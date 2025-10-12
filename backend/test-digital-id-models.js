const mongoose = require('mongoose');
const { expect } = require('chai');
const DigitalID = require('./models/DigitalID');
const AccessLog = require('./models/AccessLog');
const Facility = require('./models/Facility');
const User = require('./models/User');
const AccessControlService = require('./services/AccessControlService');

describe('Digital ID Models and Access Control', function() {
  this.timeout(10000);

  before(async function() {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pcc_portal_test');
    }
  });

  beforeEach(async function() {
    // Clean up test data
    await DigitalID.deleteMany({});
    await AccessLog.deleteMany({});
    await Facility.deleteMany({});
    await User.deleteMany({});
  });

  after(async function() {
    // Clean up and close connection
    await DigitalID.deleteMany({});
    await AccessLog.deleteMany({});
    await Facility.deleteMany({});
    await User.deleteMany({});
  });

  describe('DigitalID Model', function() {
    let testUser;

    beforeEach(async function() {
      // Create test user
      testUser = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        studentId: 'TEST001',
        role: 'student',
        password: 'hashedpassword'
      });
      await testUser.save();
    });

    it('should create a digital ID with required fields', async function() {
      const digitalID = new DigitalID({
        userId: testUser._id,
        qrCode: 'test-qr-code-123',
        accessLevel: 'student',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      });

      await digitalID.save();
      expect(digitalID.userId.toString()).to.equal(testUser._id.toString());
      expect(digitalID.qrCode).to.equal('test-qr-code-123');
      expect(digitalID.accessLevel).to.equal('student');
      expect(digitalID.isActive).to.be.true;
      expect(digitalID.securityHash).to.exist;
    });

    it('should generate security hash automatically', async function() {
      const digitalID = new DigitalID({
        userId: testUser._id,
        qrCode: 'test-qr-code-456',
        accessLevel: 'faculty',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      });

      await digitalID.save();
      expect(digitalID.securityHash).to.exist;
      expect(digitalID.securityHash).to.be.a('string');
      expect(digitalID.securityHash.length).to.equal(64); // SHA256 hex length
    });

    it('should validate security hash correctly', async function() {
      const digitalID = new DigitalID({
        userId: testUser._id,
        qrCode: 'test-qr-code-789',
        accessLevel: 'staff',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      });

      await digitalID.save();
      expect(digitalID.validateSecurityHash()).to.be.true;

      // Tamper with the QR code
      digitalID.qrCode = 'tampered-qr-code';
      expect(digitalID.validateSecurityHash()).to.be.false;
    });

    it('should check facility access permissions correctly', async function() {
      const digitalID = new DigitalID({
        userId: testUser._id,
        qrCode: 'test-qr-code-facility',
        accessLevel: 'student',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        permissions: [{
          facilityId: 'LIB001',
          facilityName: 'Main Library',
          accessType: 'full'
        }]
      });

      await digitalID.save();

      // Test access to permitted facility
      const accessResult = digitalID.hasAccessToFacility('LIB001');
      expect(accessResult.hasAccess).to.be.true;

      // Test access to non-permitted facility
      const noAccessResult = digitalID.hasAccessToFacility('LAB001');
      expect(noAccessResult.hasAccess).to.be.false;
    });

    it('should enforce time-based access restrictions', async function() {
      const digitalID = new DigitalID({
        userId: testUser._id,
        qrCode: 'test-qr-code-time',
        accessLevel: 'student',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        permissions: [{
          facilityId: 'LAB001',
          facilityName: 'Computer Lab',
          accessType: 'time_limited',
          timeRestrictions: {
            startTime: '08:00',
            endTime: '17:00',
            daysOfWeek: [1, 2, 3, 4, 5] // Monday to Friday
          }
        }]
      });

      await digitalID.save();

      // Test access during allowed hours (assuming it's a weekday)
      const allowedTime = new Date();
      allowedTime.setHours(10, 0, 0, 0); // 10:00 AM
      allowedTime.setDate(allowedTime.getDate() + (1 - allowedTime.getDay() + 7) % 7); // Next Monday

      const allowedAccess = digitalID.hasAccessToFacility('LAB001', allowedTime);
      expect(allowedAccess.hasAccess).to.be.true;

      // Test access outside allowed hours
      const deniedTime = new Date();
      deniedTime.setHours(20, 0, 0, 0); // 8:00 PM
      deniedTime.setDate(deniedTime.getDate() + (1 - deniedTime.getDay() + 7) % 7); // Next Monday

      const deniedAccess = digitalID.hasAccessToFacility('LAB001', deniedTime);
      expect(deniedAccess.hasAccess).to.be.false;
      expect(deniedAccess.reason).to.include('time');
    });

    it('should add and remove facility permissions', async function() {
      const digitalID = new DigitalID({
        userId: testUser._id,
        qrCode: 'test-qr-code-permissions',
        accessLevel: 'faculty',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      });

      await digitalID.save();

      // Add facility permission
      await digitalID.addFacilityPermission('GYM001', 'Main Gymnasium', 'full');
      expect(digitalID.permissions).to.have.length(1);
      expect(digitalID.permissions[0].facilityId).to.equal('GYM001');

      // Remove facility permission
      await digitalID.removeFacilityPermission('GYM001');
      expect(digitalID.permissions).to.have.length(0);
    });

    it('should find digital ID by QR code', async function() {
      const digitalID = new DigitalID({
        userId: testUser._id,
        qrCode: 'unique-qr-code-search',
        accessLevel: 'admin',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      });

      await digitalID.save();

      const foundID = await DigitalID.findByQRCode('unique-qr-code-search');
      expect(foundID).to.exist;
      expect(foundID.qrCode).to.equal('unique-qr-code-search');
      expect(foundID.userId.email).to.equal('john.doe@test.com');
    });

    it('should check if digital ID is expired', async function() {
      // Create expired digital ID
      const expiredID = new DigitalID({
        userId: testUser._id,
        qrCode: 'expired-qr-code',
        accessLevel: 'student',
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday
      });

      await expiredID.save();
      expect(expiredID.isExpired).to.be.true;
      expect(expiredID.isValid).to.be.false;

      // Create valid digital ID
      const validID = new DigitalID({
        userId: testUser._id,
        qrCode: 'valid-qr-code',
        accessLevel: 'student',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isActive: false // Make it inactive
      });

      // First delete the expired one to avoid unique constraint
      await DigitalID.deleteOne({ _id: expiredID._id });
      await validID.save();
      expect(validID.isExpired).to.be.false;
      expect(validID.isValid).to.be.false; // Because it's inactive
    });
  });

  describe('Facility Model', function() {
    it('should create a facility with required fields', async function() {
      const facility = new Facility({
        facilityId: 'LIB001',
        name: 'Main Library',
        type: 'library',
        location: 'Building A, Ground Floor',
        capacity: 100,
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

      await facility.save();
      expect(facility.facilityId).to.equal('LIB001');
      expect(facility.name).to.equal('Main Library');
      expect(facility.type).to.equal('library');
      expect(facility.isActive).to.be.true;
    });

    it('should check role access correctly', async function() {
      const facility = new Facility({
        facilityId: 'LAB001',
        name: 'Computer Lab',
        type: 'laboratory',
        location: 'Building B, 2nd Floor',
        capacity: 30,
        accessRequirements: [{
          role: 'student',
          accessType: 'time_limited',
          timeRestrictions: {
            startTime: '08:00',
            endTime: '17:00',
            daysOfWeek: [1, 2, 3, 4, 5]
          }
        }, {
          role: 'faculty',
          accessType: 'full'
        }]
      });

      await facility.save();

      // Test student access during allowed time
      const allowedTime = new Date();
      allowedTime.setHours(10, 0, 0, 0);
      allowedTime.setDate(allowedTime.getDate() + (1 - allowedTime.getDay() + 7) % 7); // Next Monday

      const studentAccess = facility.checkRoleAccess('student', 'basic', allowedTime);
      expect(studentAccess.hasAccess).to.be.true;

      // Test faculty access (should always have access)
      const facultyAccess = facility.checkRoleAccess('faculty', 'basic');
      expect(facultyAccess.hasAccess).to.be.true;

      // Test unauthorized role
      const visitorAccess = facility.checkRoleAccess('visitor', 'basic');
      expect(visitorAccess.hasAccess).to.be.false;
    });

    it('should update occupancy correctly', async function() {
      const facility = new Facility({
        facilityId: 'GYM001',
        name: 'Main Gymnasium',
        type: 'gym',
        location: 'Sports Complex',
        capacity: 50,
        currentOccupancy: 10
      });

      await facility.save();

      // Increase occupancy
      await facility.updateOccupancy(5);
      expect(facility.currentOccupancy).to.equal(15);

      // Decrease occupancy
      await facility.updateOccupancy(-3);
      expect(facility.currentOccupancy).to.equal(12);

      // Test capacity limit
      await facility.updateOccupancy(50);
      expect(facility.currentOccupancy).to.equal(50); // Should not exceed capacity

      // Test minimum limit
      await facility.updateOccupancy(-100);
      expect(facility.currentOccupancy).to.equal(0); // Should not go below 0
    });

    it('should calculate occupancy percentage correctly', function() {
      const facility = new Facility({
        facilityId: 'CAFE001',
        name: 'Main Cafeteria',
        type: 'cafeteria',
        location: 'Student Center',
        capacity: 200,
        currentOccupancy: 50
      });

      expect(facility.occupancyPercentage).to.equal(25);
      expect(facility.isAtCapacity).to.be.false;

      facility.currentOccupancy = 200;
      expect(facility.occupancyPercentage).to.equal(100);
      expect(facility.isAtCapacity).to.be.true;
    });

    it('should set maintenance mode correctly', async function() {
      const facility = new Facility({
        facilityId: 'LAB002',
        name: 'Science Lab',
        type: 'laboratory',
        location: 'Science Building'
      });

      await facility.save();

      const startTime = new Date();
      const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now

      await facility.setMaintenanceMode(true, startTime, endTime, 'Equipment upgrade', {
        name: 'John Maintenance',
        phone: '123-456-7890',
        email: 'maintenance@test.com'
      });

      expect(facility.maintenanceMode.isActive).to.be.true;
      expect(facility.maintenanceMode.reason).to.equal('Equipment upgrade');
      expect(facility.maintenanceMode.contactPerson.name).to.equal('John Maintenance');
    });
  });

  describe('AccessLog Model', function() {
    let testUser, testFacility;

    beforeEach(async function() {
      testUser = new User({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@test.com',
        studentId: 'TEST002',
        role: 'student',
        password: 'hashedpassword'
      });
      await testUser.save();

      testFacility = new Facility({
        facilityId: 'TEST001',
        name: 'Test Facility',
        type: 'classroom',
        location: 'Test Building'
      });
      await testFacility.save();
    });

    it('should create access log with required fields', async function() {
      const accessLog = new AccessLog({
        userId: testUser._id,
        facilityId: 'TEST001',
        facilityName: 'Test Facility',
        accessResult: 'granted',
        deviceInfo: {
          deviceId: 'device123',
          location: 'Main Entrance',
          ipAddress: '192.168.1.100',
          scannerType: 'mobile_app'
        },
        qrCodeUsed: 'test-qr-code'
      });

      await accessLog.save();
      expect(accessLog.userId.toString()).to.equal(testUser._id.toString());
      expect(accessLog.facilityId).to.equal('TEST001');
      expect(accessLog.accessResult).to.equal('granted');
      expect(accessLog.wasSuccessful).to.be.true;
    });

    it('should detect suspicious activity patterns', async function() {
      const accessLog = new AccessLog({
        userId: testUser._id,
        facilityId: 'TEST001',
        facilityName: 'Test Facility',
        accessResult: 'denied',
        denialReason: 'invalid_qr_code',
        deviceInfo: {
          deviceId: 'device123'
        }
      });

      // Create multiple failed attempts to trigger suspicious activity detection
      for (let i = 0; i < 3; i++) {
        const log = new AccessLog({
          userId: testUser._id,
          facilityId: 'TEST001',
          facilityName: 'Test Facility',
          accessResult: 'denied',
          denialReason: 'invalid_qr_code',
          deviceInfo: {
            deviceId: 'device123'
          }
        });
        await log.save();
      }

      await accessLog.save();
      expect(accessLog.securityFlags.multipleAttempts).to.be.true;
      expect(accessLog.securityFlags.isSuspiciousActivity).to.be.true;
    });

    it('should get user access statistics', async function() {
      // Create multiple access logs
      const logs = [
        { accessResult: 'granted', facilityId: 'TEST001' },
        { accessResult: 'granted', facilityId: 'TEST002' },
        { accessResult: 'denied', facilityId: 'TEST001', denialReason: 'time_restriction' },
        { accessResult: 'granted', facilityId: 'TEST003' }
      ];

      for (const logData of logs) {
        const log = new AccessLog({
          userId: testUser._id,
          facilityName: 'Test Facility',
          deviceInfo: { deviceId: 'device123' },
          ...logData
        });
        await log.save();
      }

      const stats = await AccessLog.getUserAccessStats(testUser._id);
      expect(stats).to.have.length(1);
      expect(stats[0].totalAttempts).to.equal(4);
      expect(stats[0].successfulAccess).to.equal(3);
      expect(stats[0].deniedAccess).to.equal(1);
      expect(stats[0].successRate).to.equal(75);
      expect(stats[0].uniqueFacilitiesCount).to.equal(3);
    });

    it('should validate IP address format', async function() {
      // Valid IPv4
      const validLog = new AccessLog({
        userId: testUser._id,
        facilityId: 'TEST001',
        facilityName: 'Test Facility',
        accessResult: 'granted',
        deviceInfo: {
          ipAddress: '192.168.1.1'
        }
      });

      await validLog.save();
      expect(validLog.deviceInfo.ipAddress).to.equal('192.168.1.1');

      // Invalid IP should fail validation
      try {
        const invalidLog = new AccessLog({
          userId: testUser._id,
          facilityId: 'TEST001',
          facilityName: 'Test Facility',
          accessResult: 'granted',
          deviceInfo: {
            ipAddress: '999.999.999.999'
          }
        });
        await invalidLog.save();
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.message).to.include('Invalid IP address format');
      }
    });
  });

  describe('AccessControlService', function() {
    let testUser, testFacility, testDigitalID;

    beforeEach(async function() {
      testUser = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'test.user@test.com',
        studentId: 'TEST003',
        role: 'student',
        password: 'hashedpassword'
      });
      await testUser.save();

      testFacility = new Facility({
        facilityId: 'SERVICE001',
        name: 'Service Test Facility',
        type: 'library',
        location: 'Test Building',
        capacity: 50,
        accessRequirements: [{
          role: 'student',
          accessType: 'restricted'
        }]
      });
      await testFacility.save();

      testDigitalID = new DigitalID({
        userId: testUser._id,
        qrCode: 'service-test-qr-code',
        accessLevel: 'student',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        permissions: [{
          facilityId: 'SERVICE001',
          facilityName: 'Service Test Facility',
          accessType: 'full'
        }]
      });
      await testDigitalID.save();
    });

    it('should validate access successfully for valid QR code', async function() {
      const deviceInfo = {
        deviceId: 'test-device-001',
        location: 'Main Entrance',
        ipAddress: '192.168.1.50',
        scannerType: 'mobile_app'
      };

      const result = await AccessControlService.validateAccess(
        'service-test-qr-code',
        'SERVICE001',
        deviceInfo
      );

      expect(result.success).to.be.true;
      expect(result.accessGranted).to.be.true;
      expect(result.user.email).to.equal('test.user@test.com');
      expect(result.facility.name).to.equal('Service Test Facility');
    });

    it('should deny access for invalid QR code', async function() {
      const result = await AccessControlService.validateAccess(
        'invalid-qr-code',
        'SERVICE001',
        { deviceId: 'test-device-001' }
      );

      expect(result.success).to.be.false;
      expect(result.accessGranted).to.be.false;
      expect(result.reason).to.equal('invalid_qr_code');
    });

    it('should deny access for expired digital ID', async function() {
      // Create expired digital ID
      const expiredID = new DigitalID({
        userId: testUser._id,
        qrCode: 'expired-service-qr-code',
        accessLevel: 'student',
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        permissions: [{
          facilityId: 'SERVICE001',
          facilityName: 'Service Test Facility',
          accessType: 'full'
        }]
      });

      // Remove existing digital ID to avoid unique constraint
      await DigitalID.deleteOne({ _id: testDigitalID._id });
      await expiredID.save();

      const result = await AccessControlService.validateAccess(
        'expired-service-qr-code',
        'SERVICE001',
        { deviceId: 'test-device-001' }
      );

      expect(result.success).to.be.false;
      expect(result.accessGranted).to.be.false;
      expect(result.reason).to.equal('expired_id');
    });

    it('should generate digital ID successfully', async function() {
      // Remove existing digital ID
      await DigitalID.deleteOne({ _id: testDigitalID._id });

      const permissions = [{
        facilityId: 'LIB001',
        facilityName: 'Main Library',
        accessType: 'restricted'
      }];

      const result = await AccessControlService.generateDigitalID(
        testUser._id,
        'student',
        permissions
      );

      expect(result.success).to.be.true;
      expect(result.digitalID.userId.toString()).to.equal(testUser._id.toString());
      expect(result.digitalID.accessLevel).to.equal('student');
      expect(result.digitalID.permissions).to.have.length(1);
    });

    it('should update access permissions', async function() {
      const newPermissions = [{
        facilityId: 'LAB001',
        facilityName: 'Computer Lab',
        accessType: 'time_limited'
      }, {
        facilityId: 'GYM001',
        facilityName: 'Gymnasium',
        accessType: 'restricted'
      }];

      const result = await AccessControlService.updateAccessPermissions(
        testUser._id,
        newPermissions
      );

      expect(result.success).to.be.true;
      expect(result.digitalID.permissions).to.have.length(2);
      expect(result.digitalID.permissions[0].facilityId).to.equal('LAB001');
    });

    it('should deactivate digital ID', async function() {
      const result = await AccessControlService.deactivateDigitalID(
        testUser._id,
        'Security violation'
      );

      expect(result.success).to.be.true;

      // Verify digital ID is deactivated
      const updatedID = await DigitalID.findById(testDigitalID._id);
      expect(updatedID.isActive).to.be.false;
      expect(updatedID.metadata.suspensionReason).to.equal('Security violation');
    });

    it('should get user access statistics', async function() {
      // Create some access logs
      const logs = [
        { accessResult: 'granted' },
        { accessResult: 'granted' },
        { accessResult: 'denied', denialReason: 'time_restriction' }
      ];

      for (const logData of logs) {
        const log = new AccessLog({
          userId: testUser._id,
          facilityId: 'SERVICE001',
          facilityName: 'Service Test Facility',
          deviceInfo: { deviceId: 'test-device' },
          ...logData
        });
        await log.save();
      }

      const result = await AccessControlService.getUserAccessStats(testUser._id);
      expect(result.success).to.be.true;
      expect(result.stats.totalAttempts).to.equal(3);
      expect(result.stats.successfulAccess).to.equal(2);
      expect(result.stats.deniedAccess).to.equal(1);
    });

    it('should handle emergency lockdown', async function() {
      const adminUserId = new mongoose.Types.ObjectId();
      
      const result = await AccessControlService.emergencyLockdown(
        adminUserId,
        'Security threat detected'
      );

      expect(result.success).to.be.true;

      // Verify all facilities are in emergency override
      const facilities = await Facility.find({ emergencyOverride: true });
      expect(facilities).to.have.length.greaterThan(0);
    });

    it('should lift emergency lockdown', async function() {
      const adminUserId = new mongoose.Types.ObjectId();
      
      // First activate lockdown
      await AccessControlService.emergencyLockdown(adminUserId, 'Test lockdown');
      
      // Then lift it
      const result = await AccessControlService.liftEmergencyLockdown(adminUserId);
      expect(result.success).to.be.true;

      // Verify no facilities are in emergency override
      const facilities = await Facility.find({ emergencyOverride: true });
      expect(facilities).to.have.length(0);
    });
  });
});

// Run the tests if this file is executed directly
if (require.main === module) {
  const { execSync } = require('child_process');
  try {
    execSync('npm test -- --grep "Digital ID Models and Access Control"', { stdio: 'inherit' });
  } catch (error) {
    console.error('Test execution failed:', error.message);
    process.exit(1);
  }
}