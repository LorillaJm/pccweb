# Notification Integration Guide

## Quick Reference for Task 9.3 Implementation

This guide provides quick reference for using the notification system integrated with alumni and access features.

---

## Table of Contents

1. [Alumni Notifications](#alumni-notifications)
2. [Access & Security Notifications](#access--security-notifications)
3. [Mentorship Notifications](#mentorship-notifications)
4. [Job Board Notifications](#job-board-notifications)
5. [Best Practices](#best-practices)

---

## Alumni Notifications

### Verification Notifications

```javascript
const alumniNotificationService = require('./services/AlumniNotificationService');

// Send verification approved
await alumniNotificationService.sendVerificationNotification(
  userId,
  'verified'
);

// Send verification rejected
await alumniNotificationService.sendVerificationNotification(
  userId,
  'rejected',
  'Graduation records not found'
);
```

### Networking Notifications

```javascript
// Connection request
await alumniNotificationService.sendNetworkingNotification(
  recipientId,
  senderId,
  'request'
);

// Connection accepted
await alumniNotificationService.sendNetworkingNotification(
  recipientId,
  senderId,
  'accept'
);

// Connection rejected
await alumniNotificationService.sendNetworkingNotification(
  recipientId,
  senderId,
  'reject'
);
```

### Directory Updates

```javascript
// Profile featured
await alumniNotificationService.sendAlumniDirectoryUpdateNotification(
  userId,
  'profile_featured'
);

// New connection
await alumniNotificationService.sendAlumniDirectoryUpdateNotification(
  userId,
  'new_connection',
  { connectionName: 'John Doe' }
);

// Profile viewed
await alumniNotificationService.sendAlumniDirectoryUpdateNotification(
  userId,
  'profile_viewed',
  { viewerName: 'Jane Smith' }
);
```

---

## Access & Security Notifications

### Access Attempt Notifications

```javascript
const accessNotificationService = require('./services/AccessNotificationService');

// Access denied
await accessNotificationService.sendAccessAttemptNotification(
  userId,
  {
    facilityName: 'Computer Laboratory',
    accessResult: 'denied',
    timestamp: new Date(),
    denialReason: 'Insufficient permissions'
  }
);
```

### Security Alerts

```javascript
// Multiple failed attempts
await accessNotificationService.sendSecurityAlertNotification(
  userId,
  'multiple_failed_attempts',
  {
    facilityName: 'Research Lab',
    attemptCount: 5,
    timeWindow: 5
  }
);

// Expired ID
await accessNotificationService.sendSecurityAlertNotification(
  userId,
  'expired_id',
  {}
);

// Unauthorized facility
await accessNotificationService.sendSecurityAlertNotification(
  userId,
  'unauthorized_facility',
  { facilityName: 'Server Room' }
);

// ID suspended
await accessNotificationService.sendSecurityAlertNotification(
  userId,
  'id_suspended',
  { reason: 'Security policy violation' }
);
```

### Digital ID Updates

```javascript
// ID generated
await accessNotificationService.sendDigitalIDUpdateNotification(
  userId,
  'generated'
);

// ID expiring soon
await accessNotificationService.sendDigitalIDUpdateNotification(
  userId,
  'expiring_soon',
  { daysUntilExpiry: 15 }
);

// Permission added
await accessNotificationService.sendDigitalIDUpdateNotification(
  userId,
  'permission_added',
  { facilityName: 'Research Laboratory' }
);

// Permission removed
await accessNotificationService.sendDigitalIDUpdateNotification(
  userId,
  'permission_removed',
  { facilityName: 'Faculty Lounge' }
);

// ID suspended
await accessNotificationService.sendDigitalIDUpdateNotification(
  userId,
  'suspended',
  { reason: 'Policy violation' }
);

// ID reactivated
await accessNotificationService.sendDigitalIDUpdateNotification(
  userId,
  'reactivated'
);
```

### Emergency Notifications

```javascript
// Activate lockdown
await accessNotificationService.sendEmergencyLockdownNotification(
  'LIB001', // facilityId or 'all' for campus-wide
  'Security incident reported',
  { severity: 'high' }
);

// Deactivate lockdown
await accessNotificationService.sendLockdownDeactivationNotification(
  'LIB001',
  { resolvedBy: adminUserId }
);
```

### Bulk Operations

```javascript
// Send expiry reminders
await accessNotificationService.sendBulkExpiryReminders(30); // 30 days before expiry
```

---

## Mentorship Notifications

### Mentorship Requests

```javascript
// Send mentorship request
await alumniNotificationService.sendMentorshipRequestNotification(
  mentorId,
  menteeId,
  {
    focusAreas: ['Career Development', 'Technical Skills'],
    message: 'I would like guidance on my career path'
  }
);

// Send request response
await alumniNotificationService.sendMentorshipRequestResponseNotification(
  menteeId,
  mentorId,
  'accepted', // or 'rejected'
  'I would be happy to mentor you'
);
```

### Mentorship Matching

```javascript
// Send match notification
await alumniNotificationService.sendMentorshipMatchNotification(
  menteeId,
  mentorId,
  {
    matchScore: 85,
    focusAreas: ['Software Development', 'Career Guidance']
  }
);
```

### Mentorship Progress

```javascript
// Session scheduled
await alumniNotificationService.sendMentorshipProgressNotification(
  recipientId,
  mentorship,
  'session',
  { sessionDate: new Date('2024-10-15') }
);

// Progress update
await alumniNotificationService.sendMentorshipProgressNotification(
  recipientId,
  mentorship,
  'progress',
  { notes: 'Great progress this month' }
);

// Milestone achieved
await alumniNotificationService.sendMentorshipProgressNotification(
  recipientId,
  mentorship,
  'milestone',
  { milestone: 'Completed first month' }
);

// Mentorship completed
await alumniNotificationService.sendMentorshipProgressNotification(
  recipientId,
  mentorship,
  'completion',
  { feedback: 'Excellent mentorship experience' }
);
```

---

## Job Board Notifications

### Job Postings

```javascript
// Post new job to targeted alumni
await alumniNotificationService.sendJobPostingNotification(
  jobPosting,
  {
    graduationYears: [2020, 2021, 2022],
    programs: ['Computer Science', 'Information Technology'],
    skills: ['JavaScript', 'React', 'Node.js'],
    industry: 'Technology'
  }
);
```

### Application Updates

```javascript
// Application received (to employer)
await alumniNotificationService.sendJobApplicationReceivedNotification(
  employerId,
  application
);

// Application status update (to applicant)
await alumniNotificationService.sendJobApplicationUpdateNotification(
  applicantId,
  application,
  'shortlisted', // Status: under_review, shortlisted, interview_scheduled, accepted, rejected
  'Your qualifications match our requirements'
);
```

---

## Best Practices

### 1. Error Handling

Always wrap notification calls in try-catch blocks:

```javascript
try {
  const result = await alumniNotificationService.sendVerificationNotification(
    userId,
    'verified'
  );
  
  if (!result.success) {
    console.error('Notification failed:', result.error);
  }
} catch (error) {
  console.error('Error sending notification:', error);
}
```

### 2. Check User Preferences

The notification service automatically checks user preferences, but you can verify:

```javascript
const notificationService = require('./services/NotificationService');

const preferences = await notificationService.getUserPreferences(userId);
const enabledChannels = preferences.getEnabledChannels('social');
```

### 3. Priority Guidelines

Use appropriate priorities:
- **Urgent**: Emergency lockdowns, security breaches, critical alerts
- **High**: Verification approvals, security alerts, important updates
- **Medium**: Job postings, access denials, networking requests
- **Low**: Profile views, directory updates, reminders

### 4. Channel Selection

Choose channels based on urgency and user preferences:
- **web, push**: Standard notifications
- **web, email, push**: Important updates
- **web, email, sms, push**: Critical/urgent notifications

### 5. Batch Operations

For bulk notifications, use batch methods:

```javascript
// Instead of looping
for (const userId of userIds) {
  await notificationService.sendToUser(userId, notification);
}

// Use batch method
await notificationService.sendToUsers(userIds, notification);
```

### 6. Notification Data

Include relevant data for frontend actions:

```javascript
{
  title: 'Job Application Update',
  message: 'Your application has been shortlisted',
  type: 'success',
  category: 'academic',
  priority: 'high',
  actionUrl: '/alumni/jobs/applications/123', // Frontend route
  data: {
    applicationId: '123',
    jobId: '456',
    status: 'shortlisted'
  }
}
```

### 7. Testing

Test notifications in development:

```javascript
// Run unit tests
node backend/test-notification-services-unit.js

// Run integration tests (requires MongoDB)
node backend/test-alumni-access-notifications-integration.js
```

---

## Notification Categories

| Category | Description | Examples |
|----------|-------------|----------|
| **social** | Alumni networking, mentorship | Connections, profile updates |
| **academic** | Job board, applications | Job postings, application status |
| **access** | Campus access, security | Access attempts, digital ID |
| **system** | System updates | Maintenance, announcements |
| **event** | Events and activities | Event invitations, reminders |

---

## Notification Types

| Type | Visual Style | Use Cases |
|------|--------------|-----------|
| **info** | Blue | General information, updates |
| **success** | Green | Approvals, completions, achievements |
| **warning** | Yellow | Warnings, expiring items |
| **error** | Red | Errors, denials, critical issues |

---

## Common Patterns

### Pattern 1: Verification Flow

```javascript
// 1. User submits verification
// 2. Admin reviews
// 3. Send notification based on decision

if (approved) {
  await alumniNotificationService.sendVerificationNotification(
    userId,
    'verified'
  );
} else {
  await alumniNotificationService.sendVerificationNotification(
    userId,
    'rejected',
    rejectionReason
  );
}
```

### Pattern 2: Access Control Flow

```javascript
// 1. User attempts access
// 2. Validate access
// 3. Send notification if denied

const accessResult = await accessControlService.validateFacilityAccess(
  qrData,
  facilityId,
  deviceInfo
);

if (!accessResult.accessGranted) {
  await accessNotificationService.sendAccessAttemptNotification(
    userId,
    {
      facilityName: facility.name,
      accessResult: 'denied',
      timestamp: new Date(),
      denialReason: accessResult.reason
    }
  );
}
```

### Pattern 3: Job Application Flow

```javascript
// 1. User applies for job
await alumniNotificationService.sendJobApplicationReceivedNotification(
  employerId,
  application
);

// 2. Employer reviews
// 3. Status updates
await alumniNotificationService.sendJobApplicationUpdateNotification(
  applicantId,
  application,
  'under_review'
);

// 4. Final decision
await alumniNotificationService.sendJobApplicationUpdateNotification(
  applicantId,
  application,
  'accepted',
  'Congratulations! We would like to offer you the position.'
);
```

---

## Troubleshooting

### Notifications Not Sending

1. Check user preferences:
```javascript
const prefs = await notificationService.getUserPreferences(userId);
console.log('Enabled channels:', prefs.getEnabledChannels(category));
```

2. Verify user exists and is active:
```javascript
const user = await User.findById(userId);
console.log('User active:', user?.isActive);
```

3. Check notification service logs:
```javascript
console.log('Notification result:', result);
```

### Duplicate Notifications

Ensure you're not calling notification methods multiple times:
```javascript
// Bad
await sendNotification();
await sendNotification(); // Duplicate

// Good
const result = await sendNotification();
if (!result.success) {
  // Handle error, don't retry immediately
}
```

### Performance Issues

Use batch operations for multiple users:
```javascript
// Bad
for (const userId of userIds) {
  await notificationService.sendToUser(userId, notification);
}

// Good
await notificationService.sendToUsers(userIds, notification);
```

---

## Support

For issues or questions:
1. Check the completion summary: `backend/TASK_9.3_COMPLETION_SUMMARY.md`
2. Review test files for examples
3. Check service implementations in `backend/services/`

---

**Last Updated:** October 3, 2024
**Version:** 1.0.0
**Status:** Production Ready
