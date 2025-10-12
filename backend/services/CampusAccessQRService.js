const QRCode = require('qrcode');
const crypto = require('crypto');
const DigitalID = require('../models/DigitalID');
const AccessLog = require('../models/AccessLog');
const Facility = require('../models/Facility');
const User = require('../models/User');

/**
 * CampusAccessQRService - Service for secure QR code generation and validation for campus access
 * Handles QR generation, validation, offline capabilities, and security features
 */
class CampusAccessQRService {
  constructor() {
    this.encryptionKey = process.env.QR_ENCRYPTION_KEY || 'default-key-change-in-production';
    this.algorithm = 'aes-256-gcm';
    this.qrCodeOptions = {
      errorCorrectionLevel: 'H', // High error correction for better scanning
      type: 'image/png',
      quality: 0.92,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300
    };
    
    // Security settings
    this.securitySettings = {
      qrExpirationMinutes: 5, // QR codes expire after 5 minutes for security
      maxScanAttempts: 3,
      tamperDetectionEnabled: true,
      offlineSyncEnabled: true
    };
  }

  /**
   * Generate secure QR code for digital ID campus access
   * @param {string} userId - User ID
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated QR code data
   */
  async generateSecureQRCode(userId, options = {}) {
    try {
      // Get user's digital ID
      const digitalID = await DigitalID.findActiveByUser(userId);
      if (!digitalID) {
        throw new Error('No active digital ID found for user');
      }

      // Validate digital ID
      if (!digitalID.isValid) {
        throw new Error('Digital ID is invalid or expired');
      }

      // Generate secure QR data
      const qrData = await this._generateSecureQRData(digitalID, options);
      
      // Generate QR code image
      const qrCodeImage = await this._generateQRCodeImage(qrData.encryptedData);
      
      // Store QR generation log for security audit
      await this._logQRGeneration(userId, digitalID._id, qrData.metadata);

      return {
        success: true,
        qrCode: {
          data: qrData.encryptedData,
          image: qrCodeImage,
          expiresAt: qrData.expiresAt,
          securityHash: qrData.securityHash,
          metadata: {
            generatedAt: new Date(),
            validFor: this.securitySettings.qrExpirationMinutes,
            userId: userId,
            digitalIdId: digitalID._id
          }
        },
        message: 'Secure QR code generated successfully'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to generate secure QR code'
      };
    }
  }

