# Event Notification System Integration Guide

## Overview

The Event Notification System provides comprehensive notification capabilities for event management, including registration confirmations, reminders, updates, cancellations, attendance confirmations, and follow-up messages.

## Features

### 1. Registration Confirmation Notifications
- Sent automatically when a user registers for an event
- Includes event details, date, time, and venue
- Different messages for regular registration vs. waitlist
- Supports multiple channels: web, email, push notifications

### 2. Event Update Notifications
- Automatically sent when event details change (venue, date, time)
- Notifies all registered participants
- High priority notifications for important changes
- Includes details of what changed

### 3. Event Cancellation Notifications
- Urgent notifications sent to all registered participants
- Includes cancellation reason
- Sent via all available channels (web, email, SMS, push)
- Highest priority level

### 4. Event Reminder Notifications
- Scheduled automatically based on event settings
- Default reminder times: 24 hours and 2 hours before event
- Customizable reminder intervals per event
- Only sent to confirmed registrations

### 5. Attendance Confirmation Notifications
- Sent when QR code is scanned and attendance is recorded
- Confirms participation in the event
- Includes timestamp of attendance

### 6. Follow-up Notifications
- Sent after event completion to attendees
- Thanks participants and requests feedback
- Scheduled automatically based on event settings
- Default: 24 hours after event ends

### 7. Waitlist Promotion Notifications
- Automatically sent when a user is promoted from waitlist
- High priority notification
- Includes updated registration status

## Event Notification Settings

Each event has configurable notification settings:

```javascript
{
  notificationSettings: {
    sendRegistrationConfirmation: true,  // Enable/disable registration confirmations
    sendReminders: true,                  // Enable/disable reminders
    reminderTimes: [24, 2],              // Hours before event to send reminders
    sendUpdateNotifications: true,        // Enable/disable update notifications
    sendCancellationNotifications: true,  // Enable/disable cancellation notifications
    sendAttendanceConfirmation: true,     // Enable/disable attendance confirmations
    sendFollowUp: true,                   // Enable/disable follow-up messages
    followUpDelayHours: 24               // Hours after event to send follow-up
  }
}
```

## API Endpoints

### Schedule Event Reminders
```http
POST /api/events/:id/schedule-reminders
Authorization: Bearer <token>
```

Schedules automated reminders based on event notification settings.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalScheduled": 10,
    "reminderTimes": [24, 2]
  },
  "message": "Event reminders scheduled successfully"
}
```

### Send Immediate Reminders
```http
POST /api/events/:id/send-reminders
Authorization: Bearer <token>
Content-Type: application/json

{
  "hoursBeforeEvent": 24
}
```

Sends immediate reminder notifications to all confirmed registrations.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSent": 10
  },
  "message": "Event reminders sent successfully"
}
```

### Schedule Follow-up Notifications
```http
POST /api/events/:id/schedule-followup
Authorization: Bearer <token>
```

Schedules follow-up notifications after event completion.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalScheduled": 8,
    "followUpTime": "2025-10-10T10:00:00.000Z"
  },
  "message": "Follow-up notifications scheduled successfully"
}
```

### Send Immediate Follow-up
```http
POST /api/events/:id/send-followup
Authorization: Bearer <token>
```

Sends immediate follow-up messages to all attendees.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSent": 8
  },
  "message": "Follow-up messages sent successfully"
}
```

### Update Notification Settings
```http
PATCH /api/events/:id/notification-settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "sendRegistrationConfirmation": true,
  "sendReminders": true,
  "reminderTimes": [48, 24, 2],
  "sendUpdateNotifications": true,
  "sendCancellationNotifications": true,
  "sendAttendanceConfirmation": true,
  "sendFollowUp": true,
  "followUpDelayHours": 48
}
```

Updates notification settings for a specific event.

## User Notification Preferences

Users can customize their notification preferences per category:

```javascript
{
  preferences: {
    event: {
      web: true,    // In-app notifications
      email: true,  // Email notifications
      sms: false,   // SMS notifications
      push: true    // Push notifications
    }
  }
}
```

The system respects user preferences when sending notifications. If a user has disabled email notifications for events, they will not receive event emails even if the event has email notifications enabled.

## Notification Flow

### Registration Flow
1. User registers for event
2. System checks event notification settings
3. If `sendRegistrationConfirmation` is enabled:
   - Creates notification record
   - Checks user preferences
   - Queues notification job
   - Sends via enabled channels

### Update Flow
1. Event organizer updates event details
2. System detects significant changes (venue, date, time)
3. If `sendUpdateNotifications` is enabled:
   - Retrieves all registered participants
   - Creates notifications for each user
   - Sends high-priority notifications

### Reminder Flow
1. Event organizer schedules reminders (or automatic on event creation)
2. System calculates reminder times based on event start date
3. For each reminder time:
   - Schedules notification job
   - Job executes at scheduled time
   - Sends reminders to confirmed registrations

