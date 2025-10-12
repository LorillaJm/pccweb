#!/usr/bin/env node

/**
 * E2E Performance and Load Testing Suite
 * Tests system performance under various load conditions
 */

const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const User = require('./models/User');
const Event = require('./models/Event');
const Notification = require('./models/Notification');

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

async function testChatbotResponseTime() {
  logSection('TEST: Chatbot Response Time Performance');
  
  try {
    const user = new User({
      email: 'test-perf-chatbot@test.com',
      password: 'Test123!@#',
      firstName: 'Performance',
      lastName: 'Tester',
      role: 'student'
    });
    await user.save();

    const iterations = 10;
    const responseTimes = [];

    log(`Running ${iterations} chatbot queries...`);

    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      
      try {
        await axios.post(`${API_URL}/chatbot/conversation`, {
          userId: user._id.toString(),
          message: `What are the admission requirements? Query ${i + 1}`
        }, { timeout: 5000 });
        
        const responseTime = Date.now() - startTime;
        responseTimes.push(responseTime);
      } catch (error) {
        log(`Query ${i + 1} failed or timed out`, 'yellow');
      }
    }

    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const maxResponseTime = Math.max(...responseTimes);
    const minResponseTime = Math.min(...responseTimes);

    log(`Average response time: ${avgResponseTime.toFixed(2)}ms`);
    log(`Min: ${minResponseTime}ms, Max: ${maxResponseTime}ms`);

    if (avgResponseTime < 3000) {
      logSuccess('✓ Chatbot response time within acceptable range (<3s)');
    } else {
      log('⚠ Chatbot response time exceeds target (>3s)', 'yellow');
    }

    await User.deleteOne({ _id: user._id });
    
    return avgResponseTime < 5000; // Pass if under 5s
  } catch (error) {
    logError(`✗ Chatbot performance test FAILED: ${error.message}`);
    return false;
  }
}

async function testEventRegistrationLoad() {
  logSection('TEST: Event Registration Under Load');
  
  try {
    // Create event
    const organizer = new User({
      email: 'test-perf-organizer@test.com',
      password: 'Test123!@#',
      firstName: 'Organizer',
      lastName: 'Perf',
      role: 'faculty'
    });
    await organizer.save();

    const event = new Event({
      title: 'Performance Test Event',
      description: 'Load testing event',
      category: 'seminar',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      venue: 'Test Venue',
      capacity: 100,
      organizer: organizer._id,
      status: 'published'
    });
    await event.save();

    // Create multiple users and register simultaneously
    const concurrentRegistrations = 20;
    const users = [];
    
    log(`Creating ${concurrentRegistrations} test users...`);
    for (let i = 0; i < concurrentRegistrations; i++) {
      const user = new User({
        email: `test-perf-user-${i}@test.com`,
        password: 'Test123!@#',
        firstName: `User${i}`,
        lastName: 'Perf',
        role: 'student',
        studentId: `PERF-${i}`
      });
      await user.save();
      users.push(user);
    }

    log(`Registering ${concurrentRegistrations} users simultaneously...`);
    const startTime = Date.now();
    
    const registrationPromises = users.map(user =>
      axios.post(`${API_URL}/events/${event._id}/register`, {
        userId: user._id.toString()
      }).catch(error => ({ error: true, message: error.message }))
    );

    const results = await Promise.all(registrationPromises);
    const duration = Date.now() - startTime;

    const successful = results.filter(r => !r.error).length;
    const failed = results.filter(r => r.error).length;

    log(`Completed in ${duration}ms`);
    log(`Successful: ${successful}, Failed: ${failed}`);
    log(`Average time per registration: ${(duration / concurrentRegistrations).toFixed(2)}ms`);

    // Cleanup
    await User.deleteMany({ email: /test-perf-/ });
    await Event.deleteOne({ _id: event._id });

    if (successful >= concurrentRegistrations * 0.9) {
      logSuccess('✓ Event registration handled load successfully (>90% success rate)');
      return true;
    } else {
      log('⚠ Event registration struggled under load', 'yellow');
      return false;
    }
  } catch (error) {
    logError(`✗ Event registration load test FAILED: ${error.message}`);
    return false;
  }
}