  /**
   * Validate QR code for facility access with offline support
   * @param {string} qrData - Encrypted QR code data
   * @param {string} facilityId - Facility ID
   * @param {Object} deviceInfo - Scanner device information
   * @param {boolean} isOffline - Whether validation is happening offline
   * @returns {Promise<Object>} Validation result
   */
  async validateQRCodeAccess(qrData, facilityId, deviceInfo = {}, isOffline = false) {
    const validationStart = Date.now();
    
    try {
      // Decrypt and validate QR data
      const decryptedData = await this._decryptQRData(qrData);
      if (!decryptedData.isValid) {
        return this._createValidationResponse(false, decryptedData.reason, null, null, validationStart);
      }

      // Get digital ID and user information
      const digitalID = await DigitalID.findById(decryptedData.digitalIdId).populate('userId');
      if (!digitalID) {
        return this._createValidationResponse(false, 'Digital ID not found', null, null, validationStart);
      }

      const user = digitalID.userId;

      // Validate digital ID status
      if (!digitalID.isValid) {
        return this._createValidationResponse(false, 'Digital ID is invalid or expired', user, digitalID, validationStart);
      }

      // Check QR code expiration
      if (decryptedData.expiresAt < new Date()) {
        return this._createValidationResponse(false, 'QR code has expired', user, digitalID, validationStart);
      }

      // Validate security hash to detect tampering
      if (this.securitySettings.tamperDetectionEnabled) {
        const isValidHash = await this._validateSecurityHash(decryptedData, digitalID);
        if (!isValidHash) {
          await this._flagSecurityIncident(user._id, facilityId, 'tampered_qr_detected', deviceInfo);
          return this._createValidationResponse(false, 'QR code security validation failed', user, digitalID, validationStart);
        }
      }

      // Get facility information
      const facility = await Facility.findOne({ facilityId, isActive: true });
      if (!facility) {
        return this._createValidationResponse(false, 'Facility not found or inactive', user, digitalID, validationStart);
      }

      // Check facility access permissions
      const accessCheck = await this._checkFacilityAccess(user, digitalID, facility, isOffline);
      
      // Log access attempt (queue for sync if offline)
      const logData = {
        userId: user._id,
        digitalIdId: digitalID._id,
        facilityId,
        facilityName: facility.name,
        accessResult: accessCheck.hasAccess ? 'granted' : 'denied',
        denialReason: accessCheck.reason,
        deviceInfo: {
          ...deviceInfo,
          isOffline,
          scannerType: deviceInfo.scannerType || 'mobile'
        },
        qrCodeUsed: qrData,
        metadata: {
          responseTime: Date.now() - validationStart,
          qrExpiresAt: decryptedData.expiresAt,
          securityValidated: true,
          offlineValidation: isOffline
        }
      };

      if (isOffline) {
        await this._queueOfflineLog(logData);
      } else {
        await AccessLog.logAccessAttempt(logData);
      }

      // Update facility occupancy if access granted and not offline
      if (accessCheck.hasAccess && !isOffline && facility.capacity) {
        await facility.updateOccupancy(1);
      }

      // Check for suspicious activity patterns
      if (!accessCheck.hasAccess) {
        await this._checkSuspiciousActivity(user._id, facilityId, deviceInfo, isOffline);
      }

      return {
        success: true,
        accessGranted: accessCheck.hasAccess,
        reason: accessCheck.reason,
        user: this._sanitizeUserInfo(user),
        facility: this._sanitizeFacilityInfo(facility),
        digitalID: {
          id: digitalID._id,
          accessLevel: digitalID.accessLevel,
          expiresAt: digitalID.expiresAt
        },
        qrCode: {
          expiresAt: decryptedData.expiresAt,
          generatedAt: decryptedData.generatedAt
        },
        validation: {
          timestamp: new Date(),
          responseTime: Date.now() - validationStart,
          isOffline,
          securityValidated: true
        },
        additionalRequirements: accessCheck.additionalRequirements || []
      };

    } catch (error) {
      // Log validation error
      await this._logValidationError(qrData, facilityId, error.message, deviceInfo, isOffline);
      
      return {
        success: false,
        accessGranted: false,
        reason: 'System error during QR validation',
        error: error.message,
        validation: {
          timestamp: new Date(),
          responseTime: Date.now() - validationStart,
          isOffline
        }
      };
    }
  }

  /**
   * Sync offline access logs when connection is restored
   * @param {Array} offlineLogs - Array of offline access logs
   * @returns {Promise<Object>} Sync result
   */
  async syncOfflineAccessLogs(offlineLogs) {
    try {
      const results = {
        successful: 0,
        failed: 0,
        errors: []
      };

      for (const logData of offlineLogs) {
        try {
          // Validate log data structure
          if (!this._validateOfflineLogData(logData)) {
            results.failed++;
            results.errors.push({ logData, error: 'Invalid log data structure' });
            continue;
          }

          // Check for duplicate logs (prevent double logging)
          const existingLog = await AccessLog.findOne({
            userId: logData.userId,
            facilityId: logData.facilityId,
            accessTime: logData.accessTime,
            'deviceInfo.sessionId': logData.deviceInfo?.sessionId
          });

          if (existingLog) {
            results.failed++;
            results.errors.push({ logData, error: 'Duplicate log entry' });
            continue;
          }

          // Create access log entry
          await AccessLog.logAccessAttempt({
            ...logData,
            metadata: {
              ...logData.metadata,
              syncedAt: new Date(),
              wasOffline: true
            }
          });

          results.successful++;

        } catch (error) {
          results.failed++;
          results.errors.push({ logData, error: error.message });
        }
      }

      return {
        success: true,
        results,
        message: `Synced ${results.successful} logs, ${results.failed} failed`
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to sync offline access logs'
      };
    }
  }

