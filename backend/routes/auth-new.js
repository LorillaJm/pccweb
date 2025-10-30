const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');
const { validateSession } = require('../middleware/sessionValidator');
const EmailVerificationService = require('../services/EmailVerificationService');
const EmailValidationService = require('../services/EmailValidationService');
const NotificationService = require('../services/NotificationService');
const JWTTokenService = require('../services/JWTTokenService');
const TwoFactorService = require('../services/TwoFactorService');
const AuditLog = require('../models/AuditLog');
const { rateLimitRegistration, rateLimitVerification, rateLimitResendEmail, rateLimitLogin, rateLimitTwoFactor } = require('../middleware/rateLimit');
const { verifyRecaptcha } = require('../middleware/recaptcha');

const router = express.Router();

// Generate JWT tokens (wrapper for JWTTokenService)
const generateTokens = async (userId, email, role) => {
  return await JWTTokenService.generateTokens(userId, email, role);
};

// Register new user
router.post('/register',
  rateLimitRegistration,
  verifyRecaptcha,
  [
    body('email').isEmail().normalizeEmail(),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
    body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
    body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
    body('role').isIn(['student', 'faculty']).withMessage('Role must be student or faculty'),
    body('studentId').optional().trim(),
    body('employeeId').optional().trim()
  ],
  async (req, res, next) => {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Log failed registration attempt
        await AuditLog.create({
          action: 'registration_failed',
          category: 'auth',
          status: 'failure',
          ipAddress,
          userAgent,
          metadata: { reason: 'validation_error', errors: errors.array() }
        });

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const {
        email,
        password,
        firstName,
        lastName,
        role,
        studentId,
        employeeId,
        program,
        yearLevel,
        section,
        department,
        position
      } = req.body;

      // Validate email with comprehensive checks
      const emailValidation = await EmailValidationService.validateEmail(email, {
        checkMX: false, // Skip MX check for performance
        allowDisposable: false
      });

      if (!emailValidation.valid) {
        await AuditLog.create({
          action: 'registration_failed',
          category: 'auth',
          status: 'failure',
          ipAddress,
          userAgent,
          metadata: { reason: emailValidation.reason, email }
        });

        return res.status(400).json({
          success: false,
          error: {
            code: emailValidation.reason.toUpperCase(),
            message: emailValidation.message
          }
        });
      }

      // Use normalized email
      const normalizedEmail = emailValidation.normalizedEmail;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { email: normalizedEmail },
          ...(studentId ? [{ studentId }] : []),
          ...(employeeId ? [{ employeeId }] : [])
        ]
      });

      if (existingUser) {
        await AuditLog.create({
          action: 'registration_failed',
          category: 'auth',
          status: 'failure',
          ipAddress,
          userAgent,
          metadata: { reason: 'user_exists', email: normalizedEmail }
        });

        return res.status(400).json({
          success: false,
          message: 'User already exists with this email, student ID, or employee ID'
        });
      }

      // Create user data
      const userData = {
        email: normalizedEmail,
        password,
        firstName,
        lastName,
        role,
        authProvider: 'local',
        emailVerified: false // Set to false for email verification
      };

      // Add role-specific fields
      if (role === 'student') {
        if (studentId) userData.studentId = studentId;
        if (program) userData.program = program;
        if (yearLevel) userData.yearLevel = yearLevel;
        if (section) userData.section = section;
      } else if (role === 'faculty') {
        if (employeeId) userData.employeeId = employeeId;
        if (department) userData.department = department;
        if (position) userData.position = position;
      }

      // Create user
      const newUser = await User.create(userData);

      // Generate verification token and OTP
      const { token, otp } = await EmailVerificationService.generateVerificationToken(
        newUser._id,
        normalizedEmail,
        'registration'
      );

      // Send verification email via NotificationService
      try {
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
        const verificationLink = `${frontendURL}/auth/verify?token=${token}`;

        await NotificationService.sendNotification({
          userId: newUser._id,
          type: 'email',
          category: 'system',
          priority: 'high',
          title: 'Verify Your Email - PCC Portal',
          message: `Hi ${firstName},\n\nWelcome to PCC Portal! Please verify your email address to complete your registration.\n\nMethod 1: Click the link below\n${verificationLink}\n\nMethod 2: Enter this code manually\nVerification Code: ${otp}\n\nThis link and code will expire in 24 hours.\n\nIf you didn't create an account, please ignore this email.`,
          metadata: {
            verificationLink,
            otp,
            expiresIn: '24 hours'
          }
        });
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Don't fail registration if email fails
      }

      // Log successful registration
      await AuditLog.create({
        userId: newUser._id,
        action: 'registration_success',
        category: 'auth',
        status: 'success',
        ipAddress,
        userAgent,
        metadata: {
          email: normalizedEmail,
          role,
          authProvider: 'local'
        }
      });

      // Don't generate tokens yet - user needs to verify email first
      res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        data: {
          user: {
            id: newUser._id,
            email: newUser.email,
            role: newUser.role,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            emailVerified: false,
            createdAt: newUser.createdAt
          },
          requiresVerification: true
        }
      });

    } catch (error) {
      // Log error
      await AuditLog.create({
        action: 'registration_error',
        category: 'auth',
        status: 'error',
        ipAddress,
        userAgent,
        metadata: { error: error.message }
      }).catch(err => console.error('Failed to log error:', err));

      next(error);
    }
  }
);

