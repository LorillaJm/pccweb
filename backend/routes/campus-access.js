const express = require('express');
const router = express.Router();
const CampusAccessQRService = require('../services/CampusAccessQRService');
const AccessControlService = require('../services/AccessControlService');
const DigitalIDService = require('../services/DigitalIDService');
const { requireAuth } = require('../middleware/sessionAuth');
const rateLimit = require('express-rate-limit');

// Initialize services
const campusAccessQRService = new CampusAccessQRService();
const accessControlService = new AccessControlService();
const digitalIDService = new DigitalIDService();

// Rate limiting for QR generation (prevent abuse)
const qrGenerationLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each user to 10 QR generations per windowMs
  message: { error: 'Too many QR code generation requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for access validation (more lenient for normal usage)
const accessValidationLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 access attempts per minute
  message: { error: 'Too many access validation requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @route POST /api/campus-access/generate-qr
 * @desc Generate secure QR code for campus access
 * @access Private
 */
router.post('/generate-qr', requireAuth, qrGenerationLimit, async (req, res) => {
  try {
    const userId = req.user.id;
    const { options = {} } = req.body;

    // Validate user has active digital ID
    const digitalIDResult = await digitalIDService.getDigitalID(userId);
    if (!digitalIDResult.success) {
      return res.status(404).json({
        success: false,
        message: 'No active digital ID found. Please contact administration.',
        error: digitalIDResult.message
      });
    }

    // Generate secure QR code
    const qrResult = await campusAccessQRService.generateSecureQRCode(userId, options);
    
    if (!qrResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to generate QR code',
        error: qrResult.error
      });
    }

    res.json({
      success: true,
      message: 'QR code generated successfully',
      qrCode: qrResult.qrCode,
      digitalID: digitalIDResult.digitalID
    });

  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during QR generation',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
});

/**
 * @route POST /api/campus-access/validate-qr
 * @desc Validate QR code for facility access
 * @access Public (for scanner devices)
 */
router.post('/validate-qr', accessValidationLimit, async (req, res) => {
  try {
    const { qrData, facilityId, deviceInfo = {}, isOffline = false } = req.body;

    // Validate required fields
    if (!qrData || !facilityId) {
      return res.status(400).json({
        success: false,
        message: 'QR data and facility ID are required',
        accessGranted: false
      });
    }

    // Add request metadata to device info
    const enhancedDeviceInfo = {
      ...deviceInfo,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date(),
      requestId: req.headers['x-request-id'] || 'unknown'
    };

    // Validate QR code access
    const validationResult = await campusAccessQRService.validateQRCodeAccess(
      qrData, 
      facilityId, 
      enhancedDeviceInfo, 
      isOffline
    );

    // Set appropriate HTTP status based on result
    const statusCode = validationResult.success ? 200 : 400;

    res.status(statusCode).json({
      ...validationResult,
      timestamp: new Date(),
      facilityId
    });

  } catch (error) {
    console.error('QR validation error:', error);
    res.status(500).json({
      success: false,
      accessGranted: false,
      message: 'Internal server error during QR validation',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error',
      timestamp: new Date()
    });
  }
});

/**
 * @route POST /api/campus-access/validate-offline
 * @desc Validate QR code using offline cache
 * @access Public (for offline scanner devices)
 */
router.post('/validate-offline', accessValidationLimit, async (req, res) => {
  try {
    const { qrData, facilityId, offlineCache, deviceInfo = {} } = req.body;

    // Validate required fields
    if (!qrData || !facilityId || !offlineCache) {
      return res.status(400).json({
        success: false,
        message: 'QR data, facility ID, and offline cache are required',
        accessGranted: false
      });
    }

    // Add request metadata to device info
    const enhancedDeviceInfo = {
      ...deviceInfo,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date(),
      offlineMode: true
    };

    // Validate using offline cache
    const validationResult = await campusAccessQRService.validateOfflineQRCode(
      qrData, 
      facilityId, 
      offlineCache, 
      enhancedDeviceInfo
    );

    res.json({
      ...validationResult,
      timestamp: new Date(),
      facilityId,
      offlineValidation: true
    });

  } catch (error) {
    console.error('Offline QR validation error:', error);
    res.status(500).json({
      success: false,
      accessGranted: false,
      message: 'Internal server error during offline QR validation',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error',
      timestamp: new Date()
    });
  }
});

/**
 * @route POST /api/campus-access/sync-offline-logs
 * @desc Sync offline access logs when connection is restored
 * @access Private (for scanner devices with authentication)
 */
router.post('/sync-offline-logs', requireAuth, async (req, res) => {
  try {
    const { offlineLogs } = req.body;

    if (!Array.isArray(offlineLogs)) {
      return res.status(400).json({
        success: false,
        message: 'Offline logs must be an array'
      });
    }

    // Sync offline logs
    const syncResult = await campusAccessQRService.syncOfflineAccessLogs(offlineLogs);

    res.json({
      ...syncResult,
      timestamp: new Date(),
      syncedBy: req.user.id
    });

  } catch (error) {
    console.error('Offline sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during offline sync',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
});

/**
 * @route GET /api/campus-access/offline-cache
 * @desc Generate offline validation cache for facilities
 * @access Private (for scanner devices)
 */
router.get('/offline-cache', requireAuth, async (req, res) => {
  try {
    const { facilityIds } = req.query;
    const facilityIdArray = facilityIds ? facilityIds.split(',') : [];

    // Generate offline cache
    const cacheResult = await campusAccessQRService.generateOfflineCache(facilityIdArray);

    if (!cacheResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to generate offline cache',
        error: cacheResult.error
      });
    }

    res.json({
      ...cacheResult,
      timestamp: new Date(),
      requestedBy: req.user.id
    });

  } catch (error) {
    console.error('Offline cache generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during cache generation',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
});

/**
 * @route GET /api/campus-access/access-history/:userId
 * @desc Get access history for a user
 * @access Private
 */
router.get('/access-history/:userId', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      facilityId, 
      startDate, 
      endDate, 
      limit = 50, 
      skip = 0, 
      accessResult 
    } = req.query;

    // Check if user can access this data (admin or own data)
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own access history.'
      });
    }

    const options = {
      facilityId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: parseInt(limit),
      skip: parseInt(skip),
      accessResult
    };

    // Get access history
    const historyResult = await accessControlService.getUserAccessHistory(userId, options);

    if (!historyResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to retrieve access history',
        error: historyResult.error
      });
    }

    res.json({
      ...historyResult,
      timestamp: new Date(),
      requestedBy: req.user.id
    });

  } catch (error) {
    console.error('Access history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during access history retrieval',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
});

