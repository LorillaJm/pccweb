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
    // Get user counts by role using Mongoose aggregation
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

    // Get enrollment statistics
    const enrollmentStats = await StudentEnrollment.aggregate([
      {
        $group: {
          _id: null,
          total_enrollments: { $sum: 1 },
          active_enrollments: {
            $sum: { $cond: [{ $eq: ['$status', 'enrolled'] }, 1, 0] }
          },
          pending_enrollments: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          }
        }
      }
    ]);

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
        enrollmentStats: enrollmentStats[0] || { total_enrollments: 0, active_enrollments: 0, pending_enrollments: 0 },
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

    // Build MongoDB query
    const query = {};
    
    if (role) {
      query.role = role;
    }

    if (status) {
      query.isActive = status === 'active';
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    // Get users with pagination
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Get total count
    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
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

    // Create user
    const newUser = new User({
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
      gender,
      isActive: true,
      emailVerified: true,
      authProvider: 'local'
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { 
        user: {
          id: newUser._id,
          email: newUser.email,
          role: newUser.role,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          createdAt: newUser.createdAt
        }
      }
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

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(middleName && { middleName }),
        ...(phone && { phone }),
        ...(address && { address }),
        ...(dateOfBirth && { dateOfBirth }),
        ...(gender && { gender }),
        ...(typeof isActive === 'boolean' && { isActive }),
        ...(role && { role })
      },
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: updatedUser }
    });

  } catch (error) {
    next(error);
  }
});

// Delete user (soft delete)
router.delete('/users/:id', requireAuth, requireAdminOrSuperAdmin, async (req, res, next) => {
  try {
    const userId = req.params.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

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

    const query = {};
    if (category) query.category = category;
    if (status) query.isPublished = status === 'published';

    const announcements = await Announcement.find(query)
      .populate('authorId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Announcement.countDocuments(query);

    res.json({
      success: true,
      data: {
        announcements,
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

    const newAnnouncement = new Announcement({
      title,
      content,
      authorId: req.user.id,
      category,
      priority,
      targetAudience,
      isPublished,
      eventDate,
      eventLocation,
      contentType: type
    });

    await newAnnouncement.save();

    res.status(201).json({
      success: true,
      message: `${type} created successfully`,
      data: { content: newAnnouncement }
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

    const query = {};
    if (search) {
      query.$or = [
        { subjectCode: { $regex: search, $options: 'i' } },
        { subjectName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const subjects = await Subject.find(query)
      .sort({ subjectCode: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Subject.countDocuments(query);

    // Add section counts (simplified for now)
    const subjectsWithCounts = subjects.map(subject => ({
      ...subject.toObject(),
      section_count: 0,
      active_sections: 0
    }));

    res.json({
      success: true,
      data: {
        subjects: subjectsWithCounts,
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
    const existingSubject = await Subject.findOne({ subjectCode });
    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: 'Subject code already exists'
      });
    }

    const newSubject = new Subject({
      subjectCode,
      subjectName,
      description,
      units,
      prerequisites,
      yearLevel,
      semester,
      department,
      isActive: true
    });

    await newSubject.save();

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: { subject: newSubject }
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

    const updatedSubject = await Subject.findByIdAndUpdate(
      subjectId,
      {
        ...(subjectName && { subjectName }),
        ...(description && { description }),
        ...(units && { units }),
        ...(prerequisites && { prerequisites }),
        ...(yearLevel && { yearLevel }),
        ...(semester && { semester }),
        ...(department && { department }),
        ...(typeof isActive === 'boolean' && { isActive })
      },
      { new: true }
    );

    if (!updatedSubject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.json({
      success: true,
      message: 'Subject updated successfully',
      data: { subject: updatedSubject }
    });

  } catch (error) {
    next(error);
  }
});

// Get all class sections
router.get('/sections', requireAuth, requireAdminOrSuperAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, subjectId, facultyId } = req.query;

    const query = {};
    if (subjectId) query.subjectId = subjectId;
    if (facultyId) query.facultyId = facultyId;

    const sections = await ClassSection.find(query)
      .populate('subjectId', 'subjectCode subjectName units')
      .populate('facultyId', 'firstName lastName')
      .sort({ 'subjectId.subjectCode': 1, sectionName: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.json({
      success: true,
      data: { sections }
    });

  } catch (error) {
    next(error);
  }
});

// Create class section
router.post('/sections', requireAuth, requireAdminOrSuperAdmin, [
  body('subjectId').isMongoId().withMessage('Valid subject ID is required'),
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

    const newSection = new ClassSection({
      subjectId,
      sectionName,
      facultyId,
      schedule,
      room,
      maxStudents,
      enrolledStudents: 0,
      academicYear,
      semester,
      isActive: true
    });

    await newSection.save();

    res.status(201).json({
      success: true,
      message: 'Class section created successfully',
      data: { section: newSection }
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

    const query = {};
    if (status) query.status = status;
    if (sectionId) query.sectionId = sectionId;
    if (studentId) query.studentId = studentId;

    const enrollments = await StudentEnrollment.find(query)
      .populate('studentId', 'firstName lastName email studentId')
      .populate({
        path: 'sectionId',
        populate: {
          path: 'subjectId',
          select: 'subjectCode subjectName'
        }
      })
      .sort({ enrollmentDate: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await StudentEnrollment.countDocuments(query);

    // Transform data to match frontend expectations
    const transformedEnrollments = enrollments.map(enrollment => ({
      id: enrollment._id,
      student_id: enrollment.studentId._id,
      section_id: enrollment.sectionId._id,
      status: enrollment.status,
      grade: enrollment.grade,
      enrollment_date: enrollment.enrollmentDate,
      status_reason: enrollment.statusReason,
      student_number: enrollment.studentId.studentId,
      student_name: `${enrollment.studentId.firstName} ${enrollment.studentId.lastName}`,
      student_email: enrollment.studentId.email,
      subject_code: enrollment.sectionId.subjectId.subjectCode,
      subject_name: enrollment.sectionId.subjectId.subjectName,
      section_name: enrollment.sectionId.sectionName,
      schedule: enrollment.sectionId.schedule,
      faculty_name: null // Will be populated if needed
    }));

    res.json({
      success: true,
      data: {
        enrollments: transformedEnrollments,
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

    const enrollment = await StudentEnrollment.findByIdAndUpdate(
      enrollmentId,
      {
        status,
        statusReason: reason,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
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