// Verify email with token or OTP
router.post('/verify',
  rateLimitVerification,
  [
    body('token').optional().trim(),
    body('email').optional().isEmail().normalizeEmail(),
    body('otp').optional().trim().isLength({ min: 6, max: 6 })
  ],
  async (req, res, next) => {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { token, email, otp } = req.body;

      let result;

      // Verify using token (from email link)
      if (token) {
        result = await EmailVerificationService.verifyToken(token, ipAddress, userAgent);
      }
      // Verify using OTP (manual entry)
      else if (email && otp) {
        result = await EmailVerificationService.verifyOTP(email, otp, ipAddress, userAgent);
      }
      else {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_PARAMETERS',
            message: 'Either token or email+otp is required'
          }
        });
      }

      // Log verification attempt
      await AuditLog.create({
        userId: result.userId || null,
        action: 'email_verification',
        category: 'verification',
        status: result.success ? 'success' : 'failure',
        ipAddress,
        userAgent,
        metadata: {
          method: token ? 'token' : 'otp',
          reason: result.message,
          expired: result.expired
        }
      });

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: result.expired ? 'EXPIRED_TOKEN' : 'INVALID_TOKEN',
            message: result.message,
            expired: result.expired
          }
        });
      }

      // Get user details
      const user = await User.findById(result.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
      }

      // Generate tokens for the verified user
      const { accessToken, refreshToken } = generateTokens(user._id, user.email, user.role);

      res.json({
        success: true,
        message: 'Email verified successfully!',
        data: {
          user: {
            id: user._id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            emailVerified: true,
            emailVerifiedAt: user.emailVerifiedAt
          },
          tokens: {
            accessToken,
            refreshToken
          }
        }
      });

    } catch (error) {
      await AuditLog.create({
        action: 'email_verification_error',
        category: 'verification',
        status: 'error',
        ipAddress,
        userAgent,
        metadata: { error: error.message }
      }).catch(err => console.error('Failed to log error:', err));

      next(error);
    }
  }
);

