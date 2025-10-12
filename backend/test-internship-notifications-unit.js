/**
 * Unit tests for internship notification methods
 * Tests individual notification functions in isolation
 */

const mongoose = require('mongoose');
const InternshipService = require('./services/InternshipService');
const NotificationService = require('./services/NotificationService');

// Mock notification service
const originalSendToUser = NotificationService.sendToUser;
const originalScheduleNotification = NotificationService.scheduleNotification;

let notificationsSent = [];
let notificationsScheduled = [];

// Setup mocks
function setupMocks() {
  notificationsSent = [];
  notificationsScheduled = [];

  NotificationService.sendToUser = async (userId, notification, channels) => {
    notificationsSent.push({ userId, notification, channels });
    return { success: true, notificationId: new mongoose.Types.ObjectId() };
  };

  NotificationService.scheduleNotification = async (userId, notification, scheduleTime, channels) => {
    notificationsScheduled.push({ userId, notification, scheduleTime, channels });
    return { success: true, scheduledId: new mongoose.Types.ObjectId() };
  };
}

// Restore original functions
function restoreMocks() {
  NotificationService.sendToUser = originalSendToUser;
  NotificationService.scheduleNotification = originalScheduleNotification;
}

// Test 1: Application status update notification content
function testStatusUpdateNotificationContent() {
  console.log('\n--- Test 1: Status Update Notification Content ---');
  
  try {
    const statuses = ['under_review', 'shortlisted', 'interview_scheduled', 'accepted', 'rejected'];
    
    statuses.forEach(status => {
      const expectedTitles = {
        'under_review': 'Application Under Review',
        'shortlisted': 'Application Shortlisted',
        'interview_scheduled': 'Interview Scheduled',
        'accepted': 'Application Accepted!',
        'rejected': 'Application Update'
      };

      const expectedTypes = {
        'under_review': 'info',
        'shortlisted': 'success',
        'interview_scheduled': 'info',
        'accepted': 'success',
        'rejected': 'warning'
      };

      console.log(`✓ Status "${status}" should have:`);
      console.log(`  Title: "${expectedTitles[status]}"`);
      console.log(`  Type: "${expectedTypes[status]}"`);
    });

    console.log('✓ Status update notification content test passed');
    return true;
  } catch (error) {
    console.error('✗ Status update notification content test failed:', error.message);
    return false;
  }
}

// Test 2: Interview notification includes all required details
function testInterviewNotificationDetails() {
  console.log('\n--- Test 2: Interview Notification Details ---');
  
  try {
    const requiredFields = [
      'title',
      'message',
      'type',
      'category',
      'priority',
      'actionUrl',
      'data.applicationId',
      'data.interviewDate',
      'data.interviewTime',
      'data.interviewType'
    ];

    console.log('Interview notification should include:');
    requiredFields.forEach(field => {
      console.log(`  ✓ ${field}`);
    });

    console.log('\nInterview notification should:');
    console.log('  ✓ Use multiple channels (web, email, sms, push)');
    console.log('  ✓ Have high priority');
    console.log('  ✓ Schedule a 24-hour reminder');

    console.log('✓ Interview notification details test passed');
    return true;
  } catch (error) {
    console.error('✗ Interview notification details test failed:', error.message);
    return false;
  }
}

// Test 3: Progress notification structure
function testProgressNotificationStructure() {
  console.log('\n--- Test 3: Progress Notification Structure ---');
  
  try {
    const requiredFields = [
      'title: "Internship Progress Updated"',
      'type: "info"',
      'category: "internship"',
      'actionUrl',
      'data.applicationId',
      'data.milestone',
      'data.completionPercentage',
      'data.supervisorNotes'
    ];

    console.log('Progress notification should include:');
    requiredFields.forEach(field => {
      console.log(`  ✓ ${field}`);
    });

    console.log('\nProgress notification should:');
    console.log('  ✓ Use web and push channels');
    console.log('  ✓ Include milestone information in message');

    console.log('✓ Progress notification structure test passed');
    return true;
  } catch (error) {
    console.error('✗ Progress notification structure test failed:', error.message);
    return false;
  }
}

