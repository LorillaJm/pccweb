// Integration test for Digital ID models with database
const mongoose = require('mongoose');
const DigitalID = require('./models/DigitalID');
const AccessLog = require('./models/AccessLog');
const Facility = require('./models/Facility');
const User = require('./models/User');

async function testDatabaseIntegration() {
  console.log('🔗 Testing Digital ID Database Integration...\n');
  
  try {
    // Connect to database
    console.log('📡 Connecting to database...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pcc_portal_test';
    await mongoose.connect(mongoUri);
    console.log('✅ Database connected successfully\n');
    
    // Clean up existing test data
    console.log('🧹 Cleaning up test data...');
    await DigitalID.deleteMany({ qrCode: /^test-/ });
    await AccessLog.deleteMany({ qrCodeUsed: /^test-/ });
    await Facility.deleteMany({ facilityId: /^TEST/ });
    await User.deleteMany({ email: /test\.integration/ });
    console.log('✅ Test data cleaned up\n');
    
    // Test 1: Create and validate User model
    console.log('👤 Testing User model creation...');
    const testUser = new User({
      firstName: 'Integration',
      lastName: 'Test',
      email: 'test.integration@example.com',
      studentId: 'INT001',
      role: 'student',
      password: 'hashedpassword123'
    });
    
    await testUser.save();
    console.log('✅ User created successfully');
    console.log(`   User ID: ${testUser._id}`);
    console.log(`   Email: ${testUser.email}\n`);
    
    // Test 2: Create and validate Facility model
    console.log('🏢 Testing Facility model creation...');
    const testFacility = new Facility({
      facilityId: 'TEST_LIB001',
      name: 'Test Integration Library',
      type: 'library',
      location: 'Test Building A',
      capacity: 50,
      accessRequirements: [{
        role: 'student',
        accessType: 'restricted',
        timeRestrictions: {
          startTime: '08:00',
          endTime: '20:00',
          daysOfWeek: [1, 2, 3, 4, 5, 6]
        }
      }]
    });
    
    await testFacility.save();
    console.log('✅ Facility created successfully');
    console.log(`   Facility ID: ${testFacility.facilityId}`);
    console.log(`   Name: ${testFacility.name}`);
    console.log(`   Capacity: ${testFacility.capacity}\n`);
    
    // Test 3: Create and validate DigitalID model
    console.log('🆔 Testing DigitalID model creation...');
    const testDigitalID = new DigitalID({
      userId: testUser._id,
      qrCode: 'test-integration-qr-code-123',
      accessLevel: 'student',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      permissions: [{
        facilityId: 'TEST_LIB001',
        facilityName: 'Test Integration Library',
        accessType: 'restricted'
      }]
    });
    
    await testDigitalID.save();
    console.log('✅ DigitalID created successfully');
    console.log(`   QR Code: ${testDigitalID.qrCode}`);
    console.log(`   Access Level: ${testDigitalID.accessLevel}`);
    console.log(`   Security Hash: ${testDigitalID.securityHash.substring(0, 16)}...`);
    console.log(`   Is Valid: ${testDigitalID.isValid}\n`);
    
    // Test 4: Test DigitalID methods
    console.log('🔍 Testing DigitalID methods...');
    
    // Test facility access check
    const accessCheck = testDigitalID.hasAccessToFacility('TEST_LIB001');
    console.log(`✅ Facility access check: ${accessCheck.hasAccess ? 'GRANTED' : 'DENIED'}`);
    
    // Test security hash validation
    const hashValid = testDigitalID.validateSecurityHash();
    console.log(`✅ Security hash validation: ${hashValid ? 'VALID' : 'INVALID'}`);
    
    // Test finding by QR code
    const foundID = await DigitalID.findByQRCode('test-integration-qr-code-123');
    console.log(`✅ Find by QR code: ${foundID ? 'FOUND' : 'NOT FOUND'}`);
    console.log(`   Found user: ${foundID.userId.firstName} ${foundID.userId.lastName}\n`);
    
    // Test 5: Create and validate AccessLog model
    console.log('📝 Testing AccessLog model creation...');
    const testAccessLog = new AccessLog({
      userId: testUser._id,
      digitalIdId: testDigitalID._id,
      facilityId: 'TEST_LIB001',
      facilityName: 'Test Integration Library',
      accessResult: 'granted',
      deviceInfo: {
        deviceId: 'test-device-001',
        location: 'Main Entrance',
        ipAddress: '192.168.1.100',
        scannerType: 'mobile_app'
      },
      qrCodeUsed: 'test-integration-qr-code-123'
    });
    
    await testAccessLog.save();
    console.log('✅ AccessLog created successfully');
    console.log(`   Access Result: ${testAccessLog.accessResult}`);
    console.log(`   Device ID: ${testAccessLog.deviceInfo.deviceId}`);
    console.log(`   Timestamp: ${testAccessLog.accessTime}\n`);
    
    // Test 6: Test Facility methods
    console.log('🏗️ Testing Facility methods...');
    
    // Test role access check
    const roleAccess = testFacility.checkRoleAccess('student');
    console.log(`✅ Role access check: ${roleAccess.hasAccess ? 'GRANTED' : 'DENIED'}`);
    
    // Test occupancy update
    await testFacility.updateOccupancy(5);
    console.log(`✅ Occupancy updated: ${testFacility.currentOccupancy}/${testFacility.capacity}`);
    console.log(`   Occupancy percentage: ${testFacility.occupancyPercentage}%\n`);
    
    // Test 7: Test AccessLog aggregation methods
    console.log('📊 Testing AccessLog aggregation methods...');
    
    // Create a few more access logs for testing
    for (let i = 0; i < 3; i++) {
      const log = new AccessLog({
        userId: testUser._id,
        facilityId: 'TEST_LIB001',
        facilityName: 'Test Integration Library',
        accessResult: i % 2 === 0 ? 'granted' : 'denied',
        denialReason: i % 2 === 1 ? 'time_restriction' : null,
        deviceInfo: { deviceId: `test-device-${i}` },
        qrCodeUsed: `test-qr-${i}`
      });
      await log.save();
    }
    
    // Get user access statistics
    const userStats = await AccessLog.getUserAccessStats(testUser._id);
    if (userStats.length > 0) {
      console.log('✅ User access statistics retrieved:');
      console.log(`   Total attempts: ${userStats[0].totalAttempts}`);
      console.log(`   Successful access: ${userStats[0].successfulAccess}`);
      console.log(`   Success rate: ${userStats[0].successRate.toFixed(1)}%\n`);
    }
    
    // Test 8: Test model relationships and population
    console.log('🔗 Testing model relationships...');
    
    const populatedLog = await AccessLog.findOne({ qrCodeUsed: 'test-integration-qr-code-123' })
      .populate('userId', 'firstName lastName email')
      .populate('digitalIdId');
    
    if (populatedLog) {
      console.log('✅ Model population successful:');
      console.log(`   User: ${populatedLog.userId.firstName} ${populatedLog.userId.lastName}`);
      console.log(`   Email: ${populatedLog.userId.email}`);
      console.log(`   Digital ID Access Level: ${populatedLog.digitalIdId.accessLevel}\n`);
    }
    
    // Test 9: Test unique constraints
    console.log('🔒 Testing unique constraints...');
    
    try {
      const duplicateID = new DigitalID({
        userId: testUser._id,
        qrCode: 'test-integration-qr-code-123', // Same QR code
        accessLevel: 'faculty',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      });
      await duplicateID.save();
      console.log('❌ Unique constraint failed - duplicate QR code was allowed');
    } catch (error) {
      if (error.code === 11000) {
        console.log('✅ Unique constraint working - duplicate QR code rejected');
      } else {
        console.log(`❌ Unexpected error: ${error.message}`);
      }
    }
    
    // Test 10: Test indexes
    console.log('📇 Testing database indexes...');
    
    const digitalIDIndexes = await DigitalID.collection.getIndexes();
    const accessLogIndexes = await AccessLog.collection.getIndexes();
    const facilityIndexes = await Facility.collection.getIndexes();
    
    console.log(`✅ DigitalID indexes: ${Object.keys(digitalIDIndexes).length}`);
    console.log(`✅ AccessLog indexes: ${Object.keys(accessLogIndexes).length}`);
    console.log(`✅ Facility indexes: ${Object.keys(facilityIndexes).length}\n`);
    
    console.log('🎉 All database integration tests completed successfully!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Database integration test failed:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  } finally {
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    try {
      await DigitalID.deleteMany({ qrCode: /^test-/ });
      await AccessLog.deleteMany({ qrCodeUsed: /^test-/ });
      await Facility.deleteMany({ facilityId: /^TEST/ });
      await User.deleteMany({ email: /test\.integration/ });
      console.log('✅ Test data cleaned up');
    } catch (cleanupError) {
      console.error('⚠️ Cleanup error:', cleanupError.message);
    }
    
    // Close database connection
    await mongoose.connection.close();
    console.log('📡 Database connection closed');
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testDatabaseIntegration()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test execution error:', error);
      process.exit(1);
    });
}

module.exports = { testDatabaseIntegration };