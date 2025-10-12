const mongoose = require('mongoose');
const DigitalIDService = require('./services/DigitalIDService');
const AccessControlService = require('./services/AccessControlService');
const DigitalID = require('./models/DigitalID');
const AccessLog = require('./models/AccessLog');
const Facility = require('./models/Facility');
const User = require('./models/User');

// Test configuration
const TEST_DB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/pcc_portal_test_digital_id';

describe('Digital ID Service Unit Tests', () => {
  let digitalIDService;
  let accessControlService;
  let testUser;
  let testFacility;
  let testDigitalID;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(TEST_DB_URI);
    
    // Initialize services
    digitalIDService = new DigitalIDService();
    accessControlService = new AccessControlService();
    
    // Clean up test data
    await Promise.all([
      User.deleteMany({ email: /test.*@test\.com/ }),
      DigitalID.deleteMany({}),
      AccessLog.deleteMany({}),
      Facility.deleteMany({})
    ]);

    // Create test user
    testUser = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'test.user@test.com',
      studentId: 'TEST001',
      role: 'student',
      password: 'hashedpassword'
    });
    await testUser.save();

    // Create test facility
    testFacility = new Facility({
      facilityId: 'TEST_LIB',
      name: 'Test Library',
      type: 'library',
      location: 'Building A, Floor 1',
      capacity: 100,
      accessRequirements: [{
        role: 'student',
        accessType: 'time_limited',
        timeRestrictions: {
          startTime: '08:00',
          endTime: '20:00',
          daysOfWeek: [1, 2, 3, 4, 5] // Monday to Friday
        }
      }],
      isActive: true
    });
    await testFacility.save();
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: /test\.com$/ });
    await DigitalID.deleteMany({});
    await AccessLog.deleteMany({});
    await Facility.deleteMany({ facilityId: /^TEST_/ });
    
    // Close database connection
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up digital IDs and access logs before each test
    await DigitalID.dsAccess: false, reason: 'No permission for this facility' };
        }

        // Check if permission has expired
        if (permission.expiresAt && permission.expiresAt < currentTime) {
          return { hasAccess: false, reason: 'Permission has expired' };
        }

        // Check time restrictions
        if (permission.accessType === 'time_limited' && permission.timeRestrictions) {
          const { startTime, endTime, daysOfWeek } = permission.timeRestrictions;
          
          // Check day of week
          if (daysOfWeek && daysOfWeek.length > 0) {
            const currentDay = currentTime.getDay();
            if (!daysOfWeek.includes(currentDay)) {
              return { hasAccess: false, reason: 'Access not allowed on this day' };
            }
          }

          // Check time range
          if (startTime && endTime) {
            const currentTimeStr = currentTime.toTimeString().substring(0, 5);
            if (currentTimeStr < startTime || currentTimeStr > endTime) {
              return { hasAccess: false, reason: 'Access not allowed at this time' };
            }
          }
        }

        return { hasAccess: true, permission };
      };

      digitalIDSchema.methods.generateSecurityHash = function() {
        const crypto = require('crypto');
        const data = `${this.userId}:${this.qrCode}:${this.accessLevel}:${JSON.stringify(this.permissions)}`;
        return crypto.createHash('sha256').update(data).digest('hex');
      };

      digitalIDSchema.methods.validateSecurityHash = function() {
        const expectedHash = this.generateSecurityHash();
        return this.securityHash === expectedHash;
      };

      // Don't create actual model, just use for validation testing
      DigitalID = { schema: digitalIDSchema };
    });

    it('should validate required fields', function() {
      const requiredFields = ['userId', 'qrCode', 'accessLevel', 'expiresAt', 'securityHash'];
      
      requiredFields.forEach(field => {
        const schemaPath = DigitalID.schema.paths[field];
        expect(schemaPath).to.exist;
        expect(schemaPath.isRequired).to.be.true;
      });
    });

    it('should validate access level enum values', function() {
      const accessLevelPath = DigitalID.schema.paths.accessLevel;
      const enumValues = accessLevelPath.enumValues;
      
      expect(enumValues).to.include.members(['student', 'faculty', 'staff', 'admin', 'visitor']);
    });

    it('should validate time format in time restrictions', function() {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      
      // Valid times
      expect('08:00').to.match(timeRegex);
      expect('17:30').to.match(timeRegex);
      expect('23:59').to.match(timeRegex);
      expect('00:00').to.match(timeRegex);
      
      // Invalid times
      expect('25:00').to.not.match(timeRegex);
      expect('12:60').to.not.match(timeRegex);
      expect('8:00').to.match(timeRegex); // Single digit hour is valid
      expect('abc:def').to.not.match(timeRegex);
    });
  });

  describe('Access Control Logic', function() {
    it('should check facility access permissions correctly', function() {
      // Mock digital ID object
      const digitalID = {
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        permissions: [{
          facilityId: 'LIB001',
          facilityName: 'Main Library',
          accessType: 'full'
        }],
        get isExpired() {
          return this.expiresAt < new Date();
        },
        get isValid() {
          return this.isActive && !this.isExpired;
        },
        hasAccessToFacility: function(facilityId, currentTime = new Date()) {
          if (!this.isValid) {
            return { hasAccess: false, reason: 'Digital ID is inactive or expired' };
          }

          const permission = this.permissions.find(p => p.facilityId === facilityId);
          if (!permission) {
            return { hasAccess: false, reason: 'No permission for this facility' };
          }

          return { hasAccess: true, permission };
        }
      };

      // Test access to permitted facility
      const accessResult = digitalID.hasAccessToFacility('LIB001');
      expect(accessResult.hasAccess).to.be.true;

      // Test access to non-permitted facility
      const noAccessResult = digitalID.hasAccessToFacility('LAB001');
      expect(noAccessResult.hasAccess).to.be.false;
      expect(noAccessResult.reason).to.equal('No permission for this facility');
    });

    it('should enforce time-based access restrictions', function() {
      const digitalID = {
        isActive: true,
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
        }],
        get isExpired() {
          return this.expiresAt < new Date();
        },
        get isValid() {
          return this.isActive && !this.isExpired;
        },
        hasAccessToFacility: function(facilityId, currentTime = new Date()) {
          if (!this.isValid) {
            return { hasAccess: false, reason: 'Digital ID is inactive or expired' };
          }

          const permission = this.permissions.find(p => p.facilityId === facilityId);
          if (!permission) {
            return { hasAccess: false, reason: 'No permission for this facility' };
          }

          // Check time restrictions
          if (permission.accessType === 'time_limited' && permission.timeRestrictions) {
            const { startTime, endTime, daysOfWeek } = permission.timeRestrictions;
            
            // Check day of week
            if (daysOfWeek && daysOfWeek.length > 0) {
              const currentDay = currentTime.getDay();
              if (!daysOfWeek.includes(currentDay)) {
                return { hasAccess: false, reason: 'Access not allowed on this day' };
              }
            }

            // Check time range
            if (startTime && endTime) {
              const currentTimeStr = currentTime.toTimeString().substring(0, 5);
              if (currentTimeStr < startTime || currentTimeStr > endTime) {
                return { hasAccess: false, reason: 'Access not allowed at this time' };
              }
            }
          }

          return { hasAccess: true, permission };
        }
      };

      // Test access during allowed hours on a weekday
      const allowedTime = new Date();
      allowedTime.setHours(10, 0, 0, 0); // 10:00 AM
      // Set to next Monday
      allowedTime.setDate(allowedTime.getDate() + (1 - allowedTime.getDay() + 7) % 7);

      const allowedAccess = digitalID.hasAccessToFacility('LAB001', allowedTime);
      expect(allowedAccess.hasAccess).to.be.true;

      // Test access outside allowed hours
      const deniedTime = new Date();
      deniedTime.setHours(20, 0, 0, 0); // 8:00 PM
      deniedTime.setDate(deniedTime.getDate() + (1 - deniedTime.getDay() + 7) % 7);

      const deniedAccess = digitalID.hasAccessToFacility('LAB001', deniedTime);
      expect(deniedAccess.hasAccess).to.be.false;
      expect(deniedAccess.reason).to.include('time');

      // Test access on weekend
      const weekendTime = new Date();
      weekendTime.setHours(10, 0, 0, 0);
      weekendTime.setDate(weekendTime.getDate() + (0 - weekendTime.getDay() + 7) % 7); // Next Sunday

      const weekendAccess = digitalID.hasAccessToFacility('LAB001', weekendTime);
      expect(weekendAccess.hasAccess).to.be.false;
      expect(weekendAccess.reason).to.include('day');
    });

    it('should validate expired digital IDs', function() {
      const expiredID = {
        isActive: true,
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        permissions: [{
          facilityId: 'LIB001',
          facilityName: 'Main Library',
          accessType: 'full'
        }],
        get isExpired() {
          return this.expiresAt < new Date();
        },
        get isValid() {
          return this.isActive && !this.isExpired;
        },
        hasAccessToFacility: function(facilityId) {
          if (!this.isValid) {
            return { hasAccess: false, reason: 'Digital ID is inactive or expired' };
          }
          return { hasAccess: true };
        }
      };

      expect(expiredID.isExpired).to.be.true;
      expect(expiredID.isValid).to.be.false;

      const accessResult = expiredID.hasAccessToFacility('LIB001');
      expect(accessResult.hasAccess).to.be.false;
      expect(accessResult.reason).to.include('expired');
    });

    it('should validate inactive digital IDs', function() {
      const inactiveID = {
        isActive: false,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Future date
        permissions: [{
          facilityId: 'LIB001',
          facilityName: 'Main Library',
          accessType: 'full'
        }],
        get isExpired() {
          return this.expiresAt < new Date();
        },
        get isValid() {
          return this.isActive && !this.isExpired;
        },
        hasAccessToFacility: function(facilityId) {
          if (!this.isValid) {
            return { hasAccess: false, reason: 'Digital ID is inactive or expired' };
          }
          return { hasAccess: true };
        }
      };

      expect(inactiveID.isExpired).to.be.false;
      expect(inactiveID.isValid).to.be.false;

      const accessResult = inactiveID.hasAccessToFacility('LIB001');
      expect(accessResult.hasAccess).to.be.false;
      expect(accessResult.reason).to.include('inactive');
    });
  });

  describe('Facility Access Logic', function() {
    it('should check role-based access correctly', function() {
      const facility = {
        isActive: true,
        emergencyOverride: false,
        maintenanceMode: { isActive: false },
        capacity: 50,
        currentOccupancy: 10,
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
        }],
        operatingHours: {
          monday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
          tuesday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
          wednesday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
          thursday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
          friday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
          saturday: { isOpen: false },
          sunday: { isOpen: false }
        },
        get isCurrentlyOpen() {
          const now = new Date();
          const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          const currentDay = dayNames[now.getDay()];
          const currentTime = now.toTimeString().substring(0, 5);

          const daySchedule = this.operatingHours[currentDay];
          if (!daySchedule || !daySchedule.isOpen) return false;

          return currentTime >= daySchedule.openTime && currentTime <= daySchedule.closeTime;
        },
        checkRoleAccess: function(userRole, accessLevel = 'basic', currentTime = new Date()) {
          if (!this.isActive) {
            return { hasAccess: false, reason: 'Facility is inactive' };
          }

          if (this.emergencyOverride) {
            return { hasAccess: false, reason: 'Emergency lockdown in effect' };
          }

          // Find matching access requirement
          const accessReq = this.accessRequirements.find(req => req.role === userRole);
          if (!accessReq) {
            return { hasAccess: false, reason: 'No access permission for this role' };
          }

          // Check capacity
          if (this.capacity && this.currentOccupancy >= this.capacity) {
            return { hasAccess: false, reason: 'Facility is at full capacity' };
          }

          return { 
            hasAccess: true, 
            accessRequirement: accessReq
          };
        }
      };

      // Test student access
      const studentAccess = facility.checkRoleAccess('student');
      expect(studentAccess.hasAccess).to.be.true;

      // Test faculty access
      const facultyAccess = facility.checkRoleAccess('faculty');
      expect(facultyAccess.hasAccess).to.be.true;

      // Test unauthorized role
      const visitorAccess = facility.checkRoleAccess('visitor');
      expect(visitorAccess.hasAccess).to.be.false;
      expect(visitorAccess.reason).to.include('No access permission');

      // Test capacity limit
      facility.currentOccupancy = 50;
      const capacityAccess = facility.checkRoleAccess('student');
      expect(capacityAccess.hasAccess).to.be.false;
      expect(capacityAccess.reason).to.include('capacity');

      // Test emergency override
      facility.currentOccupancy = 10;
      facility.emergencyOverride = true;
      const emergencyAccess = facility.checkRoleAccess('faculty');
      expect(emergencyAccess.hasAccess).to.be.false;
      expect(emergencyAccess.reason).to.include('Emergency lockdown');
    });

    it('should calculate occupancy percentage correctly', function() {
      const facility = {
        capacity: 100,
        currentOccupancy: 25,
        get occupancyPercentage() {
          if (!this.capacity || this.capacity === 0) return 0;
          return Math.round((this.currentOccupancy / this.capacity) * 100);
        },
        get isAtCapacity() {
          return this.capacity && this.currentOccupancy >= this.capacity;
        }
      };

      expect(facility.occupancyPercentage).to.equal(25);
      expect(facility.isAtCapacity).to.be.false;

      facility.currentOccupancy = 100;
      expect(facility.occupancyPercentage).to.equal(100);
      expect(facility.isAtCapacity).to.be.true;

      facility.currentOccupancy = 150;
      expect(facility.occupancyPercentage).to.equal(150);
      expect(facility.isAtCapacity).to.be.true;
    });
  });

  describe('Security Hash Validation', function() {
    it('should generate consistent security hashes', function() {
      const crypto = require('crypto');
      
      const generateHash = (userId, qrCode, accessLevel, permissions) => {
        const data = `${userId}:${qrCode}:${accessLevel}:${JSON.stringify(permissions)}`;
        return crypto.createHash('sha256').update(data).digest('hex');
      };

      const userId = '507f1f77bcf86cd799439011';
      const qrCode = 'test-qr-code';
      const accessLevel = 'student';
      const permissions = [{ facilityId: 'LIB001', facilityName: 'Library' }];

      const hash1 = generateHash(userId, qrCode, accessLevel, permissions);
      const hash2 = generateHash(userId, qrCode, accessLevel, permissions);

      expect(hash1).to.equal(hash2);
      expect(hash1).to.be.a('string');
      expect(hash1.length).to.equal(64); // SHA256 hex length

      // Different data should produce different hash
      const hash3 = generateHash(userId, 'different-qr', accessLevel, permissions);
      expect(hash1).to.not.equal(hash3);
    });
  });
});

// Run the tests if this file is executed directly
if (require.main === module) {
  console.log('Running Digital ID Unit Tests...');
  const { execSync } = require('child_process');
  try {
    execSync('npx mocha backend/test-digital-id-unit.js --timeout 5000', { stdio: 'inherit' });
  } catch (error) {
    console.error('Test execution failed:', error.message);
    process.exit(1);
  }
}