const express = require('express');
const router = express.Router();
const EventService = require('../services/EventService');
const TicketService = require('../services/TicketService');
const { requireAuth } = require('../middleware/sessionAuth');
const rateLimit = require('express-rate-limit');

// Initialize services
const eventService = new EventService();
const ticketService = new TicketService();

// Rate limiting for event operations
const eventRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many event requests from this IP, please try again later.'
});

const registrationRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each IP to 10 registration attempts per windowMs
  message: 'Too many registration attempts, please try again later.'
});

// Apply rate limiting to all routes
router.use(eventRateLimit);

/**
 * @route GET /api/events
 * @desc Get events with filtering and pagination
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      status: req.query.status,
      organizer: req.query.organizer,
      isPublic: req.query.isPublic === 'true' ? true : req.query.isPublic === 'false' ? false : undefined,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      sortBy: req.query.sortBy || 'startDate',
      sortOrder: req.query.sortOrder || 'asc',
      search: req.query.search || ''
    };

    const result = await eventService.getEvents(filters, options);

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
    console.error('Error getting events:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve events'
    });
  }
});

/**
 * @route GET /api/events/:id
 * @desc Get event by ID
 * @access Public
 */
router.get('/:id', async (req, res) => {
  try {
    const result = await eventService.getEventById(req.params.id);

    if (result.success) {
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
    console.error('Error getting event:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve event'
    });
  }
});

/**
 * @route POST /api/events
 * @desc Create a new event
 * @access Private (Authenticated users)
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const eventData = req.body;
    const organizerId = req.user._id || req.user.id;

    // Debug logging
    console.log('Creating event with data:', eventData);
    console.log('Organizer ID:', organizerId);
    console.log('User object:', req.user);

    if (!organizerId) {
      return res.status(400).json({
        success: false,
        error: 'Missing organizer ID',
        message: 'User ID not found in session'
      });
    }

    const result = await eventService.createEvent(eventData, organizerId);

    if (result.success) {
      res.status(201).json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      console.log('EventService error:', result);
      res.status(400).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to create event',
      details: error.message
    });
  }
});

/**
 * @route PUT /api/events/:id
 * @desc Update an event
 * @access Private (Event organizer only)
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const eventId = req.params.id;
    const updateData = req.body;
    const userId = req.user.id;

    const result = await eventService.updateEvent(eventId, updateData, userId);

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      const statusCode = result.error === 'Unauthorized' ? 403 : 
                        result.error === 'Event not found' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update event'
    });
  }
});

/**
 * @route DELETE /api/events/:id
 * @desc Delete an event
 * @access Private (Event organizer only)
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    const result = await eventService.deleteEvent(eventId, userId);

    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      const statusCode = result.error === 'Unauthorized' ? 403 : 
                        result.error === 'Event not found' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to delete event'
    });
  }
});

/**
 * @route POST /api/events/:id/register
 * @desc Register for an event
 * @access Private (Authenticated users)
 */
router.post('/:id/register', requireAuth, registrationRateLimit, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;
    const registrationData = req.body;

    const result = await eventService.registerForEvent(eventId, userId, registrationData);

    if (result.success) {
      res.status(201).json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      const statusCode = result.error === 'Event not found' ? 404 : 
                        result.error === 'Already registered' ? 409 : 400;
      res.status(statusCode).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to register for event'
    });
  }
});

/**
 * @route DELETE /api/events/:id/register
 * @desc Cancel event registration
 * @access Private (Authenticated users)
 */
router.delete('/:id/register', requireAuth, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;
    const { reason } = req.body;

    const result = await eventService.cancelRegistration(eventId, userId, reason);

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      const statusCode = result.error === 'Registration not found' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error cancelling registration:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to cancel registration'
    });
  }
});

/**
 * @route GET /api/events/:id/registrations
 * @desc Get event registrations
 * @access Private (Event organizer only)
 */
router.get('/:id/registrations', requireAuth, async (req, res) => {
  try {
    const eventId = req.params.id;
    const filters = {
      status: req.query.status,
      registrationType: req.query.registrationType
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

    const result = await eventService.getEventRegistrations(eventId, filters);

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
    console.error('Error getting event registrations:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve event registrations'
    });
  }
});

/**
 * @route GET /api/events/:id/analytics
 * @desc Get event attendance analytics
 * @access Private (Event organizer only)
 */
router.get('/:id/analytics', requireAuth, async (req, res) => {
  try {
    const eventId = req.params.id;

    const result = await eventService.getAttendanceAnalytics(eventId);

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
    console.error('Error getting event analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve event analytics'
    });
  }
});

/**
 * @route POST /api/events/:id/schedule-reminders
 * @desc Schedule automated reminders for an event
 * @access Private (Event organizer only)
 */
router.post('/:id/schedule-reminders', requireAuth, async (req, res) => {
  try {
    const eventId = req.params.id;

    const result = await eventService.scheduleEventReminders(eventId);

    if (result.success) {
      res.json({
        success: true,
        data: {
          totalScheduled: result.totalScheduled,
          reminderTimes: result.reminderTimes
        },
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
    console.error('Error scheduling event reminders:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to schedule event reminders'
    });
  }
});

/**
 * @route POST /api/events/:id/send-reminders
 * @desc Send immediate reminders to registered participants
 * @access Private (Event organizer only)
 */
router.post('/:id/send-reminders', requireAuth, async (req, res) => {
  try {
    const eventId = req.params.id;
    const hoursBeforeEvent = parseInt(req.body.hoursBeforeEvent) || 24;

    const result = await eventService.sendEventReminders(eventId, hoursBeforeEvent);

    if (result.success) {
      res.json({
        success: true,
        data: {
          totalSent: result.totalSent
        },
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
    console.error('Error sending event reminders:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to send event reminders'
    });
  }
});

/**
 * @route POST /api/events/:id/schedule-followup
 * @desc Schedule follow-up notifications after event completion
 * @access Private (Event organizer only)
 */
router.post('/:id/schedule-followup', requireAuth, async (req, res) => {
  try {
    const eventId = req.params.id;

    const result = await eventService.scheduleEventFollowUp(eventId);

    if (result.success) {
      res.json({
        success: true,
        data: {
          totalScheduled: result.totalScheduled,
          followUpTime: result.followUpTime
        },
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
    console.error('Error scheduling follow-up:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to schedule follow-up notifications'
    });
  }
});

/**
 * @route POST /api/events/:id/send-followup
 * @desc Send immediate follow-up messages to attendees
 * @access Private (Event organizer only)
 */
router.post('/:id/send-followup', requireAuth, async (req, res) => {
  try {
    const eventId = req.params.id;

    const result = await eventService.sendEventFollowUp(eventId);

    if (result.success) {
      res.json({
        success: true,
        data: {
          totalSent: result.totalSent
        },
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
    console.error('Error sending follow-up:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to send follow-up messages'
    });
  }
});

/**
 * @route PATCH /api/events/:id/notification-settings
 * @desc Update event notification settings
 * @access Private (Event organizer only)
 */
router.patch('/:id/notification-settings', requireAuth, async (req, res) => {
  try {
    const eventId = req.params.id;
    const notificationSettings = req.body;

    const result = await eventService.updateEvent(
      eventId,
      { notificationSettings },
      req.user._id
    );

    if (result.success) {
      res.json({
        success: true,
        data: result.data.notificationSettings,
        message: 'Notification settings updated successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update notification settings'
    });
  }
});

module.exports = router;