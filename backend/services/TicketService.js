const EventTicket = require('../models/EventTicket');
const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const QRCodeService = require('./QRCodeService');
const QRCode = require('qrcode');
const crypto = require('crypto');
const mongoose = require('mongoose');

class TicketService {
  constructor() {
    this.qrCodeService = new QRCodeService();
  }
  /**
   * Generate a ticket for an event registration
   * @param {string} eventId - Event ID
   * @param {string} userId - User ID
   * @param {Object} registrationData - Registration data
   * @param {Object} session - MongoDB session for transactions
   * @returns {Promise<Object>} Generated ticket
   */
  async generateTicket(eventId, userId, registrationData, session = null) {
    try {
      // Check if ticket already exists
      const existingTicket = await EventTicket.findOne({
        eventId,
        userId
      }).session(session);

      if (existingTicket) {
        return {
          success: false,
          error: 'Ticket already exists',
          message: 'A ticket already exists for this user and event'
        };
      }

      // Get event details
      const event = await Event.findById(eventId).session(session);
      if (!event) {
        return {
          success: false,
          error: 'Event not found',
          message: 'Event not found'
        };
      }

      // Generate unique ticket number
      const ticketNumber = await EventTicket.generateTicketNumber();

      // Create secure QR code with enhanced security
      const ticketData = {
        ticketId: new mongoose.Types.ObjectId().toString(),
        eventId,
        userId,
        ticketNumber,
        expiresAt: event.endDate
      };

      const qrResult = await this.qrCodeService.generateSecureQRCode(ticketData);
      if (!qrResult.success) {
        return {
          success: false,
          error: qrResult.error,
          message: 'Failed to generate secure QR code'
        };
      }

      const qrData = qrResult.data.qrString;
      const qrCodeImage = qrResult.data.qrCodeImage;

      // Create ticket
      const ticket = new EventTicket({
        eventId,
        userId,
        ticketNumber,
        qrCode: qrData,
        qrCodeImage,
        registrationData: {
          registrationType: registrationData.registrationType || 'regular',
          specialRequests: registrationData.specialRequests,
          emergencyContact: registrationData.emergencyContact,
          dietaryRestrictions: registrationData.dietaryRestrictions
        },
        status: 'active'
      });

      await ticket.save({ session });

      return {
        success: true,
        data: ticket,
        message: 'Ticket generated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to generate ticket'
      };
    }
  }

  /**
   * Validate a QR code and return ticket information
   * @param {string} qrData - QR code data
   * @param {string} eventId - Event ID (optional, for additional validation)
   * @returns {Promise<Object>} Validation result
   */
  async validateQRCode(qrData, eventId = null) {
    try {
      // Parse QR data
      const parsedData = this.parseQRData(qrData);
      if (!parsedData.valid) {
        return {
          success: false,
          error: 'Invalid QR code format',
          message: 'QR code format is invalid'
        };
      }

      // Find ticket
      const ticket = await EventTicket.findOne({
        qrCode: qrData
      })
      .populate('eventId', 'title startDate endDate venue status qrScannerSettings')
      .populate('userId', 'firstName lastName email studentId');

      if (!ticket) {
        return {
          success: false,
          error: 'Ticket not found',
          message: 'No ticket found for this QR code'
        };
      }

      // Additional event validation if provided
      if (eventId && ticket.eventId._id.toString() !== eventId) {
        return {
          success: false,
          error: 'Wrong event',
          message: 'This ticket is not for the current event'
        };
      }

      // Validate security hash
      if (!ticket.validateSecurityHash(parsedData.hash)) {
        return {
          success: false,
          error: 'Security validation failed',
          message: 'Ticket security validation failed'
        };
      }

      // Check if ticket can be scanned
      const scanValidation = ticket.canBeScanned();
      if (!scanValidation.valid) {
        return {
          success: false,
          error: scanValidation.reason,
          message: scanValidation.reason
        };
      }

      // Check event-specific scanning rules
      const event = ticket.eventId;
      const now = new Date();
      
      // Check if event is ongoing or within scan window
      const scanWindow = event.qrScannerSettings.scanTimeWindow || 30; // minutes
      const scanStartTime = new Date(event.startDate.getTime() - (scanWindow * 60 * 1000));
      const scanEndTime = new Date(event.endDate.getTime() + (scanWindow * 60 * 1000));
      
      if (now < scanStartTime || now > scanEndTime) {
        return {
          success: false,
          error: 'Outside scan window',
          message: `Scanning is only allowed ${scanWindow} minutes before event start and after event end`
        };
      }

      // Check for multiple scans if not allowed
      if (!event.qrScannerSettings.allowMultipleScans && ticket.attendanceRecords.length > 0) {
        return {
          success: false,
          error: 'Already scanned',
          message: 'This ticket has already been scanned'
        };
      }

      return {
        success: true,
        data: {
          ticket,
          event: ticket.eventId,
          user: ticket.userId,
          canScan: true
        },
        message: 'QR code is valid'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to validate QR code'
      };
    }
  }

