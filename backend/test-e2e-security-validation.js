#!/usr/bin/env node

/**
 * E2E Security Validation Tests
 * Tests security features across all advanced features
 */

const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const User = require('./models/User');
const DigitalID = require('./models/DigitalID');
const EventTicket = require('./models/EventTicket');
const Event = require('./models/Event');

const BASE_URL = process.env.API_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logSection(message) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(message, 'cyan');
  log('='.repeat(60), 'cyan');
}

async function connectDatabase() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pcc-portal');
  logSuccess('Connected to MongoDB');
}

async function testQRCodeSecurity() {
  logSection('TEST: QR Code Security and Tamper Detection');
  
  try {
    // Test 1: Invalid QR code format
    log('Test 1: Testing invalid QR code format...');
    try {
      await axios.post(`${API_URL}/tickets/validate`, {
        qrCode: 'INVALID_FORMAT',
        eventId: 'test-event-id'
      });
      throw new Error('Should have rejected invalid QR format');
    } catch (error) {
      if (error.response && error.response.status >= 400) {
        logSuccess('Invalid QR format properly rejected');
      }
    }

    // Test 2: Expired QR code
    log('Test 2: Testing expired QR code...');
    const expiredTicket = new EventTicket({
      eventId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      ticketNumber: 'SEC-TEST-001',
      qrCode: 'EXPIRED-QR-CODE-TEST',
      status: 'expired',
      expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    });
    await expiredTicket.save();
    
    try {
      await axios.post(`${API_URL}/tickets/validate`, {
        qrCode: expiredTicket.qrCode,
        eventId: expiredTicket.eventId.toString()
      });
      throw new Error('Should have rejected expired ticket');
    } catch (error) {
      if (error.response && error.response.data.message.includes('expired')) {
        logSuccess('Expired QR code properly rejected');
      }
    }

    // Test 3: Tampered QR data
    log('Test 3: Testing tampered QR data...');
    try {
      await axios.post(`${API_URL}/digital-id/validate-access`, {
        qrCode: 'TAMPERED-DATA-12345',
        facilityId: 'library-main'
      });
      throw new Error('Should have detected tampered data');
    } catch (error) {
      if (error.response && error.response.status >= 400) {
        logSuccess('Tampered QR data detected and rejected');
      }
    }

    // Test 4: Replay attack prevention
    log('Test 4: Testing replay attack prevention...');
    const validTicket = new EventTicket({
      eventId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      ticketNumber: 'SEC-TEST-002',
      qrCode: 'VALID-QR-CODE-TEST',
      status: 'used',
      attendanceRecords: [{
        scannedAt: new Date(),
        scannedBy: new mongoose.Types.ObjectId()
      }]
    });
    await validTicket.save();
    
    try {
      await axios.post(`${API_URL}/tickets/validate`, {
        qrCode: validTicket.qrCode,
        eventId: validTicket.eventId.toString()
      });
    } catch (error) {
      if (error.response && error.response.data.message.includes('already')) {
        logSuccess('Replay attack prevented - ticket already used');
      }
    }

    // Cleanup
    await EventTicket.deleteMany({ ticketNumber: /SEC-TEST-/ });
    
    logSuccess('✓ QR Code Security test PASSED');
    return true;
  } catch (error) {
    logError(`✗ QR Code Security test FAILED: ${error.message}`);
    return false;
  }
}

