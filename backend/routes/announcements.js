const express = require('express');
const { body, validationResult } = require('express-validator');
const Announcement = require('../models/Announcement');
const AnnouncementNotificationService = require('../services/AnnouncementNotificationService');
const { requireAuth, requireAdminOrSuperAdmin } = require('../middleware/sessionAuth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/announcements/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// ============================================================================
// PUBLIC ROUTES (for viewing announcements)
// ============================================================================

// Get announcements for current user's role
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      priority,
      search
    } = req.query;

    const userRole = req.user.role;
    
    const announcements = await Announcement.getForRole(userRole, {
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      priority,
      search
    });

    const total = await Announcement.getCountForRole(userRole, {
      category,
      priority,
      search
    });

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

// Get single announcement
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const announcementId = req.params.id;
    const userId = req.user.id;

    const announcement = await Announcement.findById(announcementId)
      .populate('authorId', 'firstName lastName email role');

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Check if user has access to this announcement
    const userRole = req.user.role;
    if (announcement.targetAudience !== 'all' && announcement.targetAudience !== userRole) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Increment view count
    announcement.views += 1;
    await announcement.save();

    // Mark as read if not already read
    await AnnouncementNotificationService.markAsRead(announcementId, userId, req.headers['user-agent']);

    res.json({
      success: true,
      data: { announcement }
    });

  } catch (error) {
    next(error);
  }
});

// Like/unlike announcement
router.post('/:id/like', requireAuth, async (req, res, next) => {
  try {
    const announcementId = req.params.id;
    const userId = req.user.id;

    const announcement = await Announcement.findById(announcementId);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    const existingLike = announcement.likes.find(
      like => like.userId.toString() === userId.toString()
    );

    if (existingLike) {
      // Unlike
      await announcement.removeLike(userId);
      res.json({
        success: true,
        message: 'Announcement unliked',
        data: { liked: false, likesCount: announcement.likes.length }
      });
    } else {
      // Like
      await announcement.addLike(userId);
      res.json({
        success: true,
        message: 'Announcement liked',
        data: { liked: true, likesCount: announcement.likes.length }
      });
    }

  } catch (error) {
    next(error);
  }
});

// Add comment to announcement
router.post('/:id/comments', requireAuth, [
  body('content').trim().isLength({ min: 1 }).withMessage('Comment content is required')
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

    const announcementId = req.params.id;
    const userId = req.user.id;
    const { content } = req.body;

    const announcement = await Announcement.findById(announcementId);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    await announcement.addComment(userId, content);

    // Populate the new comment with user details
    const updatedAnnouncement = await Announcement.findById(announcementId)
      .populate('comments.userId', 'firstName lastName');

    const newComment = updatedAnnouncement.comments[updatedAnnouncement.comments.length - 1];

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: { comment: newComment }
    });

  } catch (error) {
    next(error);
  }
});

// ============================================================================
// ADMIN ROUTES (for managing announcements)
// ============================================================================

