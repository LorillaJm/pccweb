const DigitalID = require('../models/DigitalID');
const AccessLog = require('../models/AccessLog');
const Facility = require('../models/Facility');
const User = require('../models/User');
const accessNotificationService = require('./AccessNotificationService');
const QRCode = require('qrcode');
const crypto = require('crypto');

/**
 * DigitalIDService - Service for managing digital IDs and QR code generation
 * Handles ID creation, validation, updates, and security features
 */
class DigitalIDService {
  constructor() {
    this.qrCodeOptions = {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    };
  }

  /**
   * Generate a new digital ID for a user
   * @param {string} userId - User ID
   * @param {Object} options - ID generation options
   * @returns {Promise<Object>} Generated digital ID
   */
  async generateDigitalID(userId, options = {}) {
    try {
      // Validate user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if user already has an active digital ID
      const existingID = await DigitalID.findActiveByUser(userId);
      if (existingID && !options.forceRegenerate) {
        throw new Error('User already has an active digital ID');
      }

      // Deactivate existing ID if regenerating
      if (existingID && options.forceRegenerate) {
        existingID.isActive = false;
        await existingID.save();
      }

      // Determine access level based on user role
      const accessLevel = this._determineAccessLevel(user.role);
      
      // Generate unique QR code data
      const qrData = this._generateQRData(userId, user.role, accessLevel);
      
      // Create digital ID record
      const digitalID = new DigitalID({
        userId,
        qrCode: qrData,
        accessLevel,
        permissions: await this._getDefaultPermissions(user.role, accessLevel),
        issuedAt: new Date(),
        expiresAt: this._calculateExpirationDate(user.role),
        metadata: {
          issuer: options.issuerId || null,
          emergencyContact: options.emergencyContact || null
        }
      });

      // Generate QR code image
      digitalID.qrCodeImage = await this._generateQRCodeImage(qrData);
      
      // Save digital ID
      await digitalID.save();

      // Send notification
      await accessNotificationService.sendDigitalIDUpdateNotification(
        userId,
        options.forceRegenerate ? 'renewed' : 'generated'
      );

      return {
        success: true,
        digitalID: await digitalID.populate('userId', 'firstName lastName email studentId role'),
        message: 'Digital ID generated successfully'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to generate digital ID'
      };
    }
  }

  /**
   * Validate a QR code and return digital ID information
   * @param {string} qrData - QR code data to validate
   * @returns {Promise<Object>} Validation result
   */
  async validateQRCode(qrData) {
    try {
      // Find digital ID by QR code
      const digitalID = await DigitalID.findByQRCode(qrData);
      if (!digitalID) {
        return {
          isValid: false,
          reason: 'Invalid QR code',
          digitalID: null
        };
      }

      // Check if ID is active and not expired
      if (!digitalID.isValid) {
        return {
          isValid: false,
          reason: digitalID.isExpired ? 'Digital ID has expired' : 'Digital ID is inactive',
          digitalID
        };
      }

      // Validate security hash
      if (!digitalID.validateSecurityHash()) {
        return {
          isValid: false,
          reason: 'Security validation failed - possible tampering detected',
          digitalID
        };
      }

      // Update last access attempt
      digitalID.metadata.lastAccessAttempt = new Date();
      digitalID.metadata.totalAccessAttempts = (digitalID.metadata.totalAccessAttempts || 0) + 1;
      await digitalID.save();

      return {
        isValid: true,
        digitalID,
        user: digitalID.userId,
        permissions: digitalID.permissions
      };

    } catch (error) {
      return {
        isValid: false,
        reason: 'System error during validation',
        error: error.message,
        digitalID: null
      };
    }
  }