  /**
   * Generate offline validation cache for facilities
   * @param {Array} facilityIds - Facility IDs to cache
   * @returns {Promise<Object>} Offline cache data
   */
  async generateOfflineCache(facilityIds = []) {
    try {
      const cacheData = {
        facilities: {},
        digitalIDs: {},
        accessRules: {},
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };

      // Get facility data
      const facilities = facilityIds.length > 0 
        ? await Facility.find({ facilityId: { $in: facilityIds }, isActive: true })
        : await Facility.find({ isActive: true });

      for (const facility of facilities) {
        cacheData.facilities[facility.facilityId] = {
          id: facility._id,
          facilityId: facility.facilityId,
          name: facility.name,
          type: facility.type,
          accessRequirements: facility.accessRequirements,
          operatingHours: facility.operatingHours,
          capacity: facility.capacity,
          emergencySettings: facility.emergencySettings
        };
      }

      // Get active digital IDs (limited data for offline validation)
      const digitalIDs = await DigitalID.find({ 
        isActive: true,
        expiresAt: { $gt: new Date() }
      }).populate('userId', 'firstName lastName role studentId');

      for (const digitalID of digitalIDs) {
        cacheData.digitalIDs[digitalID._id.toString()] = {
          userId: digitalID.userId._id,
          accessLevel: digitalID.accessLevel,
          permissions: digitalID.permissions,
          expiresAt: digitalID.expiresAt,
          securityHash: digitalID.securityHash,
          user: {
            firstName: digitalID.userId.firstName,
            lastName: digitalID.userId.lastName,
            role: digitalID.userId.role,
            studentId: digitalID.userId.studentId
          }
        };
      }

      // Generate access validation rules for offline use
      cacheData.accessRules = this._generateOfflineAccessRules();

      return {
        success: true,
        cacheData,
        cacheSize: JSON.stringify(cacheData).length,
        facilitiesCount: Object.keys(cacheData.facilities).length,
        digitalIDsCount: Object.keys(cacheData.digitalIDs).length
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to generate offline cache'
      };
    }
  }

  /**
   * Validate QR code using offline cache
   * @param {string} qrData - QR code data
   * @param {string} facilityId - Facility ID
   * @param {Object} offlineCache - Offline cache data
   * @param {Object} deviceInfo - Device information
   * @returns {Promise<Object>} Offline validation result
   */
  async validateOfflineQRCode(qrData, facilityId, offlineCache, deviceInfo = {}) {
    try {
      // Check cache validity
      if (!offlineCache || new Date() > new Date(offlineCache.expiresAt)) {
        return {
          success: false,
          accessGranted: false,
          reason: 'Offline cache expired or invalid',
          requiresOnlineValidation: true
        };
      }

      // Decrypt QR data
      const decryptedData = await this._decryptQRData(qrData);
      if (!decryptedData.isValid) {
        return {
          success: false,
          accessGranted: false,
          reason: decryptedData.reason,
          canLogOffline: true
        };
      }

      // Get digital ID from cache
      const digitalIDCache = offlineCache.digitalIDs[decryptedData.digitalIdId];
      if (!digitalIDCache) {
        return {
          success: false,
          accessGranted: false,
          reason: 'Digital ID not found in offline cache',
          requiresOnlineValidation: true
        };
      }

      // Get facility from cache
      const facilityCache = offlineCache.facilities[facilityId];
      if (!facilityCache) {
        return {
          success: false,
          accessGranted: false,
          reason: 'Facility not found in offline cache',
          requiresOnlineValidation: true
        };
      }

      // Validate access using cached data
      const accessCheck = this._validateOfflineAccess(
        digitalIDCache, 
        facilityCache, 
        offlineCache.accessRules
      );

      // Queue offline log
      await this._queueOfflineLog({
        userId: digitalIDCache.userId,
        digitalIdId: decryptedData.digitalIdId,
        facilityId,
        facilityName: facilityCache.name,
        accessResult: accessCheck.hasAccess ? 'granted' : 'denied',
        denialReason: accessCheck.reason,
        deviceInfo: {
          ...deviceInfo,
          isOffline: true,
          cacheVersion: offlineCache.generatedAt
        },
        qrCodeUsed: qrData,
        accessTime: new Date()
      });

      return {
        success: true,
        accessGranted: accessCheck.hasAccess,
        reason: accessCheck.reason,
        user: digitalIDCache.user,
        facility: {
          facilityId: facilityCache.facilityId,
          name: facilityCache.name,
          type: facilityCache.type
        },
        validation: {
          timestamp: new Date(),
          isOffline: true,
          cacheUsed: true
        },
        queuedForSync: true
      };

    } catch (error) {
      return {
        success: false,
        accessGranted: false,
        reason: 'Offline validation error',
        error: error.message,
        requiresOnlineValidation: true
      };
    }
  }