// Resend verification email
router.post('/resend-verification',
  rateLimitResendEmail,
  [
    body('email').isEmail().normalizeEmail()
  ],
  async (req, res, next) => {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      // Find user by email
      const user = await User.findOne({ email: normalizedEmail });

      if (!user) {
        // Don't reveal if user exists or not for security
        return res.json({
          success: true,
          message: 'If an account exists with this email, a verification email has been sent.'
        });
      }

      // Check if already verified
      if (user.emailVerified) {
        await AuditLog.create({
          userId: user._id,
          action: 'resend_verification_failed',
          category: 'verification',
          status: 'failure',
          ipAddress,
          userAgent,
          metadata: { reason: 'already_verified', email: normalizedEmail }
        });

        return res.status(400).json({
          success: false,
          error: {
            code: 'ALREADY_VERIFIED',
            message: 'Email is already verified'
          }
        });
      }

      // Resend verification
      const { token, otp } = await EmailVerificationService.resendVerification(user._id);

      // Send verification email
      try {
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
        const verificationLink = `${frontendURL}/auth/verify?token=${token}`;

        await NotificationService.sendNotification({
          userId: user._id,
          type: 'email',
          category: 'system',
          priority: 'high',
          title: 'Verify Your Email - PCC Portal',
          message: `Hi ${user.firstName},\n\nHere's your new verification code.\n\nMethod 1: Click the link below\n${verificationLink}\n\nMethod 2: Enter this code manually\nVerification Code: ${otp}\n\nThis link and code will expire in 24 hours.`,
          metadata: {
            verificationLink,
            otp,
            expiresIn: '24 hours'
          }
        });
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
      }

      // Log resend action
      await AuditLog.create({
        userId: user._id,
        action: 'resend_verification',
        category: 'verification',
        status: 'success',
        ipAddress,
        userAgent,
        metadata: { email: normalizedEmail }
      });

      res.json({
        success: true,
        message: 'Verification email has been resent. Please check your inbox.'
      });

    } catch (error) {
      await AuditLog.create({
        action: 'resend_verification_error',
        category: 'verification',
        status: 'error',
        ipAddress,
        userAgent,
        metadata: { error: error.message }
      }).catch(err => console.error('Failed to log error:', err));

      next(error);
    }
  }
);

