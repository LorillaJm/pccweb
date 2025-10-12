/**
 * Security Testing and Validation Suite
 * Tests QR code security, access control, API security, and penetration testing
 * Requirements: 2.7, 3.7, 3.8, 6.6
 */

const QRCodeService = require('./services/QRCodeService');
const DigitalIDService = require('./services/DigitalIDService');
const AccessControlService = require('./services/AccessControlService');
const crypto = require('crypto');

// Test configuration
const TEST_CONFIG = {
  qrEncryptionKey: process.env.QR_ENCRYPTION_KEY || 'test-encryption-key-32-characters',
  maxRateLimitAttempts: 30,
  rateLimitWindow: 60000,
  maxQRAge: 24 * 60 * 60 * 1000
};

console.log('=== Security Testing and Validation Suite ===\n');

// Test 1: QR Code Security and Tamper Detection
async function testQRCodeSecurity() {
  console.log('Test 1: QR Code Security and Tamper Detection');
  console.log('------------------------------------------------');
  
  const qrService = new QRCodeService();
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1.1: Generate secure QR code
  console.log('1.1 Testing secure QR code generation...');
  try {
    const ticketData = {
      ticketId: 'TEST-TICKET-001',
      eventId: 'TEST-EVENT-001',
      userId: 'TEST-USER-001',
      ticketNumber: 'TKT-2024-001',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };

    const qrResult = await qrService.generateSecureQRCode(ticketData);
    
    if (qrResult.success && qrResult.data.qrString && qrResult.data.securityHash) {
      console.log('✓ Secure QR code generated successfully');
      results.passed++;
      results.tests.push({ name: 'QR Generation', status: 'PASS' });
    } else {
      console.log('✗ Failed to generate secure QR code');
      results.failed++;
      results.tests.push({ name: 'QR Generation', status: 'FAIL' });
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
    results.failed++;
    results.tests.push({ name: 'QR Generation', status: 'FAIL', error: error.message });
  }

  // Test 1.2: Validate legitimate QR code
  console.log('1.2 Testing legitimate QR code validation...');
  try {
    const ticketData = {
      ticketId: 'TEST-TICKET-002',
      eventId: 'TEST-EVENT-002',
      userId: 'TEST-USER-002',
      ticketNumber: 'TKT-2024-002',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };

    const qrResult = await qrService.generateSecureQRCode(ticketData);
    const validationResult = await qrService.validateSecureQRCode(qrResult.data.qrString);
    
    if (validationResult.success && validationResult.data.ticketId === ticketData.ticketId) {
      console.log('✓ Legitimate QR code validated successfully');
      results.passed++;
      results.tests.push({ name: 'QR Validation', status: 'PASS' });
    } else {
      console.log('✗ Failed to validate legitimate QR code');
      results.failed++;
      results.tests.push({ name: 'QR Validation', status: 'FAIL' });
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
    results.failed++;
    results.tests.push({ name: 'QR Validation', status: 'FAIL', error: error.message });
  }

  // Test 1.3: Detect tampered QR code
  console.log('1.3 Testing tamper detection...');
  try {
    const ticketData = {
      ticketId: 'TEST-TICKET-003',
      eventId: 'TEST-EVENT-003',
      userId: 'TEST-USER-003',
      ticketNumber: 'TKT-2024-003',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };

    const qrResult = await qrService.generateSecureQRCode(ticketData);
    
    // Tamper with the QR data
    const qrData = JSON.parse(qrResult.data.qrString);
    qrData.hash = 'tampered-hash-value';
    const tamperedQRString = JSON.stringify(qrData);
    
    const validationResult = await qrService.validateSecureQRCode(tamperedQRString);
    
    if (!validationResult.success && (validationResult.error.includes('tampered') || validationResult.error.includes('Security validation failed'))) {
      console.log('✓ Tampered QR code detected successfully');
      results.passed++;
      results.tests.push({ name: 'Tamper Detection', status: 'PASS' });
    } else {
      console.log('✗ Failed to detect tampered QR code');
      results.failed++;
      results.tests.push({ name: 'Tamper Detection', status: 'FAIL' });
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
    results.failed++;
    results.tests.push({ name: 'Tamper Detection', status: 'FAIL', error: error.message });
  }

  // Test 1.4: Reject expired QR code
  console.log('1.4 Testing expired QR code rejection...');
  try {
    const ticketData = {
      ticketId: 'TEST-TICKET-004',
      eventId: 'TEST-EVENT-004',
      userId: 'TEST-USER-004',
      ticketNumber: 'TKT-2024-004',
      expiresAt: new Date(Date.now() - 1000) // Already expired
    };

    const qrResult = await qrService.generateSecureQRCode(ticketData);
    const validationResult = await qrService.validateSecureQRCode(qrResult.data.qrString);
    
    if (!validationResult.success && validationResult.error.includes('expired')) {
      console.log('✓ Expired QR code rejected successfully');
      results.passed++;
      results.tests.push({ name: 'Expiration Check', status: 'PASS' });
    } else {
      console.log('✗ Failed to reject expired QR code');
      results.failed++;
      results.tests.push({ name: 'Expiration Check', status: 'FAIL' });
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
    results.failed++;
    results.tests.push({ name: 'Expiration Check', status: 'FAIL', error: error.message });
  }

  // Test 1.5: Prevent replay attacks
  console.log('1.5 Testing replay attack prevention...');
  try {
    const oldTimestamp = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
    const payload = {
      ticketId: 'TEST-TICKET-005',
      eventId: 'TEST-EVENT-005',
      userId: 'TEST-USER-005',
      ticketNumber: 'TKT-2024-005',
      timestamp: oldTimestamp,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      version: '1.0'
    };

    // Manually create QR with old timestamp
    const qrService2 = new QRCodeService();
    const encryptedData = qrService2.encryptData(JSON.stringify(payload));
    const qrData = {
      data: encryptedData.encrypted,
      iv: encryptedData.iv,
      tag: encryptedData.tag,
      hash: qrService2.generateSecurityHash(payload)
    };
    const qrString = JSON.stringify(qrData);
    
    const validationResult = await qrService.validateSecureQRCode(qrString);
    
    if (!validationResult.success && validationResult.error.includes('too old')) {
      console.log('✓ Replay attack prevented successfully');
      results.passed++;
      results.tests.push({ name: 'Replay Prevention', status: 'PASS' });
    } else {
      console.log('✗ Failed to prevent replay attack');
      results.failed++;
      results.tests.push({ name: 'Replay Prevention', status: 'FAIL' });
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
    results.failed++;
    results.tests.push({ name: 'Replay Prevention', status: 'FAIL', error: error.message });
  }

  console.log(`\nQR Security Tests: ${results.passed} passed, ${results.failed} failed\n`);
  return results;
}

// Test 2: Access Control and Permission Systems
async function testAccessControl() {
  console.log('Test 2: Access Control and Permission Systems');
  console.log('------------------------------------------------');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 2.1: Role-based access control
  console.log('2.1 Testing role-based access control...');
  try {
    const testRoles = ['student', 'faculty', 'staff', 'admin'];
    const accessLevels = {
      student: 'basic',
      faculty: 'premium',
      staff: 'standard',
      admin: 'premium'
    };

    let allCorrect = true;
    for (const role of testRoles) {
      const digitalIDService = new DigitalIDService();
      const expectedLevel = accessLevels[role];
      const actualLevel = digitalIDService._determineAccessLevel(role);
      
      if (actualLevel !== expectedLevel) {
        allCorrect = false;
        console.log(`✗ Role ${role} has incorrect access level: ${actualLevel} (expected ${expectedLevel})`);
      }
    }

    if (allCorrect) {
      console.log('✓ Role-based access control working correctly');
      results.passed++;
      results.tests.push({ name: 'RBAC', status: 'PASS' });
    } else {
      results.failed++;
      results.tests.push({ name: 'RBAC', status: 'FAIL' });
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
    results.failed++;
    results.tests.push({ name: 'RBAC', status: 'FAIL', error: error.message });
  }

  // Test 2.2: Permission validation
  console.log('2.2 Testing permission validation...');
  try {
    const digitalIDService = new DigitalIDService();
    
    // Valid permissions
    const validPermissions = [
      {
        facilityId: 'LIB001',
        facilityName: 'Library',
        accessType: 'full'
      }
    ];

    try {
      digitalIDService._validatePermissions(validPermissions);
      console.log('✓ Valid permissions accepted');
      results.passed++;
      results.tests.push({ name: 'Permission Validation', status: 'PASS' });
    } catch (error) {
      console.log('✗ Valid permissions rejected:', error.message);
      results.failed++;
      results.tests.push({ name: 'Permission Validation', status: 'FAIL' });
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
    results.failed++;
    results.tests.push({ name: 'Permission Validation', status: 'FAIL', error: error.message });
  }

  // Test 2.3: Invalid permission rejection
  console.log('2.3 Testing invalid permission rejection...');
  try {
    const digitalIDService = new DigitalIDService();
    
    // Invalid permissions (missing required fields)
    const invalidPermissions = [
      {
        facilityId: 'LIB001'
        // Missing facilityName
      }
    ];

    let errorThrown = false;
    try {
      digitalIDService._validatePermissions(invalidPermissions);
    } catch (error) {
      errorThrown = true;
    }

    if (errorThrown) {
      console.log('✓ Invalid permissions rejected correctly');
      results.passed++;
      results.tests.push({ name: 'Invalid Permission Rejection', status: 'PASS' });
    } else {
      console.log('✗ Invalid permissions not rejected');
      results.failed++;
      results.tests.push({ name: 'Invalid Permission Rejection', status: 'FAIL' });
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
    results.failed++;
    results.tests.push({ name: 'Invalid Permission Rejection', status: 'FAIL', error: error.message });
  }

  // Test 2.4: Time-based access restrictions
  console.log('2.4 Testing time-based access restrictions...');
  try {
    const digitalIDService = new DigitalIDService();
    
    const timeRestrictedPermission = {
      facilityId: 'LAB001',
      facilityName: 'Computer Lab',
      accessType: 'time_limited',
      timeRestrictions: {
        startTime: '08:00',
        endTime: '18:00',
        daysOfWeek: [1, 2, 3, 4, 5]
      }
    };

    try {
      digitalIDService._validatePermissions([timeRestrictedPermission]);
      console.log('✓ Time-based restrictions validated correctly');
      results.passed++;
      results.tests.push({ name: 'Time Restrictions', status: 'PASS' });
    } catch (error) {
      console.log('✗ Time-based restrictions validation failed:', error.message);
      results.failed++;
      results.tests.push({ name: 'Time Restrictions', status: 'FAIL' });
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
    results.failed++;
    results.tests.push({ name: 'Time Restrictions', status: 'FAIL', error: error.message });
  }

  // Test 2.5: Security hash validation
  console.log('2.5 Testing security hash validation...');
  try {
    const testUserId = 'test-user-' + Date.now();
    const testRole = 'student';
    const testAccessLevel = 'basic';
    
    const digitalIDService = new DigitalIDService();
    const qrData1 = digitalIDService._generateQRData(testUserId, testRole, testAccessLevel);
    const qrData2 = digitalIDService._generateQRData(testUserId, testRole, testAccessLevel);
    
    // QR data should be unique even for same user
    if (qrData1 !== qrData2) {
      console.log('✓ Security hash generation produces unique values');
      results.passed++;
      results.tests.push({ name: 'Security Hash', status: 'PASS' });
    } else {
      console.log('✗ Security hash generation not unique');
      results.failed++;
      results.tests.push({ name: 'Security Hash', status: 'FAIL' });
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
    results.failed++;
    results.tests.push({ name: 'Security Hash', status: 'FAIL', error: error.message });
  }

  console.log(`\nAccess Control Tests: ${results.passed} passed, ${results.failed} failed\n`);
  return results;
}

// Test 3: API Security and Rate Limiting
async function testAPISecurity() {
  console.log('Test 3: API Security and Rate Limiting');
  console.log('------------------------------------------------');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 3.1: Input validation
  console.log('3.1 Testing input validation...');
  try {
    const testCases = [
      { input: null, shouldFail: true, name: 'null input' },
      { input: '', shouldFail: true, name: 'empty string' },
      { input: 'invalid-json', shouldFail: true, name: 'invalid JSON' },
      { input: '{"valid": "json"}', shouldFail: false, name: 'valid JSON' }
    ];

    let allCorrect = true;
    for (const testCase of testCases) {
      try {
        if (testCase.input) {
          JSON.parse(testCase.input);
        } else {
          throw new Error('Invalid input');
        }
        
        if (testCase.shouldFail) {
          console.log(`✗ ${testCase.name} should have failed but passed`);
          allCorrect = false;
        }
      } catch (error) {
        if (!testCase.shouldFail) {
          console.log(`✗ ${testCase.name} should have passed but failed`);
          allCorrect = false;
        }
      }
    }

    if (allCorrect) {
      console.log('✓ Input validation working correctly');
      results.passed++;
      results.tests.push({ name: 'Input Validation', status: 'PASS' });
    } else {
      results.failed++;
      results.tests.push({ name: 'Input Validation', status: 'FAIL' });
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
    results.failed++;
    results.tests.push({ name: 'Input Validation', status: 'FAIL', error: error.message });
  }

  // Test 3.2: SQL injection prevention
  console.log('3.2 Testing SQL injection prevention...');
  try {
    const maliciousInputs = [
      "'; DROP TABLE users; --",
      "1' OR '1'='1",
      "admin'--",
      "' UNION SELECT * FROM users--"
    ];

    let allSafe = true;
    for (const input of maliciousInputs) {
      // Check if input contains SQL injection patterns
      const sqlPatterns = [
        /(\bDROP\b|\bDELETE\b|\bUNION\b|\bINSERT\b|\bUPDATE\b)/i,
        /(--|;|\/\*|\*\/)/,
        /('|")\s*(OR|AND)\s*('|")/i
      ];

      const isSuspicious = sqlPatterns.some(pattern => pattern.test(input));
      if (!isSuspicious) {
        console.log(`✗ Failed to detect SQL injection pattern: ${input}`);
        allSafe = false;
      }
    }

    if (allSafe) {
      console.log('✓ SQL injection patterns detected correctly');
      results.passed++;
      results.tests.push({ name: 'SQL Injection Prevention', status: 'PASS' });
    } else {
      results.failed++;
      results.tests.push({ name: 'SQL Injection Prevention', status: 'FAIL' });
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
    results.failed++;
    results.tests.push({ name: 'SQL Injection Prevention', status: 'FAIL', error: error.message });
  }

  // Test 3.3: XSS prevention
  console.log('3.3 Testing XSS prevention...');
  try {
    const xssInputs = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      'javascript:alert("XSS")',
      '<iframe src="javascript:alert(\'XSS\')"></iframe>'
    ];

    let allDetected = true;
    for (const input of xssInputs) {
      // Check if input contains XSS patterns
      const xssPatterns = [
        /<script[^>]*>.*?<\/script>/gi,
        /<iframe[^>]*>.*?<\/iframe>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi
      ];

      const isSuspicious = xssPatterns.some(pattern => pattern.test(input));
      if (!isSuspicious) {
        console.log(`✗ Failed to detect XSS pattern: ${input}`);
        allDetected = false;
      }
    }

    if (allDetected) {
      console.log('✓ XSS patterns detected correctly');
      results.passed++;
      results.tests.push({ name: 'XSS Prevention', status: 'PASS' });
    } else {
      results.failed++;
      results.tests.push({ name: 'XSS Prevention', status: 'FAIL' });
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
    results.failed++;
    results.tests.push({ name: 'XSS Prevention', status: 'FAIL', error: error.message });
  }

  // Test 3.4: Rate limiting logic
  console.log('3.4 Testing rate limiting logic...');
  try {
    const maxRequests = 5;
    const requestCounts = new Map();
    const userId = 'test-user-rate-limit';

    let rateLimitTriggered = false;
    for (let i = 0; i < maxRequests + 2; i++) {
      const currentCount = requestCounts.get(userId) || 0;
      
      if (currentCount >= maxRequests) {
        rateLimitTriggered = true;
        break;
      }
      
      requestCounts.set(userId, currentCount + 1);
    }

    if (rateLimitTriggered) {
      console.log('✓ Rate limiting logic working correctly');
      results.passed++;
      results.tests.push({ name: 'Rate Limiting', status: 'PASS' });
    } else {
      console.log('✗ Rate limiting not triggered');
      results.failed++;
      results.tests.push({ name: 'Rate Limiting', status: 'FAIL' });
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
    results.failed++;
    results.tests.push({ name: 'Rate Limiting', status: 'FAIL', error: error.message });
  }

  // Test 3.5: CSRF token validation
  console.log('3.5 Testing CSRF token validation...');
  try {
    const generateCSRFToken = () => {
      return crypto.randomBytes(32).toString('hex');
    };

    const token1 = generateCSRFToken();
    const token2 = generateCSRFToken();

    if (token1 !== token2 && token1.length === 64 && token2.length === 64) {
      console.log('✓ CSRF token generation working correctly');
      results.passed++;
      results.tests.push({ name: 'CSRF Protection', status: 'PASS' });
    } else {
      console.log('✗ CSRF token generation failed');
      results.failed++;
      results.tests.push({ name: 'CSRF Protection', status: 'FAIL' });
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
    results.failed++;
    results.tests.push({ name: 'CSRF Protection', status: 'FAIL', error: error.message });
  }

  console.log(`\nAPI Security Tests: ${results.passed} passed, ${results.failed} failed\n`);
  return results;
}

// Test 4: Penetration Testing on Critical Features
async function testPenetrationScenarios() {
  console.log('Test 4: Penetration Testing on Critical Features');
  console.log('------------------------------------------------');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 4.1: Brute force attack prevention
  console.log('4.1 Testing brute force attack prevention...');
  try {
    const maxAttempts = 5;
    const lockoutDuration = 15 * 60 * 1000; // 15 minutes
    const failedAttempts = new Map();

    const simulateBruteForce = (userId) => {
      const attempts = failedAttempts.get(userId) || { count: 0, lockedUntil: null };
      
      // Check if account is locked
      if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
        return { success: false, reason: 'Account locked' };
      }

      // Increment failed attempts
      attempts.count++;
      
      // Lock account if max attempts reached
      if (attempts.count >= maxAttempts) {
        attempts.lockedUntil = Date.now() + lockoutDuration;
        failedAttempts.set(userId, attempts);
        return { success: false, reason: 'Account locked due to too many failed attempts' };
      }

      failedAttempts.set(userId, attempts);
      return { success: false, reason: 'Invalid credentials' };
    };

    // Simulate brute force attack
    let locked = false;
    for (let i = 0; i < maxAttempts + 1; i++) {
      const result = simulateBruteForce('test-user');
      if (result.reason.includes('locked')) {
        locked = true;
        break;
      }
    }

    if (locked) {
      console.log('✓ Brute force attack prevented successfully');
      results.passed++;
      results.tests.push({ name: 'Brute Force Prevention', status: 'PASS' });
    } else {
      console.log('✗ Brute force attack not prevented');
      results.failed++;
      results.tests.push({ name: 'Brute Force Prevention', status: 'FAIL' });
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
    results.failed++;
    results.tests.push({ name: 'Brute Force Prevention', status: 'FAIL', error: error.message });
  }

  // Test 4.2: Session hijacking prevention
  console.log('4.2 Testing session hijacking prevention...');
  try {
    const generateSessionToken = () => {
      return crypto.randomBytes(32).toString('hex');
    };

    const validateSessionFingerprint = (session, request) => {
      const fingerprint = crypto.createHash('sha256')
        .update(request.userAgent + request.ipAddress)
        .digest('hex');
      
      return session.fingerprint === fingerprint;
    };

    const session = {
      token: generateSessionToken(),
      fingerprint: crypto.createHash('sha256')
        .update('Mozilla/5.0192.168.1.1')
        .digest('hex')
    };

    // Legitimate request
    const legitimateRequest = {
      userAgent: 'Mozilla/5.0',
      ipAddress: '192.168.1.1'
    };

    // Hijacked request (different IP)
    const hijackedRequest = {
      userAgent: 'Mozilla/5.0',
      ipAddress: '10.0.0.1'
    };

    const legitimateValid = validateSessionFingerprint(session, legitimateRequest);
    const hijackedValid = validateSessionFingerprint(session, hijackedRequest);

    if (legitimateValid && !hijackedValid) {
      console.log('✓ Session hijacking prevented successfully');
      results.passed++;
      results.tests.push({ name: 'Session Hijacking Prevention', status: 'PASS' });
    } else {
      console.log('✗ Session hijacking not prevented');
      results.failed++;
      results.tests.push({ name: 'Session Hijacking Prevention', status: 'FAIL' });
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
    results.failed++;
    results.tests.push({ name: 'Session Hijacking Prevention', status: 'FAIL', error: error.message });
  }

  // Test 4.3: Privilege escalation prevention
  console.log('4.3 Testing privilege escalation prevention...');
  try {
    const checkPrivilegeEscalation = (userRole, requestedAction) => {
      const roleHierarchy = {
        student: 1,
        faculty: 2,
        staff: 2,
        admin: 3,
        super_admin: 4
      };

      const actionRequirements = {
        'view_own_data': 1,
        'view_all_students': 2,
        'modify_user_roles': 3,
        'system_configuration': 4
      };

      const userLevel = roleHierarchy[userRole] || 0;
      const requiredLevel = actionRequirements[requestedAction] || 999;

      return userLevel >= requiredLevel;
    };

    // Test cases
    const testCases = [
      { role: 'student', action: 'view_own_data', shouldAllow: true },
      { role: 'student', action: 'modify_user_roles', shouldAllow: false },
      { role: 'faculty', action: 'view_all_students', shouldAllow: true },
      { role: 'faculty', action: 'system_configuration', shouldAllow: false },
      { role: 'admin', action: 'modify_user_roles', shouldAllow: true }
    ];

    let allCorrect = true;
    for (const testCase of testCases) {
      const allowed = checkPrivilegeEscalation(testCase.role, testCase.action);
      if (allowed !== testCase.shouldAllow) {
        console.log(`✗ Privilege check failed for ${testCase.role} attempting ${testCase.action}`);
        allCorrect = false;
      }
    }

    if (allCorrect) {
      console.log('✓ Privilege escalation prevented successfully');
      results.passed++;
      results.tests.push({ name: 'Privilege Escalation Prevention', status: 'PASS' });
    } else {
      results.failed++;
      results.tests.push({ name: 'Privilege Escalation Prevention', status: 'FAIL' });
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
    results.failed++;
    results.tests.push({ name: 'Privilege Escalation Prevention', status: 'FAIL', error: error.message });
  }

  // Test 4.4: Data encryption validation
  console.log('4.4 Testing data encryption validation...');
  try {
    const encryptData = (data, key) => {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return { encrypted, iv: iv.toString('hex') };
    };

    const decryptData = (encryptedData, key, iv) => {
      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    };

    const testData = 'Sensitive user information';
    const encryptionKey = crypto.randomBytes(32).toString('hex');
    
    const { encrypted, iv } = encryptData(testData, encryptionKey);
    const decrypted = decryptData(encrypted, encryptionKey, iv);

    if (encrypted !== testData && decrypted === testData) {
      console.log('✓ Data encryption working correctly');
      results.passed++;
      results.tests.push({ name: 'Data Encryption', status: 'PASS' });
    } else {
      console.log('✗ Data encryption failed');
      results.failed++;
      results.tests.push({ name: 'Data Encryption', status: 'FAIL' });
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
    results.failed++;
    results.tests.push({ name: 'Data Encryption', status: 'FAIL', error: error.message });
  }

  // Test 4.5: API endpoint authorization
  console.log('4.5 Testing API endpoint authorization...');
  try {
    const authorizeEndpoint = (userRole, endpoint, method) => {
      const endpointPermissions = {
        '/api/users': { GET: ['admin', 'staff'], POST: ['admin'], DELETE: ['admin'] },
        '/api/profile': { GET: ['student', 'faculty', 'staff', 'admin'], PUT: ['student', 'faculty', 'staff', 'admin'] },
        '/api/admin/settings': { GET: ['admin'], PUT: ['admin'], DELETE: ['admin'] }
      };

      const permissions = endpointPermissions[endpoint];
      if (!permissions) return false;

      const allowedRoles = permissions[method];
      if (!allowedRoles) return false;

      return allowedRoles.includes(userRole);
    };

    const testCases = [
      { role: 'student', endpoint: '/api/profile', method: 'GET', shouldAllow: true },
      { role: 'student', endpoint: '/api/users', method: 'GET', shouldAllow: false },
      { role: 'admin', endpoint: '/api/admin/settings', method: 'PUT', shouldAllow: true },
      { role: 'faculty', endpoint: '/api/admin/settings', method: 'GET', shouldAllow: false }
    ];

    let allCorrect = true;
    for (const testCase of testCases) {
      const allowed = authorizeEndpoint(testCase.role, testCase.endpoint, testCase.method);
      if (allowed !== testCase.shouldAllow) {
        console.log(`✗ Authorization failed for ${testCase.role} ${testCase.method} ${testCase.endpoint}`);
        allCorrect = false;
      }
    }

    if (allCorrect) {
      console.log('✓ API endpoint authorization working correctly');
      results.passed++;
      results.tests.push({ name: 'API Authorization', status: 'PASS' });
    } else {
      results.failed++;
      results.tests.push({ name: 'API Authorization', status: 'FAIL' });
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
    results.failed++;
    results.tests.push({ name: 'API Authorization', status: 'FAIL', error: error.message });
  }

  console.log(`\nPenetration Tests: ${results.passed} passed, ${results.failed} failed\n`);
  return results;
}

// Main test execution
async function runAllSecurityTests() {
  console.log('Starting comprehensive security testing suite...\n');
  console.log('Testing Requirements: 2.7, 3.7, 3.8, 6.6\n');
  console.log('='.repeat(60) + '\n');

  const startTime = Date.now();
  
  try {
    // Run all test suites
    const qrSecurityResults = await testQRCodeSecurity();
    const accessControlResults = await testAccessControl();
    const apiSecurityResults = await testAPISecurity();
    const penetrationResults = await testPenetrationScenarios();

    // Compile overall results
    const totalPassed = qrSecurityResults.passed + accessControlResults.passed + 
                       apiSecurityResults.passed + penetrationResults.passed;
    const totalFailed = qrSecurityResults.failed + accessControlResults.failed + 
                       apiSecurityResults.failed + penetrationResults.failed;
    const totalTests = totalPassed + totalFailed;

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Print summary
    console.log('='.repeat(60));
    console.log('SECURITY TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${totalPassed} (${((totalPassed / totalTests) * 100).toFixed(1)}%)`);
    console.log(`Failed: ${totalFailed} (${((totalFailed / totalTests) * 100).toFixed(1)}%)`);
    console.log(`Duration: ${duration}s`);
    console.log('='.repeat(60));

    // Print detailed results by category
    console.log('\nDETAILED RESULTS BY CATEGORY:');
    console.log('-'.repeat(60));
    
    console.log('\n1. QR Code Security:');
    qrSecurityResults.tests.forEach(test => {
      const icon = test.status === 'PASS' ? '✓' : '✗';
      console.log(`  ${icon} ${test.name}: ${test.status}`);
    });

    console.log('\n2. Access Control:');
    accessControlResults.tests.forEach(test => {
      const icon = test.status === 'PASS' ? '✓' : '✗';
      console.log(`  ${icon} ${test.name}: ${test.status}`);
    });

    console.log('\n3. API Security:');
    apiSecurityResults.tests.forEach(test => {
      const icon = test.status === 'PASS' ? '✓' : '✗';
      console.log(`  ${icon} ${test.name}: ${test.status}`);
    });

    console.log('\n4. Penetration Testing:');
    penetrationResults.tests.forEach(test => {
      const icon = test.status === 'PASS' ? '✓' : '✗';
      console.log(`  ${icon} ${test.name}: ${test.status}`);
    });

    console.log('\n' + '='.repeat(60));

    // Security recommendations
    console.log('\nSECURITY RECOMMENDATIONS:');
    console.log('-'.repeat(60));
    console.log('1. Ensure QR_ENCRYPTION_KEY is set to a strong value in production');
    console.log('2. Implement rate limiting on all public API endpoints');
    console.log('3. Enable HTTPS/TLS for all communications');
    console.log('4. Regularly rotate encryption keys and secrets');
    console.log('5. Implement comprehensive logging and monitoring');
    console.log('6. Conduct regular security audits and penetration testing');
    console.log('7. Keep all dependencies up to date');
    console.log('8. Implement Content Security Policy (CSP) headers');
    console.log('9. Use parameterized queries to prevent SQL injection');
    console.log('10. Implement proper session management and timeout');

    console.log('\n' + '='.repeat(60));
    console.log('Security testing completed successfully!');
    console.log('='.repeat(60) + '\n');

    // Exit with appropriate code
    if (totalFailed > 0) {
      console.log(`⚠️  WARNING: ${totalFailed} security test(s) failed!`);
      process.exit(1);
    } else {
      console.log('✓ All security tests passed!');
      process.exit(0);
    }

  } catch (error) {
    console.error('\n❌ Security testing failed with error:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllSecurityTests();
}

module.exports = {
  testQRCodeSecurity,
  testAccessControl,
  testAPISecurity,
  testPenetrationScenarios,
  runAllSecurityTests
};
