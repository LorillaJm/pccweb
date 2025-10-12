const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const EventTicket = require('../models/EventTicket');
const notificationService = require('./NotificationService');
const mongoose = require('mongoose');

class EventService {
  constructor() {
    this.notificationService = notificationService;
  }

  /**
   * Create a new event
   * @param {Object} eventData - Event data
   * @param {string} organizerId - ID of the event organizer
   * @returns {Promise<Object>} Created event
   */
  async createEvent(eventData, organizerId) {
    try {
      const event = new Event({
        ...eventData,
        organizer: organizerId,
        registeredCount: 0,
        waitlistCount: 0
      });

      await event.save();
      await event.populate('organizer', 'firstName lastName email');
      
      return {
        success: true,
        data: event,
        message: 'Event created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to create event'
      };
    }
  }

  /**
   * Update an existing event
   * @param {string} eventId - Event ID
   * @param {Object} updateData - Data to update
   * @param {string} userId - ID of the user making the update
   * @returns {Promise<Object>} Updated event
   */
  async updateEvent(eventId, updateData, userId) {
    try {
      const event = await Event.findById(eventId);
      
      if (!event) {
        return {
          success: false,
          error: 'Event not found',
          message: 'Event not found'
        };
      }

      // Check if user is authorized to update (organizer or admin)
      if (event.organizer.toString() !== userId) {
        // TODO: Add admin role check when user roles are implemented
        return {
          success: false,
          error: 'Unauthorized',
          message: 'You are not authorized to update this event'
        };
      }

      // Prevent certain updates if event has registrations
      if (event.registeredCount > 0) {
        const restrictedFields = ['capacity', 'startDate', 'endDate'];
        const hasRestrictedUpdates = restrictedFields.some(field => 
          updateData.hasOwnProperty(field) && updateData[field] !== event[field]
        );
        
        if (hasRestrictedUpdates) {
          return {
            success: false,
            error: 'Cannot modify capacity or dates for events with existing registrations',
            message: 'Cannot modify capacity or dates for events with existing registrations'
          };
        }
      }

      Object.assign(event, updateData);
      await event.save();
      await event.populate('organizer', 'firstName lastName email');

      // Notify registered users of significant changes
      if (updateData.startDate || updateData.endDate || updateData.venue) {
        await this.notifyEventUpdate(eventId, updateData);
      }

      return {
        success: true,
        data: event,
        message: 'Event updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to update event'
      };
    }
  }

  /**
   * Get event by ID with full details
   * @param {string} eventId - Event ID
   * @returns {Promise<Object>} Event details
   */
  async getEventById(eventId) {
    try {
      const event = await Event.findById(eventId)
        .populate('organizer', 'firstName lastName email');
      
      if (!event) {
        return {
          success: false,
          error: 'Event not found',
          message: 'Event not found'
        };
      }

      return {
        success: true,
        data: event,
        message: 'Event retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve event'
      };
    }
  }

  /**
   * Get events with filtering and pagination
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<Object>} Filtered events
   */
  async getEvents(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'startDate',
        sortOrder = 'asc',
        search = ''
      } = options;

      const query = {};

      // Apply filters
      if (filters.category) {
        query.category = filters.category;
      }

      if (filters.status) {
        query.status = filters.status;
      } else {
        // Default to published events only
        query.status = 'published';
      }

      if (filters.organizer) {
        query.organizer = filters.organizer;
      }

      if (filters.isPublic !== undefined) {
        query.isPublic = filters.isPublic;
      }

      if (filters.startDate) {
        query.startDate = { $gte: new Date(filters.startDate) };
      }

      if (filters.endDate) {
        query.endDate = { $lte: new Date(filters.endDate) };
      }

      // Add search functionality
      if (search) {
        query.$text = { $search: search };
      }

      const skip = (page - 1) * limit;
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const [events, total] = await Promise.all([
        Event.find(query)
          .populate('organizer', 'firstName lastName email')
          .sort(sortOptions)
          .skip(skip)
          .limit(limit),
        Event.countDocuments(query)
      ]);