/**
 * @route GET /api/campus-access/facility-stats/:facilityId
 * @desc Get facility access statistics
 * @access Private (admin only)
 */
router.get('/facility-stats/:facilityId', requireAuth, async (req, res) => {
  try {
    // Check admin access
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin or staff role required.'
      });
    }

    const { facilityId } = req.params;
    const { startDate, endDate } = req.query;

    const options = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined
    };

    // Get facility statistics
    const statsResult = await accessControlService.getFacilityStats(facilityId, options);

    if (!statsResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to retrieve facility statistics',
        error: statsResult.error
      });
    }

    res.json({
      ...statsResult,
      timestamp: new Date(),
      requestedBy: req.user.id
    });

  } catch (error) {
    console.error('Facility stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during facility stats retrieval',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
});

/**
 * @route POST /api/campus-access/emergency-lockdown
 * @desc Activate emergency lockdown for facilities
 * @access Private (admin only)
 */
router.post('/emergency-lockdown', requireAuth, async (req, res) => {
  try {
    // Check admin access
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required for emergency lockdown.'
      });
    }

    const { facilityIds, reason } = req.body;

    if (!facilityIds || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Facility IDs and reason are required for emergency lockdown'
      });
    }

    // Activate emergency lockdown
    const lockdownResult = await accessControlService.activateEmergencyLockdown(
      facilityIds, 
      reason, 
      req.user.id
    );

    if (!lockdownResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to activate emergency lockdown',
        error: lockdownResult.error
      });
    }

    res.json({
      ...lockdownResult,
      timestamp: new Date(),
      activatedBy: req.user.id
    });

  } catch (error) {
    console.error('Emergency lockdown error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during emergency lockdown',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
});