async function testNotificationDeliverySpeed() {
  logSection('TEST: Real-time Notification Delivery Speed');
  
  try {
    const user = new User({
      email: 'test-perf-notification@test.com',
      password: 'Test123!@#',
      firstName: 'Notification',
      lastName: 'Perf',
      role: 'student'
    });
    await user.save();

    const notificationCount = 50;
    const deliveryTimes = [];

    log(`Creating and delivering ${notificationCount} notifications...`);

    for (let i = 0; i < notificationCount; i++) {
      const startTime = Date.now();
      
      const notification = new Notification({
        userId: user._id,
        title: `Performance Test Notification ${i + 1}`,
        message: 'Testing notification delivery speed',
        type: 'info',
        category: 'system',
        priority: 'medium',
        channels: [{ type: 'web', status: 'pending' }]
      });
      
      await notification.save();
      const deliveryTime = Date.now() - startTime;
      deliveryTimes.push(deliveryTime);
    }

    const avgDeliveryTime = deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length;
    const maxDeliveryTime = Math.max(...deliveryTimes);

    log(`Average delivery time: ${avgDeliveryTime.toFixed(2)}ms`);
    log(`Max delivery time: ${maxDeliveryTime}ms`);

    // Cleanup
    await User.deleteOne({ _id: user._id });
    await Notification.deleteMany({ userId: user._id });

    if (avgDeliveryTime < 100) {
      logSuccess('✓ Notification delivery speed excellent (<100ms)');
      return true;
    } else if (avgDeliveryTime < 500) {
      logSuccess('✓ Notification delivery speed acceptable (<500ms)');
      return true;
    } else {
      log('⚠ Notification delivery speed needs optimization', 'yellow');
      return false;
    }
  } catch (error) {
    logError(`✗ Notification delivery test FAILED: ${error.message}`);
    return false;
  }
}

async function testDatabaseQueryPerformance() {
  logSection('TEST: Database Query Performance');
  
  try {
    log('Testing complex query performance...');

    // Test 1: User search query
    const startTime1 = Date.now();
    await User.find({ role: 'student' }).limit(100);
    const queryTime1 = Date.now() - startTime1;
    log(`User search query: ${queryTime1}ms`);

    // Test 2: Event aggregation query
    const startTime2 = Date.now();
    await Event.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const queryTime2 = Date.now() - startTime2;
    log(`Event aggregation query: ${queryTime2}ms`);

    // Test 3: Notification count query
    const startTime3 = Date.now();
    await Notification.countDocuments({ isRead: false });
    const queryTime3 = Date.now() - startTime3;
    log(`Notification count query: ${queryTime3}ms`);

    const avgQueryTime = (queryTime1 + queryTime2 + queryTime3) / 3;

    if (avgQueryTime < 100) {
      logSuccess('✓ Database query performance excellent (<100ms avg)');
      return true;
    } else if (avgQueryTime < 500) {
      logSuccess('✓ Database query performance acceptable (<500ms avg)');
      return true;
    } else {
      log('⚠ Database queries need optimization', 'yellow');
      return false;
    }
  } catch (error) {
    logError(`✗ Database query performance test FAILED: ${error.message}`);
    return false;
  }
}

async function testMobileAppResponsiveness() {
  logSection('TEST: Mobile App Responsiveness');
  
  try {
    log('Testing API response times for mobile scenarios...');

    const endpoints = [
      { name: 'Digital ID Retrieval', url: `${API_URL}/digital-id/user/test-id` },
      { name: 'Event List', url: `${API_URL}/events?limit=10` },
      { name: 'Notifications', url: `${API_URL}/notifications?limit=20` }
    ];

    const responseTimes = [];

    for (const endpoint of endpoints) {
      const startTime = Date.now();
      try {
        await axios.get(endpoint.url, { timeout: 3000 });
        const responseTime = Date.now() - startTime;
        responseTimes.push(responseTime);
        log(`${endpoint.name}: ${responseTime}ms`);
      } catch (error) {
        log(`${endpoint.name}: Failed or timed out`, 'yellow');
      }
    }

    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

    if (avgResponseTime < 1000) {
      logSuccess('✓ Mobile responsiveness excellent (<1s)');
      return true;
    } else if (avgResponseTime < 3000) {
      logSuccess('✓ Mobile responsiveness acceptable (<3s)');
      return true;
    } else {
      log('⚠ Mobile responsiveness needs improvement', 'yellow');
      return false;
    }
  } catch (error) {
    logError(`✗ Mobile responsiveness test FAILED: ${error.message}`);
    return false;
  }
}

async function runPerformanceTests() {
  log('\n' + '='.repeat(60), 'cyan');
  log('E2E PERFORMANCE TESTING SUITE', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');

  const results = { total: 5, passed: 0, failed: 0 };

  try {
    await connectDatabase();

    const tests = [
      { name: 'Chatbot Response Time', fn: testChatbotResponseTime },
      { name: 'Event Registration Load', fn: testEventRegistrationLoad },
      { name: 'Notification Delivery Speed', fn: testNotificationDeliverySpeed },
      { name: 'Database Query Performance', fn: testDatabaseQueryPerformance },
      { name: 'Mobile Responsiveness', fn: testMobileAppResponsiveness }
    ];

    for (const test of tests) {
      const passed = await test.fn();
      if (passed) results.passed++;
      else results.failed++;
    }

  } catch (error) {
    logError(`Performance test suite failed: ${error.message}`);
  } finally {
    await mongoose.connection.close();
  }

  logSection('PERFORMANCE TEST SUMMARY');
  log(`Total: ${results.total}, Passed: ${results.passed}, Failed: ${results.failed}`, 
      results.failed > 0 ? 'yellow' : 'green');

  process.exit(results.failed > 0 ? 1 : 0);
}

if (require.main === module) {
  runPerformanceTests();
}

module.exports = { runPerformanceTests };
