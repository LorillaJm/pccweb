const mongoose = require('mongoose');
const { expect } = require('chai');
const Event = require('./models/Event');
const EventTicket = require('./models/EventTicket');
const EventRegistration = require('./models/EventRegistration');
const User = require('./models/User');

// Test database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pcc_portal_test';

describe('Event Models Tests', function() {
  this.timeout(10000);

  before(async function() {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('Connected to test database');
      
      // Clean up test data
      await Event.deleteMany({ title: /^Test Event/ });
      await EventTicket.deleteMany({});
      await EventRegistration.deleteMany({});
      await User.deleteMany({ email: /test.*@test\.com/ });
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  });

  after(async function() {
    try {
      // Clean up test data
      await Event.deleteMany({ title: /^Test Event/ });
      await EventTicket.deleteMany({});
      await EventRegistration.deleteMany({});
      await User.deleteMany({ email: /test.*@test\.com/ });
      
      await mongoose.connection.close();
      console.log('Disconnected from test database');
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });

  describe('Event Model', function() {
    let testUser;
    let testEvent;

    beforeEach(async function() {
      // Create test user
      testUser = new User({
        firstName: 'Test',
        lastName: 'Organizer',
        email: 'test.organizer@test.com',
        password: 'password123',
        role: 'faculty'
      });
      await testUser.save();
    });

    afterEach(async function() {
      if (testEvent) {
        await Event.findByIdAndDelete(testEvent._id);
        testEvent = null;
      }
      if (testUser) {
        await User.findByIdAndDelete(testUser._id);
        testUser = null;
      }
    });

    it('should create a valid event', async function() {
      const eventData = {
        title: 'Test Event - Valid Creation',
        description: 'This is a test event for validation',
        category: 'academic',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
        venue: 'Test Venue',
        capacity: 100,
        organizer: testUser._id
      };

      testEvent = new Event(eventData);
      const savedEvent = await testEvent.save();

      expect(savedEvent).to.exist;
      expect(savedEvent.title).to.equal(eventData.title);
      expect(savedEvent.capacity).to.equal(100);
      expect(savedEvent.registeredCount).to.equal(0);
      expect(savedEvent.status).to.equal('draft');
    });

    it('should validate required fields', async function() {
      const invalidEvent = new Event({
        title: 'Test Event - Missing Fields'
        // Missing required fields
      });

      try {
        await invalidEvent.save();
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).to.equal('ValidationError');
        expect(error.errors.description).to.exist;
        expect(error.errors.category).to.exist;
        expect(error.errors.startDate).to.exist;
      }
    });

    it('should validate date constraints', async function() {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

      const invalidEvent = new Event({
        title: 'Test Event - Invalid Dates',
        description: 'Test description',
        category: 'academic',
        startDate: pastDate, // Past date should fail
        endDate: futureDate,
        venue: 'Test Venue',
        capacity: 100,
        organizer: testUser._id
      });

      try {
        await invalidEvent.save();
        expect.fail('Should have thrown validation error for past start date');
      } catch (error) {
        expect(error.name).to.equal('ValidationError');
        expect(error.errors.startDate).to.exist;
      }
    });

    it('should calculate virtual properties correctly', async function() {
      testEvent = new Event({
        title: 'Test Event - Virtual Properties',
        description: 'Test description',
        category: 'academic',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        venue: 'Test Venue',
        capacity: 100,
        registeredCount: 30,
        organizer: testUser._id,
        status: 'published'
      });

      await testEvent.save();

      expect(testEvent.availableSlots).to.equal(70);
      expect(testEvent.isFull).to.be.false;
      expect(testEvent.isRegistrationOpen).to.be.true;

      // Test when full
      testEvent.registeredCount = 100;
      expect(testEvent.isFull).to.be.true;
      expect(testEvent.availableSlots).to.equal(0);
    });

    it('should find upcoming events', async function() {
      // Create multiple test events
      const events = [];
      for (let i = 0; i < 3; i++) {
        const event = new Event({
          title: `Test Event - Upcoming ${i}`,
          description: 'Test description',
          category: 'academic',
          startDate: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + (i + 2) * 24 * 60 * 60 * 1000),
          venue: 'Test Venue',
          capacity: 100,
          organizer: testUser._id,
          status: 'published'
        });
        await event.save();
        events.push(event);
      }

      const upcomingEvents = await Event.findUpcoming(5);
      expect(upcomingEvents).to.have.length.at.least(3);
      expect(upcomingEvents[0].startDate).to.be.lessThan(upcomingEvents[1].startDate);

      // Cleanup
      for (const event of events) {
        await Event.findByIdAndDelete(event._id);
      }
    });
  });

  describe('EventTicket Model', function() {
    let testUser;
    let testEvent;
    let testTicket;

    beforeEach(async function() {
      // Create test user
      testUser = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'test.user@test.com',
        password: 'password123',
        role: 'student'
      });
      await testUser.save();

      // Create test event
      testEvent = new Event({
        title: 'Test Event - Ticket Testing',
        description: 'Test description',
        category: 'academic',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        venue: 'Test Venue',
        capacity: 100,
        organizer: testUser._id
      });
      await testEvent.save();
    });

    afterEach(async function() {
      if (testTicket) {
        await EventTicket.findByIdAndDelete(testTicket._id);
        testTicket = null;
      }
      if (testEvent) {
        await Event.findByIdAndDelete(testEvent._id);
        testEvent = null;
      }
      if (testUser) {
        await User.findByIdAndDelete(testUser._id);
        testUser = null;
      }
    });

    it('should create a valid ticket with auto-generated fields', async function() {
      testTicket = new EventTicket({
        eventId: testEvent._id,
        userId: testUser._id,
        qrCode: 'test-qr-code-12345'
      });

      const savedTicket = await testTicket.save();

      expect(savedTicket).to.exist;
      expect(savedTicket.ticketNumber).to.exist;
      expect(savedTicket.ticketNumber).to.match(/^[A-Z0-9]{10}$/);
      expect(savedTicket.securityHash).to.exist;
      expect(savedTicket.status).to.equal('active');
      expect(savedTicket.expiresAt).to.exist;
    });

    it('should generate unique ticket numbers', async function() {
      const tickets = [];
      
      for (let i = 0; i < 5; i++) {
        const ticket = new EventTicket({
          eventId: testEvent._id,
          userId: testUser._id,
          qrCode: `test-qr-code-${i}`
        });
        await ticket.save();
        tickets.push(ticket);
      }

      const ticketNumbers = tickets.map(t => t.ticketNumber);
      const uniqueNumbers = [...new Set(ticketNumbers)];
      
      expect(uniqueNumbers).to.have.length(5);

      // Cleanup
      for (const ticket of tickets) {
        await EventTicket.findByIdAndDelete(ticket._id);
      }
    });

    it('should record attendance correctly', async function() {
      testTicket = new EventTicket({
        eventId: testEvent._id,
        userId: testUser._id,
        qrCode: 'test-qr-code-attendance'
      });
      await testTicket.save();

      const attendanceRecord = testTicket.recordAttendance(
        testUser._id,
        'Main Entrance',
        { deviceId: 'test-device', platform: 'web' }
      );

      expect(attendanceRecord).to.exist;
      expect(testTicket.attendanceRecords).to.have.length(1);
      expect(testTicket.status).to.equal('used');
      expect(testTicket.isUsed).to.be.true;
      expect(testTicket.attendanceCount).to.equal(1);
    });

    it('should validate ticket scanning eligibility', async function() {
      testTicket = new EventTicket({
        eventId: testEvent._id,
        userId: testUser._id,
        qrCode: 'test-qr-code-validation',
        status: 'active'
      });
      await testTicket.save();

      // Valid ticket
      let validation = testTicket.canBeScanned();
      expect(validation.valid).to.be.true;

      // Cancelled ticket
      testTicket.status = 'cancelled';
      validation = testTicket.canBeScanned();
      expect(validation.valid).to.be.false;
      expect(validation.reason).to.include('cancelled');

      // Expired ticket
      testTicket.status = 'active';
      testTicket.expiresAt = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
      validation = testTicket.canBeScanned();
      expect(validation.valid).to.be.false;
      expect(validation.reason).to.include('expired');
    });

    it('should enforce unique constraint per user per event', async function() {
      // Create first ticket
      testTicket = new EventTicket({
        eventId: testEvent._id,
        userId: testUser._id,
        qrCode: 'test-qr-code-unique-1'
      });
      await testTicket.save();

      // Try to create duplicate ticket
      const duplicateTicket = new EventTicket({
        eventId: testEvent._id,
        userId: testUser._id,
        qrCode: 'test-qr-code-unique-2'
      });

      try {
        await duplicateTicket.save();
        expect.fail('Should have thrown duplicate key error');
      } catch (error) {
        expect(error.code).to.equal(11000); // MongoDB duplicate key error
      }
    });
  });

  describe('EventRegistration Model', function() {
    let testUser;
    let testEvent;
    let testRegistration;

    beforeEach(async function() {
      // Create test user
      testUser = new User({
        firstName: 'Test',
        lastName: 'Registrant',
        email: 'test.registrant@test.com',
        password: 'password123',
        role: 'student'
      });
      await testUser.save();

      // Create test event
      testEvent = new Event({
        title: 'Test Event - Registration Testing',
        description: 'Test description',
        category: 'academic',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        venue: 'Test Venue',
        capacity: 100,
        organizer: testUser._id
      });
      await testEvent.save();
    });

    afterEach(async function() {
      if (testRegistration) {
        await EventRegistration.findByIdAndDelete(testRegistration._id);
        testRegistration = null;
      }
      if (testEvent) {
        await Event.findByIdAndDelete(testEvent._id);
        testEvent = null;
      }
      if (testUser) {
        await User.findByIdAndDelete(testUser._id);
        testUser = null;
      }
    });

    it('should create a valid registration', async function() {
      testRegistration = new EventRegistration({
        eventId: testEvent._id,
        userId: testUser._id,
        registrationData: {
          firstName: 'Test',
          lastName: 'Registrant',
          email: 'test.registrant@test.com',
          phone: '+639123456789'
        }
      });

      const savedRegistration = await testRegistration.save();

      expect(savedRegistration).to.exist;
      expect(savedRegistration.status).to.equal('confirmed'); // Auto-confirmed when no payment required
      expect(savedRegistration.registrationType).to.equal('regular');
      expect(savedRegistration.fullName).to.equal('Test Registrant');
      expect(savedRegistration.isConfirmed).to.be.true;
    });

    it('should validate required registration data', async function() {
      const invalidRegistration = new EventRegistration({
        eventId: testEvent._id,
        userId: testUser._id,
        registrationData: {
          firstName: 'Test'
          // Missing required fields
        }
      });

      try {
        await invalidRegistration.save();
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).to.equal('ValidationError');
        expect(error.errors['registrationData.lastName']).to.exist;
        expect(error.errors['registrationData.email']).to.exist;
      }
    });

    it('should validate email format', async function() {
      const invalidRegistration = new EventRegistration({
        eventId: testEvent._id,
        userId: testUser._id,
        registrationData: {
          firstName: 'Test',
          lastName: 'User',
          email: 'invalid-email-format'
        }
      });

      try {
        await invalidRegistration.save();
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).to.equal('ValidationError');
        expect(error.errors['registrationData.email']).to.exist;
      }
    });

    it('should handle registration confirmation and cancellation', async function() {
      testRegistration = new EventRegistration({
        eventId: testEvent._id,
        userId: testUser._id,
        status: 'pending',
        registrationData: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@test.com'
        }
      });
      await testRegistration.save();

      // Test confirmation
      const confirmed = testRegistration.confirm();
      expect(confirmed).to.be.true;
      expect(testRegistration.status).to.equal('confirmed');
      expect(testRegistration.confirmedAt).to.exist;

      // Test cancellation
      const cancelled = testRegistration.cancel('User requested cancellation');
      expect(cancelled).to.be.true;
      expect(testRegistration.status).to.equal('cancelled');
      expect(testRegistration.cancelledAt).to.exist;
      expect(testRegistration.cancellationReason).to.equal('User requested cancellation');
    });

    it('should handle attendance marking', async function() {
      testRegistration = new EventRegistration({
        eventId: testEvent._id,
        userId: testUser._id,
        registrationData: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@test.com'
        }
      });
      await testRegistration.save();

      const attended = testRegistration.markAttended(
        testUser._id,
        'Main Hall',
        'qr_scan',
        { deviceId: 'scanner-001' }
      );

      expect(attended).to.be.true;
      expect(testRegistration.status).to.equal('attended');
      expect(testRegistration.hasAttended).to.be.true;
      expect(testRegistration.checkInHistory).to.have.length(1);
      expect(testRegistration.checkInHistory[0].location).to.equal('Main Hall');
    });

    it('should enforce unique constraint per user per event', async function() {
      // Create first registration
      testRegistration = new EventRegistration({
        eventId: testEvent._id,
        userId: testUser._id,
        registrationData: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@test.com'
        }
      });
      await testRegistration.save();

      // Try to create duplicate registration
      const duplicateRegistration = new EventRegistration({
        eventId: testEvent._id,
        userId: testUser._id,
        registrationData: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test2@test.com'
        }
      });

      try {
        await duplicateRegistration.save();
        expect.fail('Should have thrown duplicate key error');
      } catch (error) {
        expect(error.code).to.equal(11000); // MongoDB duplicate key error
      }
    });

    it('should handle payment information correctly', async function() {
      testRegistration = new EventRegistration({
        eventId: testEvent._id,
        userId: testUser._id,
        registrationData: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@test.com'
        },
        paymentInfo: {
          required: true,
          amount: 500,
          currency: 'PHP',
          status: 'pending'
        }
      });
      await testRegistration.save();

      expect(testRegistration.paymentRequired).to.be.true;
      expect(testRegistration.paymentCompleted).to.be.false;
      expect(testRegistration.status).to.equal('pending'); // Should remain pending until payment

      // Complete payment
      testRegistration.paymentInfo.status = 'paid';
      testRegistration.paymentInfo.paidAt = new Date();
      await testRegistration.save();

      expect(testRegistration.paymentCompleted).to.be.true;
    });
  });

  describe('Model Integration Tests', function() {
    let testUser;
    let testEvent;

    beforeEach(async function() {
      testUser = new User({
        firstName: 'Integration',
        lastName: 'Test',
        email: 'integration.test@test.com',
        password: 'password123',
        role: 'student'
      });
      await testUser.save();

      testEvent = new Event({
        title: 'Test Event - Integration',
        description: 'Integration test event',
        category: 'academic',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        venue: 'Integration Test Venue',
        capacity: 2, // Small capacity for testing
        organizer: testUser._id,
        status: 'published'
      });
      await testEvent.save();
    });

    afterEach(async function() {
      await EventRegistration.deleteMany({ eventId: testEvent._id });
      await EventTicket.deleteMany({ eventId: testEvent._id });
      await Event.findByIdAndDelete(testEvent._id);
      await User.findByIdAndDelete(testUser._id);
    });

    it('should handle complete registration and ticketing workflow', async function() {
      // Create registration
      const registration = new EventRegistration({
        eventId: testEvent._id,
        userId: testUser._id,
        registrationData: {
          firstName: 'Integration',
          lastName: 'Test',
          email: 'integration.test@test.com'
        }
      });
      await registration.save();

      expect(registration.status).to.equal('confirmed');

      // Create ticket for confirmed registration
      const ticket = new EventTicket({
        eventId: testEvent._id,
        userId: testUser._id,
        qrCode: `qr-${registration._id}`
      });
      await ticket.save();

      // Link ticket to registration
      registration.ticketId = ticket._id;
      await registration.save();

      // Verify ticket can be scanned
      const scanValidation = ticket.canBeScanned();
      expect(scanValidation.valid).to.be.true;

      // Record attendance
      ticket.recordAttendance(testUser._id, 'Main Entrance', { deviceId: 'test' });
      await ticket.save();

      // Mark registration as attended
      registration.markAttended(testUser._id, 'Main Entrance');
      await registration.save();

      // Verify final states
      expect(ticket.status).to.equal('used');
      expect(registration.status).to.equal('attended');
      expect(ticket.attendanceCount).to.equal(1);
      expect(registration.hasAttended).to.be.true;
    });
  });
});

// Run tests if this file is executed directly
if (require.main === module) {
  const { execSync } = require('child_process');
  
  try {
    console.log('Installing test dependencies...');
    execSync('npm install --save-dev mocha chai', { stdio: 'inherit' });
    
    console.log('Running event model tests...');
    execSync('npx mocha backend/test-event-models.js --timeout 10000', { stdio: 'inherit' });
  } catch (error) {
    console.error('Test execution failed:', error.message);
    process.exit(1);
  }
}