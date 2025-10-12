const express = require('express');
const router = express.Router();
const TicketService = require('../services/TicketService');
const { requireAuth } = require('../middleware/sessionAuth');
const rateLimit = require('express-rate-limit');

// Initialize service
const ticketService = new TicketService();

// Rate limiting for ticket operations
const ticketRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: 'Too many ticket requests from this IP, please try again later.'
});

const scanRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50, // limit each IP to 50 scan attempts per minute
  message: 'Too many scan attempts, please try again later.'
});

// Apply rate limiting to all routes
router.use(ticketRateLimit);

/**
 * @route GET /api/tickets/:id
 * @desc Get ticket by ID
 * @access Private (Ticket owner or event organizer)
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const ticketId = req.params.id;

    const result = await ticketService.getTicketById(ticketId);

    if (result.success) {
      // Check if user has permission to view this ticket
      const ticket = result.data;
      const userId = req.user.id;
      
      if (ticket.userId._id.toString() !== userId && 
          ticket.eventId.organizer.toString() !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized',
          message: 'You do not have permission to view this ticket'
        });
      }

      res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error getting ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve ticket'
    });
  }
});

/**
 * @route GET /api/tickets/user/:userId
 * @desc Get tickets for a specific user
 * @access Private (User themselves only)
 */
router.get('/user/:userId', requireAuth, async (req, res) => {
  try {
    const userId = req.params.userId;
    const requestingUserId = req.user.id;

    // Users can only view their own tickets
    if (userId !== requestingUserId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
        message: 'You can only view your own tickets'
      });
    }

    const filters = {
      status: req.query.status
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

    const result = await ticketService.getUserTickets(userId, filters);

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error getting user tickets:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve user tickets'
    });
  }
});

/**
 * @route GET /api/tickets/event/:eventId
 * @desc Get tickets for a specific event
 * @access Private (Event organizer only)
 */
router.get('/event/:eventId', requireAuth, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const filters = {
      status: req.query.status
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

    const result = await ticketService.getEventTickets(eventId, filters);

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error getting event tickets:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve event tickets'
    });
  }
});

/**
 * @route POST /api/tickets/validate
 * @desc Validate a QR code
 * @access Private (Authenticated users)
 */
router.post('/validate', requireAuth, scanRateLimit, async (req, res) => {
  try {
    const { qrData, eventId } = req.body;

    if (!qrData) {
      return res.status(400).json({
        success: false,
        error: 'Missing QR data',
        message: 'QR code data is required'
      });
    }

    const result = await ticketService.validateQRCode(qrData, eventId);

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error validating QR code:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to validate QR code'
    });
  }
});

/**
 * @route POST /api/tickets/scan
 * @desc Scan QR code and record attendance
 * @access Private (Event staff/organizers)
 */
router.post('/scan', requireAuth, scanRateLimit, async (req, res) => {
  try {
    const { qrData, eventId, location, scanType, deviceInfo } = req.body;
    const scannedBy = req.user.id;

    if (!qrData) {
      return res.status(400).json({
        success: false,
        error: 'Missing QR data',
        message: 'QR code data is required'
      });
    }

    const scanDetails = {
      eventId,
      location,
      scanType: scanType || 'entry',
      deviceInfo: {
        ...deviceInfo,
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip
      }
    };

    const result = await ticketService.recordAttendance(qrData, scannedBy, scanDetails);

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error scanning QR code:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to scan QR code'
    });
  }
});

/**
 * @route PUT /api/tickets/:id/cancel
 * @desc Cancel a ticket
 * @access Private (Ticket owner only)
 */
router.put('/:id/cancel', requireAuth, async (req, res) => {
  try {
    const ticketId = req.params.id;
    const { reason } = req.body;

    // First get the ticket to check ownership
    const ticketResult = await ticketService.getTicketById(ticketId);
    if (!ticketResult.success) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found',
        message: 'Ticket not found'
      });
    }

    const ticket = ticketResult.data;
    const userId = req.user.id;

    // Check if user owns this ticket
    if (ticket.userId._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
        message: 'You can only cancel your own tickets'
      });
    }

    const result = await ticketService.cancelTicket(ticketId, reason);

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error cancelling ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to cancel ticket'
    });
  }
});

/**
 * @route PUT /api/tickets/:id/regenerate-qr
 * @desc Regenerate QR code for a ticket
 * @access Private (Ticket owner only)
 */
router.put('/:id/regenerate-qr', requireAuth, async (req, res) => {
  try {
    const ticketId = req.params.id;

    // First get the ticket to check ownership
    const ticketResult = await ticketService.getTicketById(ticketId);
    if (!ticketResult.success) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found',
        message: 'Ticket not found'
      });
    }

    const ticket = ticketResult.data;
    const userId = req.user.id;

    // Check if user owns this ticket
    if (ticket.userId._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
        message: 'You can only regenerate QR codes for your own tickets'
      });
    }

    const result = await ticketService.regenerateQRCode(ticketId);

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error regenerating QR code:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to regenerate QR code'
    });
  }
});

/**
 * @route GET /api/tickets/analytics/multi-event
 * @desc Get analytics for multiple events
 * @access Private (Authenticated users)
 */
router.get('/analytics/multi-event', requireAuth, async (req, res) => {
  try {
    const { eventIds } = req.query;

    if (!eventIds) {
      return res.status(400).json({
        success: false,
        error: 'Missing event IDs',
        message: 'Event IDs are required'
      });
    }

    const eventIdArray = Array.isArray(eventIds) ? eventIds : eventIds.split(',');

    const result = await ticketService.getMultiEventAnalytics(eventIdArray);

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error getting multi-event analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve multi-event analytics'
    });
  }
});

/**
 * @route POST /api/tickets/cleanup-expired
 * @desc Cleanup expired tickets (Admin only)
 * @access Private (Admin only)
 */
router.post('/cleanup-expired', requireAuth, async (req, res) => {
  try {
    // TODO: Add admin role check when user roles are implemented
    // For now, allow any authenticated user to run cleanup

    const result = await ticketService.cleanupExpiredTickets();

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error cleaning up expired tickets:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to cleanup expired tickets'
    });
  }
});

module.exports = router;