// Login user (Session-based)
router.post('/login',
  rateLimitLogin,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').exists().withMessage('Password is required')
  ],
  async (req, res, next) => {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        // Log failed login attempt
        await AuditLog.create({
          action: 'login_failed',
          category: 'auth',
          status: 'failure',
          ipAddress,
          userAgent,
          metadata: { reason: 'user_not_found', email: email.toLowerCase() }
        });

        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      if (!user.isActive) {
        // Log blocked login attempt
        await AuditLog.create({
          userId: user._id,
          action: 'login_blocked',
          category: 'auth',
          status: 'failure',
          ipAddress,
          userAgent,
          metadata: { reason: 'account_deactivated', email: user.email }
        });

        return res.status(401).json({
          success: false,
          message: 'Account is deactivated. Please contact administration.'
        });
      }

      // Verify password
      const isValidPassword = await user.comparePassword(password);

      if (!isValidPassword) {
        // Log failed login attempt
        await AuditLog.create({
          userId: user._id,
          action: 'login_failed',
          category: 'auth',
          status: 'failure',
          ipAddress,
          userAgent,
          metadata: { reason: 'invalid_password', email: user.email }
        });

        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check email verification for local auth users
      if (user.authProvider === 'local' && !user.emailVerified) {
        // Log blocked login attempt
        await AuditLog.create({
          userId: user._id,
          action: 'login_blocked',
          category: 'auth',
          status: 'failure',
          ipAddress,
          userAgent,
          metadata: { reason: 'email_not_verified', email: user.email }
        });

        return res.status(403).json({
          success: false,
          error: {
            code: 'EMAIL_NOT_VERIFIED',
            message: 'Please verify your email address before logging in.',
            emailVerified: false,
            email: user.email
          }
        });
      }

      // Check if 2FA is enabled
      const is2FAEnabled = await TwoFactorService.isEnabled(user._id);

      if (is2FAEnabled) {
        // Generate and send 2FA code
        try {
          const { code, expiresAt } = await TwoFactorService.generateAndStoreCode(user._id);

          // Send 2FA code via email
          await NotificationService.sendNotification({
            userId: user._id,
            type: 'email',
            category: 'system',
            priority: 'high',
            title: 'Your 2FA Code - PCC Portal',
            message: `Hi ${user.firstName},\n\nYour two-factor authentication code is:\n\n${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please secure your account immediately.`,
            metadata: {
              code,
              expiresAt
            }
          });

          // Log 2FA code sent
          await AuditLog.create({
            userId: user._id,
            action: '2fa_code_sent',
            category: '2fa',
            status: 'success',
            ipAddress,
            userAgent,
            metadata: { email: user.email }
          });

          return res.json({
            success: true,
            requiresTwoFactor: true,
            message: 'Please enter the 2FA code sent to your email',
            data: {
              email: user.email,
              expiresAt
            }
          });

        } catch (twoFactorError) {
          console.error('2FA code generation error:', twoFactorError);

          // Log error
          await AuditLog.create({
            userId: user._id,
            action: '2fa_code_error',
            category: '2fa',
            status: 'error',
            ipAddress,
            userAgent,
            metadata: { error: twoFactorError.message }
          });

          return res.status(500).json({
            success: false,
            error: {
              code: '2FA_ERROR',
              message: twoFactorError.message
            }
          });
        }
      }

      // No 2FA - proceed with normal login
      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Log successful login
      await AuditLog.create({
        userId: user._id,
        action: 'login_success',
        category: 'auth',
        status: 'success',
        ipAddress,
        userAgent,
        metadata: {
          email: user.email,
          role: user.role,
          authProvider: user.authProvider
        }
      });

      // Create session using Passport
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }

        res.json({
          success: true,
          message: 'Login successful',
          data: {
            user: {
              id: user._id,
              email: user.email,
              role: user.role,
              firstName: user.firstName,
              lastName: user.lastName,
              authProvider: user.authProvider,
              profilePicture: user.profilePicture,
              emailVerified: user.emailVerified,
              twoFactorEnabled: user.twoFactorEnabled
            }
          }
        });
      });

    } catch (error) {
      // Log error
      await AuditLog.create({
        action: 'login_error',
        category: 'auth',
        status: 'error',
        ipAddress,
        userAgent,
        metadata: { error: error.message }
      }).catch(err => console.error('Failed to log error:', err));

      next(error);
  }
});

// Google OAuth routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback',
  (req, res, next) => {
    console.log('=== Google OAuth Callback Started ===');
    console.log('Query params:', req.query);

    passport.authenticate('google', (err, user, info) => {
      console.log('Passport authenticate result:', {
        hasError: !!err,
        hasUser: !!user,
        userEmail: user?.email,
        info
      });

      if (err) {
        console.error('Google OAuth error:', err);
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
        console.log('Redirecting to error page:', `${frontendURL}/auth/error`);
        return res.redirect(`${frontendURL}/auth/error?message=${encodeURIComponent(err.message || 'Authentication failed')}`);
      }

      if (!user) {
        console.error('Google OAuth failed - no user returned:', info);
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
        console.log('Redirecting to error page (no user):', `${frontendURL}/auth/error`);
        return res.redirect(`${frontendURL}/auth/error?message=${encodeURIComponent(info?.message || 'Authentication failed')}`);
      }

      console.log('Attempting to log in user:', user.email);
      req.logIn(user, async (loginErr) => {
        if (loginErr) {
          console.error('Login error after Google OAuth:', loginErr);
          const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
          console.log('Redirecting to error page (login failed):', `${frontendURL}/auth/error`);
          return res.redirect(`${frontendURL}/auth/error?message=${encodeURIComponent('Login failed')}`);
        }

        try {
          // Update last login
          user.lastLogin = new Date();
          await user.save();

          // Generate JWT tokens for cross-domain auth
          const jwt = require('jsonwebtoken');
          const accessToken = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
          );

          const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
            { expiresIn: '30d' }
          );

          const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';

          // Redirect to callback page with tokens in URL
          res.redirect(`${frontendURL}/auth/callback?token=${accessToken}&refresh=${refreshToken}&provider=google`);

        } catch (error) {
          console.error('Google OAuth callback error:', error);
          const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
          res.redirect(`${frontendURL}/auth/error?message=${encodeURIComponent('Authentication completed but login failed')}`);
        }
      });
    })(req, res, next);
  }
);

