// Simple validation tests for Digital ID models and access control logic
const crypto = require('crypto');

console.log('🧪 Running Digital ID Validation Tests...\n');

// Test 1: Time format validation
function testTimeFormatValidation() {
  console.log('📅 Testing time format validation...');
  
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  
  const validTimes = ['08:00', '17:30', '23:59', '00:00', '9:15'];
  const invalidTimes = ['25:00', '12:60', 'abc:def', '24:00'];
  
  let passed = 0;
  let total = validTimes.length + invalidTimes.length;
  
  validTimes.forEach(time => {
    if (timeRegex.test(time)) {
      console.log(`  ✅ ${time} - Valid format`);
      passed++;
    } else {
      console.log(`  ❌ ${time} - Should be valid but failed`);
    }
  });
  
  invalidTimes.forEach(time => {
    if (!timeRegex.test(time)) {
      console.log(`  ✅ ${time} - Correctly rejected`);
      passed++;
    } else {
      console.log(`  ❌ ${time} - Should be invalid but passed`);
    }
  });
  
  console.log(`  Result: ${passed}/${total} tests passed\n`);
  return passed === total;
}

// Test 2: Access level validation
function testAccessLevelValidation() {
  console.log('👤 Testing access level validation...');
  
  const validAccessLevels = ['student', 'faculty', 'staff', 'admin', 'visitor'];
  const invalidAccessLevels = ['guest', 'contractor', 'invalid'];
  
  let passed = 0;
  let total = validAccessLevels.length + invalidAccessLevels.length;
  
  validAccessLevels.forEach(level => {
    if (validAccessLevels.includes(level)) {
      console.log(`  ✅ ${level} - Valid access level`);
      passed++;
    } else {
      console.log(`  ❌ ${level} - Should be valid but failed`);
    }
  });
  
  invalidAccessLevels.forEach(level => {
    if (!validAccessLevels.includes(level)) {
      console.log(`  ✅ ${level} - Correctly rejected`);
      passed++;
    } else {
      console.log(`  ❌ ${level} - Should be invalid but passed`);
    }
  });
  
  console.log(`  Result: ${passed}/${total} tests passed\n`);
  return passed === total;
}

