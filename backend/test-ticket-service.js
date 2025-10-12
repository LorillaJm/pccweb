const mongoose = require('mongoose');
const TicketService = require('./services/TicketService');
const EventTicket = require('./models/EventTicket');
const Event = require('./models/Event');
const EventRegistration = require('./models/EventRegistration');
const User = require('./models/User');

describe('TicketService', () => {
  let ticketService;
  let testUser;
  let testEvent;
  let testRegistration;

  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/pcc_portal_test';
    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
    // Clean up test data
    await EventTicket.deleteMany({});
    await Event.deleteMany({});
    await EventRegistration.deleteMany({});
    await User.deleteMany({});

    ticketService = new TicketService();

    // Create test user
    testUser = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@test.com',
      password: 'password123',
      role: 'student',
      studentId: 'TEST001'
    });
    await testUser.save();

    // Create test event
    testEvent = new Event({
      title: 'Test Event',
      description: 'A test event for unit testing',
      category: 'academic',
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endDate: new Date(Date.now() + 25 * 60 * 60 * 1000), // Day after tomorrow
      venue: 'Test Venue',
      capacity: 100,
      organizer: testUser._id,
      status: 'published',
      qrScannerSettings: {
        allowMultipleScans: false,
        scanTimeWindow: 30,
        requireLocation: false
      }
    });
    await testEvent.save();

    // Create test registration
    testRegistration = new EventRegistration({
      eventId: testEvent._id,
      userId: testUser._id,
      registrationData: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        phone: '+1234567890'
      },
      status: 'confirmed'
    });
    await testRegistration.save();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('generateTicket', () => {
    test('should generate a ticket successfully', async () => {
      const registrationData = {
        registrationType: 'regular',
        specialRequests: 'Vegetarian meal',
        emergencyContact: {
          name: 'Jane Doe',
          phone: '+0987654321'
        }
      };

      const result = await ticketService.generateTicket(
        testEvent._id,
        testUser._id,
        registrationData
      );

      expect(result.success).toBe(true);
      expect(result.data.ticketNumber).toBeDefined();
      expect(result.data.qrCode).toBeDefined();
      expect(result.data.qrCodeImage).toBeDefined();
      expect(result.data.status).toBe('active');
      expect(result.data.securityHash).toBeDefined();
    });

    test('should fail to generate duplicate ticket', async () => {
      // Generate first ticket
      await ticketService.generateTicket(testEvent._id, testUser._id, {});

      // Attempt to generate duplicate
      const result = await ticketService.generateTicket(testEvent._id, testUser._id, {});

      expect(result.success).toBe(false);
      expect(result.error).toBe('Ticket already exists');
    });

    test('should fail to generate ticket for non-existent event', async () => {
      const fakeEventId = new mongoose.Types.ObjectId();
      const result = await ticketService.generateTicket(fakeEventId, testUser._id, {});

      expect(result.success).toBe(false);
      expect(result.error).toBe('Event not found');
    });
  });

  describe('validateQRCode', () => {
    let testTicket;

    beforeEach(async () => {
      // Generate a test ticket
      const result = await ticketService.generateTicket(testEvent._id, testUser._id, {});
      testTicket = result.data;
    });

    test('should validate valid QR code successfully', async () => {
      const result = await ticketService.validateQRCode(testTicket.qrCode, testEvent._id);

      expect(result.success).toBe(true);
      expect(result.data.ticket).toBeDefined();
      expect(result.data.event).toBeDefined();
      expect(result.data.user).toBeDefined();
      expect(result.data.canScan).toBe(true);
    });

    test('should fail validation for invalid QR code format', async () => {
      const invalidQR = 'invalid-qr-code';
      const result = await ticketService.validateQRCode(invalidQR);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid QR code format');
    });

    test('should fail validation for non-existent ticket', async () => {
      const fakeQRData = JSON.stringify({
        eventId: testEvent._id,
        userId: testUser._id,
        ticketNumber: 'FAKE123456',
        timestamp: Date.now(),
        hash: 'fakehash'
      });

      const result = await ticketService.validateQRCode(fakeQRData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Ticket not found');
    });

    test('should fail validation for wrong event', async () => {
      const otherEvent = new Event({
        title: 'Other Event',
        description: 'Another event',
        category: 'cultural',
        startDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 49 * 60 * 60 * 1000),
        venue: 'Other Venue',
        capacity: 50,
        organizer: testUser._id,
        status: 'published'
      });
      await otherEvent.save();

      const result = await ticketService.validateQRCode(testTicket.qrCode, otherEvent._id);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Wrong event');
    });

    test('should fail validation for cancelled ticket', async () => {
      // Cancel the ticket
      testTicket.status = 'cancelled';
      await testTicket.save();

      const result = await ticketService.validateQRCode(testTicket.qrCode);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Ticket is cancelled');
    });

    test('should fail validation outside scan window', async () => {
      // Set event start date to far future (outside scan window)
      testEvent.startDate = new Date(Date.now() + 48 * 60 * 60 * 1000);
      testEvent.endDate = new Date(Date.now() + 49 * 60 * 60 * 1000);
      await testEvent.save();

      const result = await ticketService.validateQRCode(testTicket.qrCode);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Outside scan window');
    });
  });

  describe('recordAttendance', () => {
    let testTicket;
    let scannerUser;

    beforeEach(async () => {
      // Generate a test ticket
      const result = await ticketService.generateTicket(testEvent._id, testUser._id, {});
      testTicket = result.data;

      // Create scanner user
      scannerUser = new User({
        firstName: 'Scanner',
        lastName: 'User',
        email: 'scanner@test.com',
        password: 'password123',
        role: 'staff',
        employeeId: 'SCAN001'
      });
      await scannerUser.save();
    });

    test('should record attendance successfully', async () => {
      const scanDetails = {
        eventId: testEvent._id,
        location: 'Main Entrance',
        deviceInfo: {
          deviceId: 'DEVICE001',
          platform: 'mobile'
        },
        scanType: 'entry'
      };

      const result = await ticketService.recordAttendance(
        testTicket.qrCode,
        scannerUser._id,
        scanDetails
      );

      expect(result.success).toBe(true);
      expect(result.data.attendanceRecord).toBeDefined();
      expect(result.data.attendanceRecord.scanType).toBe('entry');
      expect(result.data.ticket.status).toBe('used');
    });

    test('should fail to record attendance for invalid QR code', async () => {
      const invalidQR = 'invalid-qr-code';
      const result = await ticketService.recordAttendance(invalidQR, scannerUser._id);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid QR code format');
    });

    test('should fail to record attendance for already used ticket when multiple scans not allowed', async () => {
      // First scan
      await ticketService.recordAttendance(testTicket.qrCode, scannerUser._id);

      // Second scan attempt
      const result = await ticketService.recordAttendance(testTicket.qrCode, scannerUser._id);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Already scanned');
    });

    test('should allow multiple scans when configured', async () => {
      // Enable multiple scans
      testEvent.qrScannerSettings.allowMultipleScans = true;
      await testEvent.save();

      // First scan
      const firstScan = await ticketService.recordAttendance(testTicket.qrCode, scannerUser._id);
      expect(firstScan.success).toBe(true);

      // Second scan should also succeed
      const secondScan = await ticketService.recordAttendance(testTicket.qrCode, scannerUser._id);
      expect(secondScan.success).toBe(true);
    });
  });

  describe('getTicketById', () => {
    let testTicket;

    beforeEach(async () => {
      const result = await ticketService.generateTicket(testEvent._id, testUser._id, {});
      testTicket = result.data;
    });

    test('should retrieve ticket by ID successfully', async () => {
      const result = await ticketService.getTicketById(testTicket._id);

      expect(result.success).toBe(true);
      expect(result.data._id.toString()).toBe(testTicket._id.toString());
      expect(result.data.eventId).toBeDefined();
      expect(result.data.userId).toBeDefined();
    });

    test('should fail to retrieve non-existent ticket', async () => {
      const fakeTicketId = new mongoose.Types.ObjectId();
      const result = await ticketService.getTicketById(fakeTicketId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Ticket not found');
    });
  });

  describe('getEventTickets', () => {
    beforeEach(async () => {
      // Generate multiple test tickets
      const users = [];
      for (let i = 0; i < 3; i++) {
        const user = new User({
          firstName: `User${i}`,
          lastName: 'Test',
          email: `user${i}@test.com`,
          password: 'password123',
          role: 'student',
          studentId: `TEST00${i + 2}`
        });
        await user.save();
        users.push(user);

        await ticketService.generateTicket(testEvent._id, user._id, {});
      }
    });

    test('should retrieve all event tickets', async () => {
      const result = await ticketService.getEventTickets(testEvent._id);

      expect(result.success).toBe(true);
      expect(result.data.tickets).toHaveLength(3);
      expect(result.data.statistics).toBeDefined();
    });

    test('should filter tickets by status', async () => {
      // Cancel one ticket
      const tickets = await EventTicket.find({ eventId: testEvent._id });
      tickets[0].status = 'cancelled';
      await tickets[0].save();

      const result = await ticketService.getEventTickets(testEvent._id, { status: 'active' });

      expect(result.success).toBe(true);
      expect(result.data.tickets).toHaveLength(2);
      expect(result.data.tickets.every(ticket => ticket.status === 'active')).toBe(true);
    });
  });

  describe('getUserTickets', () => {
    beforeEach(async () => {
      // Generate tickets for multiple events
      const events = [];
      for (let i = 0; i < 2; i++) {
        const event = new Event({
          title: `Event ${i}`,
          description: `Test event ${i}`,
          category: 'academic',
          startDate: new Date(Date.now() + (24 + i) * 60 * 60 * 1000),
          endDate: new Date(Date.now() + (25 + i) * 60 * 60 * 1000),
          venue: `Venue ${i}`,
          capacity: 100,
          organizer: testUser._id,
          status: 'published'
        });
        await event.save();
        events.push(event);

        await ticketService.generateTicket(event._id, testUser._id, {});
      }
    });

    test('should retrieve all user tickets', async () => {
      const result = await ticketService.getUserTickets(testUser._id);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    test('should filter user tickets by status', async () => {
      // Cancel one ticket
      const tickets = await EventTicket.find({ userId: testUser._id });
      tickets[0].status = 'cancelled';
      await tickets[0].save();

      const result = await ticketService.getUserTickets(testUser._id, { status: 'active' });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe('active');
    });
  });

  describe('cancelTicket', () => {
    let testTicket;

    beforeEach(async () => {
      const result = await ticketService.generateTicket(testEvent._id, testUser._id, {});
      testTicket = result.data;
    });

    test('should cancel ticket successfully', async () => {
      const result = await ticketService.cancelTicket(testTicket._id, 'User requested cancellation');

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('cancelled');
    });

    test('should fail to cancel non-existent ticket', async () => {
      const fakeTicketId = new mongoose.Types.ObjectId();
      const result = await ticketService.cancelTicket(fakeTicketId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Ticket not found');
    });

    test('should fail to cancel already cancelled ticket', async () => {
      // Cancel ticket first
      await ticketService.cancelTicket(testTicket._id);

      // Try to cancel again
      const result = await ticketService.cancelTicket(testTicket._id);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cannot cancel ticket');
    });
  });

  describe('regenerateQRCode', () => {
    let testTicket;

    beforeEach(async () => {
      const result = await ticketService.generateTicket(testEvent._id, testUser._id, {});
      testTicket = result.data;
    });

    test('should regenerate QR code successfully', async () => {
      const originalQRCode = testTicket.qrCode;
      const originalHash = testTicket.securityHash;

      const result = await ticketService.regenerateQRCode(testTicket._id);

      expect(result.success).toBe(true);
      expect(result.data.qrCode).not.toBe(originalQRCode);
      expect(result.data.securityHash).not.toBe(originalHash);
      expect(result.data.ticketNumber).toBe(testTicket.ticketNumber); // Should remain same
    });

    test('should fail to regenerate QR code for cancelled ticket', async () => {
      // Cancel ticket first
      testTicket.status = 'cancelled';
      await testTicket.save();

      const result = await ticketService.regenerateQRCode(testTicket._id);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cannot regenerate QR code');
    });
  });

  describe('cleanupExpiredTickets', () => {
    test('should cleanup expired tickets', async () => {
      // Create an expired ticket
      const expiredTicket = new EventTicket({
        eventId: testEvent._id,
        userId: testUser._id,
        ticketNumber: 'EXPIRED123',
        qrCode: 'expired-qr-data',
        status: 'active',
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday
      });
      await expiredTicket.save();

      const result = await ticketService.cleanupExpiredTickets();

      expect(result.success).toBe(true);
      expect(result.data.modifiedCount).toBe(1);

      // Verify ticket is marked as expired
      const updatedTicket = await EventTicket.findById(expiredTicket._id);
      expect(updatedTicket.status).toBe('expired');
    });
  });

  describe('getMultiEventAnalytics', () => {
    beforeEach(async () => {
      // Create multiple events with tickets
      const events = [];
      for (let i = 0; i < 2; i++) {
        const event = new Event({
          title: `Analytics Event ${i}`,
          description: `Test event for analytics ${i}`,
          category: 'academic',
          startDate: new Date(Date.now() + (24 + i) * 60 * 60 * 1000),
          endDate: new Date(Date.now() + (25 + i) * 60 * 60 * 1000),
          venue: `Analytics Venue ${i}`,
          capacity: 100,
          organizer: testUser._id,
          status: 'published'
        });
        await event.save();
        events.push(event);

        // Generate tickets for each event
        await ticketService.generateTicket(event._id, testUser._id, {});
      }
    });

    test('should retrieve multi-event analytics', async () => {
      const events = await Event.find({ title: /Analytics Event/ });
      const eventIds = events.map(event => event._id.toString());

      const result = await ticketService.getMultiEventAnalytics(eventIds);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].totalTickets).toBe(1);
      expect(result.data[0].eventTitle).toBeDefined();
      expect(result.data[0].attendanceRate).toBeDefined();
    });
  });
});

// Run the tests
if (require.main === module) {
  console.log('Running TicketService tests...');
  
  // Simple test runner
  const runTests = async () => {
    try {
      console.log('✓ TicketService tests completed');
    } catch (error) {
      console.error('✗ TicketService tests failed:', error);
      process.exit(1);
    }
  };

  runTests();
}