// Apple ID OAuth routes
router.get('/apple', (req, res) => {
  // Check if Apple OAuth is properly configured
  if (!process.env.APPLE_CLIENT_ID || process.env.APPLE_CLIENT_ID === 'dummy') {
    return res.status(501).json({
      success: false,
      message: 'Apple OAuth is not configured on this server'
    });
  }
  passport.authenticate('apple')(req, res);
});

router.post('/apple/callback', (req, res, next) => {
  // Check if Apple OAuth is properly configured
  if (!process.env.APPLE_CLIENT_ID || process.env.APPLE_CLIENT_ID === 'dummy') {
    return res.status(501).json({
      success: false,
      message: 'Apple OAuth is not configured on this server'
    });
  }
  next();
},
  (req, res, next) => {
    passport.authenticate('apple', (err, user, info) => {
      if (err) {
        console.error('Apple OAuth error:', err);
        return res.status(500).json({
          success: false,
          message: 'Validation failed',
          error: err.message || 'Apple authentication failed'
        });
      }

      if (!user) {
        console.error('Apple OAuth failed - no user returned:', info);
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          error: info?.message || 'Apple authentication failed'
        });
      }

      req.logIn(user, async (loginErr) => {
        if (loginErr) {
          console.error('Login error after Apple OAuth:', loginErr);
          return res.status(500).json({
            success: false,
            message: 'Validation failed',
            error: 'Login failed after authentication'
          });
        }

        try {
          // Update last login
          user.lastLogin = new Date();
          await user.save();

          // Return success response with user data
          res.json({
            success: true,
            message: 'Apple authentication successful',
            data: {
              user: {
                id: user._id,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                authProvider: user.authProvider,
                profilePicture: user.profilePicture
              }
            }
          });

        } catch (error) {
          console.error('Apple OAuth callback error:', error);
          res.status(500).json({
            success: false,
            message: 'Validation failed',
            error: error.message || 'Authentication completed but login failed'
          });
        }
      });
    })(req, res, next);
  }
);

// Refresh token
router.post('/refresh', async (req, res, next) => {
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('user-agent');

  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'REFRESH_TOKEN_REQUIRED',
          message: 'Refresh token is required'
        }
      });
    }

    // Verify refresh token
    const verification = await JWTTokenService.verifyRefreshToken(refreshToken);

    if (!verification.valid) {
      await AuditLog.create({
        action: 'token_refresh_failed',
        category: 'auth',
        status: 'failure',
        ipAddress,
        userAgent,
        metadata: { reason: verification.error }
      });

      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: verification.error
        }
      });
    }

    // Check if user still exists and is active
    const user = await User.findById(verification.payload.userId);
    if (!user || !user.isActive) {
      await AuditLog.create({
        userId: verification.payload.userId,
        action: 'token_refresh_failed',
        category: 'auth',
        status: 'failure',
        ipAddress,
        userAgent,
        metadata: { reason: 'user_not_found_or_inactive' }
      });

      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_USER',
          message: 'User not found or inactive'
        }
      });
    }

    // Refresh tokens (with rotation)
    const newTokens = await JWTTokenService.refreshAccessToken(refreshToken, {
      id: user._id,
      email: user.email,
      role: user.role
    });

    // Log successful token refresh
    await AuditLog.create({
      userId: user._id,
      action: 'token_refresh_success',
      category: 'auth',
      status: 'success',
      ipAddress,
      userAgent,
      metadata: { email: user.email }
    });

    res.json({
      success: true,
      data: {
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken
      }
    });

  } catch (error) {
    await AuditLog.create({
      action: 'token_refresh_error',
      category: 'auth',
      status: 'error',
      ipAddress,
      userAgent,
      metadata: { error: error.message }
    }).catch(err => console.error('Failed to log error:', err));

    next(error);
  }
});

