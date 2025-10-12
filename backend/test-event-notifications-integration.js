/**
 * Integration Tests for Event Notification System
 * Tests the complete integration between EventService and NotificationService
 */

const mongoose = require('mongoose');
const Event = require('./models/Event');
const EventRegistration = require('./models/EventRegistration');
const EventTicket = require('./models/EventTicket');
const Notification = require('./models/Notification');
const NotificationPreferences = require('./models/NotificationPreferences');
const User = require('./models/User');
const EventService = require('./services/EventService');
const NotificationService = require('./services/NotificationService');

// Mock Redis and Socket.io for testing
jest.mock('./config/redis', () => ({
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue('OK'),
  del: jest.fn().mockResolvedValue(1)
}));

jest.mock('./config/socket', () => ({
  sendToUser: jest.fn().mockResolvedValue(true),
  broadcast: jest.fn().mockResolvedValue(true)
}));

jest.mock('./config/queue', () => ({
  addNotificationJob: jest.fn().mockResolvedValue({ id: 'job-123' })
}));

describe('Event Notification Integration Tests', () => {
  let eventService;
  let testUser;
  let testOrganizer;
  let testEvent;

  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/pcc-portal-test';
    await mongoose.connect(mongoUri);
    
    eventService = new EventService();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear test data
    await User.deleteMany({});
    await Event.deleteMany({});
    await EventRegistration.deleteMany({});
    await EventTicket.deleteMany({});
    await Notification.deleteMany({});
    await NotificationPreferences.deleteMany({});

    // Create test users
    testUser = await User.create({
      firstName: 'Test',
      lastName: 'Student',
      email: 'test.student@example.com',
      password: 'password123',
      role: 'student',
      studentId: 'TEST001',
      isActive: true
    });

    testOrganizer = await User.create({
      firstName: 'Test',
      lastName: 'Organizer',
      email: 'test.organizer@example.com',
      password: 'password123',
      role: 'faculty',
      isActive: true
    });

    // Create test event with notification settings
    testEvent = await Event.create({
      title: 'Test Event',
      description: 'This is a test event',
      category: 'academic',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours duration
      venue: 'Test Venue',
      capacity: 50,
      organizer: testOrganizer._id,
      status: 'published',
      notificationSettings: {
        sendRegistrationConfirmation: true,
        sendReminders: true,
        reminderTimes: [24, 2],
        sendUpdateNotifications: true,
        sendCancellationNotifications: true,
        sendAttendanceConfirmation: true,
        sendFollowUp: true,
        followUpDelayHours: 24
      }
    });

    // Create default notification preferences for test user
    await NotificationPreferences.createDefault(testUser._id);
  });

  describe('Registration Confirmation Notifications', () => {
    test('should send confirmation notification on successful registration', async () => {
      const result = await eventService.registerForEvent(
        testEvent._id,
        testUser._id,
        { additionalInfo: 'Test registration' }
      );

      expect(result.success).toBe(true);

      // Check that notification was created
      const notifications = await Notification.find({ userId: testUser._id });
      expect(notifications.length).toBeGreaterThan(0);

      const confirmationNotification = notifications.find(
        n => n.title === 'Registration Confirmation'
      );
      expect(confirmationNotification).toBeDefined();
      expect(confirmationNotification.category).toBe('event');
      expect(confirmationNotification.type).toBe('success');
      expect(confirmationNotification.data.eventId.toString()).toBe(testEvent._id.toString());
    });

    test('should send waitlist notification when event is full', async () => {
      // Fill the event
      testEvent.registeredCount = testEvent.capacity;
      testEvent.maxWaitlistSize = 10;
      await testEvent.save();

      const result = await eventService.registerForEvent(
        testEvent._id,
        testUser._id,
        { additionalInfo: 'Test waitlist registration' }
      );

      expect(result.success).toBe(true);
      expect(result.data.registrationType).toBe('waitlist');

      // Check notification
      const notifications = await Notification.find({ userId: testUser._id });
      const waitlistNotification = notifications.find(
        n => n.message.includes('waitlist')
      );
      expect(waitlistNotification).toBeDefined();
    });

    test('should not send notification when setting is disabled', async () => {
      // Disable registration confirmation
      testEvent.notificationSettings.sendRegistrationConfirmation = false;
      await testEvent.save();

      const result = await eventService.registerForEvent(
        testEvent._id,
        testUser._id,
        { additionalInfo: 'Test registration' }
      );

      expect(result.success).toBe(true);

      // Check that no confirmation notification was created
      const notifications = await Notification.find({ 
        userId: testUser._id,
        title: 'Registration Confirmation'
      });
      expect(notifications.length).toBe(0);
    });
  });

  describe('Event Update Notifications', () => {
    beforeEach(async () => {
      // Register user for event
      await eventService.registerForEvent(
        testEvent._id,
        testUser._id,
        { additionalInfo: 'Test registration' }
      );
      
      // Clear notifications from registration
      await Notification.deleteMany({ userId: testUser._id });
    });

    test('should send notification when event details are updated', async () => {
      const newVenue = 'Updated Venue';
      const result = await eventService.updateEvent(
        testEvent._id,
        { venue: newVenue },
        testOrganizer._id
      );

      expect(result.success).toBe(true);

      // Check notification
      const notifications = await Notification.find({ userId: testUser._id });
      const updateNotification = notifications.find(
        n => n.title === 'Event Update'
      );
      expect(updateNotification).toBeDefined();
      expect(updateNotification.message).toContain(newVenue);
      expect(updateNotification.priority).toBe('high');
    });

    test('should send notification when event date changes', async () => {
      const newStartDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
      const result = await eventService.updateEvent(
        testEvent._id,
        { startDate: newStartDate },
        testOrganizer._id
      );

      expect(result.success).toBe(true);

      // Check notification
      const notifications = await Notification.find({ userId: testUser._id });
      const updateNotification = notifications.find(
        n => n.title === 'Event Update'
      );
      expect(updateNotification).toBeDefined();
      expect(updateNotification.message).toContain('Start date changed');
    });

    test('should not send notification when setting is disabled', async () => {
      // Disable update notifications
      testEvent.notificationSettings.sendUpdateNotifications = false;
      await testEvent.save();

      const result = await eventService.updateEvent(
        testEvent._id,
        { venue: 'New Venue' },
        testOrganizer._id
      );

      expect(result.success).toBe(true);

      // Check that no update notification was created
      const notifications = await Notification.find({ 
        userId: testUser._id,
        title: 'Event Update'
      });
      expect(notifications.length).toBe(0);
    });
  });

  describe('Event Cancellation Notifications', () => {
    beforeEach(async () => {
      // Register user for event
      await eventService.registerForEvent(
        testEvent._id,
        testUser._id,
        { additionalInfo: 'Test registration' }
      );
      
      // Clear notifications from registration
      await Notification.deleteMany({ userId: testUser._id });
    });

    test('should send notification when event is cancelled', async () => {
      const cancellationReason = 'Venue unavailable';
      const result = await eventService.cancelEvent(
        testEvent._id,
        testOrganizer._id,
        cancellationReason
      );

      expect(result.success).toBe(true);

      // Check notification
      const notifications = await Notification.find({ userId: testUser._id });
      const cancellationNotification = notifications.find(
        n => n.title === 'Event Cancelled'
      );
      expect(cancellationNotification).toBeDefined();
      expect(cancellationNotification.message).toContain(cancellationReason);
      expect(cancellationNotification.priority).toBe('urgent');
      expect(cancellationNotification.channels.length).toBeGreaterThan(0);
    });

    test('should not send notification when setting is disabled', async () => {
      // Disable cancellation notifications
      testEvent.notificationSettings.sendCancellationNotifications = false;
      await testEvent.save();

      const result = await eventService.cancelEvent(
        testEvent._id,
        testOrganizer._id,
        'Test cancellation'
      );

      expect(result.success).toBe(true);

      // Check that no cancellation notification was created
      const notifications = await Notification.find({ 
        userId: testUser._id,
        title: 'Event Cancelled'
      });
      expect(notifications.length).toBe(0);
    });
  });

  describe('Event Reminder Notifications', () => {
    beforeEach(async () => {
      // Register user for event
      await eventService.registerForEvent(
        testEvent._id,
        testUser._id,
        { additionalInfo: 'Test registration' }
      );
      
      // Confirm registration
      await EventRegistration.findOneAndUpdate(
        { eventId: testEvent._id, userId: testUser._id },
        { status: 'confirmed' }
      );
      
      // Clear notifications from registration
      await Notification.deleteMany({ userId: testUser._id });
    });

    test('should schedule reminder notifications', async () => {
      const result = await eventService.scheduleEventReminders(testEvent._id);

      expect(result.success).toBe(true);
      expect(result.totalScheduled).toBeGreaterThan(0);
      expect(result.reminderTimes).toEqual([24, 2]);

      // Check that scheduled notifications were created
      const notifications = await Notification.find({ 
        userId: testUser._id,
        title: 'Event Reminder'
      });
      expect(notifications.length).toBeGreaterThan(0);
    });

    test('should send immediate reminder', async () => {
      const result = await eventService.sendEventReminders(testEvent._id, 24);

      expect(result.success).toBe(true);
      expect(result.totalSent).toBeGreaterThan(0);

      // Check notification
      const notifications = await Notification.find({ 
        userId: testUser._id,
        title: 'Event Reminder'
      });
      expect(notifications.length).toBeGreaterThan(0);
    });

    test('should not schedule reminders when setting is disabled', async () => {
      // Disable reminders
      testEvent.notificationSettings.sendReminders = false;
      await testEvent.save();

      const result = await eventService.scheduleEventReminders(testEvent._id);

      expect(result.success).toBe(true);
      expect(result.totalScheduled).toBe(0);
      expect(result.message).toContain('disabled');
    });
  });

  describe('Attendance Confirmation Notifications', () => {
    let testTicket;

    beforeEach(async () => {
      // Register user and create ticket
      await eventService.registerForEvent(
        testEvent._id,
        testUser._id,
        { additionalInfo: 'Test registration' }
      );

      testTicket = await EventTicket.findOne({ 
        eventId: testEvent._id, 
        userId: testUser._id 
      });
      
      // Clear notifications from registration
      await Notification.deleteMany({ userId: testUser._id });
    });

    test('should send notification when attendance is recorded', async () => {
      const result = await eventService.recordAttendance(
        testTicket._id,
        testOrganizer._id,
        { location: 'Main Entrance' }
      );

      expect(result.success).toBe(true);

      // Check notification
      const notifications = await Notification.find({ userId: testUser._id });
      const attendanceNotification = notifications.find(
        n => n.title === 'Attendance Confirmed'
      );
      expect(attendanceNotification).toBeDefined();
      expect(attendanceNotification.type).toBe('success');
    });

    test('should not send notification when setting is disabled', async () => {
      // Disable attendance confirmation
      testEvent.notificationSettings.sendAttendanceConfirmation = false;
      await testEvent.save();

      const result = await eventService.recordAttendance(
        testTicket._id,
        testOrganizer._id,
        { location: 'Main Entrance' }
      );

      expect(result.success).toBe(true);

      // Check that no attendance notification was created
      const notifications = await Notification.find({ 
        userId: testUser._id,
        title: 'Attendance Confirmed'
      });
      expect(notifications.length).toBe(0);
    });
  });

  describe('Follow-up Notifications', () => {
    let testTicket;

    beforeEach(async () => {
      // Register user and create ticket
      await eventService.registerForEvent(
        testEvent._id,
        testUser._id,
        { additionalInfo: 'Test registration' }
      );

      testTicket = await EventTicket.findOne({ 
        eventId: testEvent._id, 
        userId: testUser._id 
      });

      // Record attendance
      testTicket.status = 'used';
      testTicket.attendanceRecords.push({
        scannedAt: new Date(),
        scannedBy: testOrganizer._id
      });
      await testTicket.save();
      
      // Clear notifications
      await Notification.deleteMany({ userId: testUser._id });
    });

    test('should send follow-up notification after event', async () => {
      const result = await eventService.sendEventFollowUp(testEvent._id);

      expect(result.success).toBe(true);
      expect(result.totalSent).toBeGreaterThan(0);

      // Check notification
      const notifications = await Notification.find({ userId: testUser._id });
      const followUpNotification = notifications.find(
        n => n.title === 'Thank You for Attending'
      );
      expect(followUpNotification).toBeDefined();
      expect(followUpNotification.actionUrl).toContain('/feedback');
    });

    test('should schedule follow-up notification', async () => {
      const result = await eventService.scheduleEventFollowUp(testEvent._id);

      expect(result.success).toBe(true);
      expect(result.totalScheduled).toBeGreaterThan(0);
      expect(result.followUpTime).toBeDefined();

      // Check that scheduled notification was created
      const notifications = await Notification.find({ 
        userId: testUser._id,
        title: 'Thank You for Attending'
      });
      expect(notifications.length).toBeGreaterThan(0);
    });

    test('should not send follow-up when setting is disabled', async () => {
      // Disable follow-up
      testEvent.notificationSettings.sendFollowUp = false;
      await testEvent.save();

      const result = await eventService.sendEventFollowUp(testEvent._id);

      expect(result.success).toBe(true);
      expect(result.totalSent).toBe(0);
    });
  });

  describe('Waitlist Promotion Notifications', () => {
    let waitlistedUser;

    beforeEach(async () => {
      // Create another user
      waitlistedUser = await User.create({
        firstName: 'Waitlist',
        lastName: 'User',
        email: 'waitlist.user@example.com',
        password: 'password123',
        role: 'student',
        studentId: 'TEST002',
        isActive: true
      });

      await NotificationPreferences.createDefault(waitlistedUser._id);

      // Fill the event
      testEvent.registeredCount = testEvent.capacity;
      testEvent.maxWaitlistSize = 10;
      await testEvent.save();

      // Add user to waitlist
      await eventService.registerForEvent(
        testEvent._id,
        waitlistedUser._id,
        { additionalInfo: 'Waitlist registration' }
      );

      // Clear notifications
      await Notification.deleteMany({ userId: waitlistedUser._id });
    });

    test('should send notification when promoted from waitlist', async () => {
      // Register and then cancel a regular registration to free up space
      await eventService.registerForEvent(
        testEvent._id,
        testUser._id,
        { additionalInfo: 'Test registration' }
      );

      await eventService.cancelRegistration(
        testEvent._id,
        testUser._id,
        'Changed plans'
      );

      // Check that waitlisted user received promotion notification
      const notifications = await Notification.find({ userId: waitlistedUser._id });
      const promotionNotification = notifications.find(
        n => n.title === 'Waitlist Promotion'
      );
      expect(promotionNotification).toBeDefined();
      expect(promotionNotification.type).toBe('success');
      expect(promotionNotification.priority).toBe('high');
    });
  });

  describe('User Notification Preferences', () => {
    beforeEach(async () => {
      // Register user for event
      await eventService.registerForEvent(
        testEvent._id,
        testUser._id,
        { additionalInfo: 'Test registration' }
      );
      
      // Clear notifications
      await Notification.deleteMany({ userId: testUser._id });
    });

    test('should respect user notification preferences', async () => {
      // Disable email notifications for events
      const preferences = await NotificationPreferences.findByUserId(testUser._id);
      preferences.preferences.event.email = false;
      await preferences.save();

      // Send reminder
      await eventService.sendEventReminders(testEvent._id, 24);

      // Check that notification was created but email channel is not included
      const notifications = await Notification.find({ userId: testUser._id });
      expect(notifications.length).toBeGreaterThan(0);
      
      const notification = notifications[0];
      const emailChannel = notification.channels.find(ch => ch.type === 'email');
      expect(emailChannel).toBeUndefined();
    });
  });
});

// Run tests if this file is executed directly
if (require.main === module) {
  console.log('Running Event Notification Integration Tests...');
  
  // Simple test runner
  const runTests = async () => {
    try {
      console.log('Tests would run here with a proper test runner like Jest');
      console.log('Install Jest with: npm install --save-dev jest');
      console.log('Run with: npm test');
    } catch (error) {
      console.error('Test execution error:', error);
      process.exit(1);
    }
  };

  runTests();
}

module.exports = {
  // Export for use with test runners
};
