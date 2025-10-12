const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Announcement = require('../models/Announcement');
const Subject = require('../models/Subject');
const ClassSection = require('../models/ClassSection');
const StudentEnrollment = require('../models/StudentEnrollment');
const { requireAuth, requireAdminOrSuperAdmin } = require('../middleware/sessionAuth');

const router = express.Router();

// ============================================================================
// DASHBOARD & ANALYTICS
// ============================================================================

// Get admin dashboard statistics
router.get('/dashboard', requireAuth, requireAdminOrSuperAdmin, async (req, res, next) => {
  try {
    // Get user counts by role
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active_count: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          role: '$_id',
          count: 1,
          active_count: 1,
          _id: 0
        }
      }
    ]);

    // Get enrollment statistics (mock data for now since we don't have enrollment model)
    const enrollmentStats = {
      total_enrollments: 150,
      active_enrollments: 120,
      pending_enrollments: 30
    };

    // Get recent users
    const recentUsers = await User.find()
      .select('firstName lastName email role createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get recent announcements
    const recentAnnouncements = await Announcement.find()
      .populate('authorId', 'firstName lastName')
      .select('title createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        userStats,
        enrollmentStats,
        recentUsers,
        recentAnnouncements
      }
    });

  } catch (error) {
    next(error);
  }
});

// ============================================================================
// USER MANAGEMENT
// ============================================================================

// Get all users with filtering and pagination
router.get('/users', requireAuth, requireAdminOrSuperAdmin, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      status,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let params = [];
    let paramCount = 0;

    if (role) {
      paramCount++;
      whereConditions.push(`role = $${paramCount}`);
      params.push(role);
    }

    if (status) {
      paramCount++;
      whereConditions.push(`is_active = $${paramCount}`);
      params.push(status === 'active');
    }

    if (search) {
      paramCount++;
      whereConditions.push(`(
        first_name ILIKE $${paramCount} OR 
        last_name ILIKE $${paramCount} OR 
        email ILIKE $${paramCount} OR
        student_id ILIKE $${paramCount} OR
        employee_id ILIKE $${paramCount}
      )`);
      params.push(`%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const usersQuery = `
      SELECT 
        id, student_id, employee_id, email, role, first_name, last_name, 
        middle_name, phone, address, date_of_birth, gender, is_active, 
        email_verified, created_at, updated_at
      FROM users 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(limit, offset);
    // Use Mongoose instead of raw SQL
    const query = {};
    if (role) query.role = role;
    if (status) query.isActive = status === 'active';
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const usersResult = { rows: users };

    // Get total count
    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users: usersResult.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// Create new user
router.post('/users', requireAuth, requireAdminOrSuperAdmin, [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  body('role').isIn(['student', 'faculty', 'admin']).withMessage('Invalid role'),
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

    const {
      email, password, firstName, lastName, middleName, role,
      studentId, employeeId, phone, address, dateOfBirth, gender
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
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert user
    const userResult = await db.query(`
      INSERT INTO users (
        student_id, employee_id, email, password_hash, role,
        first_name, last_name, middle_name, phone, address,
        date_of_birth, gender, is_active, email_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true, true)
      RETURNING id, email, role, first_name, last_name, created_at
    `, [
      studentId || null, employeeId || null, email, passwordHash, role,
      firstName, lastName, middleName || null, phone || null, address || null,
      dateOfBirth || null, gender || null
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

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user: newUser }
    });

  } catch (error) {
    next(error);
  }
});

// Update user
router.put('/users/:id', requireAuth, requireAdminOrSuperAdmin, async (req, res, next) => {
  try {
    const userId = req.params.id;
    const {
      firstName, lastName, middleName, phone, address,
      dateOfBirth, gender, isActive, role
    } = req.body;

    const updateResult = await db.query(`
      UPDATE users 
      SET first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          middle_name = COALESCE($3, middle_name),
          phone = COALESCE($4, phone),
          address = COALESCE($5, address),
          date_of_birth = COALESCE($6, date_of_birth),
          gender = COALESCE($7, gender),
          is_active = COALESCE($8, is_active),
          role = COALESCE($9, role),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING id, email, role, first_name, last_name, is_active, updated_at
    `, [firstName, lastName, middleName, phone, address, dateOfBirth, gender, isActive, role, userId]);

    if (updateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: updateResult.rows[0] }
    });

  } catch (error) {
    next(error);
  }
});

// Delete user
router.delete('/users/:id', requireAuth, requireAdminOrSuperAdmin, async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Check if user exists
    const userCheck = await db.query('SELECT id, role FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft delete by deactivating
    await db.query('UPDATE users SET is_active = false WHERE id = $1', [userId]);

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });

  } catch (error) {
    next(error);
  }
});

