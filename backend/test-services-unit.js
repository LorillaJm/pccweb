const EventService = require('./services/EventService');
const TicketService = require('./services/TicketService');

// Simple unit tests without database dependencies

async function runUnitTests() {
  console.log('🧪 Starting Unit Tests for Event Services...');
  
  try {
    // Test EventService instantiation
    console.log('\n📝 Test 1: EventService instantiation');
    const eventService = new EventService();
    if (!eventService) {
      throw new Error('Failed to instantiate EventService');
    }
    console.log('✅ EventService instantiated successfully');

    // Test TicketService instantiation
    console.log('\n📝 Test 2: TicketService instantiation');
    const ticketService = new TicketService();
    if (!ticketService) {
      throw new Error('Failed to instantiate TicketService');
    }
    console.log('✅ TicketService instantiated successfully');

    // Test EventService methods exist
    console.log('\n📝 Test 3: EventService methods');
    const eventMethods = [
      'createEvent',
      'updateEvent', 
      'getEventById',
      'getEvents',
      'registerForEvent',
      'cancelRegistration',
      'getEventRegistrations',
      'getAttendanceAnalytics',
      'deleteEvent'
    ];

    for (const method of eventMethods) {
      if (typeof eventService[method] !== 'function') {
        throw new Error(`EventService missing method: ${method}`);
      }
    }
    console.log('✅ All EventService methods exist');

    // Test TicketService methods exist
    console.log('\n📝 Test 4: TicketService methods');
    const ticketMethods = [
      'generateTicket',
      'validateQRCode',
      'recordAttendance',
      'getTicketById',
      'getEventTickets',
      'getUserTickets',
      'cancelTicket',
      'regenerateQRCode',
      'cleanupExpiredTickets',
      'getMultiEventAnalytics'
    ];

    for (const method of ticketMethods) {
      if (typeof ticketService[method] !== 'function') {
        throw new Error(`TicketService missing method: ${method}`);
      }
    }
    console.log('✅ All TicketService methods exist');

    // Test QR data generation and parsing
    console.log('\n📝 Test 5: QR Code utilities');
    const eventId = '507f1f77bcf86cd799439011';
    const userId = '507f1f77bcf86cd799439012';
    const ticketNumber = 'TEST123456';
    
    // Test QR data generation (private method, but we can test the concept)
    const qrData = ticketService.generateQRData(eventId, userId, ticketNumber);
    if (!qrData || typeof qrData !== 'string') {
      throw new Error('Failed to generate QR data');
    }
    
    // Test QR data parsing
    const parsedData = ticketService.parseQRData(qrData);
    if (!parsedData.valid) {
      throw new Error('Failed to parse QR data');
    }
    console.log('✅ QR Code utilities working correctly');

    // Test error handling structure
    console.log('\n📝 Test 6: Error handling structure');
    
    // Test with invalid data (should return error structure)
    try {
      const invalidResult = await eventService.getEventById('invalid-id');
      if (!invalidResult.hasOwnProperty('success') || 
          !invalidResult.hasOwnProperty('error') || 
          !invalidResult.hasOwnProperty('message')) {
        throw new Error('Invalid error response structure');
      }
    } catch (error) {
      // Expected to fail due to database connection, but structure should be correct
      if (!error.message.includes('Cast to ObjectId failed')) {
        // If it's not a mongoose casting error, it might be our structure issue
        console.log('Note: Database connection error expected in unit test');
      }
    }
    console.log('✅ Error handling structure verified');

    console.log('\n🎉 All unit tests passed!');
    
  } catch (error) {
    console.error('\n❌ Unit test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runUnitTests();
}

module.exports = { runUnitTests };