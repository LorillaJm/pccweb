const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database-adapter');
const { verifyToken } = require('../middleware/auth');

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
      middleName,
      role,
      studentId,
      employeeId,
      phone,
      address,
      dateOfBirth,
      gender
    } = req.body;

    // Check if user already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1 OR student_id = $2 OR employee_id = $3',
      [email, studentId || null, employeeId || null]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email, student ID, or employee ID'
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user
    const userResult = await db.query(`
      INSERT INTO users (
        student_id, employee_id, email, password_hash, role,
        first_name, last_name, middle_name, phone, address,
        date_of_birth, gender, is_active, email_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true, false)
      RETURNING id, email, role, first_name, last_name, created_at
    `, [
      studentId || null,
      employeeId || null,
      email,
      passwordHash,
      role,
      firstName,
      lastName,
      middleName || null,
      phone || null,
      address || null,
      dateOfBirth || null,
      gender || null
    ]);

    const newUser = userResult.rows[0];

    // Create role-specific profile
    if (role === 'student') {
      await db.query(`
        INSERT INTO student_profiles (user_id, status)
        VALUES ($1, 'active')
      `, [newUser.id]);
    } else if (role === 'faculty') {
      await db.query(`
        INSERT INTO faculty_profiles (user_id)
        VALUES ($1)
      `, [newUser.id]);
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(newUser.id, newUser.email, newUser.role);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await db.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [newUser.id, refreshToken, expiresAt]
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          createdAt: newUser.created_at
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

// Login user
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
    const userResult = await db.query(`
      SELECT id, email, password_hash, role, first_name, last_name, is_active
      FROM users WHERE email = $1
    `, [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administration.'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await db.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, expiresAt]
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.first_name,
          lastName: user.last_name
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

    // Check if refresh token exists in database
    const tokenResult = await db.query(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
      [refreshToken]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
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
router.post('/logout', verifyToken, async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Remove refresh token from database
      await db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    next(error);
  }
});

// Get current user profile
router.get('/me', verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get basic user info
    const userResult = await db.query(`
      SELECT 
        id, student_id, employee_id, email, role, first_name, last_name, middle_name,
        phone, address, date_of_birth, gender, profile_picture, created_at, updated_at
      FROM users WHERE id = $1
    `, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult.rows[0];
    let profile = null;

    // Get role-specific profile
    if (user.role === 'student') {
      const profileResult = await db.query(`
        SELECT * FROM student_profiles WHERE user_id = $1
      `, [userId]);
      profile = profileResult.rows[0] || null;
    } else if (user.role === 'faculty') {
      const profileResult = await db.query(`
        SELECT * FROM faculty_profiles WHERE user_id = $1
      `, [userId]);
      profile = profileResult.rows[0] || null;
    }

    res.json({
      success: true,
      data: {
        user,
        profile
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;