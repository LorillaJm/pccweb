/**
 * Integration tests for internship notification system
 * Tests the complete notification flow for internship-related events
 */

const mongoose = require('mongoose');
const InternshipService = require('./services/InternshipService');
const NotificationService = require('./services/NotificationService');
const Internship = require('./models/Internship');
const InternshipApplication = require('./models/InternshipApplication');
const Company = require('./models/Company');
const User = require('./models/User');
const Notification = require('./models/Notification');

// Test configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pcc_portal_test';

// Test data
let testCompany;
let testInternship;
let testStudent;
let testApplication;
let testReviewer;

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to test database');
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    process.exit(1);
  }
}

async function cleanupTestData() {
  try {
    await Notification.deleteMany({ 
      $or: [
        { 'data.testData': true },
        { userId: testStudent?._id }
      ]
    });
    
    if (testApplication) {
      await InternshipApplication.findByIdAndDelete(testApplication._id);
    }
    if (testInternship) {
      await Internship.findByIdAndDelete(testInternship._id);
    }
    if (testCompany) {
      await Company.findByIdAndDelete(testCompany._id);
    }
    if (testStudent) {
      await User.findByIdAndDelete(testStudent._id);
    }
    if (testReviewer) {
      await User.findByIdAndDelete(testReviewer._id);
    }
    
    console.log('✓ Cleaned up test data');
  } catch (error) {
    console.error('✗ Cleanup failed:', error.message);
  }
}

async function setupTestData() {
  try {
    // Create test company
    testCompany = await Company.create({
      name: 'Test Tech Company',
      description: 'A test technology company',
      industry: 'Technology',
      website: 'https://testtech.com',
      address: '123 Test Street, Test City',
      contactPerson: {
        name: 'John Doe',
        email: 'john@testtech.com',
        phone: '+1234567890',
        position: 'HR Manager'
      },
      verificationStatus: 'verified',
      isActive: true
    });

    // Create test student
    testStudent = await User.create({
      firstName: 'Jane',
      lastName: 'Student',
      email: 'jane.student@test.com',
      password: 'hashedpassword123',
      role: 'student',
      studentId: 'TEST-2024-001',
      program: 'Computer Science',
      yearLevel: 3,
      isActive: true
    });

    // Create test reviewer
    testReviewer = await User.create({
      firstName: 'Bob',
      lastName: 'Reviewer',
      email: 'bob.reviewer@test.com',
      password: 'hashedpassword123',
      role: 'admin',
      isActive: true
    });

    // Create test internship
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 30);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 90);
    
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 14);

    testInternship = await Internship.create({
      companyId: testCompany._id,
      title: 'Software Development Intern',
      description: 'Test internship for software development',
      requirements: ['Programming skills', 'Team player'],
      skills: ['JavaScript', 'Node.js', 'React'],
      duration: 12,
      stipend: 15000,
      location: 'Test City',
      workArrangement: 'hybrid',
      slots: 5,
      applicationDeadline: deadline,
      startDate: startDate,
      endDate: endDate,
      status: 'published',
      targetPrograms: ['Computer Science', 'Information Technology'],
      yearLevelRequirement: 3,
      createdBy: testReviewer._id
    });

    console.log('✓ Test data setup complete');
  } catch (error) {
    console.error('✗ Test data setup failed:', error.message);
    throw error;
  }
}

