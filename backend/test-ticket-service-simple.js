const mongoose = require('mongoose');
const TicketService = require('./services/TicketService');
const EventTicket = require('./models/EventTicket');
const Event = require('./models/Event');
const EventRegistration = require('./models/EventRegistration');
const User = require('./models/User');

async function runTicketServiceTests() {
  console.log('🧪 Starting TicketService tests...');
  
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pcc_portal';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to database');

    // Clean up test data
    await EventTicket.deleteMany({});
    await Event.deleteMany({ title: /Ticket Test Event/ });
    await EventRegistration.deleteMany({});
    await User.deleteMany({ email: /tickettest\.com/ });

    const ticketService = new TicketService();

    // Create test user
    const testUser = new User({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@tickettest.com',
      password: 'password123',
      role: 'student',
      studentId: 'TICKET001'
    });
    await testUser.save();
    console.log('✅ Test user created');

    // Create test event
    const testEvent = new Event({
      title: 'Ticket Test Event',
      description: 'A test event for ticket testing',
      category: 'academic',
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endDate: new Date(Date.now() + 25 * 60 * 60 * 1000), // Day after tomorrow
      venue: 'Ticket Test Venue',
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
    console.log('✅ Test event created');

    // Test 1: Generate Ticket
    console.log('\n📝 Test 1: Generate Ticket');
    const registrationData = {
      registrationType: 'regular',
      specialRequests: 'Vegetarian meal',
      emergencyContact: {
        name: 'John Smith',
        phone: '+0987654321'
      }
    };

    const generateResult = await ticketService.generateTicket(
      testEvent._id,
      testUser._id,
      registrationData
    );
    if (!generateResult.success) {
      throw new Error(`Failed to generate ticket: ${generateResult.error}`);
    }
    console.log('✅ Ticket generated successfully');
    const testTicket = generateResult.data;

    // Test 2: Get Ticket by ID
    console.log('\n📝 Test 2: Get Ticket by ID');
    const getTicketResult = await ticketService.getTicketById(testTicket._id);
    if (!getTicketResult.success || getTicketResult.data.ticketNumber !== testTicket.ticketNumber) {
      throw new Error('Failed to get ticket by ID');
    }
    console.log('✅ Ticket retrieved successfully');

    // Test 3: Validate QR Code
    console.log('\n📝 Test 3: Validate QR Code');
    const validateResult = await ticketService.validateQRCode(testTicket.qrCode, testEvent._id);
    if (!validateResult.success) {
      throw new Error(`Failed to validate QR code: ${validateResult.error}`);
    }
    console.log('✅ QR code validated successfully');

    // Test 4: Record Attendance
    console.log('\n📝 Test 4: Record Attendance');
    const scannerUser = new User({
      firstName: 'Scanner',
      lastName: 'User',
      email: 'scanner@tickettest.com',
      password: 'password123',
      role: 'staff',
      employeeId: 'SCAN001'
    });
    await scannerUser.save();

    const scanDetails = {
      eventId: testEvent._id,
      location: 'Main Entrance',
      deviceInfo: {
        deviceId: 'DEVICE001',
        platform: 'mobile'
      },
      scanType: 'entry'
    };

    const attendanceResult = await ticketService.recordAttendance(
      testTicket.qrCode,
      scannerUser._id,
      scanDetails
    );
    if (!attendanceResult.success) {
      throw new Error(`Failed to record attendance: ${attendanceResult.error}`);
    }
    console.log('✅ Attendance recorded successfully');

    // Test 5: Get Event Tickets
    console.log('\n📝 Test 5: Get Event Tickets');
    const eventTicketsResult = await ticketService.getEventTickets(testEvent._id);
    if (!eventTicketsResult.success || eventTicketsResult.data.tickets.length === 0) {
      throw new Error('Failed to get event tickets');
    }
    console.log('✅ Event tickets retrieved successfully');

    // Test 6: Get User Tickets
    console.log('\n📝 Test 6: Get User Tickets');
    const userTicketsResult = await ticketService.getUserTickets(testUser._id);
    if (!userTicketsResult.success || userTicketsResult.data.length === 0) {
      throw new Error('Failed to get user tickets');
    }
    console.log('✅ User tickets retrieved successfully');

    // Test 7: Regenerate QR Code
    console.log('\n📝 Test 7: Regenerate QR Code');
    const originalQRCode = testTicket.qrCode;
    const regenerateResult = await ticketService.regenerateQRCode(testTicket._id);
    if (!regenerateResult.success || regenerateResult.data.qrCode === originalQRCode) {
      throw new Error('Failed to regenerate QR code');
    }
    console.log('✅ QR code regenerated successfully');

    // Test 8: Cancel Ticket
    console.log('\n📝 Test 8: Cancel Ticket');
    const cancelResult = await ticketService.cancelTicket(testTicket._id, 'Test cancellation');
    if (!cancelResult.success || cancelResult.data.status !== 'cancelled') {
      throw new Error(`Failed to cancel ticket: ${cancelResult.error}`);
    }
    console.log('✅ Ticket cancelled successfully');

    // Test 9: Cleanup Expired Tickets
    console.log('\n📝 Test 9: Cleanup Expired Tickets');
    const cleanupResult = await ticketService.cleanupExpiredTickets();
    if (!cleanupResult.success) {
      throw new Error(`Failed to cleanup expired tickets: ${cleanupResult.error}`);
    }
    console.log('✅ Expired tickets cleaned up successfully');

    // Test 10: Multi-Event Analytics
    console.log('\n📝 Test 10: Multi-Event Analytics');
    const analyticsResult = await ticketService.getMultiEventAnalytics([testEvent._id]);
    if (!analyticsResult.success) {
      throw new Error(`Failed to get multi-event analytics: ${analyticsResult.error}`);
    }
    console.log('✅ Multi-event analytics retrieved successfully');

    // Clean up test data
    await EventTicket.deleteMany({});
    await Event.deleteMany({ title: /Ticket Test Event/ });
    await EventRegistration.deleteMany({});
    await User.deleteMany({ email: /tickettest\.com/ });
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All TicketService tests passed!');
    
  } catch (error) {
    console.error('\n❌ TicketService test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTicketServiceTests();
}

module.exports = { runTicketServiceTests };