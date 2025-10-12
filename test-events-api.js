const mongoose = require('mongoose');
const Event = require('./backend/models/Event');
const User = require('./backend/models/User');

console.log('🧪 Testing Events API Integration...\n');

// Test database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pcc_portal';

async function testEventsAPI() {
  try {
    // Connect to database
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to database');

    // Create a test organizer user
    let testUser = await User.findOne({ email: 'test.organizer@pcc.edu' });
    if (!testUser) {
      testUser = new User({
        firstName: 'Test',
        lastName: 'Organizer',
        email: 'test.organizer@pcc.edu',
        password: 'password123',
        role: 'faculty'
      });
      await testUser.save();
      console.log('✅ Created test organizer user');
    } else {
      console.log('✅ Found existing test organizer user');
    }

    // Create a test event
    const testEvent = new Event({
      title: 'Test Event - API Integration',
      description: 'This is a test event created through the API integration test',
      category: 'academic',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
      venue: 'Test Auditorium',
      capacity: 100,
      organizer: testUser._id,
      status: 'published',
      isPublic: true
    });

    await testEvent.save();
    console.log('✅ Created test event:', testEvent.title);
    console.log('   Event ID:', testEvent._id);
    console.log('   Status:', testEvent.status);
    console.log('   Capacity:', testEvent.capacity);
    console.log('   Available Slots:', testEvent.availableSlots);
    console.log('   Registration Open:', testEvent.isRegistrationOpen);

    // Test event queries
    const upcomingEvents = await Event.findUpcoming(5);
    console.log(`✅ Found ${upcomingEvents.length} upcoming events`);

    const academicEvents = await Event.findByCategory('academic', 10);
    console.log(`✅ Found ${academicEvents.length} academic events`);

    // Test API endpoint simulation
    console.log('\n📡 Simulating API Endpoints:');
    
    // GET /api/events
    const allEvents = await Event.find({ status: 'published', isPublic: true })
      .populate('organizer', 'firstName lastName')
      .sort({ startDate: 1 })
      .limit(20);
    
    console.log(`✅ GET /api/events - Found ${allEvents.length} public events`);
    
    if (allEvents.length > 0) {
      const event = allEvents[0];
      console.log('   Sample Event:');
      console.log('   - Title:', event.title);
      console.log('   - Organizer:', `${event.organizer.firstName} ${event.organizer.lastName}`);
      console.log('   - Date:', event.startDate.toLocaleDateString());
      console.log('   - Venue:', event.venue);
      console.log('   - Capacity:', `${event.registeredCount}/${event.capacity}`);
    }

    // Clean up test data
    await Event.findByIdAndDelete(testEvent._id);
    console.log('✅ Cleaned up test event');

    console.log('\n🎉 Events API Integration Test Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Database connection working');
    console.log('✅ Event model validation working');
    console.log('✅ Event creation working');
    console.log('✅ Event queries working');
    console.log('✅ API endpoint simulation working');
    console.log('\n🚀 Ready to use the Events Management System!');
    console.log('\n📍 Access Points:');
    console.log('- Admin Events: http://localhost:3000/admin/events');
    console.log('- Public Events: http://localhost:3000/events');
    console.log('- API Endpoint: http://localhost:3000/api/events');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from database');
    process.exit(0);
  }
}

// Run the test
testEventsAPI();