  /**
   * Get security audit report for QR access system
   * @param {Object} options - Report options
   * @returns {Promise<Object>} Security audit report
   */
  async getSecurityAuditReport(options = {}) {
    try {
      const {
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        endDate = new Date(),
        facilityId,
        userId,
        includeSecurityIncidents = true
      } = options;

      const report = {
        period: { startDate, endDate },
        summary: {},
        securityIncidents: [],
        accessPatterns: {},
        recommendations: []
      };

      // Get access logs for the period
      const query = {
        accessTime: { $gte: startDate, $lte: endDate }
      };
      
      if (facilityId) query.facilityId = facilityId;
      if (userId) query.userId = userId;

      const accessLogs = await AccessLog.find(query)
        .populate('userId', 'firstName lastName role studentId')
        .sort({ accessTime: -1 });

      // Calculate summary statistics
      report.summary = {
        totalAttempts: accessLogs.length,
        successfulAccess: accessLogs.filter(log => log.accessResult === 'granted').length,
        deniedAccess: accessLogs.filter(log => log.accessResult === 'denied').length,
        offlineValidations: accessLogs.filter(log => log.metadata?.offlineValidation).length,
        securityFlags: accessLogs.filter(log => log.metadata?.securityFlags?.length > 0).length
      };

      report.summary.successRate = report.summary.totalAttempts > 0 
        ? ((report.summary.successfulAccess / report.summary.totalAttempts) * 100).toFixed(2)
        : 0;

      // Analyze security incidents
      if (includeSecurityIncidents) {
        report.securityIncidents = accessLogs
          .filter(log => log.metadata?.securityFlags?.length > 0)
          .map(log => ({
            timestamp: log.accessTime,
            userId: log.userId,
            facilityId: log.facilityId,
            securityFlags: log.metadata.securityFlags,
            deviceInfo: log.deviceInfo,
            denialReason: log.denialReason
          }));
      }

      // Analyze access patterns
      report.accessPatterns = await this._analyzeAccessPatterns(accessLogs);

      // Generate security recommendations
      report.recommendations = this._generateSecurityRecommendations(report);

      return {
        success: true,
        report,
        generatedAt: new Date()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to generate security audit report'
      };
    }
  }

  // Private helper methods

