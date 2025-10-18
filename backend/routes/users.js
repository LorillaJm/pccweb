const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database-adapter');
const { verifyToken, requireAnyRole } = require('../middleware/auth');
const { requireAuth } = require('../middleware/sessionAuth');

const router = express.Router();

// Middleware to accept both session and JWT
const authenticateUser = (req, res, next) => {
  // Try session first
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  
  // Fall back to JWT
  return verifyToken(req, res, next);
};

// Update user profile
router.put('/profile', authenticateUser, requireAnyRole, [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('phone').optional().trim(),
  body('address').optional().trim()
], async (req, res, next) => {
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
    const {
      firstName,
      lastName,
      middleName,
      phone,
      address,
      dateOfBirth,
      gender
    } = req.body;

    // Update user basic info
    await db.query(`
      UPDATE users 
      SET first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          middle_name = COALESCE($3, middle_name),
          phone = COALESCE($4, phone),
          address = COALESCE($5, address),
          date_of_birth = COALESCE($6, date_of_birth),
          gender = COALESCE($7, gender),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
    `, [firstName, lastName, middleName, phone, address, dateOfBirth, gender, userId]);

    // Get updated user info
    const userResult = await db.query(`
      SELECT id, email, role, first_name, last_name, middle_name,
             phone, address, date_of_birth, gender, updated_at
      FROM users WHERE id = $1
    `, [userId]);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: userResult.rows[0]
      }
    });

  } catch (error) {
    next(error);
  }
});

// Update student-specific profile
router.put('/student-profile', authenticateUser, async (req, res, next) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Students only.'
      });
    }

    const userId = req.user.id;
    const { program, yearLevel, semester } = req.body;

    await db.query(`
      UPDATE student_profiles 
      SET program = COALESCE($1, program),
          year_level = COALESCE($2, year_level),
          semester = COALESCE($3, semester),
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $4
    `, [program, yearLevel, semester, userId]);

    // Get updated profile
    const profileResult = await db.query(`
      SELECT * FROM student_profiles WHERE user_id = $1
    `, [userId]);

    res.json({
      success: true,
      message: 'Student profile updated successfully',
      data: {
        profile: profileResult.rows[0]
      }
    });

  } catch (error) {
    next(error);
  }
});

// Update faculty-specific profile
router.put('/faculty-profile', verifyToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Faculty only.'
      });
    }

    const userId = req.user.id;
    const {
      department,
      position,
      education,
      specialization,
      officeLocation,
      officeHours
    } = req.body;

    await db.query(`
      UPDATE faculty_profiles 
      SET department = COALESCE($1, department),
          position = COALESCE($2, position),
          education = COALESCE($3, education),
          specialization = COALESCE($4, specialization),
          office_location = COALESCE($5, office_location),
          office_hours = COALESCE($6, office_hours),
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $7
    `, [department, position, education, specialization, officeLocation, officeHours, userId]);

    // Get updated profile
    const profileResult = await db.query(`
      SELECT * FROM faculty_profiles WHERE user_id = $1
    `, [userId]);

    res.json({
      success: true,
      message: 'Faculty profile updated successfully',
      data: {
        profile: profileResult.rows[0]
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;