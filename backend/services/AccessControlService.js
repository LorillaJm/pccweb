const DigitalID = require('../models/DigitalID');
const AccessLog = require('../models/AccessLog');
const Facility = require('../models/Facility');
const User = require('../models/User');
const notificationService = require('./NotificationService');
const accessNotificationService = require('./AccessNotificationService');

/**
 * AccessControlService - Service for managing facility access control
 * Handles access validation, logging, and security features
 */
class AccessControlService {
  constructor() {
    this.notificationService = notificationService;
    this.suspiciousActivityThreshold = {
      maxFailedAttempts: 5,
      timeWindowMinutes: 5,
      lockoutDurationMinutes: 15
    };
  }

  /**
   * Validate access to a facility using QR code
   * @param {string} qrData - QR code data
   * @param {string} facilityId - Facility ID
   * @param {Object} deviceInfo - Device information
   * @returns {Promise<Object>} Access validation result
   */
  async validateFacilityAccess(qrData, facilityId, deviceInfo = {}) {
    const startTime = Date.now();
    let accessResult = 'denied';
    let denialReason = null;
    let digitalID = null;
    let user = null;
    let facility = null;

    try {
      // Validate QR code and get digital ID
      const qrValidation = await this._validateQRCode(qrData);
      if (!qrValidation.isValid) {
        denialReason = qrValidation.reason;
        await this._logAccessAttempt({
          qrData,
          facilityId,
          accessResult,
          denialReason,
          deviceInfo,
          responseTime: Date.now() - startTime
        });
        return {
          success: false,
          accessGranted: false,
          reason: denialReason,
          timestamp: new Date()
        };
      }

      digitalID = qrValidation.digitalID;
      user = digitalID.userId;

      // Get facility information
      facility = await Facility.findOne({ facilityId, isActive: true });
      if (!facility) {
        denialReason = 'Facility not found or inactive';
        await this._logAccessAttempt({
          userId: user._id,
          digitalIdId: digitalID._id,
          qrData,
          facilityId,
          facilityName: 'Unknown Facility',
          accessResult,
          denialReason,
          deviceInfo,
          responseTime: Date.now() - startTime
        });
        return {
          success: false,
          accessGranted: false,
          reason: denialReason,
          user: this._sanitizeUserInfo(user),
          timestamp: new Date()
        };
      }

      // Check if user is currently locked out
      const lockoutCheck = await this._checkUserLockout(user._id, facilityId);
      if (lockoutCheck.isLockedOut) {
        denialReason = `User is locked out until ${lockoutCheck.lockoutUntil}`;
        await this._logAccessAttempt({
          userId: user._id,
          digitalIdId: digitalID._id,
          qrData,
          facilityId,
          facilityName: facility.name,
          accessResult,
          denialReason,
          deviceInfo,
          responseTime: Date.now() - startTime,
          metadata: { securityFlags: ['user_lockout'] }
        });
        return {
          success: false,
          accessGranted: false,
          reason: denialReason,
          user: this._sanitizeUserInfo(user),
          facility: this._sanitizeFacilityInfo(facility),
          timestamp: new Date()
        };
      }

      // Check facility access permissions
      const facilityAccess = await this._checkFacilityAccess(user, digitalID, facility);
      if (!facilityAccess.hasAccess) {
        denialReason = facilityAccess.reason;
        accessResult = 'denied';
      } else {
        accessResult = 'granted';
        
        // Update facility occupancy if access granted
        if (facility.capacity) {
          await facility.updateOccupancy(1);
        }
      }

      // Log access attempt
      const logResult = await this._logAccessAttempt({
        userId: user._id,
        digitalIdId: digitalID._id,
        qrData,
        facilityId,
        facilityName: facility.name,
        accessResult,
        denialReason,
        deviceInfo,
        responseTime: Date.now() - startTime,
        metadata: facilityAccess.metadata || {}
      });

      // Check for suspicious activity if access was denied
      if (accessResult === 'denied') {
        await this._checkSuspiciousActivity(user._id, facilityId, deviceInfo);
        
        // Send access denied notification
        await accessNotificationService.sendAccessAttemptNotification(user._id, {
          facilityName: facility.name,
          accessResult,
          timestamp: new Date(),
          denialReason
        });
      }

      // Send notifications if configured
      if (accessResult === 'granted' && facility.metadata?.notifyOnAccess) {
        await this._sendAccessNotification(user, facility, 'granted');
      }

      return {
        success: true,
        accessGranted: accessResult === 'granted',
        reason: denialReason,
        user: this._sanitizeUserInfo(user),
        facility: this._sanitizeFacilityInfo(facility),
        digitalID: {
          id: digitalID._id,
          accessLevel: digitalID.accessLevel,
          expiresAt: digitalID.expiresAt
        },
        additionalRequirements: facilityAccess.additionalRequirements || [],
        timestamp: new Date(),
        logId: logResult._id
      };

    } catch (error) {
      // Log system error
      await this._logAccessAttempt({
        qrData,
        facilityId,
        facilityName: facility?.name || 'Unknown',
        accessResult: 'denied',
        denialReason: 'System error during validation',
        deviceInfo,
        responseTime: Date.now() - startTime,
        metadata: { systemError: error.message }
      });

      return {
        success: false,
        accessGranted: false,
        reason: 'System error during access validation',
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Check facility access permissions for a user
   * @param {string} userId - User ID
   * @param {string} facilityId - Facility ID
   * @param {Date} timeOfAccess - Time of access attempt
   * @returns {Promise<Object>} Access check result
   */
  async checkFacilityAccess(userId, facilityId, timeOfAccess = new Date()) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { hasAccess: false, reason: 'User not found' };
      }

      const digitalID = await DigitalID.findActiveByUser(userId);
      if (!digitalID) {
        return { hasAccess: false, reason: 'No active digital ID found' };
      }

      const facility = await Facility.findOne({ facilityId, isActive: true });
      if (!facility) {
        return { hasAccess: false, reason: 'Facility not found or inactive' };
      }

      return this._checkFacilityAccess(user, digitalID, facility, timeOfAccess);

    } catch (error) {
      return {
        hasAccess: false,
        reason: 'System error during access check',
        error: error.message
      };
    }
  }

