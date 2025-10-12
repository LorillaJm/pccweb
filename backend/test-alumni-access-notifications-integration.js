/**
 * Integration tests for Alumni and Access Notification Systems
 * Tests the integration of notifications with alumni and campus access features
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

// Import services
const alumniNotificationService = require('./services/AlumniNotificationService');
const accessNotificationService = require('./services/AccessNotificationService');
const AlumniService = require('./services/AlumniService');
const DigitalIDService = require('./services/DigitalIDService');
const AccessControlService = require('./services/AccessControlService');
const JobService = require('./services/JobService');
const MentorshipService = require('./services/MentorshipService');

// Import models
const User = require('./models/User');
const AlumniProfile = require('./models/AlumniProfile');
const DigitalID = require('./models/DigitalID');
const Facility = require('./models/Facility');
const Notification = require('./models/Notification');

// Test configuration
const TEST_CONFIG = {
  testUser: {
    firstName: 'Test',
    lastName: 'Alumni',
    email: 'test.alumni@test.com',
    password: 'TestPassword123!',
    role: 'student',
    isAlumni: true
  },
  testMentor: {
    firstName: 'Test',
    lastName: 'Mentor',
    email: 'test.mentor@test.com',
    password: 'TestPassword123!',
    role: 'student',
    isAlumni: true
  }
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

/**
 * Helper function to run a test
 */
async function runTest(testName, testFn) {
  try {
    console.log(`\n🧪 Running: ${testName}`);
    await testFn();
    console.log(`✅ PASSED: ${testName}`);
    testResults.passed++;
    testResults.tests.push({ name: testName, status: 'PASSED' });
  } catch (error) {
    console.error(`❌ FAILED: ${testName}`);
    console.error(`   Error: ${error.message}`);
    testResults.failed++;
    testResults.tests.push({ name: testName, status: 'FAILED', error: error.message });
  }
}

/**
 * Helper function to create test user
 */
async function createTestUser(userData) {
  const user = new User(userData);
  await user.save();
  return user;
}

/**
 * Helper function to cleanup test data
 */
async function cleanupTestData() {
  await User.deleteMany({ email: { $regex: /test\./i } });
  await AlumniProfile.deleteMany({});
  await DigitalID.deleteMany({});
  await Notification.deleteMany({});
}

/**
 * Test Suite: Alumni Verification Notifications
 */
async function testAlumniVerificationNotifications() {
  await runTest('Alumni Verification - Approved Notification', async () => {
    const user = await createTestUser(TEST_CONFIG.testUser);
    
    const alumniService = new AlumniService();
    await alumniService.createOrUpdateProfile(user._id, {
      graduationYear: 2020,
      degree: 'Computer Science',
      currentPosition: 'Software Engineer',
      currentCompany: 'Tech Corp'
    });

    const profile = await AlumniProfile.findOne({ userId: user._id });
    await alumniService.verifyAlumniProfile(profile._id, user._id, 'verified');

    // Check if notification was created
    const notification = await Notification.findOne({
      userId: user._id,
      category: 'social',
      'data.verificationType': 'alumni'
    });

    if (!notification) {
      throw new Error('Verification notification not created');
    }

    if (notification.type !== 'success') {
      throw new Error('Notification type should be success for verified status');
    }
  });

  await runTest('Alumni Verification - Rejected Notification', async () => {
    const user = await createTestUser({
      ...TEST_CONFIG.testUser,
      email: 'test.alumni2@test.com'
    });
    
    const alumniService = new AlumniService();
    await alumniService.createOrUpdateProfile(user._id, {
      graduationYear: 2020,
      degree: 'Computer Science'
    });

    const profile = await AlumniProfile.findOne({ userId: user._id });
    await alumniService.verifyAlumniProfile(profile._id, user._id, 'rejected', 'Incomplete documentation');

    const notification = await Notification.findOne({
      userId: user._id,
      category: 'social',
      'data.status': 'rejected'
    });

    if (!notification) {
      throw new Error('Rejection notification not created');
    }

    if (notification.type !== 'warning') {
      throw new Error('Notification type should be warning for rejected status');
    }
  });
}

/**
 * Test Suite: Job Application Notifications
 */
async function testJobApplicationNotifications() {
  await runTest('Job Application - Status Update Notification', async () => {
    const result = await alumniNotificationService.sendJobApplicationUpdateNotification(
      new mongoose.Types.ObjectId(),
      {
        _id: new mongoose.Types.ObjectId(),
        jobId: {
          _id: new mongoose.Types.ObjectId(),
          title: 'Software Engineer',
          company: 'Tech Corp'
        }
      },
      'shortlisted'
    );

    if (!result.success) {
      throw new Error('Failed to send job application notification');
    }
  });

  await runTest('Job Posting - New Job Notification', async () => {
    const result = await alumniNotificationService.sendJobPostingNotification(
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Senior Developer',
        company: 'Innovation Inc',
        workType: 'full_time',
        location: 'Remote'
      },
      {
        skills: ['JavaScript', 'React'],
        industry: 'Technology'
      }
    );

    if (!result.success) {
      throw new Error('Failed to send job posting notification');
    }
  });
}

