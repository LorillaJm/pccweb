const mongoose = require('mongoose');
const QRCodeService = require('./services/QRCodeService');
const TicketService = require('./services/TicketService');
const EventService = require('./services/EventService');
const Event = require('./models/Event');
const EventTicket = require('./models/EventTicket');
const User = require('./models/User');

async function runQRIntegrationTests() {
  console.log('🧪 Starting QR Code Integration Tests...');
  
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pcc_portal';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to database');

    // Clean up test data
    await Event.deleteMany({ title: /QR Test Event/ });
    await EventTicket.deleteMany({});
    await User.deleteMany({ email: /qrtest\.com/ });

    const qrService = new QRCodeService();
    const ticketService = new TicketService();
    const eventService = new EventService();

    // Create test user
    const testUser = new User({
      firstName: 'QR',
      lastName: 'Tester',
      email: 'qr.tester@qrtest.com',
      password: 'password123',
      role: 'student',
      studentId: 'QR001'
    });
    await testUser.save();
    console.log('✅ Test user created');

    // Create test event
    const testEvent = new Event({
      title: 'QR Test Event',
      description: 'A test event for QR code testing',
      category: 'academic',
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endDate: new Date(Date.now() + 25 * 60 * 60 * 1000), // Day after tomorrow
      venue: 'QR Test Venue',
      capacity: 100,
      organizer: testUser._id,
      status: 'published',
      qrScannerSettings: {
        allowMultipleScans: true,
        scanTimeWindow: 60,
        requireLocation: false
      }
    });
    await testEvent.save();
    console.log('✅ Test event created');

    // Test 1: Generate Secure QR Code
    console.log('\n📝 Test 1: Generate Secure QR Code');
    const ticketData = {
      ticketId: new mongoose.Types.ObjectId().toString(),
      eventId: testEvent._id.toString(),
      userId: testUser._id.toString(),
      ticketNumber: 'QR123456',
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000) // 2 days from now
    };

    const qrResult = await qrService.generateSecureQRCode(ticketData);
    if (!qrResult.success) {
      throw new Error(`Failed to generate secure QR code: ${qrResult.error}`);
    }
    console.log('✅ Secure QR code generated successfully');
    const secureQRString = qrResult.data.qrString;

    // Test 2: Validate Secure QR Code
    console.log('\n📝 Test 2: Validate Secure QR Code');
    const validateResult = await qrService.validateSecureQRCode(secureQRString);
    if (!validateResult.success) {
      throw new Error(`Failed to validate secure QR code: ${validateResult.error}`);
    }
    console.log('✅ Secure QR code validated successfully');

    // Test 3: Generate Offline QR Code
    console.log('\n📝 Test 3: Generate Offline QR Code');
    const offlineData = {
      eventTitle: testEvent.title,
      eventDate: testEvent.startDate,
      userName: `${testUser.firstName} ${testUser.lastName}`
    };

    const offlineQRResult = await qrService.generateOfflineQRCode(ticketData, offlineData);
    if (!offlineQRResult.success) {
      throw new Error(`Failed to generate offline QR code: ${offlineQRResult.error}`);
    }
    console.log('✅ Offline QR code generated successfully');

    // Test 4: Validate Offline QR Code
    console.log('\n📝 Test 4: Validate Offline QR Code');
    const offlineContext = {
      eventId: testEvent._id.toString()
    };

    const offlineValidateResult = await qrService.validateOfflineQRCode(
      offlineQRResult.data.qrString,
      offlineContext
    );
    if (!offlineValidateResult.success) {
      throw new Error(`Failed to validate offline QR code: ${offlineValidateResult.error}`);
    }
    console.log('✅ Offline QR code validated successfully');

    // Test 5: Generate Real Ticket and Test Integration
    console.log('\n📝 Test 5: Generate Real Ticket and Test Integration');
    const registrationData = {
      firstName: 'QR',
      lastName: 'Tester',
      email: 'qr.tester@qrtest.com'
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

    const realTicket = registerResult.data.ticket;

    // Test 6: Validate Real Ticket QR Code
    console.log('\n📝 Test 6: Validate Real Ticket QR Code');
    const realValidateResult = await ticketService.validateQRCode(realTicket.qrCode, testEvent._id);
    if (!realValidateResult.success) {
      throw new Error(`Failed to validate real ticket QR code: ${realValidateResult.error}`);
    }
    console.log('✅ Real ticket QR code validated successfully');

    // Test 7: Record Attendance with Real Ticket
    console.log('\n📝 Test 7: Record Attendance with Real Ticket');
    const scanDetails = {
      eventId: testEvent._id.toString(),
      location: 'Main Entrance',
      deviceInfo: {
        deviceId: 'TEST_DEVICE',
        platform: 'test'
      }
    };

    const attendanceResult = await ticketService.recordAttendance(
      realTicket.qrCode,
      testUser._id,
      scanDetails
    );
    if (!attendanceResult.success) {
      throw new Error(`Failed to record attendance: ${attendanceResult.error}`);
    }
    console.log('✅ Attendance recorded successfully');

    // Test 8: Test Offline Sync Preparation
    console.log('\n📝 Test 8: Test Offline Sync Preparation');
    const offlineScans = [
      {
        ticketId: realTicket._id.toString(),
        eventId: testEvent._id.toString(),
        userId: testUser._id.toString(),
        scannedAt: new Date(),
        scannedBy: testUser._id.toString(),
        location: 'Side Entrance',
        deviceInfo: { deviceId: 'OFFLINE_DEVICE', platform: 'mobile' }
      }
    ];

    const syncPrepResult = await qrService.prepareOfflineSync(offlineScans);
    if (!syncPrepResult.success) {
      throw new Error(`Failed to prepare offline sync: ${syncPrepResult.error}`);
    }
    console.log('✅ Offline sync data prepared successfully');

    // Test 9: Test Batch QR Generation
    console.log('\n📝 Test 9: Test Batch QR Generation');
    const batchTickets = [
      {
        ticketId: new mongoose.Types.ObjectId().toString(),
        eventId: testEvent._id.toString(),
        userId: testUser._id.toString(),
        ticketNumber: 'BATCH001',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
      },
      {
        ticketId: new mongoose.Types.ObjectId().toString(),
        eventId: testEvent._id.toString(),
        userId: testUser._id.toString(),
        ticketNumber: 'BATCH002',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
      }
    ];

    const batchResult = await qrService.generateBatchQRCodes(batchTickets);
    if (!batchResult.success || batchResult.data.successful.length !== 2) {
      throw new Error(`Failed to generate batch QR codes: ${batchResult.error}`);
    }
    console.log('✅ Batch QR codes generated successfully');

    // Test 10: Test Security Features
    console.log('\n📝 Test 10: Test Security Features');
    
    // Test tampered QR code
    const tamperedQR = secureQRString.replace('a', 'b'); // Tamper with the data
    const tamperResult = await qrService.validateSecureQRCode(tamperedQR);
    if (tamperResult.success) {
      throw new Error('Tampered QR code should not validate successfully');
    }
    console.log('✅ Tamper detection working correctly');

    // Test expired QR code
    const expiredTicketData = {
      ...ticketData,
      expiresAt: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
    };
    const expiredQRResult = await qrService.generateSecureQRCode(expiredTicketData);
    if (expiredQRResult.success) {
      // Wait a moment to ensure expiration
      setTimeout(async () => {
        const expiredValidateResult = await qrService.validateSecureQRCode(expiredQRResult.data.qrString);
        if (expiredValidateResult.success) {
          throw new Error('Expired QR code should not validate successfully');
        }
        console.log('✅ Expiration detection working correctly');
      }, 100);
    }

    // Clean up test data
    await Event.deleteMany({ title: /QR Test Event/ });
    await EventTicket.deleteMany({});
    await User.deleteMany({ email: /qrtest\.com/ });
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All QR Code Integration tests passed!');
    
  } catch (error) {
    console.error('\n❌ QR Integration test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runQRIntegrationTests();
}

module.exports = { runQRIntegrationTests };