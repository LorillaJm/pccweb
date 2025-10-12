const QRCode = require('qrcode');
const crypto = require('crypto');
const EventTicket = require('../models/EventTicket');

class QRCodeService {
  constructor() {
    this.encryptionKey = process.env.QR_ENCRYPTION_KEY || 'default-key-change-in-production';
    this.algorithm = 'aes-256-gcm';
  }

  /**
   * Generate secure QR code with encryption and tamper detection
   * @param {Object} ticketData - Ticket data to encode
   * @returns {Promise<Object>} QR code generation result
   */
  async generateSecureQRCode(ticketData) {
    try {
      // Create payload with security features
      const payload = {
        ticketId: ticketData.ticketId,
        eventId: ticketData.eventId,
        userId: ticketData.userId,
        ticketNumber: ticketData.ticketNumber,
        timestamp: Date.now(),
        expiresAt: ticketData.expiresAt,
        version: '1.0'
      };

      // Encrypt the payload
      const encryptedData = this.encryptData(JSON.stringify(payload));
      
      // Create QR data with security hash
      const qrData = {
        data: encryptedData.encrypted,
        iv: encryptedData.iv,
        tag: encryptedData.tag,
        hash: this.generateSecurityHash(payload)
      };

      const qrString = JSON.stringify(qrData);

      // Generate QR code image with high error correction
      const qrCodeImage = await this.generateQRCodeImage(qrString, {
        errorCorrectionLevel: 'H', // High error correction for better scanning
        margin: 2,
        width: 300,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      return {
        success: true,
        data: {
          qrString,
          qrCodeImage,
          payload,
          securityHash: qrData.hash
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
   * Validate and decrypt QR code data
   * @param {string} qrString - QR code string data
   * @returns {Promise<Object>} Validation result
   */
  async validateSecureQRCode(qrString) {
    try {
      // Parse QR data
      const qrData = JSON.parse(qrString);
      
      // Validate required fields
      if (!qrData.data || !qrData.iv || !qrData.tag || !qrData.hash) {
        return {
          success: false,
          error: 'Invalid QR code format',
          message: 'QR code is missing required security fields'
        };
      }

      // Decrypt the payload
      const decryptedPayload = this.decryptData({
        encrypted: qrData.data,
        iv: qrData.iv,
        tag: qrData.tag
      });

      const payload = JSON.parse(decryptedPayload);

      // Validate security hash
      const expectedHash = this.generateSecurityHash(payload);
      if (qrData.hash !== expectedHash) {
        return {
          success: false,
          error: 'Security validation failed',
          message: 'QR code has been tampered with or is invalid'
        };
      }

      // Check expiration
      if (payload.expiresAt && new Date() > new Date(payload.expiresAt)) {
        return {
          success: false,
          error: 'QR code expired',
          message: 'This QR code has expired'
        };
      }

      // Validate timestamp (prevent replay attacks)
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      if (Date.now() - payload.timestamp > maxAge) {
        return {
          success: false,
          error: 'QR code too old',
          message: 'QR code is too old and may have been compromised'
        };
      }

      return {
        success: true,
        data: payload,
        message: 'QR code validated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Invalid QR code',
        message: 'Failed to validate QR code: ' + error.message
      };
    }
  }

  /**
   * Generate QR code for offline scanning with sync data
   * @param {Object} ticketData - Ticket data
   * @param {Object} offlineData - Additional offline sync data
   * @returns {Promise<Object>} Offline QR code result
   */
  async generateOfflineQRCode(ticketData, offlineData = {}) {
    try {
      // Include offline sync information
      const offlinePayload = {
        ...ticketData,
        offline: true,
        syncData: {
          lastSync: Date.now(),
          syncId: crypto.randomUUID(),
          eventTitle: offlineData.eventTitle,
          eventDate: offlineData.eventDate,
          userName: offlineData.userName,
          ...offlineData
        }
      };

      const result = await this.generateSecureQRCode(offlinePayload);
      
      if (result.success) {
        return {
          success: true,
          data: {
            ...result.data,
            offlineCapable: true,
            syncId: offlinePayload.syncData.syncId
          },
          message: 'Offline-capable QR code generated successfully'
        };
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to generate offline QR code'
      };
    }
  }

  /**
   * Validate QR code for offline scanning
   * @param {string} qrString - QR code string
   * @param {Object} offlineContext - Offline validation context
   * @returns {Promise<Object>} Offline validation result
   */
  async validateOfflineQRCode(qrString, offlineContext = {}) {
    try {
      const validationResult = await this.validateSecureQRCode(qrString);
      
      if (!validationResult.success) {
        return validationResult;
      }

      const payload = validationResult.data;

      // Additional offline validations
      if (offlineContext.eventId && payload.eventId !== offlineContext.eventId) {
        return {
          success: false,
          error: 'Wrong event',
          message: 'This ticket is not for the current event'
        };
      }

      // Check if this is an offline-capable QR code
      const isOfflineCapable = payload.offline === true;

      return {
        success: true,
        data: {
          ...payload,
          offlineValidation: true,
          offlineCapable: isOfflineCapable,
          validatedAt: Date.now()
        },
        message: 'QR code validated for offline use'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to validate offline QR code'
      };
    }
  }

  /**
   * Create sync data for offline scans
   * @param {Array} offlineScans - Array of offline scan records
   * @returns {Promise<Object>} Sync preparation result
   */
  async prepareOfflineSync(offlineScans) {
    try {
      const syncData = {
        syncId: crypto.randomUUID(),
        timestamp: Date.now(),
        scans: offlineScans.map(scan => ({
          ticketId: scan.ticketId,
          eventId: scan.eventId,
          userId: scan.userId,
          scannedAt: scan.scannedAt,
          scannedBy: scan.scannedBy,
          location: scan.location,
          deviceInfo: scan.deviceInfo,
          offlineId: scan.offlineId || crypto.randomUUID()
        }))
      };

      return {
        success: true,
        data: syncData,
        message: 'Offline sync data prepared successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to prepare offline sync data'
      };
    }
  }

  /**
   * Process offline sync data when connection is restored
   * @param {Object} syncData - Sync data from offline scans
   * @returns {Promise<Object>} Sync processing result
   */
  async processOfflineSync(syncData) {
    try {
      const results = {
        successful: [],
        failed: [],
        duplicates: []
      };

      for (const scan of syncData.scans) {
        try {
          // Check if this scan was already processed
          const existingTicket = await EventTicket.findById(scan.ticketId);
          if (!existingTicket) {
            results.failed.push({
              scan,
              reason: 'Ticket not found'
            });
            continue;
          }

          // Check for duplicate scans
          const isDuplicate = existingTicket.attendanceRecords.some(record => 
            record.scannedAt.getTime() === new Date(scan.scannedAt).getTime() &&
            record.scannedBy.toString() === scan.scannedBy
          );

          if (isDuplicate) {
            results.duplicates.push({
              scan,
              reason: 'Duplicate scan detected'
            });
            continue;
          }

          // Add attendance record
          existingTicket.attendanceRecords.push({
            scannedAt: new Date(scan.scannedAt),
            scannedBy: scan.scannedBy,
            location: scan.location,
            deviceInfo: scan.deviceInfo,
            scanType: 'entry',
            isValid: true,
            notes: 'Synced from offline scan'
          });

          // Update ticket status if first scan
          if (existingTicket.status === 'active' && existingTicket.attendanceRecords.length === 1) {
            existingTicket.status = 'used';
          }

          await existingTicket.save();
          results.successful.push(scan);

        } catch (error) {
          results.failed.push({
            scan,
            reason: error.message
          });
        }
      }

      return {
        success: true,
        data: {
          syncId: syncData.syncId,
          processedAt: Date.now(),
          results
        },
        message: `Offline sync completed: ${results.successful.length} successful, ${results.failed.length} failed, ${results.duplicates.length} duplicates`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to process offline sync'
      };
    }
  }

  /**
   * Generate batch QR codes for multiple tickets
   * @param {Array} tickets - Array of ticket data
   * @returns {Promise<Object>} Batch generation result
   */
  async generateBatchQRCodes(tickets) {
    try {
      const results = {
        successful: [],
        failed: []
      };

      for (const ticket of tickets) {
        try {
          const qrResult = await this.generateSecureQRCode(ticket);
          if (qrResult.success) {
            results.successful.push({
              ticketId: ticket.ticketId,
              qrData: qrResult.data
            });
          } else {
            results.failed.push({
              ticketId: ticket.ticketId,
              error: qrResult.error
            });
          }
        } catch (error) {
          results.failed.push({
            ticketId: ticket.ticketId,
            error: error.message
          });
        }
      }

      return {
        success: true,
        data: results,
        message: `Batch QR generation completed: ${results.successful.length} successful, ${results.failed.length} failed`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to generate batch QR codes'
      };
    }
  }

  // Private helper methods

  /**
   * Encrypt data using AES-256-CBC
   * @private
   */
  encryptData(text) {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: crypto.createHash('sha256').update(encrypted + iv.toString('hex')).digest('hex')
    };
  }

  /**
   * Decrypt data using AES-256-CBC
   * @private
   */
  decryptData(encryptedData) {
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(encryptedData.iv, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Generate security hash for tamper detection
   * @private
   */
  generateSecurityHash(payload) {
    const hashData = `${payload.ticketId}:${payload.eventId}:${payload.userId}:${payload.timestamp}`;
    return crypto.createHmac('sha256', this.encryptionKey).update(hashData).digest('hex');
  }

  /**
   * Generate QR code image
   * @private
   */
  async generateQRCodeImage(data, options = {}) {
    const defaultOptions = {
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

    const qrOptions = { ...defaultOptions, ...options };
    
    return QRCode.toDataURL(data, qrOptions);
  }
}

module.exports = QRCodeService;