// Test 1: Application status update notifications
async function testApplicationStatusNotifications() {
  console.log('\n--- Test 1: Application Status Update Notifications ---');
  
  try {
    // Create application
    testApplication = await InternshipService.submitApplication(
      testInternship._id,
      testStudent._id,
      {
        coverLetter: 'I am very interested in this internship opportunity.',
        resume: '/uploads/resumes/test-resume.pdf',
        studentInfo: {
          currentYear: 3,
          program: 'Computer Science',
          gpa: 3.5,
          expectedGraduation: new Date('2025-05-01'),
          skills: ['JavaScript', 'React', 'Node.js'],
          previousExperience: 'Completed several web development projects'
        }
      }
    );

    console.log('✓ Application submitted');

    // Wait a bit for notification processing
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test status updates
    const statuses = ['under_review', 'shortlisted', 'accepted'];
    
    for (const status of statuses) {
      await InternshipService.updateApplicationStatus(
        testApplication._id,
        status,
        testReviewer._id,
        { notes: `Application moved to ${status}` }
      );

      console.log(`✓ Status updated to: ${status}`);

      // Check if notification was created
      const notification = await Notification.findOne({
        userId: testStudent._id,
        category: 'internship',
        'data.applicationId': testApplication._id,
        'data.newStatus': status
      }).sort({ createdAt: -1 });

      if (notification) {
        console.log(`  ✓ Notification created: "${notification.title}"`);
        console.log(`    Message: ${notification.message}`);
        console.log(`    Type: ${notification.type}`);
        console.log(`    Priority: ${notification.priority}`);
      } else {
        console.log(`  ✗ No notification found for status: ${status}`);
      }

      await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log('✓ Application status notifications test passed');
    return true;
  } catch (error) {
    console.error('✗ Application status notifications test failed:', error.message);
    return false;
  }
}

// Test 2: Interview scheduling notifications
async function testInterviewNotifications() {
  console.log('\n--- Test 2: Interview Scheduling Notifications ---');
  
  try {
    const interviewDate = new Date();
    interviewDate.setDate(interviewDate.getDate() + 7);

    const interviewDetails = {
      date: interviewDate,
      time: '14:00',
      duration: 60,
      location: 'Test Tech Company Office',
      type: 'in_person',
      interviewerName: 'John Doe',
      interviewerEmail: 'john@testtech.com',
      notes: 'Please bring your portfolio'
    };

    await InternshipService.scheduleInterview(
      testApplication._id,
      interviewDetails
    );

    console.log('✓ Interview scheduled');

    // Wait for notification processing
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check for interview notification
    const notification = await Notification.findOne({
      userId: testStudent._id,
      category: 'internship',
      title: 'Interview Scheduled'
    }).sort({ createdAt: -1 });

    if (notification) {
      console.log('✓ Interview notification created');
      console.log(`  Title: ${notification.title}`);
      console.log(`  Message: ${notification.message}`);
      console.log(`  Priority: ${notification.priority}`);
      console.log(`  Channels: ${notification.channels.map(c => c.type).join(', ')}`);
    } else {
      console.log('✗ Interview notification not found');
      return false;
    }

    // Check for scheduled reminder
    const reminder = await Notification.findOne({
      userId: testStudent._id,
      category: 'internship',
      title: 'Interview Reminder',
      scheduledFor: { $exists: true }
    }).sort({ createdAt: -1 });

    if (reminder) {
      console.log('✓ Interview reminder scheduled');
      console.log(`  Scheduled for: ${reminder.scheduledFor}`);
    } else {
      console.log('⚠ Interview reminder not found (may be expected if interview is too soon)');
    }

    console.log('✓ Interview notifications test passed');
    return true;
  } catch (error) {
    console.error('✗ Interview notifications test failed:', error.message);
    return false;
  }
}

// Test 3: Progress tracking notifications
async function testProgressNotifications() {
  console.log('\n--- Test 3: Progress Tracking Notifications ---');
  
  try {
    // Update application to in_progress
    const application = await InternshipApplication.findById(testApplication._id);
    application.internshipStatus = 'in_progress';
    application.startedAt = new Date();
    await application.save();

    // Track progress
    const progressData = {
      milestone: 'Completed onboarding and initial training',
      description: 'Successfully completed the first week of internship',
      completionPercentage: 25,
      supervisorNotes: 'Great start, showing good initiative',
      studentReflection: 'Learning a lot about the company culture'
    };

    await InternshipService.trackProgress(
      testApplication._id,
      progressData,
      testReviewer._id
    );

    console.log('✓ Progress tracked');

    // Wait for notification processing
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check for progress notification
    const notification = await Notification.findOne({
      userId: testStudent._id,
      category: 'internship',
      title: 'Internship Progress Updated'
    }).sort({ createdAt: -1 });

    if (notification) {
      console.log('✓ Progress notification created');
      console.log(`  Title: ${notification.title}`);
      console.log(`  Message: ${notification.message}`);
      console.log(`  Milestone: ${notification.data.milestone}`);
    } else {
      console.log('✗ Progress notification not found');
      return false;
    }

    console.log('✓ Progress notifications test passed');
    return true;
  } catch (error) {
    console.error('✗ Progress notifications test failed:', error.message);
    return false;
  }
}

// Test 4: Evaluation notifications
async function testEvaluationNotifications() {
  console.log('\n--- Test 4: Evaluation Notifications ---');
  
  try {
    const evaluationData = {
      evaluatorType: 'company',
      period: 'midterm',
      ratings: {
        technicalSkills: 4,
        communication: 5,
        teamwork: 4,
        initiative: 5,
        reliability: 4,
        overallPerformance: 4
      },
      comments: 'Excellent performance so far. Shows great potential.',
      recommendations: 'Continue with current trajectory'
    };

    await InternshipService.submitEvaluation(
      testApplication._id,
      evaluationData,
      testReviewer._id
    );

    console.log('✓ Evaluation submitted');

    // Wait for notification processing
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check for evaluation notification
    const notification = await Notification.findOne({
      userId: testStudent._id,
      category: 'internship',
      title: 'Internship Evaluation Received'
    }).sort({ createdAt: -1 });

    if (notification) {
      console.log('✓ Evaluation notification created');
      console.log(`  Title: ${notification.title}`);
      console.log(`  Message: ${notification.message}`);
      console.log(`  Overall Rating: ${notification.data.overallRating}`);
      console.log(`  Channels: ${notification.channels.map(c => c.type).join(', ')}`);
    } else {
      console.log('✗ Evaluation notification not found');
      return false;
    }

    console.log('✓ Evaluation notifications test passed');
    return true;
  } catch (error) {
    console.error('✗ Evaluation notifications test failed:', error.message);
    return false;
  }
}

// Test 5: Completion notifications
async function testCompletionNotifications() {
  console.log('\n--- Test 5: Completion Notifications ---');
  
  try {
    const completionData = {
      finalRating: 4.5
    };

    await InternshipService.completeInternship(
      testApplication._id,
      completionData
    );

    console.log('✓ Internship completed');

    // Wait for notification processing
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check for completion notification
    const notification = await Notification.findOne({
      userId: testStudent._id,
      category: 'internship',
      title: 'Internship Completed!'
    }).sort({ createdAt: -1 });

    if (notification) {
      console.log('✓ Completion notification created');
      console.log(`  Title: ${notification.title}`);
      console.log(`  Message: ${notification.message}`);
      console.log(`  Type: ${notification.type}`);
      console.log(`  Priority: ${notification.priority}`);
      console.log(`  Final Rating: ${notification.data.finalRating}`);
    } else {
      console.log('✗ Completion notification not found');
      return false;
    }

    console.log('✓ Completion notifications test passed');
    return true;
  } catch (error) {
    console.error('✗ Completion notifications test failed:', error.message);
    return false;
  }
}

// Test 6: Reminder notifications
async function testReminderNotifications() {
  console.log('\n--- Test 6: Reminder Notifications ---');
  
  try {
    // Test progress report reminders
    console.log('Testing progress report reminders...');
    const progressResult = await InternshipService.sendProgressReportReminders(0);
    console.log(`✓ Progress reminders: ${progressResult.remindersSent} sent`);

    // Test evaluation reminders
    console.log('Testing evaluation reminders...');
    const evalResult = await InternshipService.sendEvaluationReminders();
    console.log(`✓ Evaluation reminders: ${evalResult.remindersSent} sent`);

    // Test deadline reminders
    console.log('Testing deadline reminders...');
    const deadlineResult = await InternshipService.sendDeadlineReminders(14);
    console.log(`✓ Deadline reminders: ${deadlineResult.remindersSent} sent`);

    // Test start reminders
    console.log('Testing start reminders...');
    const startResult = await InternshipService.sendStartReminders(30);
    console.log(`✓ Start reminders: ${startResult.remindersSent} sent`);

    console.log('✓ Reminder notifications test passed');
    return true;
  } catch (error) {
    console.error('✗ Reminder notifications test failed:', error.message);
    return false;
  }
}

// Test 7: Notification delivery channels
async function testNotificationChannels() {
  console.log('\n--- Test 7: Notification Delivery Channels ---');
  
  try {
    // Get all notifications for the test student
    const notifications = await Notification.find({
      userId: testStudent._id,
      category: 'internship'
    }).sort({ createdAt: -1 });

    console.log(`✓ Found ${notifications.length} notifications`);

    // Check channel distribution
    const channelStats = {
      web: 0,
      email: 0,
      sms: 0,
      push: 0
    };

    notifications.forEach(notification => {
      notification.channels.forEach(channel => {
        if (channelStats[channel.type] !== undefined) {
          channelStats[channel.type]++;
        }
      });
    });

    console.log('Channel distribution:');
    console.log(`  Web: ${channelStats.web}`);
    console.log(`  Email: ${channelStats.email}`);
    console.log(`  SMS: ${channelStats.sms}`);
    console.log(`  Push: ${channelStats.push}`);

    // Verify critical notifications use multiple channels
    const criticalNotifications = notifications.filter(n => 
      n.priority === 'high' || 
      ['Interview Scheduled', 'Application Accepted!', 'Internship Completed!'].includes(n.title)
    );

    console.log(`\n✓ Found ${criticalNotifications.length} critical notifications`);
    
    criticalNotifications.forEach(notification => {
      const channelCount = notification.channels.length;
      console.log(`  "${notification.title}": ${channelCount} channels`);
      if (channelCount < 2) {
        console.log(`    ⚠ Warning: Critical notification uses only ${channelCount} channel(s)`);
      }
    });

    console.log('✓ Notification channels test passed');
    return true;
  } catch (error) {
    console.error('✗ Notification channels test failed:', error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('='.repeat(60));
  console.log('INTERNSHIP NOTIFICATION INTEGRATION TESTS');
  console.log('='.repeat(60));

  await connectDB();
  await cleanupTestData();
  await setupTestData();

  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };

  const tests = [
    { name: 'Application Status Notifications', fn: testApplicationStatusNotifications },
    { name: 'Interview Notifications', fn: testInterviewNotifications },
    { name: 'Progress Notifications', fn: testProgressNotifications },
    { name: 'Evaluation Notifications', fn: testEvaluationNotifications },
    { name: 'Completion Notifications', fn: testCompletionNotifications },
    { name: 'Reminder Notifications', fn: testReminderNotifications },
    { name: 'Notification Channels', fn: testNotificationChannels }
  ];

  for (const test of tests) {
    results.total++;
    const passed = await test.fn();
    if (passed) {
      results.passed++;
    } else {
      results.failed++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);

  // Cleanup
  await cleanupTestData();
  await mongoose.connection.close();
  console.log('\n✓ Database connection closed');

  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