      return {
        success: true,
        data: {
          events,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        },
        message: 'Events retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve events'
      };
    }
  }

  /**
   * Register user for an event
   * @param {string} eventId - Event ID
   * @param {string} userId - User ID
   * @param {Object} registrationData - Registration form data
   * @returns {Promise<Object>} Registration result
   */
  async registerForEvent(eventId, userId, registrationData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const event = await Event.findById(eventId).session(session);
      
      if (!event) {
        await session.abortTransaction();
        return {
          success: false,
          error: 'Event not found',
          message: 'Event not found'
        };
      }

      // Check if registration is open
      if (!event.isRegistrationOpen) {
        await session.abortTransaction();
        return {
          success: false,
          error: 'Registration is closed',
          message: 'Registration for this event is closed'
        };
      }

      // Check if user is already registered
      const existingRegistration = await EventRegistration.findOne({
        eventId,
        userId
      }).session(session);

      if (existingRegistration) {
        await session.abortTransaction();
        return {
          success: false,
          error: 'Already registered',
          message: 'You are already registered for this event'
        };
      }

      // Determine registration type based on capacity
      let registrationType = 'regular';
      let waitlistPosition = null;

      if (event.isFull) {
        if (event.canAddToWaitlist()) {
          registrationType = 'waitlist';
          waitlistPosition = event.waitlistCount + 1;
        } else {
          await session.abortTransaction();
          return {
            success: false,
            error: 'Event is full',
            message: 'Event is full and waitlist is not available'
          };
        }
      }

      // Create registration
      const registration = new EventRegistration({
        eventId,
        userId,
        registrationType,
        waitlistPosition,
        registrationData,
        status: 'pending'
      });

      await registration.save({ session });

      // Update event counts
      if (registrationType === 'regular') {
        event.registeredCount += 1;
      } else {
        event.waitlistCount += 1;
      }
      
      await event.save({ session });

      // Generate ticket if registration is confirmed
      let ticket = null;
      if (registration.status === 'confirmed') {
        const TicketService = require('./TicketService');
        const ticketService = new TicketService();
        const ticketResult = await ticketService.generateTicket(
          eventId, 
          userId, 
          registrationData, 
          session
        );
        
        if (ticketResult.success) {
          ticket = ticketResult.data;
          registration.ticketId = ticket._id;
          await registration.save({ session });
        }
      }

      await session.commitTransaction();

      // Send confirmation notification
      await this.notifyRegistrationConfirmation(registration, event, ticket);

      return {
        success: true,
        data: {
          registration,
          ticket,
          registrationType
        },
        message: registrationType === 'waitlist' 
          ? `You have been added to the waitlist (position ${waitlistPosition})`
          : 'Registration successful'
      };
    } catch (error) {
      await session.abortTransaction();
      return {
        success: false,
        error: error.message,
        message: 'Failed to register for event'
      };
    } finally {
      session.endSession();
    }
  }

  /**
   * Cancel event registration
   * @param {string} eventId - Event ID
   * @param {string} userId - User ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} Cancellation result
   */
  async cancelRegistration(eventId, userId, reason = '') {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const registration = await EventRegistration.findOne({
        eventId,
        userId,
        status: { $in: ['pending', 'confirmed'] }
      }).session(session);

      if (!registration) {
        await session.abortTransaction();
        return {
          success: false,
          error: 'Registration not found',
          message: 'No active registration found for this event'
        };
      }

      const event = await Event.findById(eventId).session(session);
      
      // Cancel registration
      registration.cancel(reason);
      await registration.save({ session });

      // Cancel associated ticket
      if (registration.ticketId) {
        await EventTicket.findByIdAndUpdate(
          registration.ticketId,
          { status: 'cancelled' },
          { session }
        );
      }

      // Update event counts
      if (registration.registrationType === 'regular') {
        event.registeredCount = Math.max(0, event.registeredCount - 1);
      } else {
        event.waitlistCount = Math.max(0, event.waitlistCount - 1);
      }
      
      await event.save({ session });

      // Promote from waitlist if there's space
      if (registration.registrationType === 'regular' && event.waitlistCount > 0) {
        const promoted = await EventRegistration.promoteFromWaitlist(eventId, 1);
        if (promoted.length > 0) {
          // Generate ticket for promoted user
          const TicketService = require('./TicketService');
          const ticketService = new TicketService();
          await ticketService.generateTicket(
            eventId,
            promoted[0].userId,
            promoted[0].registrationData,
            session
          );
          
          // Notify promoted user
          await this.notifyWaitlistPromotion(promoted[0], event);
        }
      }

      await session.commitTransaction();

      return {
        success: true,
        data: registration,
        message: 'Registration cancelled successfully'
      };
    } catch (error) {
      await session.abortTransaction();
      return {
        success: false,
        error: error.message,
        message: 'Failed to cancel registration'
      };
    } finally {
      session.endSession();
    }
  }

  /**
   * Get event registrations with filtering
   * @param {string} eventId - Event ID
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Object>} Event registrations
   */
  async getEventRegistrations(eventId, filters = {}) {
    try {
      const registrations = await EventRegistration.findByEvent(
        eventId,
        filters.status,
        filters.registrationType
      );

      const stats = await EventRegistration.getRegistrationStats(eventId);

      return {
        success: true,
        data: {
          registrations,
          statistics: stats
        },
        message: 'Registrations retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve registrations'
      };
    }
  }

  /**
   * Get attendance analytics for an event
   * @param {string} eventId - Event ID
   * @returns {Promise<Object>} Attendance analytics
   */
  async getAttendanceAnalytics(eventId) {
    try {
      const [registrationStats, ticketStats, attendanceRecords] = await Promise.all([
        EventRegistration.getRegistrationStats(eventId),
        EventTicket.getAttendanceStats(eventId),
        EventTicket.find({ eventId })
          .populate('userId', 'firstName lastName email')
          .select('attendanceRecords status')
      ]);

      const analytics = {
        registrations: registrationStats,
        tickets: ticketStats,
        attendance: {
          totalScans: attendanceRecords.reduce((sum, ticket) => 
            sum + ticket.attendanceRecords.length, 0),
          uniqueAttendees: attendanceRecords.filter(ticket => 
            ticket.attendanceRecords.length > 0).length,
          noShows: attendanceRecords.filter(ticket => 
            ticket.status === 'active' && ticket.attendanceRecords.length === 0).length
        }
      };

      return {
        success: true,
        data: analytics,
        message: 'Analytics retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve analytics'
      };
    }
  }

  /**
   * Cancel an event and notify all participants
   * @param {string} eventId - Event ID
   * @param {string} userId - User ID requesting cancellation
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} Cancellation result
   */
  async cancelEvent(eventId, userId, reason = '') {
    try {
      const event = await Event.findById(eventId);
      
      if (!event) {
        return {
          success: false,
          error: 'Event not found',
          message: 'Event not found'
        };
      }

      // Check authorization
      if (event.organizer.toString() !== userId) {
        return {
          success: false,
          error: 'Unauthorized',
          message: 'You are not authorized to cancel this event'
        };
      }

      // Update event status
      event.status = 'cancelled';
      await event.save();

      // Notify all registered participants
      await this.notifyEventCancellation(eventId, event.title, reason);

      return {
        success: true,
        message: 'Event cancelled successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to cancel event'
      };
    }
  }

  /**
   * Delete an event (only if no registrations)
   * @param {string} eventId - Event ID
   * @param {string} userId - User ID requesting deletion
   * @returns {Promise<Object>} Deletion result
   */
  async deleteEvent(eventId, userId) {
    try {
      const event = await Event.findById(eventId);
      
      if (!event) {
        return {
          success: false,
          error: 'Event not found',
          message: 'Event not found'
        };
      }

      // Check authorization
      if (event.organizer.toString() !== userId) {
        return {
          success: false,
          error: 'Unauthorized',
          message: 'You are not authorized to delete this event'
        };
      }

      // Check if event has registrations
      if (event.registeredCount > 0 || event.waitlistCount > 0) {
        return {
          success: false,
          error: 'Cannot delete event with registrations',
          message: 'Cannot delete event that has registrations'
        };
      }

      await Event.findByIdAndDelete(eventId);

      return {
        success: true,
        message: 'Event deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to delete event'
      };
    }
  }

  /**
   * Record attendance and send confirmation
   * @param {string} ticketId - Ticket ID
   * @param {string} scannedBy - User ID of scanner
   * @param {Object} metadata - Additional scan metadata
   * @returns {Promise<Object>} Attendance result
   */
  async recordAttendance(ticketId, scannedBy, metadata = {}) {
    try {
      const ticket = await EventTicket.findById(ticketId)
        .populate('userId', 'firstName lastName email')
        .populate('eventId', 'title startDate venue');

      if (!ticket) {
        return {
          success: false,
          error: 'Ticket not found',
          message: 'Ticket not found'
        };
      }

      // Check if already scanned
      if (ticket.attendanceRecords && ticket.attendanceRecords.length > 0) {
        const event = ticket.eventId;
        if (!event.qrScannerSettings?.allowMultipleScans) {
          return {
            success: false,
            error: 'Ticket already scanned',
            message: 'This ticket has already been scanned'
          };
        }
      }

      // Record attendance
      ticket.attendanceRecords.push({
        scannedAt: new Date(),
        scannedBy: scannedBy,
        location: metadata.location,
        deviceInfo: metadata.deviceInfo
      });

      if (ticket.status === 'active') {
        ticket.status = 'used';
      }

      await ticket.save();

      // Send attendance confirmation
      await this.notifyAttendanceConfirmation(ticket.userId._id, ticket.eventId);

      return {
        success: true,
        data: ticket,
        message: 'Attendance recorded successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to record attendance'
      };
    }
  }

  /**
   * Send event reminders to registered participants
   * @param {string} eventId - Event ID
   * @param {number} hoursBeforeEvent - Hours before event to send reminder
   * @returns {Promise<Object>} Reminder result
   */
  async sendEventReminders(eventId, hoursBeforeEvent = 24) {
    try {
      const event = await Event.findById(eventId);
      
      if (!event) {
        return {
          success: false,
          error: 'Event not found',
          message: 'Event not found'
        };
      }

      // Get all confirmed registrations
      const registrations = await EventRegistration.find({
        eventId,
        status: 'confirmed'
      }).populate('userId', 'firstName lastName email');

      if (registrations.length === 0) {
        return {
          success: true,
          message: 'No confirmed registrations to remind',
          totalSent: 0
        };
      }

      // Calculate time until event
      const timeUntilEvent = new Date(event.startDate).getTime() - Date.now();
      const hoursUntilEvent = timeUntilEvent / (1000 * 60 * 60);

      // Send reminders
      const reminderPromises = registrations.map(registration =>
        this.notificationService.sendToUser(registration.userId._id, {
          title: 'Event Reminder',
          message: `Reminder: "${event.title}" starts in ${Math.round(hoursUntilEvent)} hours at ${event.venue}`,
          type: 'reminder',
          category: 'event',
          priority: 'high',
          data: { 
            eventId: event._id,
            startDate: event.startDate,
            venue: event.venue
          },
          actionUrl: `/events/${event._id}`
        }, ['web', 'email', 'push'])
      );

      await Promise.all(reminderPromises);

      return {
        success: true,
        message: 'Event reminders sent successfully',
        totalSent: registrations.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to send event reminders'
      };
    }
  }

  /**
   * Send follow-up messages after event completion
   * @param {string} eventId - Event ID
   * @returns {Promise<Object>} Follow-up result
   */
  async sendEventFollowUp(eventId) {
    try {
      const event = await Event.findById(eventId);
      
      if (!event) {
        return {
          success: false,
          error: 'Event not found',
          message: 'Event not found'
        };
      }

      // Get all attendees (tickets with attendance records)
      const tickets = await EventTicket.find({
        eventId,
        status: 'used'
      }).populate('userId', 'firstName lastName email');

      if (tickets.length === 0) {
        return {
          success: true,
          message: 'No attendees to follow up with',
          totalSent: 0
        };
      }

      // Send follow-up messages
      const followUpPromises = tickets.map(ticket =>
        this.notificationService.sendToUser(ticket.userId._id, {
          title: 'Thank You for Attending',
          message: `Thank you for attending "${event.title}". We hope you enjoyed the event!`,
          type: 'info',
          category: 'event',
          priority: 'low',
          data: { 
            eventId: event._id,
            attendedAt: ticket.attendanceRecords[0]?.scannedAt
          },
          actionUrl: `/events/${event._id}/feedback`
        }, ['web', 'email'])
      );

      await Promise.all(followUpPromises);

      return {
        success: true,
        message: 'Follow-up messages sent successfully',
        totalSent: tickets.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to send follow-up messages'
      };
    }
  }

  // Private helper methods

  /**
   * Notify users of event updates
   * @private
   */
  async notifyEventUpdate(eventId, updateData) {
    try {
      const event = await Event.findById(eventId);
      
      // Check if update notifications are enabled for this event
      if (!event.notificationSettings?.sendUpdateNotifications) {
        return;
      }

      const registrations = await EventRegistration.find({
        eventId,
        status: { $in: ['confirmed', 'pending'] }
      }).populate('userId');

      if (registrations.length === 0) {
        return;
      }

      // Build detailed update message
      let updateDetails = [];
      if (updateData.startDate) {
        updateDetails.push(`Start date changed to ${new Date(updateData.startDate).toLocaleString()}`);
      }
      if (updateData.endDate) {
        updateDetails.push(`End date changed to ${new Date(updateData.endDate).toLocaleString()}`);
      }
      if (updateData.venue) {
        updateDetails.push(`Venue changed to ${updateData.venue}`);
      }
      if (updateData.title) {
        updateDetails.push(`Title changed to ${updateData.title}`);
      }

      if (updateDetails.length === 0) {
        return; // No significant updates to notify about
      }

      const message = `Important update for "${event.title}": ${updateDetails.join(', ')}`;

      // Send notifications to each user
      for (const registration of registrations) {
        await this.notificationService.sendToUser(registration.userId._id, {
          title: 'Event Update',
          message: message,
          type: 'warning',
          category: 'event',
          priority: 'high',
          data: { 
            eventId, 
            updateData,
            eventTitle: event.title,
            registrationId: registration._id
          },
          actionUrl: `/events/${eventId}`
        }, ['web', 'email', 'push']);
      }
    } catch (error) {
      console.error('Error sending event update notifications:', error);
    }
  }

  /**
   * Send registration confirmation notification
   * @private
   */
  async notifyRegistrationConfirmation(registration, event, ticket) {
    try {
      // Check if registration confirmation is enabled for this event
      if (!event.notificationSettings?.sendRegistrationConfirmation) {
        return;
      }

      const message = registration.registrationType === 'waitlist'
        ? `You have been added to the waitlist for "${event.title}"`
        : `Your registration for "${event.title}" has been confirmed`;

      const detailedMessage = registration.registrationType === 'waitlist'
        ? `You are currently on the waitlist (position ${registration.waitlistPosition}) for "${event.title}". We'll notify you if a spot becomes available.`
        : `Your registration for "${event.title}" has been confirmed! Event starts on ${new Date(event.startDate).toLocaleString()} at ${event.venue}.`;

      await this.notificationService.sendToUser(registration.userId, {
        title: 'Registration Confirmation',
        message: detailedMessage,
        type: 'success',
        category: 'event',
        priority: 'high',
        data: { 
          eventId: event._id, 
          registrationId: registration._id,
          ticketId: ticket?._id,
          eventTitle: event.title,
          eventDate: event.startDate,
          venue: event.venue,
          registrationType: registration.registrationType
        },
        actionUrl: `/events/${event._id}`
      }, ['web', 'email', 'push']);
    } catch (error) {
      console.error('Error sending registration confirmation:', error);
    }
  }

  /**
   * Notify user of waitlist promotion
   * @private
   */
  async notifyWaitlistPromotion(registration, event) {
    try {
      await this.notificationService.sendToUser(registration.userId, {
        title: 'Waitlist Promotion',
        message: `Great news! You've been promoted from the waitlist for "${event.title}"`,
        type: 'success',
        category: 'event',
        priority: 'high',
        data: { 
          eventId: event._id, 
          registrationId: registration._id 
        },
        actionUrl: `/events/${event._id}`
      }, ['web', 'email', 'push']);
    } catch (error) {
      console.error('Error sending waitlist promotion notification:', error);
    }
  }

  /**
   * Notify users of event cancellation
   * @private
   */
  async notifyEventCancellation(eventId, eventTitle, reason) {
    try {
      const event = await Event.findById(eventId);
      
      // Check if cancellation notifications are enabled for this event
      if (!event.notificationSettings?.sendCancellationNotifications) {
        return;
      }

      const registrations = await EventRegistration.find({
        eventId,
        status: { $in: ['confirmed', 'pending'] }
      }).populate('userId');

      if (registrations.length === 0) {
        return;
      }

      const notificationPromises = registrations.map(registration =>
        this.notificationService.sendToUser(registration.userId._id, {
          title: 'Event Cancelled',
          message: `The event "${eventTitle}" has been cancelled. ${reason ? 'Reason: ' + reason : ''}`,
          type: 'warning',
          category: 'event',
          priority: 'urgent',
          data: { 
            eventId, 
            eventTitle,
            reason,
            registrationId: registration._id 
          },
          actionUrl: `/events/${eventId}`
        }, ['web', 'email', 'sms', 'push'])
      );

      await Promise.all(notificationPromises);
    } catch (error) {
      console.error('Error sending event cancellation notifications:', error);
    }
  }

  /**
   * Send attendance confirmation notification
   * @private
   */
  async notifyAttendanceConfirmation(userId, event) {
    try {
      // Check if attendance confirmation is enabled for this event
      if (!event.notificationSettings?.sendAttendanceConfirmation) {
        return;
      }

      await this.notificationService.sendToUser(userId, {
        title: 'Attendance Confirmed',
        message: `Your attendance at "${event.title}" has been recorded. Thank you for participating!`,
        type: 'success',
        category: 'event',
        priority: 'medium',
        data: { 
          eventId: event._id,
          eventTitle: event.title,
          confirmedAt: new Date()
        },
        actionUrl: `/events/${event._id}`
      }, ['web', 'push']);
    } catch (error) {
      console.error('Error sending attendance confirmation:', error);
    }
  }

  /**
   * Schedule automated event reminders
   * @param {string} eventId - Event ID
   * @returns {Promise<Object>} Scheduling result
   */
  async scheduleEventReminders(eventId) {
    try {
      const event = await Event.findById(eventId);
      
      if (!event) {
        return {
          success: false,
          error: 'Event not found',
          message: 'Event not found'
        };
      }

      // Check if reminders are enabled for this event
      if (!event.notificationSettings?.sendReminders) {
        return {
          success: true,
          message: 'Reminders are disabled for this event',
          totalScheduled: 0
        };
      }

      const registrations = await EventRegistration.find({
        eventId,
        status: 'confirmed'
      }).populate('userId', 'firstName lastName email');

      if (registrations.length === 0) {
        return {
          success: true,
          message: 'No confirmed registrations to schedule reminders for',
          totalScheduled: 0
        };
      }

      const eventStartTime = new Date(event.startDate).getTime();
      const reminderTimes = event.notificationSettings?.reminderTimes || [24, 2];
      let totalScheduled = 0;

      // Schedule reminders for each time interval
      for (const hoursBeforeEvent of reminderTimes) {
        const reminderTime = new Date(eventStartTime - (hoursBeforeEvent * 60 * 60 * 1000));
        
        // Only schedule if reminder time is in the future
        if (reminderTime > new Date()) {
          for (const registration of registrations) {
            try {
              await this.notificationService.scheduleNotification(
                registration.userId._id,
                {
                  title: 'Event Reminder',
                  message: `Reminder: "${event.title}" starts in ${hoursBeforeEvent} hours at ${event.venue}`,
                  type: 'reminder',
                  category: 'event',
                  priority: hoursBeforeEvent <= 2 ? 'high' : 'medium',
                  data: {
                    eventId: event._id,
                    eventTitle: event.title,
                    startDate: event.startDate,
                    venue: event.venue,
                    hoursBeforeEvent
                  },
                  actionUrl: `/events/${event._id}`
                },
                reminderTime,
                ['web', 'email', 'push']
              );
              totalScheduled++;
            } catch (error) {
              console.error(`Error scheduling reminder for user ${registration.userId._id}:`, error);
            }
          }
        }
      }

      return {
        success: true,
        message: 'Event reminders scheduled successfully',
        totalScheduled,
        reminderTimes
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to schedule event reminders'
      };
    }
  }

  /**
   * Schedule follow-up notification after event completion
   * @param {string} eventId - Event ID
   * @returns {Promise<Object>} Scheduling result
   */
  async scheduleEventFollowUp(eventId) {
    try {
      const event = await Event.findById(eventId);
      
      if (!event) {
        return {
          success: false,
          error: 'Event not found',
          message: 'Event not found'
        };
      }

      // Check if follow-up is enabled for this event
      if (!event.notificationSettings?.sendFollowUp) {
        return {
          success: true,
          message: 'Follow-up is disabled for this event',
          totalScheduled: 0
        };
      }

      const followUpDelayHours = event.notificationSettings?.followUpDelayHours || 24;
      const followUpTime = new Date(
        new Date(event.endDate).getTime() + (followUpDelayHours * 60 * 60 * 1000)
      );

      // Only schedule if follow-up time is in the future
      if (followUpTime <= new Date()) {
        return {
          success: false,
          message: 'Follow-up time has already passed',
          totalScheduled: 0
        };
      }

      // Get all attendees
      const tickets = await EventTicket.find({
        eventId,
        status: 'used'
      }).populate('userId', 'firstName lastName email');

      if (tickets.length === 0) {
        return {
          success: true,
          message: 'No attendees to schedule follow-up for',
          totalScheduled: 0
        };
      }

      let totalScheduled = 0;

      for (const ticket of tickets) {
        try {
          await this.notificationService.scheduleNotification(
            ticket.userId._id,
            {
              title: 'Thank You for Attending',
              message: `Thank you for attending "${event.title}". We hope you enjoyed the event! Please share your feedback.`,
              type: 'info',
              category: 'event',
              priority: 'low',
              data: {
                eventId: event._id,
                eventTitle: event.title,
                attendedAt: ticket.attendanceRecords[0]?.scannedAt
              },
              actionUrl: `/events/${event._id}/feedback`
            },
            followUpTime,
            ['web', 'email']
          );
          totalScheduled++;
        } catch (error) {
          console.error(`Error scheduling follow-up for user ${ticket.userId._id}:`, error);
        }
      }

      return {
        success: true,
        message: 'Follow-up notifications scheduled successfully',
        totalScheduled,
        followUpTime
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to schedule follow-up notifications'
      };
    }
  }
}

module.exports = EventService;