  /**
   * Log access attempt with comprehensive details
   * @param {string} userId - User ID
   * @param {string} facilityId - Facility ID
   * @param {string} result - Access result ('granted' or 'denied')
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Log result
   */
  async logAccessAttempt(userId, facilityId, result, metadata = {}) {
    try {
      const user = await User.findById(userId);
      const digitalID = await DigitalID.findActiveByUser(userId);
      const facility = await Facility.findOne({ facilityId });

      return this._logAccessAttempt({
        userId,
        digitalIdId: digitalID?._id,
        facilityId,
        facilityName: facility?.name || 'Unknown Facility',
        accessResult: result,
        denialReason: metadata.reason,
        deviceInfo: metadata.deviceInfo || {},
        qrData: metadata.qrData,
        responseTime: metadata.responseTime,
        metadata: metadata.additionalData || {}
      });

    } catch (error) {
      throw new Error(`Failed to log access attempt: ${error.message}`);
    }
  }

  /**
   * Get access history for a user
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Access history
   */
  async getUserAccessHistory(userId, options = {}) {
    try {
      const accessLogs = await AccessLog.getUserAccessHistory(userId, options);
      
      const summary = await AccessLog.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: '$accessResult',
            count: { $sum: 1 },
            lastAccess: { $max: '$accessTime' }
          }
        }
      ]);

      return {
        success: true,
        accessLogs,
        summary: {
          total: accessLogs.length,
          granted: summary.find(s => s._id === 'granted')?.count || 0,
          denied: summary.find(s => s._id === 'denied')?.count || 0,
          lastAccess: Math.max(...summary.map(s => s.lastAccess)) || null
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve access history'
      };
    }
  }

  /**
   * Get facility access statistics
   * @param {string} facilityId - Facility ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Facility statistics
   */
  async getFacilityStats(facilityId, options = {}) {
    try {
      const stats = await AccessLog.getFacilityStats(facilityId, options);
      const recentAccess = await AccessLog.getRecentFacilityAccess(facilityId, 60);
      
      return {
        success: true,
        dailyStats: stats,
        recentAccess,
        summary: {
          totalAttempts: stats.reduce((sum, day) => sum + day.total, 0),
          totalGranted: stats.reduce((sum, day) => sum + day.granted, 0),
          totalDenied: stats.reduce((sum, day) => sum + day.denied, 0),
          successRate: stats.length > 0 ? 
            (stats.reduce((sum, day) => sum + day.granted, 0) / 
             stats.reduce((sum, day) => sum + day.total, 0) * 100).toFixed(2) : 0
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve facility statistics'
      };
    }
  }

  /**
   * Activate emergency lockdown for facilities
   * @param {Array|string} facilityIds - Facility ID(s) to lock down
   * @param {string} reason - Lockdown reason
   * @param {string} activatedBy - User ID activating lockdown
   * @returns {Promise<Object>} Lockdown result
   */
  async activateEmergencyLockdown(facilityIds, reason, activatedBy) {
    try {
      const facilities = Array.isArray(facilityIds) ? facilityIds : [facilityIds];
      const results = {
        successful: [],
        failed: []
      };

      for (const facilityId of facilities) {
        try {
          const facility = await Facility.findOne({ facilityId });
          if (facility) {
            await facility.activateEmergencyLockdown(reason, activatedBy);
            results.successful.push(facilityId);
            
            // Send emergency notifications
            await accessNotificationService.sendEmergencyLockdownNotification(facilityId, reason);
          } else {
            results.failed.push({ facilityId, reason: 'Facility not found' });
          }
        } catch (error) {
          results.failed.push({ facilityId, reason: error.message });
        }
      }

      return {
        success: true,
        results,
        message: `Lockdown activated for ${results.successful.length} facilities`
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to activate emergency lockdown'
      };
    }
  }

  /**
   * Deactivate emergency lockdown for facilities
   * @param {Array|string} facilityIds - Facility ID(s) to unlock
   * @param {string} deactivatedBy - User ID deactivating lockdown
   * @returns {Promise<Object>} Unlock result
   */
  async deactivateEmergencyLockdown(facilityIds, deactivatedBy) {
    try {
      const facilities = Array.isArray(facilityIds) ? facilityIds : [facilityIds];
      const results = {
        successful: [],
        failed: []
      };

      for (const facilityId of facilities) {
        try {
          const facility = await Facility.findOne({ facilityId });
          if (facility && facility.emergencySettings.lockdownActive) {
            await facility.deactivateEmergencyLockdown();
            results.successful.push(facilityId);
            
            // Send unlock notifications
            await accessNotificationService.sendLockdownDeactivationNotification(facilityId);
          } else {
            results.failed.push({ 
              facilityId, 
              reason: facility ? 'Not under lockdown' : 'Facility not found' 
            });
          }
        } catch (error) {
          results.failed.push({ facilityId, reason: error.message });
        }
      }

      return {
        success: true,
        results,
        message: `Lockdown deactivated for ${results.successful.length} facilities`
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to deactivate emergency lockdown'
      };
    }
  }

  /**
   * Detect and report suspicious access activity
   * @param {Object} options - Detection options
   * @returns {Promise<Object>} Suspicious activity report
   */
  async detectSuspiciousActivity(options = {}) {
    try {
      const suspiciousActivity = await AccessLog.detectSuspiciousActivity(options);
      
      // Process and categorize suspicious activities
      const categorized = {
        multipleFailedAttempts: [],
        unusualTimeAccess: [],
        deviceAnomalies: [],
        locationAnomalies: []
      };

      for (const activity of suspiciousActivity) {
        if (activity.attempts >= this.suspiciousActivityThreshold.maxFailedAttempts) {
          categorized.multipleFailedAttempts.push(activity);
        }
        // Add more categorization logic as needed
      }

      return {
        success: true,
        suspiciousActivity: categorized,
        totalIncidents: suspiciousActivity.length,
        timestamp: new Date()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to detect suspicious activity'
      };
    }
  }

  // Private helper methods

  /**
   * Validate QR code using DigitalIDService
   * @param {string} qrData - QR code data
   * @returns {Promise<Object>} Validation result
   */
  async _validateQRCode(qrData) {
    const DigitalIDService = require('./DigitalIDService');
    const digitalIDService = new DigitalIDService();
    return digitalIDService.validateQRCode(qrData);
  }

  /**
   * Check facility access permissions
   * @param {Object} user - User object
   * @param {Object} digitalID - Digital ID object
   * @param {Object} facility - Facility object
   * @param {Date} timeOfAccess - Time of access
   * @returns {Object} Access check result
   */
  _checkFacilityAccess(user, digitalID, facility, timeOfAccess = new Date()) {
    // Check digital ID validity
    if (!digitalID.isValid) {
      return { 
        hasAccess: false, 
        reason: digitalID.isExpired ? 'Digital ID has expired' : 'Digital ID is inactive' 
      };
    }

    // Check facility-specific permissions in digital ID
    const digitalIDAccess = digitalID.hasAccessToFacility(facility.facilityId, timeOfAccess);
    if (!digitalIDAccess.hasAccess) {
      return digitalIDAccess;
    }

    // Check facility's role-based access requirements
    const facilityAccess = facility.checkRoleAccess(user.role, digitalID.accessLevel, timeOfAccess);
    if (!facilityAccess.hasAccess) {
      return facilityAccess;
    }

    return {
      hasAccess: true,
      digitalIDPermission: digitalIDAccess.permission,
      facilityRequirement: facilityAccess.accessRequirement,
      additionalRequirements: facilityAccess.additionalRequirements
    };
  }

  /**
   * Log access attempt with comprehensive details
   * @param {Object} logData - Log data
   * @returns {Promise<Object>} Log result
   */
  async _logAccessAttempt(logData) {
    return AccessLog.logAccessAttempt(logData);
  }

  /**
   * Check if user is currently locked out
   * @param {string} userId - User ID
   * @param {string} facilityId - Facility ID
   * @returns {Promise<Object>} Lockout status
   */
  async _checkUserLockout(userId, facilityId) {
    const lockoutDuration = this.suspiciousActivityThreshold.lockoutDurationMinutes * 60 * 1000;
    const cutoffTime = new Date(Date.now() - lockoutDuration);

    const recentFailures = await AccessLog.countDocuments({
      userId,
      facilityId,
      accessResult: 'denied',
      accessTime: { $gte: cutoffTime },
      'metadata.securityFlags': { $in: ['multiple_attempts', 'suspicious_timing'] }
    });

    const isLockedOut = recentFailures >= this.suspiciousActivityThreshold.maxFailedAttempts;
    
    return {
      isLockedOut,
      lockoutUntil: isLockedOut ? new Date(Date.now() + lockoutDuration) : null,
      failureCount: recentFailures
    };
  }

  /**
   * Check for suspicious activity patterns
   * @param {string} userId - User ID
   * @param {string} facilityId - Facility ID
   * @param {Object} deviceInfo - Device information
   * @returns {Promise<void>}
   */
  async _checkSuspiciousActivity(userId, facilityId, deviceInfo) {
    const timeWindow = this.suspiciousActivityThreshold.timeWindowMinutes * 60 * 1000;
    const cutoffTime = new Date(Date.now() - timeWindow);

    const recentAttempts = await AccessLog.countDocuments({
      userId,
      facilityId,
      accessResult: 'denied',
      accessTime: { $gte: cutoffTime }
    });

    if (recentAttempts >= this.suspiciousActivityThreshold.maxFailedAttempts) {
      // Flag as suspicious and notify security
      await this._flagSuspiciousActivity(userId, facilityId, {
        attemptCount: recentAttempts,
        timeWindow: this.suspiciousActivityThreshold.timeWindowMinutes,
        deviceInfo
      });

      // Send security alert to user
      const facility = await Facility.findOne({ facilityId });
      await accessNotificationService.sendSecurityAlertNotification(userId, 'multiple_failed_attempts', {
        facilityName: facility?.name || 'Unknown Facility',
        attemptCount: recentAttempts,
        timeWindow: this.suspiciousActivityThreshold.timeWindowMinutes
      });
    }
  }

  /**
   * Flag suspicious activity and send alerts
   * @param {string} userId - User ID
   * @param {string} facilityId - Facility ID
   * @param {Object} details - Activity details
   * @returns {Promise<void>}
   */
  async _flagSuspiciousActivity(userId, facilityId, details) {
    try {
      const user = await User.findById(userId);
      const facility = await Facility.findOne({ facilityId });

      // Send security alert
      await this.notificationService.sendNotification('security_team', {
        title: 'Suspicious Access Activity Detected',
        message: `Multiple failed access attempts detected for ${user?.firstName} ${user?.lastName} at ${facility?.name}`,
        type: 'warning',
        category: 'security',
        priority: 'high',
        data: {
          userId,
          facilityId,
          details
        }
      });

    } catch (error) {
      console.error('Failed to flag suspicious activity:', error);
    }
  }

  /**
   * Send access notification
   * @param {Object} user - User object
   * @param {Object} facility - Facility object
   * @param {string} result - Access result
   * @returns {Promise<void>}
   */
  async _sendAccessNotification(user, facility, result) {
    try {
      await this.notificationService.sendNotification(user._id, {
        title: 'Facility Access',
        message: `Access ${result} to ${facility.name}`,
        type: result === 'granted' ? 'success' : 'warning',
        category: 'access',
        data: {
          facilityId: facility.facilityId,
          facilityName: facility.name,
          accessResult: result,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Failed to send access notification:', error);
    }
  }

  /**
   * Send emergency notification
   * @param {Object} facility - Facility object
   * @param {string} reason - Emergency reason
   * @param {string} type - Notification type
   * @returns {Promise<void>}
   */
  async _sendEmergencyNotification(facility, reason, type) {
    try {
      await this.notificationService.broadcastNotification('all_users', {
        title: 'Emergency Alert',
        message: type === 'lockdown_activated' 
          ? `Emergency lockdown activated for ${facility.name}: ${reason}`
          : `Emergency lockdown deactivated for ${facility.name}`,
        type: 'error',
        category: 'emergency',
        priority: 'urgent',
        data: {
          facilityId: facility.facilityId,
          facilityName: facility.name,
          emergencyType: type,
          reason
        }
      });
    } catch (error) {
      console.error('Failed to send emergency notification:', error);
    }
  }

  /**
   * Sanitize user information for response
   * @param {Object} user - User object
   * @returns {Object} Sanitized user info
   */
  _sanitizeUserInfo(user) {
    return {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      studentId: user.studentId,
      role: user.role
    };
  }

  /**
   * Sanitize facility information for response
   * @param {Object} facility - Facility object
   * @returns {Object} Sanitized facility info
   */
  _sanitizeFacilityInfo(facility) {
    return {
      id: facility._id,
      facilityId: facility.facilityId,
      name: facility.name,
      type: facility.type,
      location: facility.location,
      building: facility.building,
      capacity: facility.capacity,
      currentOccupancy: facility.currentOccupancy,
      isCurrentlyOpen: facility.isCurrentlyOpen,
      occupancyStatus: facility.occupancyStatus
    };
  }
}

module.exports = AccessControlService;