  /**
   * Generate secure QR data with encryption
   * @param {Object} digitalID - Digital ID object
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Secure QR data
   */
  async _generateSecureQRData(digitalID, options = {}) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.securitySettings.qrExpirationMinutes * 60 * 1000);
    
    const qrPayload = {
      digitalIdId: digitalID._id.toString(),
      userId: digitalID.userId.toString(),
      accessLevel: digitalID.accessLevel,
      generatedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      nonce: crypto.randomBytes(16).toString('hex'),
      version: '1.0'
    };

    // Generate security hash
    const securityHash = this._generateSecurityHash(qrPayload, digitalID);
    qrPayload.securityHash = securityHash;

    // Encrypt the payload
    const encryptedData = this._encryptData(JSON.stringify(qrPayload));

    return {
      encryptedData,
      expiresAt,
      securityHash,
      metadata: {
        generatedFor: digitalID.userId,
        accessLevel: digitalID.accessLevel,
        validUntil: expiresAt
      }
    };
  }

  /**
   * Generate QR code image from encrypted data
   * @param {string} encryptedData - Encrypted QR data
   * @returns {Promise<string>} Base64 QR code image
   */
  async _generateQRCodeImage(encryptedData) {
    try {
      return await QRCode.toDataURL(encryptedData, this.qrCodeOptions);
    } catch (error) {
      throw new Error(`Failed to generate QR code image: ${error.message}`);
    }
  }

  /**
   * Decrypt QR code data
   * @param {string} encryptedData - Encrypted QR data
   * @returns {Promise<Object>} Decrypted data
   */
  async _decryptQRData(encryptedData) {
    try {
      const decryptedString = this._decryptData(encryptedData);
      const qrPayload = JSON.parse(decryptedString);

      // Validate payload structure
      if (!qrPayload.digitalIdId || !qrPayload.userId || !qrPayload.expiresAt) {
        return { isValid: false, reason: 'Invalid QR code format' };
      }

      return {
        isValid: true,
        ...qrPayload,
        expiresAt: new Date(qrPayload.expiresAt),
        generatedAt: new Date(qrPayload.generatedAt)
      };

    } catch (error) {
      return { isValid: false, reason: 'Failed to decrypt QR code' };
    }
  }

  /**
   * Encrypt data using AES-256-GCM
   * @param {string} data - Data to encrypt
   * @returns {string} Encrypted data
   */
  _encryptData(data) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.encryptionKey);
    cipher.setAAD(Buffer.from('campus-access-qr'));
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt data using AES-256-GCM
   * @param {string} encryptedData - Encrypted data
   * @returns {string} Decrypted data
   */
  _decryptData(encryptedData) {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const [ivHex, authTagHex, encrypted] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipher(this.algorithm, this.encryptionKey);
    decipher.setAAD(Buffer.from('campus-access-qr'));
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Generate security hash for tamper detection
   * @param {Object} qrPayload - QR payload
   * @param {Object} digitalID - Digital ID object
   * @returns {string} Security hash
   */
  _generateSecurityHash(qrPayload, digitalID) {
    const hashData = `${qrPayload.digitalIdId}:${qrPayload.userId}:${qrPayload.generatedAt}:${qrPayload.nonce}:${digitalID.securityHash}`;
    return crypto.createHash('sha256').update(hashData).digest('hex');
  }

  /**
   * Validate security hash to detect tampering
   * @param {Object} decryptedData - Decrypted QR data
   * @param {Object} digitalID - Digital ID object
   * @returns {Promise<boolean>} Hash validation result
   */
  async _validateSecurityHash(decryptedData, digitalID) {
    try {
      const expectedHash = this._generateSecurityHash(decryptedData, digitalID);
      return decryptedData.securityHash === expectedHash;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check facility access permissions
   * @param {Object} user - User object
   * @param {Object} digitalID - Digital ID object
   * @param {Object} facility - Facility object
   * @param {boolean} isOffline - Whether check is offline
   * @returns {Promise<Object>} Access check result
   */
  async _checkFacilityAccess(user, digitalID, facility, isOffline = false) {
    // Use AccessControlService for comprehensive access validation
    const AccessControlService = require('./AccessControlService');
    const accessControlService = new AccessControlService();
    
    return accessControlService._checkFacilityAccess(user, digitalID, facility);
  }

  /**
   * Create validation response object
   * @param {boolean} success - Validation success
   * @param {string} reason - Reason for result
   * @param {Object} user - User object
   * @param {Object} digitalID - Digital ID object
   * @param {number} startTime - Validation start time
   * @returns {Object} Validation response
   */
  _createValidationResponse(success, reason, user, digitalID, startTime) {
    return {
      success: false,
      accessGranted: false,
      reason,
      user: user ? this._sanitizeUserInfo(user) : null,
      digitalID: digitalID ? {
        id: digitalID._id,
        accessLevel: digitalID.accessLevel,
        expiresAt: digitalID.expiresAt
      } : null,
      validation: {
        timestamp: new Date(),
        responseTime: Date.now() - startTime
      }
    };
  }

  /**
   * Log QR code generation for audit trail
   * @param {string} userId - User ID
   * @param {string} digitalIdId - Digital ID
   * @param {Object} metadata - Generation metadata
   * @returns {Promise<void>}
   */
  async _logQRGeneration(userId, digitalIdId, metadata) {
    // This could be logged to a separate QR generation log collection
    console.log('QR Generation Log:', {
      timestamp: new Date(),
      userId,
      digitalIdId,
      metadata,
      type: 'qr_generation'
    });
  }

  /**
   * Queue offline access log for later sync
   * @param {Object} logData - Log data
   * @returns {Promise<void>}
   */
  async _queueOfflineLog(logData) {
    // In a real implementation, this would store in local storage or IndexedDB
    // For now, we'll use a simple in-memory queue or file system
    const offlineQueue = global.offlineAccessQueue || [];
    offlineQueue.push({
      ...logData,
      queuedAt: new Date(),
      synced: false
    });
    global.offlineAccessQueue = offlineQueue;
  }

  /**
   * Validate offline log data structure
   * @param {Object} logData - Log data to validate
   * @returns {boolean} Validation result
   */
  _validateOfflineLogData(logData) {
    const requiredFields = ['userId', 'facilityId', 'accessResult', 'accessTime'];
    return requiredFields.every(field => logData.hasOwnProperty(field));
  }

  /**
   * Generate offline access validation rules
   * @returns {Object} Access rules for offline validation
   */
  _generateOfflineAccessRules() {
    return {
      timeValidation: {
        enabled: true,
        checkOperatingHours: true,
        checkTimeRestrictions: true
      },
      capacityValidation: {
        enabled: false, // Disabled offline due to sync issues
        allowOverCapacity: true
      },
      emergencyOverride: {
        enabled: true,
        allowEmergencyAccess: false
      }
    };
  }

  /**
   * Validate access using offline cached data
   * @param {Object} digitalIDCache - Cached digital ID data
   * @param {Object} facilityCache - Cached facility data
   * @param {Object} accessRules - Offline access rules
   * @returns {Object} Access validation result
   */
  _validateOfflineAccess(digitalIDCache, facilityCache, accessRules) {
    const now = new Date();

    // Check digital ID expiration
    if (new Date(digitalIDCache.expiresAt) < now) {
      return { hasAccess: false, reason: 'Digital ID has expired' };
    }

    // Check facility permissions
    const permission = digitalIDCache.permissions.find(p => p.facilityId === facilityCache.facilityId);
    if (!permission) {
      return { hasAccess: false, reason: 'No permission for this facility' };
    }

    // Check time restrictions if enabled
    if (accessRules.timeValidation.checkTimeRestrictions && permission.timeRestrictions) {
      const { startTime, endTime, daysOfWeek } = permission.timeRestrictions;
      
      if (daysOfWeek && daysOfWeek.length > 0) {
        const currentDay = now.getDay();
        if (!daysOfWeek.includes(currentDay)) {
          return { hasAccess: false, reason: 'Access not allowed on this day' };
        }
      }

      if (startTime && endTime) {
        const currentTime = now.toTimeString().substring(0, 5);
        if (currentTime < startTime || currentTime > endTime) {
          return { hasAccess: false, reason: 'Access not allowed at this time' };
        }
      }
    }

    // Check operating hours if enabled
    if (accessRules.timeValidation.checkOperatingHours) {
      const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
      const daySchedule = facilityCache.operatingHours[currentDay];
      
      if (daySchedule && daySchedule.closed) {
        return { hasAccess: false, reason: 'Facility is closed today' };
      }

      if (daySchedule && daySchedule.start && daySchedule.end) {
        const currentTime = now.toTimeString().substring(0, 5);
        if (currentTime < daySchedule.start || currentTime > daySchedule.end) {
          return { hasAccess: false, reason: 'Facility is currently closed' };
        }
      }
    }

    return { hasAccess: true };
  }

  /**
   * Flag security incident
   * @param {string} userId - User ID
   * @param {string} facilityId - Facility ID
   * @param {string} incidentType - Type of security incident
   * @param {Object} deviceInfo - Device information
   * @returns {Promise<void>}
   */
  async _flagSecurityIncident(userId, facilityId, incidentType, deviceInfo) {
    console.log('Security Incident Flagged:', {
      timestamp: new Date(),
      userId,
      facilityId,
      incidentType,
      deviceInfo,
      severity: 'high'
    });

    // In a real implementation, this would trigger alerts and notifications
  }

  /**
   * Check for suspicious activity patterns
   * @param {string} userId - User ID
   * @param {string} facilityId - Facility ID
   * @param {Object} deviceInfo - Device information
   * @param {boolean} isOffline - Whether check is offline
   * @returns {Promise<void>}
   */
  async _checkSuspiciousActivity(userId, facilityId, deviceInfo, isOffline) {
    if (isOffline) {
      // Queue suspicious activity check for when online
      return;
    }

    // Use AccessControlService for suspicious activity detection
    const AccessControlService = require('./AccessControlService');
    const accessControlService = new AccessControlService();
    
    await accessControlService._checkSuspiciousActivity(userId, facilityId, deviceInfo);
  }

  /**
   * Log validation error
   * @param {string} qrData - QR data
   * @param {string} facilityId - Facility ID
   * @param {string} error - Error message
   * @param {Object} deviceInfo - Device information
   * @param {boolean} isOffline - Whether error occurred offline
   * @returns {Promise<void>}
   */
  async _logValidationError(qrData, facilityId, error, deviceInfo, isOffline) {
    console.log('QR Validation Error:', {
      timestamp: new Date(),
      qrData: qrData.substring(0, 20) + '...', // Truncated for security
      facilityId,
      error,
      deviceInfo,
      isOffline
    });
  }

  /**
   * Analyze access patterns for security report
   * @param {Array} accessLogs - Access log entries
   * @returns {Object} Access pattern analysis
   */
  _analyzeAccessPatterns(accessLogs) {
    const patterns = {
      hourlyDistribution: {},
      dailyDistribution: {},
      facilityUsage: {},
      userActivity: {}
    };

    accessLogs.forEach(log => {
      const hour = log.accessTime.getHours();
      const day = log.accessTime.getDay();
      
      // Hourly distribution
      patterns.hourlyDistribution[hour] = (patterns.hourlyDistribution[hour] || 0) + 1;
      
      // Daily distribution
      patterns.dailyDistribution[day] = (patterns.dailyDistribution[day] || 0) + 1;
      
      // Facility usage
      patterns.facilityUsage[log.facilityId] = (patterns.facilityUsage[log.facilityId] || 0) + 1;
      
      // User activity
      const userId = log.userId._id.toString();
      patterns.userActivity[userId] = (patterns.userActivity[userId] || 0) + 1;
    });

    return patterns;
  }

  /**
   * Generate security recommendations based on audit data
   * @param {Object} report - Audit report data
   * @returns {Array} Security recommendations
   */
  _generateSecurityRecommendations(report) {
    const recommendations = [];

    // Check success rate
    if (parseFloat(report.summary.successRate) < 80) {
      recommendations.push({
        type: 'access_rate',
        priority: 'medium',
        message: 'Low access success rate detected. Review access permissions and user training.'
      });
    }

    // Check security incidents
    if (report.securityIncidents.length > 0) {
      recommendations.push({
        type: 'security_incidents',
        priority: 'high',
        message: `${report.securityIncidents.length} security incidents detected. Review and investigate flagged activities.`
      });
    }

    // Check offline usage
    if (report.summary.offlineValidations > report.summary.totalAttempts * 0.3) {
      recommendations.push({
        type: 'offline_usage',
        priority: 'low',
        message: 'High offline validation usage. Consider improving network connectivity at access points.'
      });
    }

    return recommendations;
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

module.exports = CampusAccessQRService;