// Create new announcement
router.post('/', requireAuth, requireAdminOrSuperAdmin, upload.array('attachments', 5), [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
  body('targetAudience').isIn(['all', 'students', 'faculty']).withMessage('Invalid target audience'),
  body('priority').isIn(['low', 'normal', 'high', 'urgent']).withMessage('Invalid priority')
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
      title, content, category = 'general', priority = 'normal',
      targetAudience = 'all', isPublished = false,
      // Real-time notification settings
      enableRealTime = true, enableSound = true, soundType = 'default',
      pushToMobile = true, emailNotification = false,
      customSoundUrl
    } = req.body;

    const authorId = req.user.id;

    // Process attachments
    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/announcements/${file.filename}`
    })) : [];

    // Create announcement
    const announcement = new Announcement({
      title,
      content,
      authorId,
      category,
      priority,
      targetAudience,
      isPublished,
      attachments,
      notificationSettings: {
        enableRealTime,
        enableSound,
        soundType,
        customSoundUrl,
        pushToMobile,
        emailNotification
      }
    });

    const savedAnnouncement = await announcement.save();

    // If published, send real-time notifications immediately
    if (isPublished) {
      try {
        const notificationResult = await AnnouncementNotificationService.sendAnnouncementNotification(
          savedAnnouncement._id
        );
        
        res.status(201).json({
          success: true,
          message: 'Announcement created and notifications sent',
          data: { 
            announcement: savedAnnouncement,
            notificationResult
          }
        });
      } catch (notificationError) {
        console.error('Error sending notifications:', notificationError);
        res.status(201).json({
          success: true,
          message: 'Announcement created but notification failed',
          data: { 
            announcement: savedAnnouncement,
            notificationError: notificationError.message
          }
        });
      }
    } else {
      res.status(201).json({
        success: true,
        message: 'Announcement created as draft',
        data: { announcement: savedAnnouncement }
      });
    }

  } catch (error) {
    next(error);
  }
});

// Update announcement
router.put('/:id', requireAuth, requireAdminOrSuperAdmin, upload.array('attachments', 5), async (req, res, next) => {
  try {
    const announcementId = req.params.id;
    const updateData = { ...req.body };

    // Process new attachments if any
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `/uploads/announcements/${file.filename}`
      }));
      
      updateData.attachments = newAttachments;
    }

    const wasPublished = await Announcement.findById(announcementId).select('isPublished');
    
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      announcementId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedAnnouncement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // If announcement was just published, send notifications
    if (!wasPublished.isPublished && updatedAnnouncement.isPublished) {
      try {
        const notificationResult = await AnnouncementNotificationService.sendAnnouncementNotification(
          updatedAnnouncement._id
        );
        
        res.json({
          success: true,
          message: 'Announcement updated and notifications sent',
          data: { 
            announcement: updatedAnnouncement,
            notificationResult
          }
        });
      } catch (notificationError) {
        console.error('Error sending notifications:', notificationError);
        res.json({
          success: true,
          message: 'Announcement updated but notification failed',
          data: { 
            announcement: updatedAnnouncement,
            notificationError: notificationError.message
          }
        });
      }
    } else {
      res.json({
        success: true,
        message: 'Announcement updated successfully',
        data: { announcement: updatedAnnouncement }
      });
    }

  } catch (error) {
    next(error);
  }
});

// Delete announcement
router.delete('/:id', requireAuth, requireAdminOrSuperAdmin, async (req, res, next) => {
  try {
    const announcementId = req.params.id;

    const deletedAnnouncement = await Announcement.findByIdAndDelete(announcementId);

    if (!deletedAnnouncement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });

  } catch (error) {
    next(error);
  }
});

// Publish/unpublish announcement
router.patch('/:id/publish', requireAuth, requireAdminOrSuperAdmin, async (req, res, next) => {
  try {
    const announcementId = req.params.id;
    const { isPublished } = req.body;

    const announcement = await Announcement.findByIdAndUpdate(
      announcementId,
      { isPublished },
      { new: true }
    );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // If publishing, send notifications
    if (isPublished) {
      try {
        const notificationResult = await AnnouncementNotificationService.sendAnnouncementNotification(
          announcement._id
        );
        
        res.json({
          success: true,
          message: 'Announcement published and notifications sent',
          data: { 
            announcement,
            notificationResult
          }
        });
      } catch (notificationError) {
        console.error('Error sending notifications:', notificationError);
        res.json({
          success: true,
          message: 'Announcement published but notification failed',
          data: { 
            announcement,
            notificationError: notificationError.message
          }
        });
      }
    } else {
      res.json({
        success: true,
        message: 'Announcement unpublished',
        data: { announcement }
      });
    }

  } catch (error) {
    next(error);
  }
});

// Send urgent announcement
router.post('/:id/urgent', requireAuth, requireAdminOrSuperAdmin, async (req, res, next) => {
  try {
    const announcementId = req.params.id;

    const result = await AnnouncementNotificationService.sendUrgentAnnouncement(announcementId);

    res.json({
      success: true,
      message: 'Urgent announcement sent successfully',
      data: result
    });

  } catch (error) {
    next(error);
  }
});

// Get announcement delivery statistics
router.get('/:id/stats', requireAuth, requireAdminOrSuperAdmin, async (req, res, next) => {
  try {
    const announcementId = req.params.id;

    const stats = await AnnouncementNotificationService.getDeliveryStats(announcementId);

    if (!stats.success) {
      return res.status(404).json(stats);
    }

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    next(error);
  }
});

// Broadcast system announcement
router.post('/system/broadcast', requireAuth, requireAdminOrSuperAdmin, [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('message').trim().isLength({ min: 1 }).withMessage('Message is required')
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

    const { title, message, priority = 'high', enableSound = true, soundType = 'announcement' } = req.body;

    const result = await AnnouncementNotificationService.broadcastSystemAnnouncement(
      title,
      message,
      { priority, enableSound, soundType }
    );

    res.json({
      success: true,
      message: 'System announcement broadcasted successfully',
      data: result
    });

  } catch (error) {
    next(error);
  }
});

// Schedule announcement
router.post('/:id/schedule', requireAuth, requireAdminOrSuperAdmin, [
  body('scheduleTime').isISO8601().withMessage('Valid schedule time is required')
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

    const announcementId = req.params.id;
    const { scheduleTime } = req.body;

    const result = await AnnouncementNotificationService.scheduleAnnouncement(
      announcementId,
      scheduleTime
    );

    res.json({
      success: true,
      message: 'Announcement scheduled successfully',
      data: result
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;