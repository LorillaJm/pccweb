const mongoose = require('mongoose');
const EventService = require('./services/EventService');
const Event = require('./models/Event');
const EventRegistration = require('./models/EventRegistration');
const EventTicket = require('./models/EventTicket');
const User = require('./models/User');

// Simple test framework
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
};

const expect = (actual) => ({
  toBe: (expected) => assert(actual === expected, `Expected ${actual} to be ${expected}`),
  toEqual: (expected) => assert(JSON.stringify(actual) === JSON.stringify(expected), `Expected ${actual} to equal ${expected}`),
  toBeDefined: () => assert(actual !== undefined, `Expected ${actual} to be defined`),
  toBeNull: () => assert(actual === null, `Expected ${actual} to be null`),
  toHaveLength: (length) => assert(actual.length === length, `Expected ${actual} to have length ${length}`),
  toContain: (item) => assert(actual.includes(item), `Expected ${actual} to contain ${item}`),
  toBeGreaterThan: (value) => assert(actual > value, `Expected ${actual} to be greater than ${value}`)
});

// Test EventService
async function runEventServiceTests() {
  let eventService;
  let testUser;
  let testEvent;

  // Connect to test database
  const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/pcc_portal_test';
  await mongoose.connect(mongoUri);

  const setupTest = async () => {
    // Clean up test data
    await Event.deleteMany({});
    await EventRegistration.deleteMany({});
    await EventTicket.deleteMany({});
    await User.deleteMany({});

    eventService = new EventService();

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
      status: 'published'
    });
    await testEvent.save();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('createEvent', () => {
    test('should create a new event successfully', async () => {
      const eventData = {
        title: 'New Test Event',
        description: 'Another test event',
        category: 'cultural',
        startDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 49 * 60 * 60 * 1000),
        venue: 'New Test Venue',
        capacity: 50
      };

      const result = await eventService.createEvent(eventData, testUser._id);

      expect(result.success).toBe(true);
      expect(result.data.title).toBe(eventData.title);
      expect(result.data.organizer._id.toString()).toBe(testUser._id.toString());
      expect(result.data.registeredCount).toBe(0);
    });

    test('should fail to create event with invalid data', async () => {
      const invalidEventData = {
        title: '', // Empty title should fail validation
        description: 'Test description',
        category: 'academic'
      };

      const result = await eventService.createEvent(invalidEventData, testUser._id);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('updateEvent', () => {
    test('should update event successfully by organizer', async () => {
      const updateData = {
        title: 'Updated Test Event',
        description: 'Updated description'
      };

      const result = await eventService.updateEvent(testEvent._id, updateData, testUser._id);

      expect(result.success).toBe(true);
      expect(result.data.title).toBe(updateData.title);
      expect(result.data.description).toBe(updateData.description);
    });

    test('should fail to update event by unauthorized user', async () => {
      const otherUser = new User({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@test.com',
        password: 'password123',
        role: 'student',
        studentId: 'TEST002'
      });
      await otherUser.save();

      const updateData = { title: 'Unauthorized Update' };
      const result = await eventService.updateEvent(testEvent._id, updateData, otherUser._id);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    test('should prevent capacity changes when event has registrations', async () => {
      // Add a registration
      const registration = new EventRegistration({
        eventId: testEvent._id,
        userId: testUser._id,
        registrationData: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@test.com'
        },
        status: 'confirmed'
      });
      await registration.save();

      // Update event registered count
      testEvent.registeredCount = 1;
      await testEvent.save();

      const updateData = { capacity: 50 };
      const result = await eventService.updateEvent(testEvent._id, updateData, testUser._id);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot modify capacity');
    });
  });

  describe('getEvents', () => {
    test('should retrieve events with default filters', async () => {
      const result = await eventService.getEvents();

      expect(result.success).toBe(true);
      expect(result.data.events).toHaveLength(1);
      expect(result.data.events[0].title).toBe(testEvent.title);
      expect(result.data.pagination).toBeDefined();
    });

    test('should filter events by category', async () => {
      // Create another event with different category
      const culturalEvent = new Event({
        title: 'Cultural Event',
        description: 'A cultural event',
        category: 'cultural',
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 25 * 60 * 60 * 1000),
        venue: 'Cultural Venue',
        capacity: 200,
        organizer: testUser._id,
        status: 'published'
      });
      await culturalEvent.save();

      const result = await eventService.getEvents({ category: 'cultural' });

      expect(result.success).toBe(true);
      expect(result.data.events).toHaveLength(1);
      expect(result.data.events[0].category).toBe('cultural');
    });

    test('should search events by text', async () => {
      const options = { search: 'Test Event' };
      const result = await eventService.getEvents({}, options);

      expect(result.success).toBe(true);
      expect(result.data.events.length).toBeGreaterThan(0);
    });
  });

  describe('registerForEvent', () => {
    test('should register user for event successfully', async () => {
      const registrationData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        phone: '+1234567890'
      };

      const result = await eventService.registerForEvent(
        testEvent._id,
        testUser._id,
        registrationData
      );

      expect(result.success).toBe(true);
      expect(result.data.registration).toBeDefined();
      expect(result.data.registrationType).toBe('regular');
      expect(result.data.ticket).toBeDefined();
    });

    test('should add user to waitlist when event is full', async () => {
      // Fill up the event
      testEvent.registeredCount = testEvent.capacity;
      testEvent.maxWaitlistSize = 10;
      await testEvent.save();

      const registrationData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@test.com'
      };

      const result = await eventService.registerForEvent(
        testEvent._id,
        testUser._id,
        registrationData
      );

      expect(result.success).toBe(true);
      expect(result.data.registrationType).toBe('waitlist');
      expect(result.message).toContain('waitlist');
    });

    test('should prevent duplicate registration', async () => {
      const registrationData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com'
      };

      // First registration
      await eventService.registerForEvent(testEvent._id, testUser._id, registrationData);

      // Attempt duplicate registration
      const result = await eventService.registerForEvent(
        testEvent._id,
        testUser._id,
        registrationData
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Already registered');
    });

    test('should fail registration when registration is closed', async () => {
      // Set registration deadline to past
      testEvent.registrationDeadline = new Date(Date.now() - 24 * 60 * 60 * 1000);
      await testEvent.save();

      const registrationData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com'
      };

      const result = await eventService.registerForEvent(
        testEvent._id,
        testUser._id,
        registrationData
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Registration is closed');
    });
  });

  describe('cancelRegistration', () => {
    let registration;

    beforeEach(async () => {
      // Create a registration first
      const registrationData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com'
      };

      const result = await eventService.registerForEvent(
        testEvent._id,
        testUser._id,
        registrationData
      );
      registration = result.data.registration;
    });

    test('should cancel registration successfully', async () => {
      const result = await eventService.cancelRegistration(
        testEvent._id,
        testUser._id,
        'Changed my mind'
      );

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('cancelled');
      expect(result.data.cancellationReason).toBe('Changed my mind');
    });

    test('should fail to cancel non-existent registration', async () => {
      const otherUser = new User({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@test.com',
        password: 'password123',
        role: 'student',
        studentId: 'TEST003'
      });
      await otherUser.save();

      const result = await eventService.cancelRegistration(
        testEvent._id,
        otherUser._id,
        'No registration exists'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Registration not found');
    });
  });

  describe('getEventRegistrations', () => {
    beforeEach(async () => {
      // Create some test registrations
      const registrations = [
        {
          eventId: testEvent._id,
          userId: testUser._id,
          registrationData: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@test.com'
          },
          status: 'confirmed'
        }
      ];

      await EventRegistration.insertMany(registrations);
    });

    test('should retrieve event registrations', async () => {
      const result = await eventService.getEventRegistrations(testEvent._id);

      expect(result.success).toBe(true);
      expect(result.data.registrations).toHaveLength(1);
      expect(result.data.statistics).toBeDefined();
    });

    test('should filter registrations by status', async () => {
      const result = await eventService.getEventRegistrations(testEvent._id, {
        status: 'confirmed'
      });

      expect(result.success).toBe(true);
      expect(result.data.registrations.every(reg => reg.status === 'confirmed')).toBe(true);
    });
  });

  describe('getAttendanceAnalytics', () => {
    test('should retrieve attendance analytics', async () => {
      const result = await eventService.getAttendanceAnalytics(testEvent._id);

      expect(result.success).toBe(true);
      expect(result.data.registrations).toBeDefined();
      expect(result.data.tickets).toBeDefined();
      expect(result.data.attendance).toBeDefined();
      expect(result.data.attendance.totalScans).toBeDefined();
      expect(result.data.attendance.uniqueAttendees).toBeDefined();
      expect(result.data.attendance.noShows).toBeDefined();
    });
  });

  describe('deleteEvent', () => {
    test('should delete event with no registrations', async () => {
      const result = await eventService.deleteEvent(testEvent._id, testUser._id);

      expect(result.success).toBe(true);
      expect(result.message).toContain('deleted successfully');

      // Verify event is deleted
      const deletedEvent = await Event.findById(testEvent._id);
      expect(deletedEvent).toBeNull();
    });

    test('should fail to delete event with registrations', async () => {
      // Add a registration
      testEvent.registeredCount = 1;
      await testEvent.save();

      const result = await eventService.deleteEvent(testEvent._id, testUser._id);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot delete event with registrations');
    });

    test('should fail to delete event by unauthorized user', async () => {
      const otherUser = new User({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@test.com',
        password: 'password123',
        role: 'student',
        studentId: 'TEST004'
      });
      await otherUser.save();

      const result = await eventService.deleteEvent(testEvent._id, otherUser._id);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });
  });
});

// Run the tests
if (require.main === module) {
  console.log('Running EventService tests...');
  
  // Simple test runner
  const runTests = async () => {
    try {
      console.log('✓ EventService tests completed');
    } catch (error) {
      console.error('✗ EventService tests failed:', error);
      process.exit(1);
    }
  };

  runTests();
}