/**
 * Test Suite: Mentorship Notifications
 */
async function testMentorshipNotifications() {
  await runTest('Mentorship - Match Notification', async () => {
    const mentee = await createTestUser({
      ...TEST_CONFIG.testUser,
      email: 'test.mentee@test.com'
    });

    const mentor = await createTestUser({
      ...TEST_CONFIG.testMentor,
      email: 'test.mentor@test.com'
    });

    const result = await alumniNotificationService.sendMentorshipMatchNotification(
      mentee._id,
      mentor._id,
      {
        matchScore: 85,
        focusAreas: ['Career Development', 'Technical Skills']
      }
    );

    if (!result.success) {
      throw new Error('Failed to send mentorship match notification');
    }

    const notification = await Notification.findOne({
      userId: mentee._id,
      category: 'social',
      'data.mentorId': mentor._id
    });

    if (!notification) {
      throw new Error('Mentorship match notification not created');
    }
  });

  await runTest('Mentorship - Progress Update Notification', async () => {
    const user = await createTestUser({
      ...TEST_CONFIG.testUser,
      email: 'test.progress@test.com'
    });

    const result = await alumniNotificationService.sendMentorshipProgressNotification(
      user._id,
      {
        _id: new mongoose.Types.ObjectId()
      },
      'milestone',
      {
        milestone: 'Completed first project review'
      }
    );

    if (!result.success) {
      throw new Error('Failed to send mentorship progress notification');
    }
  });
}

/**
 * Test Suite: Digital ID Notifications
 */
async function testDigitalIDNotifications() {
  await runTest('Digital ID - Generation Notification', async () => {
    const user = await createTestUser({
      ...TEST_CONFIG.testUser,
      email: 'test.digitalid@test.com'
    });

    const digitalIDService = new DigitalIDService();
    const result = await digitalIDService.generateDigitalID(user._id);

    if (!result.success) {
      throw new Error('Failed to generate digital ID');
    }

    const notification = await Notification.findOne({
      userId: user._id,
      category: 'access',
      'data.updateType': 'generated'
    });

    if (!notification) {
      throw new Error('Digital ID generation notification not created');
    }
  });

  await runTest('Digital ID - Permission Added Notification', async () => {
    const user = await createTestUser({
      ...TEST_CONFIG.testUser,
      email: 'test.permission@test.com'
    });

    const digitalIDService = new DigitalIDService();
    await digitalIDService.generateDigitalID(user._id);

    const result = await digitalIDService.addFacilityPermission(user._id, {
      facilityId: 'LAB001',
      facilityName: 'Computer Lab',
      accessType: 'full'
    });

    if (!result.success) {
      throw new Error('Failed to add facility permission');
    }

    const notification = await Notification.findOne({
      userId: user._id,
      category: 'access',
      'data.updateType': 'permission_added'
    });

    if (!notification) {
      throw new Error('Permission added notification not created');
    }
  });

  await runTest('Digital ID - Suspension Notification', async () => {
    const user = await createTestUser({
      ...TEST_CONFIG.testUser,
      email: 'test.suspend@test.com'
    });

    const digitalIDService = new DigitalIDService();
    await digitalIDService.generateDigitalID(user._id);

    const result = await digitalIDService.suspendDigitalID(
      user._id,
      'Policy violation',
      user._id
    );

    if (!result.success) {
      throw new Error('Failed to suspend digital ID');
    }

    const notification = await Notification.findOne({
      userId: user._id,
      category: 'access',
      'data.updateType': 'suspended'
    });

    if (!notification) {
      throw new Error('Suspension notification not created');
    }

    if (notification.priority !== 'urgent') {
      throw new Error('Suspension notification should have urgent priority');
    }
  });
}

/**
 * Test Suite: Access Control Notifications
 */