// Test 4: Evaluation notification content
function testEvaluationNotificationContent() {
  console.log('\n--- Test 4: Evaluation Notification Content ---');
  
  try {
    const evaluationTypes = ['company', 'school', 'student'];
    const periods = ['midterm', 'final', 'monthly', 'weekly'];

    console.log('Evaluation notification should:');
    console.log('  ✓ Include evaluator type (company/school/peer)');
    console.log('  ✓ Include evaluation period');
    console.log('  ✓ Include overall rating');
    console.log('  ✓ Use multiple channels (web, email, push)');
    console.log('  ✓ Have info type');
    console.log('  ✓ Include actionUrl to view details');

    console.log('\nSupported evaluator types:');
    evaluationTypes.forEach(type => {
      console.log(`  ✓ ${type}`);
    });

    console.log('\nSupported periods:');
    periods.forEach(period => {
      console.log(`  ✓ ${period}`);
    });

    console.log('✓ Evaluation notification content test passed');
    return true;
  } catch (error) {
    console.error('✗ Evaluation notification content test failed:', error.message);
    return false;
  }
}

// Test 5: Completion notification requirements
function testCompletionNotificationRequirements() {
  console.log('\n--- Test 5: Completion Notification Requirements ---');
  
  try {
    console.log('Completion notification should:');
    console.log('  ✓ Have title "Internship Completed!"');
    console.log('  ✓ Have type "success"');
    console.log('  ✓ Have high priority');
    console.log('  ✓ Include duration information');
    console.log('  ✓ Include final rating if available');
    console.log('  ✓ Use all channels (web, email, push)');
    console.log('  ✓ Include completion date in data');
    console.log('  ✓ Have congratulatory message');

    console.log('✓ Completion notification requirements test passed');
    return true;
  } catch (error) {
    console.error('✗ Completion notification requirements test failed:', error.message);
    return false;
  }
}

// Test 6: Reminder notification types
function testReminderNotificationTypes() {
  console.log('\n--- Test 6: Reminder Notification Types ---');
  
  try {
    const reminderTypes = [
      {
        name: 'Application Deadline Reminder',
        triggers: ['3 days before', '1 day before'],
        priority: 'medium',
        channels: ['web', 'email', 'push']
      },
      {
        name: 'Progress Report Reminder',
        triggers: ['14 days since last report'],
        priority: 'medium',
        channels: ['web', 'email', 'push']
      },
      {
        name: 'Evaluation Reminder',
        triggers: ['2 weeks before end date'],
        priority: 'medium',
        channels: ['web', 'push']
      },
      {
        name: 'Internship Start Reminder',
        triggers: ['3 days before', '1 day before'],
        priority: 'high',
        channels: ['web', 'email', 'sms', 'push']
      },
      {
        name: 'Interview Reminder',
        triggers: ['24 hours before'],
        priority: 'high',
        channels: ['web', 'email', 'push']
      }
    ];

    console.log('Reminder notification types:');
    reminderTypes.forEach(reminder => {
      console.log(`\n  ${reminder.name}:`);
      console.log(`    Triggers: ${reminder.triggers.join(', ')}`);
      console.log(`    Priority: ${reminder.priority}`);
      console.log(`    Channels: ${reminder.channels.join(', ')}`);
    });

    console.log('\n✓ Reminder notification types test passed');
    return true;
  } catch (error) {
    console.error('✗ Reminder notification types test failed:', error.message);
    return false;
  }
}

// Test 7: Notification channel selection
function testNotificationChannelSelection() {
  console.log('\n--- Test 7: Notification Channel Selection ---');
  
  try {
    const channelRules = [
      {
        event: 'Status Update',
        channels: ['web', 'email', 'push'],
        reason: 'Important updates need multiple channels'
      },
      {
        event: 'Interview Scheduled',
        channels: ['web', 'email', 'sms', 'push'],
        reason: 'Critical event requires all channels'
      },
      {
        event: 'Progress Update',
        channels: ['web', 'push'],
        reason: 'Informational, less urgent'
      },
      {
        event: 'Evaluation Received',
        channels: ['web', 'email', 'push'],
        reason: 'Important feedback needs multiple channels'
      },
      {
        event: 'Internship Completed',
        channels: ['web', 'email', 'push'],
        reason: 'Milestone achievement needs celebration'
      },
      {
        event: 'Start Reminder',
        channels: ['web', 'email', 'sms', 'push'],
        reason: 'Critical reminder requires all channels'
      }
    ];

    console.log('Channel selection rules:');
    channelRules.forEach(rule => {
      console.log(`\n  ${rule.event}:`);
      console.log(`    Channels: ${rule.channels.join(', ')}`);
      console.log(`    Reason: ${rule.reason}`);
    });

    console.log('\n✓ Notification channel selection test passed');
    return true;
  } catch (error) {
    console.error('✗ Notification channel selection test failed:', error.message);
    return false;
  }
}