/**
 * @route POST /api/campus-access/emergency-unlock
 * @desc Deactivate emergency lockdown for facilities
 * @access Private (admin only)
 */
router.post('/emergency-unlock', requireAuth, async (req, res) => {
  try {
    // Check admin access
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required for emergency unlock.'
      });
    }

    const { facilityIds } = req.body;

    if (!facilityIds) {
      return res.status(400).json({
        success: false,
        message: 'Facility IDs are required for emergency unlock'
      });
    }

    // Deactivate emergency lockdown
    const unlockResult = await accessControlService.deactivateEmergencyLockdown(
      facilityIds, 
      req.user.id
    );

    if (!unlockResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to deactivate emergency lockdown',
        error: unlockResult.error
      });
    }

    res.json({
      ...unlockResult,
      timestamp: new Date(),
      deactivatedBy: req.user.id
    });

  } catch (error) {
    console.error('Emergency unlock error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during emergency unlock',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
});

/**
 * @route GET /api/campus-access/security-audit
 * @desc Get security audit report for QR access system
 * @access Private (admin only)
 */
router.get('/security-audit', requireAuth, async (req, res) => {
  try {
    // Check admin access
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required for security audit.'
      });
    }

    const { 
      startDate, 
      endDate, 
      facilityId, 
      userId, 
      includeSecurityIncidents = 'true' 
    } = req.query;

    const options = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      facilityId,
      userId,
      includeSecurityIncidents: includeSecurityIncidents === 'true'
    };

    // Generate security audit report
    const auditResult = await campusAccessQRService.getSecurityAuditReport(options);

    if (!auditResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to generate security audit report',
        error: auditResult.error
      });
    }

    res.json({
      ...auditResult,
      timestamp: new Date(),
      requestedBy: req.user.id
    });

  } catch (error) {
    console.error('Security audit error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during security audit',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
});

/**
 * @route GET /api/campus-access/suspicious-activity
 * @desc Detect and report suspicious access activity
 * @access Private (admin only)
 */
router.get('/suspicious-activity', requireAuth, async (req, res) => {
  try {
    // Check admin access
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required for suspicious activity detection.'
      });
    }

    const { 
      timeWindow = 5, 
      maxAttempts = 5, 
      facilityId 
    } = req.query;

    const options = {
      timeWindow: parseInt(timeWindow),
      maxAttempts: parseInt(maxAttempts),
      facilityId
    };

    // Detect suspicious activity
    const suspiciousResult = await accessControlService.detectSuspiciousActivity(options);

    if (!suspiciousResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to detect suspicious activity',
        error: suspiciousResult.error
      });
    }

    res.json({
      ...suspiciousResult,
      timestamp: new Date(),
      requestedBy: req.user.id
    });

  } catch (error) {
    console.error('Suspicious activity detection error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during suspicious activity detection',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
});

/**
 * @route GET /api/campus-access/my-digital-id
 * @desc Get current user's digital ID information
 * @access Private
 */
router.get('/my-digital-id', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get digital ID information
    const digitalIDResult = await digitalIDService.getDigitalID(userId);

    if (!digitalIDResult.success) {
      return res.status(404).json({
        success: false,
        message: 'No active digital ID found',
        error: digitalIDResult.message
      });
    }

    res.json({
      ...digitalIDResult,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Digital ID retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during digital ID retrieval',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
});

/**
 * @route GET /api/campus-access/health
 * @desc Health check endpoint for campus access system
 * @access Public
 */
router.get('/health', async (req, res) => {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date(),
      services: {
        campusAccessQR: 'operational',
        accessControl: 'operational',
        digitalID: 'operational'
      },
      version: '1.0.0'
    };

    res.json(healthStatus);

  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date(),
      error: error.message
    });
  }
});

module.exports = router;