// Logout
router.post('/logout', async (req, res, next) => {
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('user-agent');

  try {
    const userId = req.user?._id;

    // Invalidate all refresh tokens for the user
    if (userId) {
      await JWTTokenService.invalidateAllUserTokens(userId.toString());

      // Log logout
      await AuditLog.create({
        userId,
        action: 'logout',
        category: 'auth',
        status: 'success',
        ipAddress,
        userAgent
      });
    }

    req.logout((err) => {
      if (err) {
        return next(err);
      }
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Could not log out'
          });
        }
        res.clearCookie('connect.sid');
        res.json({
          success: true,
          message: 'Logged out successfully'
        });
      });
    });
  } catch (error) {
    next(error);
  }
});

// Enable 2FA
router.post('/2fa/enable',
  verifyToken,
  [
    body('method').optional().isIn(['email', 'sms', 'totp']).withMessage('Invalid 2FA method')
  ],
  async (req, res, next) => {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    try {
      const userId = req.user.id;
      const { method = 'email' } = req.body;

      // Enable 2FA
      const result = await TwoFactorService.enable(userId, method);

      // Log 2FA enable
      await AuditLog.create({
        userId,
        action: '2fa_enabled',
        category: '2fa',
        status: 'success',
        ipAddress,
        userAgent,
        metadata: { method }
      });

      res.json({
        success: true,
        message: '2FA enabled successfully. Save your backup codes in a secure location.',
        data: {
          backupCodes: result.backupCodes,
          method
        }
      });

    } catch (error) {
      await AuditLog.create({
        userId: req.user?.id,
        action: '2fa_enable_error',
        category: '2fa',
        status: 'error',
        ipAddress,
        userAgent,
        metadata: { error: error.message }
      }).catch(err => console.error('Failed to log error:', err));

      next(error);
    }
  }
);

// Verify 2FA code
router.post('/2fa/verify',
  rateLimitTwoFactor,
  [
    body('email').isEmail().normalizeEmail(),
    body('code').trim().isLength({ min: 6, max: 6 }).withMessage('Code must be 6 digits'),
    body('isBackupCode').optional().isBoolean()
  ],
  async (req, res, next) => {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email, code, isBackupCode = false } = req.body;

      // Find user
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        await AuditLog.create({
          action: '2fa_verify_failed',
          category: '2fa',
          status: 'failure',
          ipAddress,
          userAgent,
          metadata: { reason: 'user_not_found', email }
        });

        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid credentials'
          }
        });
      }

      // Verify code
      let result;
      if (isBackupCode) {
        result = await TwoFactorService.verifyBackupCode(user._id, code);
      } else {
        result = await TwoFactorService.verifyUserCode(user._id, code);
      }

      if (!result.valid) {
        await AuditLog.create({
          userId: user._id,
          action: '2fa_verify_failed',
          category: '2fa',
          status: 'failure',
          ipAddress,
          userAgent,
          metadata: {
            reason: result.error,
            locked: result.locked,
            remainingAttempts: result.remainingAttempts
          }
        });

        return res.status(401).json({
          success: false,
          error: {
            code: result.locked ? 'ACCOUNT_LOCKED' : 'INVALID_CODE',
            message: result.error,
            locked: result.locked,
            remainingAttempts: result.remainingAttempts
          }
        });
      }

      // Generate tokens
      const tokens = await generateTokens(user._id, user.email, user.role);

      // Log successful 2FA verification
      await AuditLog.create({
        userId: user._id,
        action: '2fa_verify_success',
        category: '2fa',
        status: 'success',
        ipAddress,
        userAgent,
        metadata: {
          isBackupCode,
          remainingBackupCodes: result.remainingBackupCodes
        }
      });

      res.json({
        success: true,
        message: '2FA verification successful',
        data: {
          user: {
            id: user._id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName
          },
          tokens,
          ...(result.remainingBackupCodes !== undefined && {
            remainingBackupCodes: result.remainingBackupCodes
          })
        }
      });

    } catch (error) {
      await AuditLog.create({
        action: '2fa_verify_error',
        category: '2fa',
        status: 'error',
        ipAddress,
        userAgent,
        metadata: { error: error.message }
      }).catch(err => console.error('Failed to log error:', err));

      next(error);
    }
  }
);

