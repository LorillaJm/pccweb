const express = require('express');
const { query, param, validationResult } = require('express-validator');
const User = require('../models/User');
const EmailVerification = require('../models/EmailVerification');
const EmailVerificationService = require('../services/EmailVerificationService');
const NotificationService = require('../services/NotificationService');
const AuditLogService = require('../services/AuditLogService');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin')) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Admin access required'
      }
    });
  }
  next();
};

// Get all users with verification status
router.get('/verifications',
  verifyToken,
  requireAdmin,
  [
    query('status').optional().isIn(['all', 'verified', 'unverified']),
    query('search').optional().trim(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
  ],
  async (req, res, next) => {
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
        status = 'all',
        search = '',
        page = 1,
        limit = 20
      } = req.query;

      const skip = (page - 1) * limit;

      // Build query
      const query = {};

      // Filter by verification status
      if (status === 'verified') {
        query.emailVerified = true;
      } else if (status === 'unverified') {
        query.emailVerified = false;
      }

      // Search by name or email
      if (search) {
        query.$or = [
          { email: { $regex: search, $options: 'i' } },
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } }
        ];
      }

      // Get users
      const users = await User.find(query)
        .select('email firstName lastName emailVerified emailVerifiedAt createdAt role authProvider')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      // Get total count
      const total = await User.countDocuments(query);

      // Get pending verification info for unverified users
      const usersWithVerificationInfo = await Promise.all(
        users.map(async (user) => {
          if (!user.emailVerified) {
            const latestVerification = await EmailVerification.findOne({
              userId: user._id,
              verified: false
            }).sort({ createdAt: -1 }).lean();

            return {
              ...user,
              pendingVerification: latestVerification ? {
                createdAt: latestVerification.createdAt,
                expiresAt: latestVerification.expiresAt,
                attempts: latestVerification.attempts
              } : null
            };
          }
          return user;
        })
      );

      res.json({
        success: true,
        data: {
          users: usersWithVerificationInfo,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasMore: total > skip + limit
          }
        }
      });

    } catch (error) {
      next(error);
    }
  }
);

// Resend verification email for a user
router.post('/verifications/:userId/resend',
  verifyToken,
  requireAdmin,
  [
    param('userId').isMongoId()
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

      const { userId } = req.params;

      // Get user
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
      }

      // Check if already verified
      if (user.emailVerified) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ALREADY_VERIFIED',
            message: 'User email is already verified'
          }
        });
      }

      // Resend verification
      const { token, otp } = await EmailVerificationService.resendVerification(userId);

      // Send email
      const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
      const verificationLink = `${frontendURL}/auth/verify?token=${token}`;

      await NotificationService.sendNotification({
        userId: user._id,
        type: 'email',
        category: 'system',
        priority: 'high',
        title: 'Verify Your Email - PCC Portal',
        message: `Hi ${user.firstName},\n\nAn administrator has resent your verification email.\n\nMethod 1: Click the link below\n${verificationLink}\n\nMethod 2: Enter this code manually\nVerification Code: ${otp}\n\nThis link and code will expire in 24 hours.`,
        metadata: {
          verificationLink,
          otp,
          expiresIn: '24 hours',
          resentByAdmin: true
        }
      });

      // Log admin action
      await AuditLogService.logAdminAction(
        req.user.id,
        'admin_resend_verification',
        userId,
        'success',
        ipAddress,
        userAgent,
        { email: user.email }
      );

      res.json({
        success: true,
        message: 'Verification email resent successfully'
      });

    } catch (error) {
      await AuditLogService.logAdminAction(
        req.user.id,
        'admin_resend_verification_error',
        req.params.userId,
        'error',
        ipAddress,
        userAgent,
        { error: error.message }
      ).catch(err => console.error('Failed to log error:', err));

      next(error);
    }
  }
);

// Manually verify a user
router.post('/verifications/:userId/verify',
  verifyToken,
  requireAdmin,
  [
    param('userId').isMongoId()
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

      const { userId } = req.params;

      // Get user
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
      }

      // Check if already verified
      if (user.emailVerified) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ALREADY_VERIFIED',
            message: 'User email is already verified'
          }
        });
      }

      // Manually verify user
      user.emailVerified = true;
      user.emailVerifiedAt = new Date();
      await user.save();

      // Invalidate any pending verification tokens
      await EmailVerification.updateMany(
        { userId, verified: false },
        { $set: { verified: true, verifiedAt: new Date() } }
      );

      // Send notification to user
      await NotificationService.sendNotification({
        userId: user._id,
        type: 'email',
        category: 'system',
        priority: 'high',
        title: 'Email Verified - PCC Portal',
        message: `Hi ${user.firstName},\n\nYour email has been verified by an administrator. You can now log in to your account.\n\nIf you have any questions, please contact support.`,
        metadata: {
          manuallyVerified: true
        }
      });

      // Log admin action
      await AuditLogService.logAdminAction(
        req.user.id,
        'admin_manual_verification',
        userId,
        'success',
        ipAddress,
        userAgent,
        { email: user.email }
      );

      res.json({
        success: true,
        message: 'User verified successfully'
      });

    } catch (error) {
      await AuditLogService.logAdminAction(
        req.user.id,
        'admin_manual_verification_error',
        req.params.userId,
        'error',
        ipAddress,
        userAgent,
        { error: error.message }
      ).catch(err => console.error('Failed to log error:', err));

      next(error);
    }
  }
);

// Get verification logs
router.get('/verifications/logs',
  verifyToken,
  requireAdmin,
  [
    query('userId').optional().isMongoId(),
    query('action').optional().trim(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
  ],
  async (req, res, next) => {
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
        userId,
        action,
        page = 1,
        limit = 50
      } = req.query;

      const skip = (page - 1) * limit;

      // Get logs
      const options = { limit, skip };
      let result;

      if (userId) {
        result = await AuditLogService.getLogsByUser(userId, options);
      } else if (action) {
        result = await AuditLogService.getLogsByAction(action, options);
      } else {
        result = await AuditLogService.getLogsByCategory('verification', options);
      }

      res.json({
        success: true,
        data: {
          logs: result.logs,
          pagination: {
            page,
            limit,
            total: result.total,
            totalPages: Math.ceil(result.total / limit),
            hasMore: result.hasMore
          }
        }
      });

    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