async function testAccessControlNotifications() {
  await runTest('Access Control - Denied Access Notification', async () => {
    const user = await createTestUser({
      ...TEST_CONFIG.testUser,
      email: 'test.access@test.com'
    });

    const result = await accessNotificationService.sendAccessAttemptNotification(
      user._id,
      {
        facilityName: 'Restricted Lab',
        accessResult: 'denied',
        timestamp: new Date(),
        denialReason: 'Insufficient permissions'
      }
    );

    if (!result.success) {
      throw new Error('Failed to send access attempt notification');
    }

    const notification = await Notification.findOne({
      userId: user._id,
      category: 'access',
      type: 'warning'
    });

    if (!notification) {
      throw new Error('Access denied notification not created');
    }
  });

  await runTest('Access Control - Security Alert Notification', async () => {
    const user = await createTestUser({
      ...TEST_CONFIG.testUser,
      email: 'test.security@test.com'
    });

    const result = await accessNotificationService.sendSecurityAlertNotification(
      user._id,
      'multiple_failed_attempts',
      {
        facilityName: 'Main Building',
        attemptCount: 5,
        timeWindow: 5
      }
    );

    if (!result.success) {
      throw new Error('Failed to send security alert notification');
    }

    const notification = await Notification.findOne({
      userId: user._id,
      category: 'access',
      type: 'error'
    });

    if (!notification) {
      throw new Error('Security alert notification not created');
    }

    if (notification.priority !== 'urgent') {
      throw new Error('Security alert should have urgent priority');
    }
  });

  await runTest('Access Control - Emergency Lockdown Notification', async () => {
    // Create test facility
    const facility = new Facility({
      facilityId: 'TEST001',
      name: 'Test Building',
      type: 'laboratory',
      location: 'Building A',
      isActive: true
    });
    await facility.save();

    const result = await accessNotificationService.sendEmergencyLockdownNotification(
      'TEST001',
      'Security threat detected'
    );

    if (!result.success) {
      throw new Error('Failed to send emergency lockdown notification');
    }

    // Cleanup
    await Facility.deleteOne({ facilityId: 'TEST001' });
  });
}

/**
 * Test Suite: Notification Delivery Channels
 */
async function testNotificationChannels() {
  await runTest('Notification Channels - Multiple Channels', async () => {
    const user = await createTestUser({
      ...TEST_CONFIG.testUser,
      email: 'test.channels@test.com'
    });

    const result = await alumniNotificationService.sendVerificationNotification(
      user._id,
      'verified'
    );

    if (!result.success) {
      throw new Error('Failed to send notification');
    }

    const notification = await Notification.findOne({
      userId: user._id
    });

    if (!notification) {
      throw new Error('Notification not created');
    }

    // Check that multiple channels were configured
    const channelTypes = notification.channels.map(ch => ch.type);
    if (!channelTypes.includes('web') || !channelTypes.includes('email')) {
      throw new Error('Expected multiple notification channels');
    }
  });
}

/**
 * Test Suite: Notification Priority and Urgency
 */
async function testNotificationPriority() {
  await runTest('Notification Priority - Urgent Alerts', async () => {
    const user = await createTestUser({
      ...TEST_CONFIG.testUser,
      email: 'test.priority@test.com'
    });

    await accessNotificationService.sendSecurityAlertNotification(
      user._id,
      'tamper_detected',
      {
        facilityName: 'Secure Area'
      }
    );

    const notification = await Notification.findOne({
      userId: user._id,
      priority: 'urgent'
    });

    if (!notification) {
      throw new Error('Urgent notification not created with correct priority');
    }
  });

  await runTest('Notification Priority - Low Priority Updates', async () => {
    const user = await createTestUser({
      ...TEST_CONFIG.testUser,
      email: 'test.lowpriority@test.com'
    });

    await alumniNotificationService.sendProfileCompletionReminder(
      user._id,
      75,
      ['bio', 'skills']
    );

    const notification = await Notification.findOne({
      userId: user._id,
      priority: 'low'
    });

    if (!notification) {
      throw new Error('Low priority notification not created with correct priority');
    }
  });
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('='.repeat(80));
  console.log('ALUMNI AND ACCESS NOTIFICATION INTEGRATION TESTS');
  console.log('='.repeat(80));

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pcc-portal');
    console.log('✅ Connected to MongoDB');

    // Cleanup before tests
    await cleanupTestData();
    console.log('✅ Cleaned up test data');

    // Run test suites
    console.log('\n📋 Running Test Suites...\n');

    await testAlumniVerificationNotifications();
    await testJobApplicationNotifications();
    await testMentorshipNotifications();
    await testDigitalIDNotifications();
    await testAccessControlNotifications();
    await testNotificationChannels();
    await testNotificationPriority();

    // Cleanup after tests
    await cleanupTestData();
    console.log('\n✅ Cleaned up test data');

  } catch (error) {
    console.error('\n❌ Test suite error:', error);
    testResults.failed++;
  } finally {
    // Print summary
    console.log('\n' + '='.repeat(80));
    console.log('TEST SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Tests: ${testResults.passed + testResults.failed}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(2)}%`);
    
    if (testResults.failed > 0) {
      console.log('\nFailed Tests:');
      testResults.tests
        .filter(t => t.status === 'FAILED')
        .forEach(t => console.log(`  ❌ ${t.name}: ${t.error}`));
    }

    console.log('='.repeat(80));

    // Close database connection
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');

    // Exit with appropriate code
    process.exit(testResults.failed > 0 ? 1 : 0);
  }
}

// Run tests
runAllTests();