// Disable 2FA
router.post('/2fa/disable',
  verifyToken,
  [
    body('password').exists().withMessage('Password is required')
  ],
  async (req, res, next) => {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const userId = req.user.id;
      const { password } = req.body;

      // Verify password
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        await AuditLog.create({
          userId,
          action: '2fa_disable_failed',
          category: '2fa',
          status: 'failure',
          ipAddress,
          userAgent,
          metadata: { reason: 'invalid_password' }
        });

        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_PASSWORD',
            message: 'Invalid password'
          }
        });
      }

      // Disable 2FA
      await TwoFactorService.disable(userId);

      // Log 2FA disable
      await AuditLog.create({
        userId,
        action: '2fa_disabled',
        category: '2fa',
        status: 'success',
        ipAddress,
        userAgent
      });

      res.json({
        success: true,
        message: '2FA disabled successfully'
      });

    } catch (error) {
      await AuditLog.create({
        userId: req.user?.id,
        action: '2fa_disable_error',
        category: '2fa',
        status: 'error',
        ipAddress,
        userAgent,
        metadata: { error: error.message }
      }).catch(err => console.error('Failed to log error:', err));

      next(error);
    }
  }
);

// Get 2FA status
router.get('/2fa/status', verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const status = await TwoFactorService.getStatus(userId);

    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    next(error);
  }
});

// Middleware to accept both session and JWT
const authenticateUser = async (req, res, next) => {
  // Try JWT first
  const authHeader = req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (user && user.isActive) {
        req.user = user;
        return next();
      }
    } catch (err) {
      // JWT failed, try session
    }
  }
  
  // Try session
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  
  // Both failed
  return res.status(401).json({ message: 'Not authenticated' });
};

// Test session endpoint (for debugging)
router.get('/session-test', (req, res) => {
  res.json({
    hasSession: !!req.session,
    sessionID: req.sessionID,
    isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false,
    hasUser: !!req.user,
    user: req.user ? {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    } : null
  });
});