  /**
   * Record attendance by scanning QR code
   * @param {string} qrData - QR code data
   * @param {string} scannedBy - ID of user performing the scan
   * @param {Object} scanDetails - Additional scan details
   * @returns {Promise<Object>} Attendance recording result
   */
  async recordAttendance(qrData, scannedBy, scanDetails = {}) {
    try {
      // First validate the QR code
      const validation = await this.validateQRCode(qrData, scanDetails.eventId);
      
      if (!validation.success) {
        // Record failed validation attempt
        await this.recordValidationAttempt(qrData, false, validation.error, scanDetails);
        return validation;
      }

      const { ticket, event } = validation.data;

      // Record attendance
      const attendanceRecord = ticket.recordAttendance(
        scannedBy,
        scanDetails.location || event.venue,
        scanDetails.deviceInfo,
        scanDetails.scanType || 'entry'
      );

      await ticket.save();

      // Update registration status to attended
      await EventRegistration.findOneAndUpdate(
        { eventId: ticket.eventId._id, userId: ticket.userId._id },
        { 
          status: 'attended',
          $push: {
            checkInHistory: {
              checkedInBy: scannedBy,
              location: scanDetails.location || event.venue,
              method: 'qr_scan',
              deviceInfo: scanDetails.deviceInfo
            }
          }
        }
      );

      // Record successful validation attempt
      await this.recordValidationAttempt(qrData, true, null, scanDetails);

      return {
        success: true,
        data: {
          ticket,
          attendanceRecord,
          user: ticket.userId,
          event: ticket.eventId
        },
        message: 'Attendance recorded successfully'
      };
    } catch (error) {
      // Record failed validation attempt
      await this.recordValidationAttempt(qrData, false, error.message, scanDetails);
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to record attendance'
      };
    }
  }

  /**
   * Get ticket by ID with full details
   * @param {string} ticketId - Ticket ID
   * @returns {Promise<Object>} Ticket details
   */
  async getTicketById(ticketId) {
    try {
      const ticket = await EventTicket.findById(ticketId)
        .populate('eventId', 'title startDate endDate venue status')
        .populate('userId', 'firstName lastName email studentId')
        .populate('attendanceRecords.scannedBy', 'firstName lastName');

      if (!ticket) {
        return {
          success: false,
          error: 'Ticket not found',
          message: 'Ticket not found'
        };
      }

      return {
        success: true,
        data: ticket,
        message: 'Ticket retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve ticket'
      };
    }
  }

  /**
   * Get tickets for a specific event
   * @param {string} eventId - Event ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Event tickets
   */
  async getEventTickets(eventId, filters = {}) {
    try {
      const tickets = await EventTicket.findByEvent(eventId, filters.status);
      
      const stats = await EventTicket.getAttendanceStats(eventId);

      return {
        success: true,
        data: {
          tickets,
          statistics: stats
        },
        message: 'Tickets retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve tickets'
      };
    }
  }

  /**
   * Get tickets for a specific user
   * @param {string} userId - User ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} User tickets
   */
  async getUserTickets(userId, filters = {}) {
    try {
      const tickets = await EventTicket.findByUser(userId, filters.status);

      return {
        success: true,
        data: tickets,
        message: 'User tickets retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve user tickets'
      };
    }
  }

  /**
   * Cancel a ticket
   * @param {string} ticketId - Ticket ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} Cancellation result
   */
  async cancelTicket(ticketId, reason = '') {
    try {
      const ticket = await EventTicket.findById(ticketId);
      
      if (!ticket) {
        return {
          success: false,
          error: 'Ticket not found',
          message: 'Ticket not found'
        };
      }

      if (ticket.status !== 'active') {
        return {
          success: false,
          error: 'Cannot cancel ticket',
          message: `Cannot cancel ticket with status: ${ticket.status}`
        };
      }

      ticket.status = 'cancelled';
      // Store cancellation reason if provided
      if (reason) {
        ticket.cancellationReason = reason;
      }
      await ticket.save();

      return {
        success: true,
        data: ticket,
        message: 'Ticket cancelled successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to cancel ticket'
      };
    }
  }

  /**
   * Regenerate QR code for a ticket (in case of security concerns)
   * @param {string} ticketId - Ticket ID
   * @returns {Promise<Object>} Regeneration result
   */
  async regenerateQRCode(ticketId) {
    try {
      const ticket = await EventTicket.findById(ticketId);
      
      if (!ticket) {
        return {
          success: false,
          error: 'Ticket not found',
          message: 'Ticket not found'
        };
      }

      if (ticket.status !== 'active') {
        return {
          success: false,
          error: 'Cannot regenerate QR code',
          message: 'Can only regenerate QR code for active tickets'
        };
      }

      // Generate new QR data and image
      const qrData = this.generateQRData(ticket.eventId, ticket.userId, ticket.ticketNumber);
      const qrCodeImage = await this.generateQRCodeImage(qrData);

      ticket.qrCode = qrData;
      ticket.qrCodeImage = qrCodeImage;
      ticket.securityHash = ticket.generateSecurityHash();
      
      await ticket.save();

      return {
        success: true,
        data: ticket,
        message: 'QR code regenerated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to regenerate QR code'
      };
    }
  }

  // Private helper methods

  /**
   * Generate QR code data with security
   * @private
   */
  generateQRData(eventId, userId, ticketNumber) {
    const timestamp = Date.now();
    const data = {
      eventId,
      userId,
      ticketNumber,
      timestamp,
      hash: crypto.createHash('sha256')
        .update(`${eventId}:${userId}:${ticketNumber}:${timestamp}`)
        .digest('hex')
    };
    
    return JSON.stringify(data);
  }

  /**
   * Parse QR code data
   * @private
   */
  parseQRData(qrData) {
    try {
      const parsed = JSON.parse(qrData);
      
      // Validate required fields
      if (!parsed.eventId || !parsed.userId || !parsed.ticketNumber || !parsed.hash) {
        return { valid: false };
      }

      return {
        valid: true,
        ...parsed
      };
    } catch (error) {
      return { valid: false };
    }
  }

  /**
   * Generate QR code image
   * @private
   */
  async generateQRCodeImage(qrData) {
    try {
      const qrCodeDataURL = QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      });
      
      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating QR code image:', error);
      return null;
    }
  }

  /**
   * Record validation attempt for security monitoring
   * @private
   */
  async recordValidationAttempt(qrData, isSuccessful, errorReason, scanDetails) {
    try {
      // Try to find the ticket to record the attempt
      const parsedData = this.parseQRData(qrData);
      if (parsedData.valid) {
        const ticket = await EventTicket.findOne({
          ticketNumber: parsedData.ticketNumber
        });
        
        if (ticket) {
          ticket.validationAttempts.push({
            isSuccessful,
            errorReason,
            deviceInfo: scanDetails.deviceInfo || {}
          });
          
          await ticket.save();
        }
      }
    } catch (error) {
      console.error('Error recording validation attempt:', error);
    }
  }

  /**
   * Clean up expired tickets (utility method)
   * @returns {Promise<Object>} Cleanup result
   */
  async cleanupExpiredTickets() {
    try {
      const result = await EventTicket.updateMany(
        {
          expiresAt: { $lt: new Date() },
          status: 'active'
        },
        {
          status: 'expired'
        }
      );

      return {
        success: true,
        data: { modifiedCount: result.modifiedCount },
        message: `${result.modifiedCount} expired tickets updated`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to cleanup expired tickets'
      };
    }
  }

  /**
   * Get attendance analytics for multiple events
   * @param {Array} eventIds - Array of event IDs
   * @returns {Promise<Object>} Analytics data
   */
  async getMultiEventAnalytics(eventIds) {
    try {
      const analytics = await EventTicket.aggregate([
        {
          $match: {
            eventId: { $in: eventIds.map(id => mongoose.Types.ObjectId(id)) }
          }
        },
        {
          $group: {
            _id: '$eventId',
            totalTickets: { $sum: 1 },
            activeTickets: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            },
            usedTickets: {
              $sum: { $cond: [{ $eq: ['$status', 'used'] }, 1, 0] }
            },
            cancelledTickets: {
              $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
            },
            totalScans: {
              $sum: { $size: '$attendanceRecords' }
            }
          }
        },
        {
          $lookup: {
            from: 'events',
            localField: '_id',
            foreignField: '_id',
            as: 'event'
          }
        },
        {
          $unwind: '$event'
        },
        {
          $project: {
            eventTitle: '$event.title',
            eventDate: '$event.startDate',
            totalTickets: 1,
            activeTickets: 1,
            usedTickets: 1,
            cancelledTickets: 1,
            totalScans: 1,
            attendanceRate: {
              $cond: [
                { $gt: ['$totalTickets', 0] },
                { $multiply: [{ $divide: ['$usedTickets', '$totalTickets'] }, 100] },
                0
              ]
            }
          }
        }
      ]);

      return {
        success: true,
        data: analytics,
        message: 'Multi-event analytics retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve multi-event analytics'
      };
    }
  }
}

module.exports = TicketService;