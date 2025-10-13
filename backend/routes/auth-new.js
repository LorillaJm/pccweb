const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');
const { validateSession } = require('../middleware/sessionValidator');

const router = express.Router();

// Generate JWT tokens
const generateTokens = (userId, email, role) => {
  const payload = { userId, email, role };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '24h'
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
  });

  return { accessToken, refreshToken };
};

// Register new user
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  body('role').isIn(['student', 'faculty']).withMessage('Role must be student or faculty'),
  body('studentId').optional().trim(),
  body('employeeId').optional().trim()
], async (req, res, next) => {
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

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email },
        ...(studentId ? [{ studentId }] : []),
        ...(employeeId ? [{ employeeId }] : [])
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email, student ID, or employee ID'
      });
    }

    // Create user data
    const userData = {
      email,
      password,
      firstName,
      lastName,
      role,
      authProvider: 'local'
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

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(newUser._id, newUser.email, newUser.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser._id,
          email: newUser.email,
          role: newUser.role,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          createdAt: newUser.createdAt
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// Login user (Session-based)
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists().withMessage('Password is required')
], async (req, res, next) => {
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
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administration.'
      });
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

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
            profilePicture: user.profilePicture
          }
        }
      });
    });

  } catch (error) {
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
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
    next(error);
  }
});

// Logout
router.post('/logout', async (req, res, next) => {
  try {
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
      'firstName', 'lastName', 'studentId', 'program',
      'yearLevel', 'section', 'employeeId', 'department', 'position'
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