// Get current user profile (supports both session and JWT)
router.get('/me', authenticateUser, async (req, res, next) => {
  try {
    // User lookup with proper error handling
    let user;
    try {
      user = await User.findById(req.user._id).select('-password');
    } catch (dbError) {
      console.error('Database error during user lookup:', dbError);

      // Check if it's a connection error
      if (dbError.name === 'MongoNetworkError' || dbError.name === 'MongoTimeoutError') {
        return res.status(503).json({
          success: false,
          message: 'Database temporarily unavailable. Please try again.',
          sessionStatus: 'error',
          retryAfter: 5
        });
      }

      // Generic database error
      return res.status(500).json({
        success: false,
        message: 'Error retrieving user data',
        sessionStatus: 'error'
      });
    }

    // User not found - clear invalid session
    if (!user) {
      console.warn(`User not found for session: ${req.user._id}`);

      return new Promise((resolve) => {
        req.logout((err) => {
          if (err) console.error('Error logging out after user not found:', err);

          req.session.destroy((destroyErr) => {
            if (destroyErr) console.error('Error destroying session:', destroyErr);

            res.clearCookie('connect.sid');
            res.status(401).json({
              success: false,
              message: 'User account no longer exists',
              sessionStatus: 'invalid'
            });
            resolve();
          });
        });
      });
    }

    // User deactivated - clear session
    if (!user.isActive) {
      console.warn(`Deactivated user attempted access: ${user.email}`);

      return new Promise((resolve) => {
        req.logout((err) => {
          if (err) console.error('Error logging out deactivated user:', err);

          req.session.destroy((destroyErr) => {
            if (destroyErr) console.error('Error destroying session:', destroyErr);

            res.clearCookie('connect.sid');
            res.status(403).json({
              success: false,
              message: 'Account is deactivated. Please contact administration.',
              sessionStatus: 'invalid'
            });
            resolve();
          });
        });
      });
    }

    // Calculate session expiration
    const sessionMaxAge = req.session.cookie.maxAge || 24 * 60 * 60 * 1000; // Default 24 hours
    const expiresAt = new Date(Date.now() + sessionMaxAge);
    const timeUntilExpiry = sessionMaxAge / 1000; // in seconds

    // Session health indicators
    const sessionHealth = {
      expiresAt: expiresAt.toISOString(),
      expiresIn: Math.floor(timeUntilExpiry), // seconds until expiration
      isValid: true,
      needsRenewal: timeUntilExpiry < 3600 // Flag if less than 1 hour remaining
    };

    // Successful response with session health indicators
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          authProvider: user.authProvider,
          profilePicture: user.profilePicture,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          lastLogin: user.lastLogin
        },
        profile: null, // TODO: Add profile data when needed
        sessionInfo: sessionHealth
      },
      sessionStatus: 'valid'
    });

  } catch (error) {
    console.error('Unexpected error in /auth/me:', error);

    // Handle different error types
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
        sessionStatus: 'error'
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      sessionStatus: 'error'
    });
  }
});

// Get user profile
router.get('/profile', async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const user = await User.findById(req.user._id).select('-password -emailVerificationToken -passwordResetToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profilePicture: user.profilePicture,
        authProvider: user.authProvider,
        // Student fields
        studentId: user.studentId,
        program: user.program,
        yearLevel: user.yearLevel,
        section: user.section,
        // Faculty fields
        employeeId: user.employeeId,
        department: user.department,
        position: user.position,
        // Metadata
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isActive: user.isActive
      }
    });

  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile', [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('middleName').optional().trim(),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('studentId').optional().trim(),
  body('program').optional().trim(),
  body('yearLevel').optional().isInt({ min: 1, max: 6 }),
  body('section').optional().trim(),
  body('employeeId').optional().trim(),
  body('department').optional().trim(),
  body('position').optional().trim()
], async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update allowed fields
    const allowedFields = [
      'firstName', 'lastName', 'middleName', 'phone', 'address',
      'studentId', 'program', 'yearLevel', 'section', 
      'employeeId', 'department', 'position'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profilePicture: user.profilePicture,
        studentId: user.studentId,
        program: user.program,
        yearLevel: user.yearLevel,
        section: user.section,
        employeeId: user.employeeId,
        department: user.department,
        position: user.position,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    next(error);
  }
});

// Link social account to existing account
router.post('/link/:provider', verifyToken, async (req, res, next) => {
  try {
    const { provider } = req.params;
    const { socialId, email } = req.body;
    const userId = req.user.id;

    if (!['google', 'apple'].includes(provider)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid provider'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if social account is already linked to another user
    const existingSocialUser = await User.findBySocialId(provider, socialId);
    if (existingSocialUser && existingSocialUser._id.toString() !== userId) {
      return res.status(400).json({
        success: false,
        message: `This ${provider} account is already linked to another user`
      });
    }

    // Link the account
    if (provider === 'google') {
      user.googleId = socialId;
    } else if (provider === 'apple') {
      user.appleId = socialId;
    }

    await user.save();

    res.json({
      success: true,
      message: `${provider} account linked successfully`
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