  /**
   * Update access permissions for a digital ID
   * @param {string} userId - User ID
   * @param {Array} permissions - New permissions array
   * @param {string} updatedBy - ID of user making the update
   * @returns {Promise<Object>} Update result
   */
  async updateAccessPermissions(userId, permissions, updatedBy) {
    try {
      const digitalID = await DigitalID.findActiveByUser(userId);
      if (!digitalID) {
        throw new Error('No active digital ID found for user');
      }

      // Validate permissions format
      this._validatePermissions(permissions);

      // Update permissions
      digitalID.permissions = permissions;
      digitalID.metadata.lastUpdatedBy = updatedBy;
      
      // Regenerate security hash due to permission changes
      digitalID.securityHash = digitalID.generateSecurityHash();
      digitalID.lastUpdated = new Date();

      await digitalID.save();

      // Send notification
      await accessNotificationService.sendDigitalIDUpdateNotification(
        userId,
        'updated'
      );

      return {
        success: true,
        digitalID: await digitalID.populate('userId', 'firstName lastName email studentId role'),
        message: 'Access permissions updated successfully'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to update access permissions'
      };
    }
  }

  /**
   * Add facility permission to a digital ID
   * @param {string} userId - User ID
   * @param {Object} facilityPermission - Facility permission details
   * @returns {Promise<Object>} Operation result
   */
  async addFacilityPermission(userId, facilityPermission) {
    try {
      const digitalID = await DigitalID.findActiveByUser(userId);
      if (!digitalID) {
        throw new Error('No active digital ID found for user');
      }

      const { facilityId, facilityName, accessType, timeRestrictions, expiresAt } = facilityPermission;

      await digitalID.addFacilityPermission(facilityId, facilityName, accessType, timeRestrictions, expiresAt);

      // Send notification
      await accessNotificationService.sendDigitalIDUpdateNotification(
        userId,
        'permission_added',
        { facilityName }
      );

      return {
        success: true,
        digitalID: await digitalID.populate('userId', 'firstName lastName email studentId role'),
        message: 'Facility permission added successfully'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to add facility permission'
      };
    }
  }

  /**
   * Remove facility permission from a digital ID
   * @param {string} userId - User ID
   * @param {string} facilityId - Facility ID to remove
   * @returns {Promise<Object>} Operation result
   */
  async removeFacilityPermission(userId, facilityId) {
    try {
      const digitalID = await DigitalID.findActiveByUser(userId);
      if (!digitalID) {
        throw new Error('No active digital ID found for user');
      }

      const permission = digitalID.permissions.find(p => p.facilityId === facilityId);
      const facilityName = permission?.facilityName || 'Unknown Facility';

      await digitalID.removeFacilityPermission(facilityId);

      // Send notification
      await accessNotificationService.sendDigitalIDUpdateNotification(
        userId,
        'permission_removed',
        { facilityName }
      );

      return {
        success: true,
        digitalID: await digitalID.populate('userId', 'firstName lastName email studentId role'),
        message: 'Facility permission removed successfully'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to remove facility permission'
      };
    }
  }

  /**
   * Suspend a digital ID
   * @param {string} userId - User ID
   * @param {string} reason - Suspension reason
   * @param {string} suspendedBy - ID of user performing suspension
   * @returns {Promise<Object>} Operation result
   */
  async suspendDigitalID(userId, reason, suspendedBy) {
    try {
      const digitalID = await DigitalID.findActiveByUser(userId);
      if (!digitalID) {
        throw new Error('No active digital ID found for user');
      }

      digitalID.isActive = false;
      digitalID.metadata.suspensionReason = reason;
      digitalID.metadata.suspendedBy = suspendedBy;
      digitalID.metadata.suspendedAt = new Date();

      await digitalID.save();

      // Send notification
      await accessNotificationService.sendDigitalIDUpdateNotification(
        userId,
        'suspended',
        { reason }
      );

      return {
        success: true,
        digitalID: await digitalID.populate('userId', 'firstName lastName email studentId role'),
        message: 'Digital ID suspended successfully'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to suspend digital ID'
      };
    }
  }

