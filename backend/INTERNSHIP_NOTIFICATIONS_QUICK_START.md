# Internship Notifications Quick Start Guide

## Quick Reference

### Automatic Notifications

These notifications are sent automatically when you use the InternshipService methods:

```javascript
const InternshipService = require('./services/InternshipService');

// 1. Application Status Update → Sends notification automatically
await InternshipService.updateApplicationStatus(
  applicationId,
  'accepted',
  reviewerId,
  { notes: 'Great candidate!' }
);

// 2. Interview Scheduling → Sends notification + 24h reminder
await InternshipService.scheduleInterview(applicationId, {
  date: new Date('2024-03-15T14:00:00'),
  time: '14:00',
  type: 'video_call',
  meetingLink: 'https://meet.example.com/abc123'
});

// 3. Progress Tracking → Sends notification
await InternshipService.trackProgress(applicationId, {
  milestone: 'Completed Phase 1',
  completionPercentage: 25,
  supervisorNotes: 'Excellent work'
}, supervisorId);

// 4. Evaluation Submission → Sends notification
await InternshipService.submitEvaluation(applicationId, {
  evaluatorType: 'company',
  period: 'midterm',
  ratings: { /* ... */ }
}, evaluatorId);

// 5. Internship Completion → Sends notification
await InternshipService.completeInternship(applicationId, {
  finalRating: 4.5
});
```

### Manual Reminder Triggers

Use these methods to manually trigger reminder notifications:

```javascript
// Application deadline reminders (3 days before)
await InternshipService.sendDeadlineReminders(3);

// Internship start reminders (1 day before)
await InternshipService.sendStartReminders(1);

// Progress report reminders (14 days since last)
await InternshipService.sendProgressReportReminders(14);

// Evaluation reminders (2 weeks before end)
await InternshipService.sendEvaluationReminders();
```

## Notification Types

| Event | Channels | Priority | Auto/Manual |
|-------|----------|----------|-------------|
| Status Update | Web, Email, Push | Medium-High | Auto |
| Interview Scheduled | Web, Email, SMS, Push | High | Auto |
| Interview Reminder | Web, Email, Push | High | Auto (24h before) |
| Progress Update | Web, Push | Medium | Auto |
| Evaluation | Web, Email, Push | Medium | Auto |
| Completion | Web, Email, Push | High | Auto |
| Deadline Reminder | Web, Email, Push | Medium | Scheduled |
| Start Reminder | Web, Email, SMS, Push | High | Scheduled |

## Scheduled Tasks

Automated reminders run on these schedules:

```javascript
// Daily at 9:00 AM
- Deadline reminders (3 days & 1 day before)
- Start reminders (3 days & 1 day before)

// Weekly on Monday at 10:00 AM
- Progress report reminders (every 14 days)
- Evaluation reminders (2 weeks before end)
```

## Testing

```bash
# Run unit tests
node backend/test-internship-notifications-unit.js

# Run integration tests
node backend/test-internship-notifications-integration.js
```

## Common Use Cases

### 1. Update Application Status
```javascript
// Student applies → Status: submitted (automatic)
// Company reviews → Status: under_review
await InternshipService.updateApplicationStatus(
  applicationId, 'under_review', reviewerId
);
// → Notification sent: "Application Under Review"

// Company shortlists → Status: shortlisted
await InternshipService.updateApplicationStatus(
  applicationId, 'shortlisted', reviewerId
);
// → Notification sent: "Application Shortlisted"

// Company accepts → Status: accepted
await InternshipService.updateApplicationStatus(
  applicationId, 'accepted', reviewerId
);
// → Notification sent: "Application Accepted!"
```

### 2. Schedule Interview
```javascript
await InternshipService.scheduleInterview(applicationId, {
  date: new Date('2024-03-15T14:00:00'),
  time: '14:00',
  duration: 60,
  type: 'video_call',
  meetingLink: 'https://meet.example.com/abc123',
  interviewerName: 'John Doe',
  notes: 'Please test your camera beforehand'
});
// → Immediate notification: "Interview Scheduled"
// → Scheduled notification: "Interview Reminder" (24h before)
```

### 3. Track Progress
```javascript
await InternshipService.trackProgress(applicationId, {
  milestone: 'Week 1: Onboarding Complete',
  description: 'Completed orientation and initial training',
  completionPercentage: 10,
  supervisorNotes: 'Great start, very engaged',
  studentReflection: 'Learning a lot about the company'
}, supervisorId);
// → Notification sent: "Internship Progress Updated"
```

### 4. Submit Evaluation
```javascript
await InternshipService.submitEvaluation(applicationId, {
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
  comments: 'Excellent performance so far',
  recommendations: 'Continue with current approach'
}, evaluatorId);
// → Notification sent: "Internship Evaluation Received"
```

### 5. Complete Internship
```javascript
await InternshipService.completeInternship(applicationId, {
  finalRating: 4.5
});
// → Notification sent: "Internship Completed!"
```

## Notification Data Structure

Every notification includes:

```javascript
{
  title: string,              // "Interview Scheduled"
  message: string,            // Detailed message
  type: string,              // 'info', 'success', 'warning', 'reminder'
  category: 'internship',    // Always 'internship'
  priority: string,          // 'low', 'medium', 'high'
  actionUrl: string,         // Link to view details
  data: {
    applicationId: ObjectId,
    internshipId: ObjectId,
    // Event-specific data
  }
}
```

## Troubleshooting

### Notifications Not Sending?

1. Check NotificationService is running
2. Verify user notification preferences
3. Check user email/phone is valid
4. Review notification queue for errors

### Reminders Not Triggering?

1. Verify scheduler is running: `taskScheduler.getTaskStatus()`
2. Check cron job configuration
3. Review scheduler logs
4. Verify application dates are correct

### Testing Notifications

```javascript
// Mock notification service for testing
const NotificationService = require('./services/NotificationService');
const originalSend = NotificationService.sendToUser;

NotificationService.sendToUser = async (userId, notification, channels) => {
  console.log('Notification:', notification);
  return { success: true };
};

// Run your test
await InternshipService.updateApplicationStatus(/* ... */);

// Restore
NotificationService.sendToUser = originalSend;
```

## Best Practices

1. **Always use InternshipService methods** - They handle notifications automatically
2. **Don't send duplicate notifications** - Service methods prevent this
3. **Respect user preferences** - NotificationService handles this
4. **Use appropriate channels** - Critical events use more channels
5. **Set correct priorities** - Helps users prioritize their notifications
6. **Include action URLs** - Makes notifications actionable
7. **Test thoroughly** - Use provided test files

## Need Help?

- 📖 Full Documentation: `backend/INTERNSHIP_NOTIFICATIONS_GUIDE.md`
- 🧪 Unit Tests: `backend/test-internship-notifications-unit.js`
- 🔗 Integration Tests: `backend/test-internship-notifications-integration.js`
- 📋 Task Summary: `backend/TASK_9.2_COMPLETION_SUMMARY.md`

---

**Quick Start Version**: 1.0.0
**Last Updated**: January 2024
