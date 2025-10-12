const express = require('express');
const { body, validationResult } = require('express-validator');
const Announcement = require('../models/Announcement');
const { verifyToken, requireFacultyOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Session guard for passport-session auth
const requireSession = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  next();
};

// Get announcements (filtered by role) - allow session-based auth
router.get('/', requireSession, async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const { page = 1, limit = 10, category, search } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      search
    };

    const [announcements, total] = await Promise.all([
      Announcement.getForRole(userRole, options),
      Announcement.getCountForRole(userRole, options)
    ]);

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

// Create announcement (faculty/admin only)
router.post('/', verifyToken, requireFacultyOrAdmin, [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
  body('targetAudience').optional().isIn(['all', 'students', 'faculty']),
  body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
  body('category').optional().trim()
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
      title,
      content,
      category,
      priority = 'normal',
      targetAudience = 'all',
      isPublished = false
    } = req.body;

    const announcement = new Announcement({
      title,
      content,
      authorId: req.user.id,
      category,
      priority,
      targetAudience,
      isPublished
    });

    await announcement.save();
    await announcement.populate('authorId', 'firstName lastName email role');

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: {
        announcement
      }
    });

  } catch (error) {
    next(error);
  }
});

// Update announcement
router.put('/:id', verifyToken, requireFacultyOrAdmin, async (req, res, next) => {
  try {
    const announcementId = req.params.id;
    const {
      title,
      content,
      category,
      priority,
      targetAudience,
      isPublished
    } = req.body;

    // Find announcement
    const announcement = await Announcement.findById(announcementId);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Only author or admin can edit
    if (announcement.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own announcements'
      });
    }

    // Update fields
    if (title !== undefined) announcement.title = title;
    if (content !== undefined) announcement.content = content;
    if (category !== undefined) announcement.category = category;
    if (priority !== undefined) announcement.priority = priority;
    if (targetAudience !== undefined) announcement.targetAudience = targetAudience;
    if (isPublished !== undefined) announcement.isPublished = isPublished;

    await announcement.save();
    await announcement.populate('authorId', 'firstName lastName email role');

    res.json({
      success: true,
      message: 'Announcement updated successfully',
      data: {
        announcement
      }
    });

  } catch (error) {
    next(error);
  }
});

// Delete announcement
router.delete('/:id', verifyToken, requireFacultyOrAdmin, async (req, res, next) => {
  try {
    const announcementId = req.params.id;

    // Find announcement
    const announcement = await Announcement.findById(announcementId);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Only author or admin can delete
    if (announcement.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own announcements'
      });
    }

    await Announcement.findByIdAndDelete(announcementId);

    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;