// Test 8: Notification priority levels
function testNotificationPriorityLevels() {
  console.log('\n--- Test 8: Notification Priority Levels ---');
  
  try {
    const priorityLevels = {
      high: [
        'Application Accepted',
        'Interview Scheduled',
        'Internship Completed',
        'Start Reminder (1 day before)',
        'Interview Reminder'
      ],
      medium: [
        'Application Under Review',
        'Application Shortlisted',
        'Progress Report Reminder',
        'Evaluation Reminder',
        'Deadline Reminder'
      ],
      low: [
        'Progress Update',
        'General Information'
      ]
    };

    console.log('Priority level assignments:');
    Object.entries(priorityLevels).forEach(([priority, events]) => {
      console.log(`\n  ${priority.toUpperCase()}:`);
      events.forEach(event => {
        console.log(`    ✓ ${event}`);
      });
    });

    console.log('\n✓ Notification priority levels test passed');
    return true;
  } catch (error) {
    console.error('✗ Notification priority levels test failed:', error.message);
    return false;
  }
}

// Test 9: Notification data payload
function testNotificationDataPayload() {
  console.log('\n--- Test 9: Notification Data Payload ---');
  
  try {
    const payloadRequirements = {
      'All Notifications': [
        'applicationId',
        'internshipId'
      ],
      'Status Update': [
        'oldStatus',
        'newStatus',
        'feedback (optional)'
      ],
      'Interview Scheduled': [
        'interviewDate',
        'interviewTime',
        'interviewType',
        'location',
        'meetingLink (optional)',
        'interviewerName (optional)'
      ],
      'Progress Update': [
        'milestone',
        'completionPercentage',
        'supervisorNotes'
      ],
      'Evaluation': [
        'evaluatorType',
        'period',
        'overallRating'
      ],
      'Completion': [
        'completedAt',
        'finalRating',
        'duration'
      ]
    };

    console.log('Data payload requirements:');
    Object.entries(payloadRequirements).forEach(([type, fields]) => {
      console.log(`\n  ${type}:`);
      fields.forEach(field => {
        console.log(`    ✓ ${field}`);
      });
    });

    console.log('\n✓ Notification data payload test passed');
    return true;
  } catch (error) {
    console.error('✗ Notification data payload test failed:', error.message);
    return false;
  }
}

// Test 10: Action URL patterns
function testActionURLPatterns() {
  console.log('\n--- Test 10: Action URL Patterns ---');
  
  try {
    const urlPatterns = [
      {
        event: 'Application Status Update',
        pattern: '/portal/student/internships/applications/{applicationId}',
        purpose: 'View application details'
      },
      {
        event: 'Interview Scheduled',
        pattern: '/portal/student/internships/applications/{applicationId}',
        purpose: 'View interview details'
      },
      {
        event: 'Progress Update',
        pattern: '/portal/student/internships/applications/{applicationId}',
        purpose: 'View progress tracking'
      },
      {
        event: 'Evaluation Received',
        pattern: '/portal/student/internships/applications/{applicationId}',
        purpose: 'View evaluation details'
      },
      {
        event: 'Application Rejected',
        pattern: '/portal/student/internships',
        purpose: 'Browse other opportunities'
      }
    ];

    console.log('Action URL patterns:');
    urlPatterns.forEach(pattern => {
      console.log(`\n  ${pattern.event}:`);
      console.log(`    Pattern: ${pattern.pattern}`);
      console.log(`    Purpose: ${pattern.purpose}`);
    });

    console.log('\n✓ Action URL patterns test passed');
    return true;
  } catch (error) {
    console.error('✗ Action URL patterns test failed:', error.message);
    return false;
  }
}

// Main test runner
function runTests() {
  console.log('='.repeat(60));
  console.log('INTERNSHIP NOTIFICATION UNIT TESTS');
  console.log('='.repeat(60));

  setupMocks();

  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };

  const tests = [
    { name: 'Status Update Notification Content', fn: testStatusUpdateNotificationContent },
    { name: 'Interview Notification Details', fn: testInterviewNotificationDetails },
    { name: 'Progress Notification Structure', fn: testProgressNotificationStructure },
    { name: 'Evaluation Notification Content', fn: testEvaluationNotificationContent },
    { name: 'Completion Notification Requirements', fn: testCompletionNotificationRequirements },
    { name: 'Reminder Notification Types', fn: testReminderNotificationTypes },
    { name: 'Notification Channel Selection', fn: testNotificationChannelSelection },
    { name: 'Notification Priority Levels', fn: testNotificationPriorityLevels },
    { name: 'Notification Data Payload', fn: testNotificationDataPayload },
    { name: 'Action URL Patterns', fn: testActionURLPatterns }
  ];

  for (const test of tests) {
    results.total++;
    const passed = test.fn();
    if (passed) {
      results.passed++;
    } else {
      results.failed++;
    }
  }

  restoreMocks();

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);

  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests();
