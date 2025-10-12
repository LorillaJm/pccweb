# Internship Portal Notification Integration Guide

## Overview

This guide documents the comprehensive notification system integrated with the OJT & Internship Portal. The system provides real-time updates, reminders, and communications throughout the entire internship lifecycle.

## Features Implemented

### 1. Application Status Update Notifications

Automatically notifies students when their application status changes:

- **Under Review**: Application is being reviewed by the company
- **Shortlisted**: Student has been shortlisted for further consideration
- **Interview Scheduled**: Interview has been arranged
- **Interview Completed**: Interview process is complete
- **Accepted**: Application has been accepted
- **Rejected**: Application was not selected

**Channels**: Web, Email, Push
**Priority**: Medium to High (depending on status)

### 2. Interview Communication Notifications

Comprehensive interview scheduling and reminder system:

- **Interview Scheduled**: Detailed notification with date, time, location, and type
- **Interview Reminder**: Automatic 24-hour advance reminder
- **Interview Details**: Includes meeting links for video calls, location for in-person

**Channels**: Web, Email, SMS, Push
**Priority**: High

### 3. Progress Tracking Notifications

Updates students on their internship progress:

- **Progress Updates**: Notifications when supervisors update progress
- **Milestone Achievements**: Alerts for completed milestones
- **Supervisor Notes**: Feedback from company supervisors

**Channels**: Web, Push
**Priority**: Medium

### 4. Evaluation Notifications

Alerts when evaluations are submitted:

- **Midterm Evaluations**: Mid-internship performance reviews
- **Final Evaluations**: End-of-internship assessments
- **Company Evaluations**: Feedback from company supervisors
- **School Evaluations**: Academic supervisor assessments

**Channels**: Web, Email, Push
**Priority**: Medium

### 5. Completion Notifications

Celebrates successful internship completion:

- **Completion Confirmation**: Congratulatory message with final rating
- **Duration Summary**: Total time spent in internship
- **Achievement Recognition**: Acknowledgment of successful completion

**Channels**: Web, Email, Push
**Priority**: High

### 6. Deadline Reminder Notifications

Proactive reminders for important deadlines:

- **Application Deadlines**: 3 days and 1 day before deadline
- **Progress Report Reminders**: Every 14 days if no report submitted
- **Evaluation Reminders**: 2 weeks before internship end date
- **Start Date Reminders**: 3 days and 1 day before internship starts

**Channels**: Web, Email, Push (SMS for critical reminders)
**Priority**: Medium to High

## Notification Types and Channels

### Channel Selection Strategy

| Event Type | Web | Email | SMS | Push | Priority |
|------------|-----|-------|-----|------|----------|
| Status Update | ✓ | ✓ | - | ✓ | Medium-High |
| Interview Scheduled | ✓ | ✓ | ✓ | ✓ | High |
| Interview Reminder | ✓ | ✓ | - | ✓ | High |
| Progress Update | ✓ | - | - | ✓ | Medium |
| Evaluation Received | ✓ | ✓ | - | ✓ | Medium |
| Internship Completed | ✓ | ✓ | - | ✓ | High |
| Deadline Reminder | ✓ | ✓ | - | ✓ | Medium |
| Start Reminder | ✓ | ✓ | ✓ | ✓ | High |

### Priority Levels

**High Priority**:
- Application Accepted
- Interview Scheduled
- Interview Reminder
- Internship Completed
- Start Reminder (1 day before)

**Medium Priority**:
- Application Under Review
- Application Shortlisted
- Progress Updates
- Evaluation Received
- Deadline Reminders

**Low Priority**:
- General informational updates

## API Usage

### Sending Application Status Notifications

```javascript
// Automatically sent when updating application status
await InternshipService.updateApplicationStatus(
  applicationId,
  'accepted',
  reviewerId,
  { notes: 'Great candidate!' }
);
```

### Scheduling Interview Notifications

```javascript
// Automatically sends notification and schedules reminder
await InternshipService.scheduleInterview(
  applicationId,
  {
    date: new Date('2024-03-15T14:00:00'),
    time: '14:00',
    duration: 60,
    location: 'Company Office',
    type: 'in_person',
    interviewerName: 'John Doe',
    interviewerEmail: 'john@company.com',
    notes: 'Please bring your portfolio'
  }
);
```

### Tracking Progress with Notifications

```javascript
// Sends progress update notification
await InternshipService.trackProgress(
  applicationId,
  {
    milestone: 'Completed Phase 1',
    description: 'Successfully finished initial training',
    completionPercentage: 25,
    supervisorNotes: 'Excellent progress',
    studentReflection: 'Learning a lot'
  },
  supervisorId
);
```

### Submitting Evaluations

```javascript
// Sends evaluation notification
await InternshipService.submitEvaluation(
  applicationId,
  {
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
    comments: 'Excellent performance',
    recommendations: 'Continue current trajectory'
  },
  evaluatorId
);
```

### Completing Internship

```javascript
// Sends completion notification
await InternshipService.completeInternship(
  applicationId,
  { finalRating: 4.5 }
);
```

## Automated Reminder System

### Scheduled Tasks