  /**
   * Reactivate a suspended digital ID
   * @param {string} userId - User ID
   * @param {string} reactivatedBy - ID of user performing reactivation
   * @returns {Promise<Object>} Operation result
   */
  async reactivateDigitalID(userId, reactivatedBy) {
    try {
      const digitalID = await DigitalID.findOne({ userId, isActive: false });
      if (!digitalID) {
        throw new Error('No suspended digital ID found for user');
      }

      // Check if ID has expired
      if (digitalID.isExpired) {
        throw new Error('Cannot reactivate expired digital ID. Please generate a new one.');
      }

      digitalID.isActive = true;
      digitalID.metadata.suspensionReason = null;
      digitalID.metadata.reactivatedBy = reactivatedBy;
      digitalID.metadata.reactivatedAt = new Date();

      await digitalID.save();

      // Send notification
      await accessNotificationService.sendDigitalIDUpdateNotification(
        userId,
        'reactivated'
      );

      return {
        success: true,
        digitalID: await digitalID.populate('userId', 'firstName lastName email studentId role'),
        message: 'Digital ID reactivated successfully'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to reactivate digital ID'
      };
    }
  }

  /**
   * Get digital ID information for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Digital ID information
   */
  async getDigitalID(userId) {
    try {
      const digitalID = await DigitalID.findActiveByUser(userId);
      if (!digitalID) {
        return {
          success: false,
          message: 'No active digital ID found for user'
        };
      }

      return {
        success: true,
        digitalID,
        isValid: digitalID.isValid,
        isExpired: digitalID.isExpired,
        expiresIn: Math.ceil((digitalID.expiresAt - new Date()) / (1000 * 60 * 60 * 24)) // days
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve digital ID'
      };
    }
  }

  /**
   * Find expiring digital IDs
   * @param {number} daysFromNow - Number of days from now to check
   * @returns {Promise<Array>} List of expiring digital IDs
   */
  async findExpiringIDs(daysFromNow = 30) {
    try {
      const expiringIDs = await DigitalID.findExpiringIDs(daysFromNow);
      return {
        success: true,
        expiringIDs,
        count: expiringIDs.length
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to find expiring digital IDs'
      };
    }
  }

  /**
   * Bulk update access levels for multiple users
   * @param {Array} userIds - Array of user IDs
   * @param {string} newAccessLevel - New access level
   * @param {string} updatedBy - ID of user making the update
   * @returns {Promise<Object>} Bulk update result
   */
  async bulkUpdateAccessLevel(userIds, newAccessLevel, updatedBy) {
    try {
      const results = {
        successful: [],
        failed: []
      };

      for (const userId of userIds) {
        try {
          const digitalID = await DigitalID.findActiveByUser(userId);
          if (digitalID) {
            await digitalID.updateAccessLevel(newAccessLevel);
            digitalID.metadata.lastUpdatedBy = updatedBy;
            await digitalID.save();
            results.successful.push(userId);
          } else {
            results.failed.push({ userId, reason: 'No active digital ID found' });
          }
        } catch (error) {
          results.failed.push({ userId, reason: error.message });
        }
      }

      return {
        success: true,
        results,
        message: `Updated ${results.successful.length} digital IDs, ${results.failed.length} failed`
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to perform bulk update'
      };
    }
  }