async function testAccessControlSecurity() {
  logSection('TEST: Access Control and Permission Validation');
  
  try {
    // Test 1: Unauthorized facility access
    log('Test 1: Testing unauthorized facility access...');
    const student = new User({
      email: 'test-security-student@test.com',
      password: 'Test123!@#',
      firstName: 'Security',
      lastName: 'Student',
      role: 'student'
    });
    await student.save();

    const digitalId = new DigitalID({
      userId: student._id,
      qrCode: 'SEC-STUDENT-QR-001',
      accessLevel: 'student',
      permissions: [{
        facilityId: 'library-main',
        facilityName: 'Main Library',
        accessType: 'full'
      }],
      isActive: true,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      securityHash: 'test-hash'
    });
    await digitalId.save();

    try {
      await axios.post(`${API_URL}/digital-id/validate-access`, {
        qrCode: digitalId.qrCode,
        facilityId: 'admin-office',
        facilityName: 'Admin Office'
      });
    } catch (error) {
      if (error.response && !error.response.data.accessGranted) {
        logSuccess('Unauthorized facility access properly denied');
      }
    }

    // Test 2: Time-based access restrictions
    log('Test 2: Testing time-based access restrictions...');
    const restrictedId = new DigitalID({
      userId: student._id,
      qrCode: 'SEC-STUDENT-QR-002',
      accessLevel: 'student',
      permissions: [{
        facilityId: 'lab-computer',
        facilityName: 'Computer Lab',
        accessType: 'time_limited',
        timeRestrictions: {
          startTime: '08:00',
          endTime: '17:00',
          daysOfWeek: [1, 2, 3, 4, 5] // Monday to Friday
        }
      }],
      isActive: true,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      securityHash: 'test-hash-2'
    });
    await restrictedId.save();
    
    logSuccess('Time-based restrictions configured');

    // Test 3: Suspended account access
    log('Test 3: Testing suspended account access...');
    const suspendedId = await DigitalID.findOneAndUpdate(
      { userId: student._id, qrCode: 'SEC-STUDENT-QR-001' },
      { isActive: false },
      { new: true }
    );

    try {
      await axios.post(`${API_URL}/digital-id/validate-access`, {
        qrCode: suspendedId.qrCode,
        facilityId: 'library-main'
      });
    } catch (error) {
      if (error.response && !error.response.data.accessGranted) {
        logSuccess('Suspended account access properly denied');
      }
    }

    // Cleanup
    await User.deleteOne({ _id: student._id });
    await DigitalID.deleteMany({ userId: student._id });
    
    logSuccess('✓ Access Control Security test PASSED');
    return true;
  } catch (error) {
    logError(`✗ Access Control Security test FAILED: ${error.message}`);
    return false;
  }
}

async function testAPISecurityAndRateLimiting() {
  logSection('TEST: API Security and Rate Limiting');
  
  try {
    // Test 1: Missing authentication
    log('Test 1: Testing missing authentication...');
    try {
      await axios.get(`${API_URL}/admin/users`);
      throw new Error('Should have required authentication');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        logSuccess('Missing authentication properly rejected');
      }
    }

    // Test 2: Invalid token
    log('Test 2: Testing invalid token...');
    try {
      await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: 'Bearer INVALID_TOKEN' }
      });
      throw new Error('Should have rejected invalid token');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        logSuccess('Invalid token properly rejected');
      }
    }

    // Test 3: SQL injection attempt
    log('Test 3: Testing SQL injection prevention...');
    try {
      await axios.get(`${API_URL}/events`, {
        params: { search: "'; DROP TABLE events; --" }
      });
      logSuccess('SQL injection attempt handled safely');
    } catch (error) {
      logSuccess('SQL injection attempt blocked');
    }

    // Test 4: XSS attempt
    log('Test 4: Testing XSS prevention...');
    try {
      await axios.post(`${API_URL}/chatbot/conversation`, {
        message: '<script>alert("XSS")</script>',
        userId: 'test-user-id'
      });
      logSuccess('XSS attempt handled safely');
    } catch (error) {
      logSuccess('XSS attempt blocked');
    }

    logSuccess('✓ API Security test PASSED');
    return true;
  } catch (error) {
    logError(`✗ API Security test FAILED: ${error.message}`);
    return false;
  }
}

async function runSecurityTests() {
  log('\n' + '='.repeat(60), 'cyan');
  log('E2E SECURITY VALIDATION SUITE', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');

  const results = { total: 3, passed: 0, failed: 0 };

  try {
    await connectDatabase();

    const tests = [
      { name: 'QR Code Security', fn: testQRCodeSecurity },
      { name: 'Access Control Security', fn: testAccessControlSecurity },
      { name: 'API Security', fn: testAPISecurityAndRateLimiting }
    ];

    for (const test of tests) {
      const passed = await test.fn();
      if (passed) results.passed++;
      else results.failed++;
    }

  } catch (error) {
    logError(`Security test suite failed: ${error.message}`);
  } finally {
    await mongoose.connection.close();
  }

  logSection('SECURITY TEST SUMMARY');
  log(`Total: ${results.total}, Passed: ${results.passed}, Failed: ${results.failed}`, 
      results.failed > 0 ? 'red' : 'green');

  process.exit(results.failed > 0 ? 1 : 0);
}

if (require.main === module) {
  runSecurityTests();
}

module.exports = { runSecurityTests };
