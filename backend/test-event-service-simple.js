const mongoose = require('mongoose');
const EventService = require('./services/EventService');
const Event = require('./models/Event');
const EventRegistration = require('./models/EventRegistration');
const EventTicket = require('./models/EventTicket');
const User = require('./models/User');

async function runEventServiceTests() {
  console.log('🧪 Starting EventService tests...');
  
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pcc_portal';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to database');

    // Clean up test data
    await Event.deleteMany({ title: /Test Event/ });
    await EventRegistration.deleteMany({});
    await EventTicket.deleteMany({});
    await User.deleteMany({ email: /test\.com/ });

    const eventService = new EventService();

    // Create test user
    const testUser = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@test.com',
      password: 'password123',
      role: 'student',
      studentId: 'TEST001'
    });
    await testUser.save();
    console.log('✅ Test user created');

    // Test 1: Create Event
    console.log('\n📝 Test 1: Create Event');
    const eventData = {
      title: 'Test Event for Service',
      description: 'A test event for service testing',
      category: 'academic',
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endDate: new Date(Date.now() + 25 * 60 * 60 * 1000), // Day after tomorrow
      venue: 'Test Venue',
      capacity: 100
    };

    const createResult = await eventService.createEvent(eventData, testUser._id);
    if (!createResult.success) {
      throw new Error(`Failed to create event: ${createResult.error}`);
    }
    console.log('✅ Event created successfully');
    const testEvent = createResult.data;

    // Test 2: Get Event by ID
    console.log('\n📝 Test 2: Get Event by ID');
    const getResult = await eventService.getEventById(testEvent._id);
    if (!getResult.success || getResult.data.title !== eventData.title) {
      throw new Error('Failed to get event by ID');
    }
    console.log('✅ Event retrieved successfully');

    // Test 3: Get Events with filters
    console.log('\n📝 Test 3: Get Events with filters');
    const listResult = await eventService.getEvents({ category: 'academic' });
    if (!listResult.success || listResult.data.events.length === 0) {
      throw new Error('Failed to get events with filters');
    }
    console.log('✅ Events filtered successfully');

    // Test 4: Register for Event
    console.log('\n📝 Test 4: Register for Event');
    const registrationData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@test.com',
      phone: '+1234567890'
    };

    const registerResult = await eventService.registerForEvent(
      testEvent._id,
      testUser._id,
      registrationData
    );
    if (!registerResult.success) {
      throw new Error(`Failed to register for event: ${registerResult.error}`);
    }
    console.log('✅ Event registration successful');

    // Test 5: Get Event Registrations
    console.log('\n📝 Test 5: Get Event Registrations');
    const registrationsResult = await eventService.getEventRegistrations(testEvent._id);
    if (!registrationsResult.success || registrationsResult.data.registrations.length === 0) {
      throw new Error('Failed to get event registrations');
    }
    console.log('✅ Event registrations retrieved successfully');

    // Test 6: Get Attendance Analytics
    console.log('\n📝 Test 6: Get Attendance Analytics');
    const analyticsResult = await eventService.getAttendanceAnalytics(testEvent._id);
    if (!analyticsResult.success) {
      throw new Error(`Failed to get attendance analytics: ${analyticsResult.error}`);
    }
    console.log('✅ Attendance analytics retrieved successfully');

    // Test 7: Update Event
    console.log('\n📝 Test 7: Update Event');
    const updateData = {
      description: 'Updated test event description'
    };
    const updateResult = await eventService.updateEvent(testEvent._id, updateData, testUser._id);
    if (!updateResult.success || updateResult.data.description !== updateData.description) {
      throw new Error(`Failed to update event: ${updateResult.error}`);
    }
    console.log('✅ Event updated successfully');

    // Test 8: Cancel Registration
    console.log('\n📝 Test 8: Cancel Registration');
    const cancelResult = await eventService.cancelRegistration(
      testEvent._id,
      testUser._id,
      'Test cancellation'
    );
    if (!cancelResult.success) {
      throw new Error(`Failed to cancel registration: ${cancelResult.error}`);
    }
    console.log('✅ Registration cancelled successfully');

    // Clean up test data
    await Event.deleteMany({ title: /Test Event/ });
    await EventRegistration.deleteMany({});
    await EventTicket.deleteMany({});
    await User.deleteMany({ email: /test\.com/ });
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All EventService tests passed!');
    
  } catch (error) {
    console.error('\n❌ EventService test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runEventServiceTests();
}

module.exports = { runEventServiceTests };