### Attendance Flow
1. QR code is scanned at event
2. System records attendance
3. If `sendAttendanceConfirmation` is enabled:
   - Sends confirmation notification
   - Includes attendance timestamp

### Follow-up Flow
1. Event ends
2. System schedules follow-up based on `followUpDelayHours`
3. At scheduled time:
   - Retrieves all attendees
   - Sends thank you and feedback request

## Testing

### Run Integration Tests
```bash
# With Jest (if installed)
npm test backend/test-event-notifications-integration.js

# Simple test without Jest
node backend/test-event-notifications-simple.js
```

### Manual Testing

1. **Test Registration Confirmation:**
   ```bash
   curl -X POST http://localhost:5000/api/events/:eventId/register \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"additionalInfo": "Test registration"}'
   ```

2. **Test Event Update:**
   ```bash
   curl -X PUT http://localhost:5000/api/events/:eventId \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"venue": "New Venue"}'
   ```

3. **Test Reminder Scheduling:**
   ```bash
   curl -X POST http://localhost:5000/api/events/:eventId/schedule-reminders \
     -H "Authorization: Bearer <token>"
   ```

4. **Test Follow-up:**
   ```bash
   curl -X POST http://localhost:5000/api/events/:eventId/send-followup \
     -H "Authorization: Bearer <token>"
   ```

## Best Practices

### 1. Event Creation
- Always configure notification settings when creating events
- Use appropriate reminder times based on event type
- Enable all relevant notifications for better user engagement

### 2. Reminder Timing
- Academic events: 48h, 24h, 2h before
- Social events: 24h, 2h before
- Urgent events: 2h, 30min before

### 3. Follow-up Timing
- Short events: 24 hours after
- Multi-day events: 48 hours after
- Conferences: 72 hours after (allows for travel time)

### 4. Notification Content
- Keep messages concise and actionable
- Include all relevant event details
- Provide clear next steps or action URLs

### 5. User Experience
- Respect user notification preferences
- Don't over-notify (use appropriate priority levels)
- Provide opt-out options for non-critical notifications

## Troubleshooting

### Notifications Not Sending

1. **Check Event Settings:**
   ```javascript
   const event = await Event.findById(eventId);
   console.log(event.notificationSettings);
   ```

2. **Check User Preferences:**
   ```javascript
   const prefs = await NotificationPreferences.findByUserId(userId);
   console.log(prefs.preferences.event);
   ```

3. **Check Notification Queue:**
   - Verify Redis is running
   - Check queue status in logs
   - Verify notification jobs are being processed

### Reminders Not Scheduled

1. **Check Event Date:**
   - Ensure event is in the future
   - Verify reminder times are before event start

2. **Check Registration Status:**
   - Only confirmed registrations receive reminders
   - Verify users have confirmed status

### Follow-up Not Sending

1. **Check Event Status:**
   - Event must be completed
   - Verify end date has passed

2. **Check Attendance:**
   - Only attendees receive follow-up
   - Verify tickets have attendance records

## Integration with Other Systems

### Email Service
- Configured via environment variables
- Uses nodemailer for email delivery
- Supports HTML templates

### SMS Service
- Configured via Twilio or similar
- Only for urgent notifications
- Requires phone number in user profile

### Push Notifications
- Requires device token registration
- Supports iOS and Android
- Uses Firebase Cloud Messaging or similar

## Performance Considerations

### Batch Processing
- Notifications are processed in batches (default: 100)
- Prevents overwhelming the system
- Configurable via `NOTIFICATION_BATCH_SIZE`

### Caching
- User preferences cached in Redis
- Reduces database queries
- Cache TTL: 1 hour

### Queue Management
- Background job processing with Bull
- Retry logic for failed notifications
- Job prioritization based on notification priority

## Security

### Authorization
- Only event organizers can manage notifications
- Users can only update their own preferences
- Admin override for system notifications

### Rate Limiting
- API endpoints are rate-limited
- Prevents notification spam
- Configurable limits per endpoint

### Data Privacy
- User contact information is protected
- Notification content is sanitized
- Audit logs for all notifications

## Monitoring

### Metrics to Track
- Notification delivery rate
- Channel success rates
- User engagement (open/click rates)
- Failed notification count
- Average delivery time

### Logging
- All notifications logged with timestamp
- Delivery status tracked per channel
- Error messages captured for debugging

## Future Enhancements

1. **Rich Notifications:**
   - Images and attachments
   - Interactive buttons
   - Custom templates

2. **Advanced Scheduling:**
   - Timezone-aware scheduling
   - Recurring reminders
   - Smart timing based on user behavior

3. **Analytics:**
   - Notification effectiveness metrics
   - A/B testing for message content
   - User engagement tracking

4. **Personalization:**
   - AI-powered message customization
   - User preference learning
   - Optimal timing prediction
