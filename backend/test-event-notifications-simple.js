/**
 * Simple Event Notification Integration Test
 * Tests basic notification functionality without requiring Jest
 */

const mongoose = require('mongoose');
const Event = require('./models/Event');
const EventRegistration = require('./models/EventRegistration');
const EventTicket = require('./models/EventTicket');
const Notification = require('./models/Notification');
const NotificationPreferences = require('./models/NotificationPreferences');
const User = require('./models/User');
const EventService = require('./services/EventService');

// Test configuration
const TEST_DB = process.env.MONGODB_URI_TEST || 'mongodb+srv://lavillajero944_db_user:116161080022@pccportal.y1jmpl6.mongodb.net/?retryWrites=true&w=majority&appName=pccportalmongodb+srv://lavillajero944_db_user:116161080022@pccportal.y1jmpl6.mongodb.net/?retryWrites=true&w=majority&appName=pccportal';

// Test utilities
const assert = (condition, message) => {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
};

const log = (message) => {
    console.log(`✓ ${message}`);
};

const logSection = (message) => {
    console.log(`\n=== ${message} ===`);
};

// Main test suite
async function runTests() {
    let connection;
    let eventService;
    let testUser;
    let testOrganizer;
    let testEvent;

    try {
        logSection('Connecting to test database');
        connection = await mongoose.connect(TEST_DB);
        log('Connected to database');

        // Initialize service
        eventService = new EventService();

        logSection('Setting up test data');

        // Clear existing test data
        await User.deleteMany({ email: /test.*@example\.com/ });
        await Event.deleteMany({ title: /Test Event/ });
        await EventRegistration.deleteMany({});
        await EventTicket.deleteMany({});
        await Notification.deleteMany({});
        await NotificationPreferences.deleteMany({});
        log('Cleared existing test data');

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
        log('Created test student user');

        testOrganizer = await User.create({
            firstName: 'Test',
            lastName: 'Organizer',
            email: 'test.organizer@example.com',
            password: 'password123',
            role: 'faculty',
            isActive: true
        });
        log('Created test organizer user');

        // Create notification preferences
        await NotificationPreferences.createDefault(testUser._id);
        log('Created notification preferences');

        // Create test event
        testEvent = await Event.create({
            title: 'Test Event - Notification Integration',
            description: 'This is a test event for notification integration',
            category: 'academic',
            startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
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
        log('Created test event with notification settings');

        // Test 1: Registration Confirmation
        logSection('Test 1: Registration Confirmation Notification');
        const registrationResult = await eventService.registerForEvent(
            testEvent._id,
            testUser._id,
            { additionalInfo: 'Test registration' }
        );
        assert(registrationResult.success, 'Registration should succeed');
        log('User registered for event');

        const confirmationNotifications = await Notification.find({
            userId: testUser._id,
            title: 'Registration Confirmation'
        });
        assert(confirmationNotifications.length > 0, 'Should create confirmation notification');
        assert(confirmationNotifications[0].category === 'event', 'Should be event category');
        assert(confirmationNotifications[0].type === 'success', 'Should be success type');
        log('Registration confirmation notification created successfully');

        // Test 2: Event Update Notification
        logSection('Test 2: Event Update Notification');
        await Notification.deleteMany({ userId: testUser._id });

        const updateResult = await eventService.updateEvent(
            testEvent._id,
            { venue: 'Updated Test Venue' },
            testOrganizer._id
        );
        assert(updateResult.success, 'Update should succeed');
        log('Event updated');

        // Wait a bit for async notification
        await new Promise(resolve => setTimeout(resolve, 500));

        const updateNotifications = await Notification.find({
            userId: testUser._id,
            title: 'Event Update'
        });
        assert(updateNotifications.length > 0, 'Should create update notification');
        assert(updateNotifications[0].message.includes('Updated Test Venue'), 'Should mention new venue');
        log('Event update notification created successfully');

        // Test 3: Event Reminder Scheduling
        logSection('Test 3: Event Reminder Scheduling');
        await Notification.deleteMany({ userId: testUser._id });

        // Confirm registration first
        await EventRegistration.findOneAndUpdate(
            { eventId: testEvent._id, userId: testUser._id },
            { status: 'confirmed' }
        );

        const reminderResult = await eventService.scheduleEventReminders(testEvent._id);
        assert(reminderResult.success, 'Reminder scheduling should succeed');
        assert(reminderResult.totalScheduled > 0, 'Should schedule reminders');
        log(`Scheduled ${reminderResult.totalScheduled} reminder notifications`);

        const reminderNotifications = await Notification.find({
            userId: testUser._id,
            title: 'Event Reminder'
        });
        assert(reminderNotifications.length > 0, 'Should create reminder notifications');
        log('Event reminder notifications scheduled successfully');

        // Test 4: Attendance Confirmation
        logSection('Test 4: Attendance Confirmation Notification');
        await Notification.deleteMany({ userId: testUser._id });

        const ticket = await EventTicket.findOne({
            eventId: testEvent._id,
            userId: testUser._id
        });
        assert(ticket, 'Ticket should exist');

        const attendanceResult = await eventService.recordAttendance(
            ticket._id,
            testOrganizer._id,
            { location: 'Main Entrance' }
        );
        assert(attendanceResult.success, 'Attendance recording should succeed');
        log('Attendance recorded');

        // Wait a bit for async notification
        await new Promise(resolve => setTimeout(resolve, 500));

        const attendanceNotifications = await Notification.find({
            userId: testUser._id,
            title: 'Attendance Confirmed'
        });
        assert(attendanceNotifications.length > 0, 'Should create attendance notification');
        log('Attendance confirmation notification created successfully');

        // Test 5: Event Cancellation
        logSection('Test 5: Event Cancellation Notification');
        await Notification.deleteMany({ userId: testUser._id });

        const cancellationResult = await eventService.cancelEvent(
            testEvent._id,
            testOrganizer._id,
            'Venue unavailable'
        );
        assert(cancellationResult.success, 'Cancellation should succeed');
        log('Event cancelled');

        // Wait a bit for async notification
        await new Promise(resolve => setTimeout(resolve, 500));

        const cancellationNotifications = await Notification.find({
            userId: testUser._id,
            title: 'Event Cancelled'
        });
        assert(cancellationNotifications.length > 0, 'Should create cancellation notification');
        assert(cancellationNotifications[0].priority === 'urgent', 'Should be urgent priority');
        assert(cancellationNotifications[0].message.includes('Venue unavailable'), 'Should include reason');
        log('Event cancellation notification created successfully');

        // Test 6: Notification Settings Respect
        logSection('Test 6: Notification Settings Disabled');

        // Create new event with notifications disabled
        const eventNoNotif = await Event.create({
            title: 'Test Event - No Notifications',
            description: 'Event with notifications disabled',
            category: 'academic',
            startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
            venue: 'Test Venue',
            capacity: 50,
            organizer: testOrganizer._id,
            status: 'published',
            notificationSettings: {
                sendRegistrationConfirmation: false,
                sendReminders: false,
                sendUpdateNotifications: false,
                sendCancellationNotifications: false,
                sendAttendanceConfirmation: false,
                sendFollowUp: false
            }
        });
        log('Created event with notifications disabled');

        await Notification.deleteMany({ userId: testUser._id });

        const regResult = await eventService.registerForEvent(
            eventNoNotif._id,
            testUser._id,
            { additionalInfo: 'Test' }
        );
        assert(regResult.success, 'Registration should succeed');

        const noNotifications = await Notification.find({
            userId: testUser._id,
            title: 'Registration Confirmation'
        });
        assert(noNotifications.length === 0, 'Should not create notification when disabled');
        log('Notification settings respected - no notification sent');

        // Test 7: Follow-up Notification
        logSection('Test 7: Follow-up Notification');

        // Create event that just ended
        const pastEvent = await Event.create({
            title: 'Test Event - Past',
            description: 'Past event for follow-up test',
            category: 'academic',
            startDate: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
            endDate: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
            venue: 'Test Venue',
            capacity: 50,
            organizer: testOrganizer._id,
            status: 'completed',
            notificationSettings: {
                sendFollowUp: true,
                followUpDelayHours: 24
            }
        });

        // Create ticket with attendance
        const pastTicket = await EventTicket.create({
            eventId: pastEvent._id,
            userId: testUser._id,
            ticketNumber: 'TEST-PAST-001',
            qrCode: 'test-qr-past',
            status: 'used',
            attendanceRecords: [{
                scannedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
                scannedBy: testOrganizer._id
            }]
        });

        await Notification.deleteMany({ userId: testUser._id });

        const followUpResult = await eventService.scheduleEventFollowUp(pastEvent._id);
        assert(followUpResult.success, 'Follow-up scheduling should succeed');
        assert(followUpResult.totalScheduled > 0, 'Should schedule follow-up');
        log('Follow-up notification scheduled successfully');

        logSection('All Tests Passed! ✓');
        console.log('\nSummary:');
        console.log('- Registration confirmation notifications: ✓');
        console.log('- Event update notifications: ✓');
        console.log('- Event reminder scheduling: ✓');
        console.log('- Attendance confirmation notifications: ✓');
        console.log('- Event cancellation notifications: ✓');
        console.log('- Notification settings respect: ✓');
        console.log('- Follow-up notification scheduling: ✓');

    } catch (error) {
        console.error('\n✗ Test failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    } finally {
        if (connection) {
            await mongoose.connection.close();
            log('\nDatabase connection closed');
        }
    }
}

// Run tests
if (require.main === module) {
    console.log('Event Notification Integration Tests\n');
    runTests()
        .then(() => {
            console.log('\n✓ All tests completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n✗ Test suite failed:', error);
            process.exit(1);
        });
}

module.exports = { runTests };