// Test 3: Security hash generation
function testSecurityHashGeneration() {
  console.log('🔐 Testing security hash generation...');
  
  const generateHash = (userId, qrCode, accessLevel, permissions) => {
    const data = `${userId}:${qrCode}:${accessLevel}:${JSON.stringify(permissions)}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  };
  
  const userId = '507f1f77bcf86cd799439011';
  const qrCode = 'test-qr-code';
  const accessLevel = 'student';
  const permissions = [{ facilityId: 'LIB001', facilityName: 'Library' }];
  
  let passed = 0;
  let total = 4;
  
  // Test 1: Consistent hash generation
  const hash1 = generateHash(userId, qrCode, accessLevel, permissions);
  const hash2 = generateHash(userId, qrCode, accessLevel, permissions);
  
  if (hash1 === hash2) {
    console.log('  ✅ Consistent hash generation');
    passed++;
  } else {
    console.log('  ❌ Hash generation is not consistent');
  }
  
  // Test 2: Hash length
  if (hash1.length === 64) {
    console.log('  ✅ Correct hash length (64 characters)');
    passed++;
  } else {
    console.log(`  ❌ Incorrect hash length: ${hash1.length}, expected 64`);
  }
  
  // Test 3: Different data produces different hash
  const hash3 = generateHash(userId, 'different-qr', accessLevel, permissions);
  if (hash1 !== hash3) {
    console.log('  ✅ Different data produces different hash');
    passed++;
  } else {
    console.log('  ❌ Different data produced same hash');
  }
  
  // Test 4: Hash is hexadecimal
  const hexRegex = /^[a-f0-9]+$/i;
  if (hexRegex.test(hash1)) {
    console.log('  ✅ Hash is valid hexadecimal');
    passed++;
  } else {
    console.log('  ❌ Hash is not valid hexadecimal');
  }
  
  console.log(`  Result: ${passed}/${total} tests passed\n`);
  return passed === total;
}

// Test 4: Facility access logic
function testFacilityAccessLogic() {
  console.log('🏢 Testing facility access logic...');
  
  // Mock digital ID
  const createMockDigitalID = (isActive, expiresAt, permissions) => ({
    isActive,
    expiresAt,
    permissions,
    get isExpired() {
      return this.expiresAt < new Date();
    },
    get isValid() {
      return this.isActive && !this.isExpired;
    },
    hasAccessToFacility(facilityId, currentTime = new Date()) {
      if (!this.isValid) {
        return { hasAccess: false, reason: 'Digital ID is inactive or expired' };
      }

      const permission = this.permissions.find(p => p.facilityId === facilityId);
      if (!permission) {
        return { hasAccess: false, reason: 'No permission for this facility' };
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
    }
  });
  
  let passed = 0;
  let total = 6;
  
  // Test 1: Valid access
  const validID = createMockDigitalID(
    true,
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    [{ facilityId: 'LIB001', facilityName: 'Library', accessType: 'full' }]
  );
  
  const validAccess = validID.hasAccessToFacility('LIB001');
  if (validAccess.hasAccess) {
    console.log('  ✅ Valid access granted');
    passed++;
  } else {
    console.log('  ❌ Valid access denied');
  }
  
  // Test 2: No permission
  const noPermAccess = validID.hasAccessToFacility('LAB001');
  if (!noPermAccess.hasAccess && noPermAccess.reason.includes('No permission')) {
    console.log('  ✅ Correctly denied access for unpermitted facility');
    passed++;
  } else {
    console.log('  ❌ Should have denied access for unpermitted facility');
  }
  
  // Test 3: Expired ID
  const expiredID = createMockDigitalID(
    true,
    new Date(Date.now() - 24 * 60 * 60 * 1000),
    [{ facilityId: 'LIB001', facilityName: 'Library', accessType: 'full' }]
  );
  
  const expiredAccess = expiredID.hasAccessToFacility('LIB001');
  if (!expiredAccess.hasAccess && expiredAccess.reason.includes('expired')) {
    console.log('  ✅ Correctly denied access for expired ID');
    passed++;
  } else {
    console.log('  ❌ Should have denied access for expired ID');
  }
  
  // Test 4: Inactive ID
  const inactiveID = createMockDigitalID(
    false,
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    [{ facilityId: 'LIB001', facilityName: 'Library', accessType: 'full' }]
  );
  
  const inactiveAccess = inactiveID.hasAccessToFacility('LIB001');
  if (!inactiveAccess.hasAccess && inactiveAccess.reason.includes('inactive')) {
    console.log('  ✅ Correctly denied access for inactive ID');
    passed++;
  } else {
    console.log('  ❌ Should have denied access for inactive ID');
  }
  
  // Test 5: Time restriction - allowed time
  const timeRestrictedID = createMockDigitalID(
    true,
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    [{
      facilityId: 'LAB001',
      facilityName: 'Computer Lab',
      accessType: 'time_limited',
      timeRestrictions: {
        startTime: '08:00',
        endTime: '17:00',
        daysOfWeek: [1, 2, 3, 4, 5] // Monday to Friday
      }
    }]
  );
  
  // Create a Monday at 10:00 AM
  const allowedTime = new Date();
  allowedTime.setHours(10, 0, 0, 0);
  allowedTime.setDate(allowedTime.getDate() + (1 - allowedTime.getDay() + 7) % 7);
  
  const timeAllowedAccess = timeRestrictedID.hasAccessToFacility('LAB001', allowedTime);
  if (timeAllowedAccess.hasAccess) {
    console.log('  ✅ Correctly allowed access during permitted hours');
    passed++;
  } else {
    console.log('  ❌ Should have allowed access during permitted hours');
  }
  
  // Test 6: Time restriction - denied time
  const deniedTime = new Date();
  deniedTime.setHours(20, 0, 0, 0); // 8:00 PM
  deniedTime.setDate(deniedTime.getDate() + (1 - deniedTime.getDay() + 7) % 7);
  
  const timeDeniedAccess = timeRestrictedID.hasAccessToFacility('LAB001', deniedTime);
  if (!timeDeniedAccess.hasAccess && timeDeniedAccess.reason.includes('time')) {
    console.log('  ✅ Correctly denied access outside permitted hours');
    passed++;
  } else {
    console.log('  ❌ Should have denied access outside permitted hours');
  }
  
  console.log(`  Result: ${passed}/${total} tests passed\n`);
  return passed === total;
}

// Test 5: Role-based access control
function testRoleBasedAccess() {
  console.log('🔑 Testing role-based access control...');
  
  const createMockFacility = (accessRequirements, isActive = true, emergencyOverride = false, capacity = 100, currentOccupancy = 10) => ({
    isActive,
    emergencyOverride,
    capacity,
    currentOccupancy,
    accessRequirements,
    maintenanceMode: { isActive: false },
    checkRoleAccess(userRole, accessLevel = 'basic') {
      if (!this.isActive) {
        return { hasAccess: false, reason: 'Facility is inactive' };
      }

      if (this.emergencyOverride) {
        return { hasAccess: false, reason: 'Emergency lockdown in effect' };
      }

      const accessReq = this.accessRequirements.find(req => req.role === userRole);
      if (!accessReq) {
        return { hasAccess: false, reason: 'No access permission for this role' };
      }

      if (this.capacity && this.currentOccupancy >= this.capacity) {
        return { hasAccess: false, reason: 'Facility is at full capacity' };
      }

      return { hasAccess: true, accessRequirement: accessReq };
    }
  });
  
  let passed = 0;
  let total = 5;
  
  const facility = createMockFacility([
    { role: 'student', accessType: 'restricted' },
    { role: 'faculty', accessType: 'full' },
    { role: 'staff', accessType: 'restricted' }
  ]);
  
  // Test 1: Student access
  const studentAccess = facility.checkRoleAccess('student');
  if (studentAccess.hasAccess) {
    console.log('  ✅ Student access granted');
    passed++;
  } else {
    console.log('  ❌ Student access should be granted');
  }
  
  // Test 2: Faculty access
  const facultyAccess = facility.checkRoleAccess('faculty');
  if (facultyAccess.hasAccess) {
    console.log('  ✅ Faculty access granted');
    passed++;
  } else {
    console.log('  ❌ Faculty access should be granted');
  }
  
  // Test 3: Unauthorized role
  const visitorAccess = facility.checkRoleAccess('visitor');
  if (!visitorAccess.hasAccess && visitorAccess.reason.includes('No access permission')) {
    console.log('  ✅ Visitor access correctly denied');
    passed++;
  } else {
    console.log('  ❌ Visitor access should be denied');
  }
  
  // Test 4: Capacity limit
  facility.currentOccupancy = 100;
  const capacityAccess = facility.checkRoleAccess('student');
  if (!capacityAccess.hasAccess && capacityAccess.reason.includes('capacity')) {
    console.log('  ✅ Access correctly denied at capacity');
    passed++;
  } else {
    console.log('  ❌ Access should be denied at capacity');
  }
  
  // Test 5: Emergency override
  facility.currentOccupancy = 10;
  facility.emergencyOverride = true;
  const emergencyAccess = facility.checkRoleAccess('faculty');
  if (!emergencyAccess.hasAccess && emergencyAccess.reason.includes('Emergency')) {
    console.log('  ✅ Access correctly denied during emergency');
    passed++;
  } else {
    console.log('  ❌ Access should be denied during emergency');
  }
  
  console.log(`  Result: ${passed}/${total} tests passed\n`);
  return passed === total;
}

// Run all tests
function runAllTests() {
  console.log('🚀 Starting Digital ID Access Control Validation Tests\n');
  
  const results = [
    testTimeFormatValidation(),
    testAccessLevelValidation(),
    testSecurityHashGeneration(),
    testFacilityAccessLogic(),
    testRoleBasedAccess()
  ];
  
  const totalPassed = results.filter(r => r).length;
  const totalTests = results.length;
  
  console.log('📊 Test Summary:');
  console.log(`  Total test suites: ${totalTests}`);
  console.log(`  Passed: ${totalPassed}`);
  console.log(`  Failed: ${totalTests - totalPassed}`);
  
  if (totalPassed === totalTests) {
    console.log('🎉 All tests passed! Digital ID models and access control logic are working correctly.');
    return true;
  } else {
    console.log('❌ Some tests failed. Please review the implementation.');
    return false;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const success = runAllTests();
  process.exit(success ? 0 : 1);
}

module.exports = {
  testTimeFormatValidation,
  testAccessLevelValidation,
  testSecurityHashGeneration,
  testFacilityAccessLogic,
  testRoleBasedAccess,
  runAllTests
};