// ============================================================================
// CONTENT MANAGEMENT SYSTEM (CMS)
// ============================================================================

// Get all announcements for admin
router.get('/announcements', requireAuth, requireAdminOrSuperAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, status } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      whereConditions.push(`a.category = $${paramCount}`);
      params.push(category);
    }

    if (status) {
      paramCount++;
      whereConditions.push(`a.is_published = $${paramCount}`);
      params.push(status === 'published');
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const announcementsQuery = `
      SELECT a.*, u.first_name, u.last_name
      FROM announcements a
      LEFT JOIN users u ON a.author_id = u.id
      ${whereClause}
      ORDER BY a.created_at DESC 
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(limit, offset);
    const result = await db.query(announcementsQuery, params);

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM announcements a ${whereClause}`;
    const countResult = await db.query(countQuery, params.slice(0, paramCount));
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        announcements: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// Create news/events (enhanced announcements)
router.post('/content', requireAuth, requireAdminOrSuperAdmin, [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
  body('type').isIn(['news', 'event', 'announcement']).withMessage('Invalid content type'),
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

    const {
      title, content, type, category, priority = 'normal',
      targetAudience = 'all', isPublished = false, eventDate, eventLocation
    } = req.body;

    const authorId = req.user.id;

    const result = await db.query(`
      INSERT INTO announcements (
        title, content, author_id, category, priority, target_audience, 
        is_published, event_date, event_location, content_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [title, content, authorId, category, priority, targetAudience, isPublished, eventDate, eventLocation, type]);

    res.status(201).json({
      success: true,
      message: `${type} created successfully`,
      data: { content: result.rows[0] }
    });

  } catch (error) {
    next(error);
  }
});

// ============================================================================
// ACADEMIC MANAGEMENT
// ============================================================================

// Get all subjects
router.get('/subjects', requireAuth, requireAdminOrSuperAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    let params = [];

    if (search) {
      whereClause = 'WHERE subject_code ILIKE $1 OR subject_name ILIKE $1 OR description ILIKE $1';
      params.push(`%${search}%`);
    }

    const subjectsQuery = `
      SELECT s.*, 
             COUNT(cs.id) as section_count,
             COUNT(CASE WHEN cs.is_active = true THEN 1 END) as active_sections
      FROM subjects s
      LEFT JOIN class_sections cs ON s.id = cs.subject_id
      ${whereClause}
      GROUP BY s.id
      ORDER BY s.subject_code 
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);
    const result = await db.query(subjectsQuery, params);

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM subjects ${whereClause}`;
    const countParams = search ? [search] : [];
    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        subjects: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// Create new subject
router.post('/subjects', requireAuth, requireAdminOrSuperAdmin, [
  body('subjectCode').trim().isLength({ min: 1 }).withMessage('Subject code is required'),
  body('subjectName').trim().isLength({ min: 1 }).withMessage('Subject name is required'),
  body('units').isInt({ min: 1, max: 10 }).withMessage('Units must be between 1 and 10'),
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

    const {
      subjectCode, subjectName, description, units,
      prerequisites, yearLevel, semester, department
    } = req.body;

    // Check if subject code already exists
    const existingSubject = await db.query(
      'SELECT id FROM subjects WHERE subject_code = $1',
      [subjectCode]
    );

    if (existingSubject.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Subject code already exists'
      });
    }

    const result = await db.query(`
      INSERT INTO subjects (
        subject_code, subject_name, description, units, 
        prerequisites, year_level, semester, department, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
      RETURNING *
    `, [subjectCode, subjectName, description, units, prerequisites, yearLevel, semester, department]);

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: { subject: result.rows[0] }
    });

  } catch (error) {
    next(error);
  }
});

// Update subject
router.put('/subjects/:id', requireAuth, requireAdminOrSuperAdmin, async (req, res, next) => {
  try {
    const subjectId = req.params.id;
    const {
      subjectName, description, units, prerequisites,
      yearLevel, semester, department, isActive
    } = req.body;

    const updateResult = await db.query(`
      UPDATE subjects 
      SET subject_name = COALESCE($1, subject_name),
          description = COALESCE($2, description),
          units = COALESCE($3, units),
          prerequisites = COALESCE($4, prerequisites),
          year_level = COALESCE($5, year_level),
          semester = COALESCE($6, semester),
          department = COALESCE($7, department),
          is_active = COALESCE($8, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `, [subjectName, description, units, prerequisites, yearLevel, semester, department, isActive, subjectId]);

    if (updateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.json({
      success: true,
      message: 'Subject updated successfully',
      data: { subject: updateResult.rows[0] }
    });

  } catch (error) {
    next(error);
  }
});

// Get all class sections
router.get('/sections', requireAuth, requireAdminOrSuperAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, subjectId, facultyId } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params = [];
    let paramCount = 0;

    if (subjectId) {
      paramCount++;
      whereConditions.push(`cs.subject_id = $${paramCount}`);
      params.push(subjectId);
    }

    if (facultyId) {
      paramCount++;
      whereConditions.push(`cs.faculty_id = $${paramCount}`);
      params.push(facultyId);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const sectionsQuery = `
      SELECT cs.*, s.subject_code, s.subject_name, s.units,
             u.first_name || ' ' || u.last_name as faculty_name
      FROM class_sections cs
      LEFT JOIN subjects s ON cs.subject_id = s.id
      LEFT JOIN users u ON cs.faculty_id = u.id
      ${whereClause}
      ORDER BY s.subject_code, cs.section_name 
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(limit, offset);
    const result = await db.query(sectionsQuery, params);

    res.json({
      success: true,
      data: { sections: result.rows }
    });

  } catch (error) {
    next(error);
  }
});

// Create class section
router.post('/sections', requireAuth, requireAdminOrSuperAdmin, [
  body('subjectId').isInt().withMessage('Subject ID is required'),
  body('sectionName').trim().isLength({ min: 1 }).withMessage('Section name is required'),
  body('maxStudents').isInt({ min: 1 }).withMessage('Max students must be at least 1'),
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

    const {
      subjectId, sectionName, facultyId, schedule, room,
      maxStudents, academicYear, semester
    } = req.body;

    const result = await db.query(`
      INSERT INTO class_sections (
        subject_id, section_name, faculty_id, schedule, room,
        max_students, enrolled_students, academic_year, semester, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, 0, $7, $8, true)
      RETURNING *
    `, [subjectId, sectionName, facultyId, schedule, room, maxStudents, academicYear, semester]);

    res.status(201).json({
      success: true,
      message: 'Class section created successfully',
      data: { section: result.rows[0] }
    });

  } catch (error) {
    next(error);
  }
});

// ============================================================================
// ENROLLMENT CONTROL
// ============================================================================

// Get all enrollments with filtering
router.get('/enrollments', requireAuth, requireAdminOrSuperAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, sectionId, studentId } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      whereConditions.push(`se.status = $${paramCount}`);
      params.push(status);
    }

    if (sectionId) {
      paramCount++;
      whereConditions.push(`se.section_id = $${paramCount}`);
      params.push(sectionId);
    }

    if (studentId) {
      paramCount++;
      whereConditions.push(`se.student_id = $${paramCount}`);
      params.push(studentId);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const enrollmentsQuery = `
      SELECT se.*, 
             u.student_id as student_number,
             u.first_name || ' ' || u.last_name as student_name,
             u.email as student_email,
             s.subject_code, s.subject_name,
             cs.section_name, cs.schedule,
             f.first_name || ' ' || f.last_name as faculty_name
      FROM student_enrollments se
      JOIN users u ON se.student_id = u.id
      JOIN class_sections cs ON se.section_id = cs.id
      JOIN subjects s ON cs.subject_id = s.id
      LEFT JOIN users f ON cs.faculty_id = f.id
      ${whereClause}
      ORDER BY se.enrollment_date DESC 
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(limit, offset);
    const result = await db.query(enrollmentsQuery, params);

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM student_enrollments se ${whereClause}`;
    const countResult = await db.query(countQuery, params.slice(0, paramCount));
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        enrollments: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// Approve/reject enrollment
router.put('/enrollments/:id/status', requireAuth, requireAdminOrSuperAdmin, [
  body('status').isIn(['enrolled', 'rejected', 'dropped']).withMessage('Invalid status'),
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

    const enrollmentId = req.params.id;
    const { status, reason } = req.body;

    // Get enrollment details
    const enrollmentResult = await db.query(`
      SELECT se.*, cs.enrolled_students, cs.max_students
      FROM student_enrollments se
      JOIN class_sections cs ON se.section_id = cs.id
      WHERE se.id = $1
    `, [enrollmentId]);

    if (enrollmentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    const enrollment = enrollmentResult.rows[0];

    // Update enrollment status
    await db.query(`
      UPDATE student_enrollments 
      SET status = $1, 
          status_reason = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [status, reason, enrollmentId]);

    // Update section enrollment count
    if (status === 'enrolled' && enrollment.status !== 'enrolled') {
      await db.query(`
        UPDATE class_sections 
        SET enrolled_students = enrolled_students + 1 
        WHERE id = $1
      `, [enrollment.section_id]);
    } else if (status !== 'enrolled' && enrollment.status === 'enrolled') {
      await db.query(`
        UPDATE class_sections 
        SET enrolled_students = enrolled_students - 1 
        WHERE id = $1
      `, [enrollment.section_id]);
    }

    res.json({
      success: true,
      message: `Enrollment ${status} successfully`
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