  /**
   * Validate access to a facility (integration with AccessControlService)
   * @param {string} qrData - QR code data
   * @param {string} facilityId - Facility ID
   * @param {Object} deviceInfo - Device information
   * @returns {Promise<Object>} Access validation result
   */
  async validateAccess(qrData, facilityId, deviceInfo = {}) {
    try {
      // Use AccessControlService for comprehensive access validation
      const AccessControlService = require('./AccessControlService');
      const accessControlService = new AccessControlService();
      
      return accessControlService.validateFacilityAccess(qrData, facilityId, deviceInfo);

    } catch (error) {
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
   * Emergency lockdown - suspend all digital IDs for specific users or roles
   * @param {Object} criteria - Lockdown criteria
   * @param {string} reason - Lockdown reason
   * @param {string} activatedBy - User ID activating lockdown
   * @returns {Promise<Object>} Lockdown result
   */
  async emergencyLockdown(criteria, reason, activatedBy) {
    try {
      const { userIds, roles, accessLevels } = criteria;
      let query = { isActive: true };

      // Build query based on criteria
      if (userIds && userIds.length > 0) {
        query.userId = { $in: userIds };
      }

      if (roles || accessLevels) {
        // Need to populate user data to filter by role
        const digitalIDs = await DigitalID.find(query).populate('userId', 'role');
        
        const filteredIds = digitalIDs.filter(digitalID => {
          const user = digitalID.userId;
          const roleMatch = !roles || roles.includes(user.role);
          const accessLevelMatch = !accessLevels || accessLevels.includes(digitalID.accessLevel);
          return roleMatch && accessLevelMatch;
        }).map(digitalID => digitalID._id);

        query = { _id: { $in: filteredIds } };
      }

      // Suspend matching digital IDs
      const updateResult = await DigitalID.updateMany(query, {
        isActive: false,
        'metadata.suspensionReason': reason,
        'metadata.suspendedBy': activatedBy,
        'metadata.suspendedAt': new Date(),
        'metadata.emergencyLockdown': true
      });

      // Log emergency action
      await this._logEmergencyAction('lockdown', criteria, reason, activatedBy, updateResult.modifiedCount);

      return {
        success: true,
        affectedCount: updateResult.modifiedCount,
        message: `Emergency lockdown activated for ${updateResult.modifiedCount} digital IDs`,
        reason,
        timestamp: new Date()
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
   * Emergency unlock - reactivate digital IDs after lockdown
   * @param {Object} criteria - Unlock criteria
   * @param {string} reactivatedBy - User ID reactivating IDs
   * @returns {Promise<Object>} Unlock result
   */
  async emergencyUnlock(criteria, reactivatedBy) {
    try {
      const { userIds, roles, accessLevels } = criteria;
      let query = { 
        isActive: false, 
        'metadata.emergencyLockdown': true 
      };

      // Build query based on criteria
      if (userIds && userIds.length > 0) {
        query.userId = { $in: userIds };
      }

      if (roles || accessLevels) {
        const digitalIDs = await DigitalID.find(query).populate('userId', 'role');
        
        const filteredIds = digitalIDs.filter(digitalID => {
          const user = digitalID.userId;
          const roleMatch = !roles || roles.includes(user.role);
          const accessLevelMatch = !accessLevels || accessLevels.includes(digitalID.accessLevel);
          return roleMatch && accessLevelMatch;
        }).map(digitalID => digitalID._id);

        query = { _id: { $in: filteredIds } };
      }

      // Check for expired IDs and exclude them
      const digitalIDs = await DigitalID.find(query);
      const validIds = digitalIDs.filter(digitalID => !digitalID.isExpired).map(digitalID => digitalID._id);

      // Reactivate valid digital IDs
      const updateResult = await DigitalID.updateMany(
        { _id: { $in: validIds } },
        {
          isActive: true,
          'metadata.suspensionReason': null,
          'metadata.reactivatedBy': reactivatedBy,
          'metadata.reactivatedAt': new Date(),
          'metadata.emergencyLockdown': false
        }
      );

      // Log emergency action
      await this._logEmergencyAction('unlock', criteria, 'Emergency unlock', reactivatedBy, updateResult.modifiedCount);

      return {
        success: true,
        affectedCount: updateResult.modifiedCount,
        expiredCount: digitalIDs.length - validIds.length,
        message: `Emergency unlock completed for ${updateResult.modifiedCount} digital IDs`,
        timestamp: new Date()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to perform emergency unlock'
      };
    }
  }

  /**
   * Get security audit trail for digital IDs
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Audit trail
   */
  async getSecurityAuditTrail(options = {}) {
    try {
      const {
        userId,
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        endDate = new Date(),
        limit = 100
      } = options;

      // Get access logs
      const accessLogs = await AccessLog.find({
        ...(userId && { userId }),
        accessTime: { $gte: startDate, $lte: endDate }
      })
        .populate('userId', 'firstName lastName email studentId role')
        .populate('digitalIdId', 'accessLevel')
        .sort({ accessTime: -1 })
        .limit(limit);

      // Get digital ID changes
      const digitalIDChanges = await DigitalID.find({
        ...(userId && { userId }),
        lastUpdated: { $gte: startDate, $lte: endDate }
      })
        .populate('userId', 'firstName lastName email studentId role')
        .sort({ lastUpdated: -1 });

      // Compile audit events
      const auditEvents = [
        ...accessLogs.map(log => ({
          type: 'access_attempt',
          timestamp: log.accessTime,
          userId: log.userId,
          details: {
            facilityId: log.facilityId,
            facilityName: log.facilityName,
            result: log.accessResult,
            reason: log.denialReason,
            deviceInfo: log.deviceInfo
          }
        })),
        ...digitalIDChanges.map(digitalID => ({
          type: 'digital_id_change',
          timestamp: digitalID.lastUpdated,
          userId: digitalID.userId,
          details: {
            accessLevel: digitalID.accessLevel,
            isActive: digitalID.isActive,
            suspensionReason: digitalID.metadata?.suspensionReason,
            emergencyLockdown: digitalID.metadata?.emergencyLockdown
          }
        }))
      ].sort((a, b) => b.timestamp - a.timestamp);

      return {
        success: true,
        auditEvents: auditEvents.slice(0, limit),
        summary: {
          totalEvents: auditEvents.length,
          accessAttempts: accessLogs.length,
          digitalIdChanges: digitalIDChanges.length,
          dateRange: { startDate, endDate }
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve security audit trail'
      };
    }
  }

  // Private helper methods

  /**
   * Determine access level based on user role
   * @param {string} userRole - User role
   * @returns {string} Access level
   */
  _determineAccessLevel(userRole) {
    const roleMappings = {
      'admin': 'premium',
      'faculty': 'premium',
      'staff': 'standard',
      'student': 'basic',
      'visitor': 'basic'
    };
    return roleMappings[userRole] || 'basic';
  }

  /**
   * Generate unique QR code data
   * @param {string} userId - User ID
   * @param {string} userRole - User role
   * @param {string} accessLevel - Access level
   * @returns {string} QR code data
   */
  _generateQRData(userId, userRole, accessLevel) {
    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(8).toString('hex');
    const data = `${userId}:${userRole}:${accessLevel}:${timestamp}:${randomBytes}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate QR code image from data
   * @param {string} qrData - QR code data
   * @returns {Promise<string>} Base64 encoded QR code image
   */
  async _generateQRCodeImage(qrData) {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(qrData, this.qrCodeOptions);
      return qrCodeDataURL;
    } catch (error) {
      throw new Error('Failed to generate QR code image: ' + error.message);
    }
  }

  /**
   * Get default permissions based on user role and access level
   * @param {string} userRole - User role
   * @param {string} accessLevel - Access level
   * @returns {Promise<Array>} Default permissions array
   */
  async _getDefaultPermissions(userRole, accessLevel) {
    // This would typically be configured based on institutional policies
    const defaultPermissions = {
      student: [
        {
          facilityId: 'LIB001',
          facilityName: 'Main Library',
          accessType: 'time_limited',
          timeRestrictions: {
            startTime: '07:00',
            endTime: '22:00',
            daysOfWeek: [1, 2, 3, 4, 5, 6] // Monday to Saturday
          }
        },
        {
          facilityId: 'CAF001',
          facilityName: 'Student Cafeteria',
          accessType: 'time_limited',
          timeRestrictions: {
            startTime: '06:00',
            endTime: '20:00',
            daysOfWeek: [1, 2, 3, 4, 5, 6]
          }
        }
      ],
      faculty: [
        {
          facilityId: 'LIB001',
          facilityName: 'Main Library',
          accessType: 'full'
        },
        {
          facilityId: 'FAC001',
          facilityName: 'Faculty Lounge',
          accessType: 'full'
        },
        {
          facilityId: 'CAF001',
          facilityName: 'Student Cafeteria',
          accessType: 'full'
        }
      ],
      staff: [
        {
          facilityId: 'LIB001',
          facilityName: 'Main Library',
          accessType: 'full'
        },
        {
          facilityId: 'ADM001',
          facilityName: 'Administration Building',
          accessType: 'time_limited',
          timeRestrictions: {
            startTime: '07:00',
            endTime: '18:00',
            daysOfWeek: [1, 2, 3, 4, 5]
          }
        }
      ],
      admin: [
        {
          facilityId: 'ALL',
          facilityName: 'All Facilities',
          accessType: 'full'
        }
      ]
    };

    return defaultPermissions[userRole] || [];
  }

  /**
   * Calculate expiration date based on user role
   * @param {string} userRole - User role
   * @returns {Date} Expiration date
   */
  _calculateExpirationDate(userRole) {
    const now = new Date();
    const expirationPeriods = {
      'student': 365, // 1 year
      'faculty': 730, // 2 years
      'staff': 730,   // 2 years
      'admin': 1095,  // 3 years
      'visitor': 30   // 30 days
    };

    const days = expirationPeriods[userRole] || 365;
    const expirationDate = new Date(now);
    expirationDate.setDate(expirationDate.getDate() + days);
    return expirationDate;
  }

  /**
   * Validate permissions array format
   * @param {Array} permissions - Permissions to validate
   * @throws {Error} If permissions are invalid
   */
  _validatePermissions(permissions) {
    if (!Array.isArray(permissions)) {
      throw new Error('Permissions must be an array');
    }

    for (const permission of permissions) {
      if (!permission.facilityId || !permission.facilityName) {
        throw new Error('Each permission must have facilityId and facilityName');
      }

      if (permission.accessType && !['full', 'restricted', 'time_limited'].includes(permission.accessType)) {
        throw new Error('Invalid access type');
      }

      if (permission.timeRestrictions) {
        const { startTime, endTime, daysOfWeek } = permission.timeRestrictions;
        
        if (startTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(startTime)) {
          throw new Error('Invalid start time format');
        }
        
        if (endTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(endTime)) {
          throw new Error('Invalid end time format');
        }
        
        if (daysOfWeek && (!Array.isArray(daysOfWeek) || daysOfWeek.some(day => day < 0 || day > 6))) {
          throw new Error('Invalid days of week');
        }
      }
    }
  }

  /**
   * Log emergency action for audit trail
   * @param {string} action - Emergency action type
   * @param {Object} criteria - Action criteria
   * @param {string} reason - Action reason
   * @param {string} performedBy - User ID performing action
   * @param {number} affectedCount - Number of affected records
   * @returns {Promise<void>}
   */
  async _logEmergencyAction(action, criteria, reason, performedBy, affectedCount) {
    try {
      // This could be logged to a separate emergency actions collection
      // For now, we'll use console logging and could extend to database logging
      const logEntry = {
        timestamp: new Date(),
        action,
        criteria,
        reason,
        performedBy,
        affectedCount,
        type: 'emergency_action'
      };

      console.log('Emergency Action Log:', JSON.stringify(logEntry, null, 2));
      
      // TODO: Implement database logging for emergency actions
      // await EmergencyActionLog.create(logEntry);

    } catch (error) {
      console.error('Failed to log emergency action:', error);
    }
  }
}

module.exports = DigitalIDService;