The system includes automated reminder tasks that should be run periodically:

```javascript
// Run daily to send deadline reminders
await InternshipService.sendDeadlineReminders(3); // 3 days before

// Run weekly to send progress report reminders
await InternshipService.sendProgressReportReminders(14); // 14 days since last

// Run weekly to send evaluation reminders
await InternshipService.sendEvaluationReminders();

// Run daily to send start reminders
await InternshipService.sendStartReminders(3); // 3 days before
```

### Cron Job Configuration

Add to `backend/config/scheduler.js`:

```javascript
// Daily at 9:00 AM - Deadline reminders
cron.schedule('0 9 * * *', async () => {
  await InternshipService.sendDeadlineReminders(3);
  await InternshipService.sendDeadlineReminders(1);
  await InternshipService.sendStartReminders(3);
  await InternshipService.sendStartReminders(1);
});

// Weekly on Monday at 10:00 AM - Progress and evaluation reminders
cron.schedule('0 10 * * 1', async () => {
  await InternshipService.sendProgressReportReminders(14);
  await InternshipService.sendEvaluationReminders();
});
```

## Notification Data Structure

### Common Fields

All internship notifications include:

```javascript
{
  title: string,           // Notification title
  message: string,         // Notification message
  type: string,           // 'info', 'success', 'warning', 'reminder'
  category: 'internship', // Always 'internship'
  priority: string,       // 'low', 'medium', 'high'
  actionUrl: string,      // URL to view details
  data: {
    applicationId: ObjectId,
    internshipId: ObjectId,
    // Additional event-specific data
  }
}
```

### Status Update Data

```javascript
data: {
  applicationId: ObjectId,
  internshipId: ObjectId,
  oldStatus: string,
  newStatus: string,
  feedback: string // optional
}
```

### Interview Notification Data

```javascript
data: {
  applicationId: ObjectId,
  internshipId: ObjectId,
  interviewDate: Date,
  interviewTime: string,
  interviewType: string,
  location: string,
  meetingLink: string, // optional
  interviewerName: string // optional
}
```

### Progress Update Data

```javascript
data: {
  applicationId: ObjectId,
  milestone: string,
  completionPercentage: number,
  supervisorNotes: string
}
```

### Evaluation Data

```javascript
data: {
  applicationId: ObjectId,
  evaluatorType: string,
  period: string,
  overallRating: number
}
```

### Completion Data

```javascript
data: {
  applicationId: ObjectId,
  internshipId: ObjectId,
  completedAt: Date,
  finalRating: number,
  duration: number
}
```

## Testing

### Unit Tests

Run unit tests to verify notification structure and content:

```bash
node backend/test-internship-notifications-unit.js
```

### Integration Tests

Run integration tests to verify end-to-end notification flow:

```bash
node backend/test-internship-notifications-integration.js
```

## User Preferences

Students can customize their notification preferences through the notification settings:

- Enable/disable notifications by category
- Choose preferred channels (web, email, SMS, push)
- Set quiet hours
- Configure notification frequency

## Best Practices

### 1. Channel Selection

- Use multiple channels for critical notifications (interview, acceptance, start date)
- Use web + push for informational updates
- Reserve SMS for urgent, time-sensitive notifications

### 2. Timing

- Send reminders at appropriate intervals (24 hours for interviews, 3 days for deadlines)
- Respect user quiet hours
- Batch non-urgent notifications

### 3. Message Content

- Keep messages concise and actionable
- Include relevant dates and times
- Provide clear next steps
- Use encouraging language for positive events

### 4. Priority Management

- Set appropriate priority levels
- High priority for time-sensitive actions
- Medium priority for important updates
- Low priority for general information

## Troubleshooting

### Notifications Not Sending

1. Check notification service is running
2. Verify user has enabled notifications for internship category
3. Check user contact information (email, phone) is valid
4. Review notification queue for errors

### Reminders Not Triggering

1. Verify cron jobs are configured and running
2. Check scheduler service is active
3. Review application dates and deadlines
4. Check for errors in scheduler logs

### Missing Notifications

1. Verify notification preferences are enabled
2. Check spam/junk folders for emails
3. Verify push notification permissions
4. Review notification history in database

## Future Enhancements

Potential improvements for the notification system:

1. **Smart Notifications**: AI-powered notification timing based on user behavior
2. **Digest Mode**: Daily/weekly summary of notifications
3. **Rich Notifications**: Include images, attachments, and interactive elements
4. **Multi-language Support**: Notifications in user's preferred language
5. **Advanced Filtering**: More granular control over notification types
6. **Analytics Dashboard**: Track notification engagement and effectiveness

## Related Documentation

- [Notification Service Documentation](./ADVANCED_FEATURES_SETUP.md#notification-service)
- [Internship Portal Guide](./INTERNSHIP_MODELS_SUMMARY.md)
- [API Documentation](./API_DOCUMENTATION.md)

## Support

For issues or questions about the internship notification system:

1. Check this documentation
2. Review test files for examples
3. Check application logs for errors
4. Contact the development team

---

**Last Updated**: January 2024
**Version**: 1.0.0
