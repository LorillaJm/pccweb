# Event Notifications Quick Start Guide

## Overview
This guide provides a quick reference for using the event notification system.

## Basic Usage

### 1. Creating an Event with Notifications

```javascript
const event = await Event.create({
  title: 'Tech Workshop',
  description: 'Learn about modern web development',
  category: 'workshop',
  startDate: new Date('2025-10-15T14:00:00'),
  endDate: new Date('2025-10-15T17:00:00'),
  venue: 'Computer Lab 1',
  capacity: 30,
  organizer: organizerId,
  status: 'published',
  // Notification settings
  notificationSettings: {
    sendRegistrationConfirmation: true,
    sendReminders: true,
    reminderTimes: [24, 2],  // 24h and 2h before event
    sendUpdateNotifications: true,
    sendCancellationNotifications: true,
    sendAttendanceConfirmation: true,
    sendFollowUp: true,
    followUpDelayHours: 24
  }
});
```

### 2. Automatic Notifications

These notifications are sent automatically:

#### On Registration
```javascript
// User registers for event
await eventService.registerForEvent(eventId, userId, registrationData);
// → Sends registration confirmation automatically
```

#### On Event Update
```javascript
// Organizer updates event
await eventService.updateEvent(eventId, { venue: 'New Venue' }, organizerId);
// → Sends update notification to all registered users
```

#### On Event Cancellation
```javascript
// Organizer cancels event
await eventService.cancelEvent(eventId, organizerId, 'Venue unavailable');
// → Sends urgent cancellation notification to all registered users
```

#### On Attendance Recording
```javascript
// QR code is scanned
await eventService.recordAttendance(ticketId, scannerId, metadata);
// → Sends attendance confirmation to user
```

### 3. Manual Notification Triggers

#### Schedule Reminders
```javascript
// Schedule automated reminders
const result = await eventService.scheduleEventReminders(eventId);
console.log(`Scheduled ${result.totalScheduled} reminders`);
```

#### Send Immediate Reminders
```javascript
// Send reminders now (e.g., 24 hours before)
const result = await eventService.sendEventReminders(eventId, 24);
console.log(`Sent ${result.totalSent} reminders`);
```

#### Schedule Follow-up
```javascript
// Schedule follow-up after event
const result = await eventService.scheduleEventFollowUp(eventId);
console.log(`Scheduled ${result.totalScheduled} follow-ups`);
```

#### Send Immediate Follow-up
```javascript
// Send follow-up now
const result = await eventService.sendEventFollowUp(eventId);
console.log(`Sent ${result.totalSent} follow-ups`);
```

## API Endpoints

### Schedule Reminders
```http
POST /api/events/:id/schedule-reminders
Authorization: Bearer <token>
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

### Schedule Follow-up
```http
POST /api/events/:id/schedule-followup
Authorization: Bearer <token>
```

### Send Immediate Follow-up
```http
POST /api/events/:id/send-followup
Authorization: Bearer <token>
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

## Notification Types

| Type | When Sent | Priority | Channels |
|------|-----------|----------|----------|
| Registration Confirmation | On registration | High | Web, Email, Push |
| Event Update | On event changes | High | Web, Email, Push |
| Event Cancellation | On cancellation | Urgent | Web, Email, SMS, Push |
| Event Reminder | Before event (scheduled) | High/Medium | Web, Email, Push |
| Attendance Confirmation | On QR scan | Medium | Web, Push |
| Follow-up | After event | Low | Web, Email |
| Waitlist Promotion | When promoted | High | Web, Email, Push |

## Notification Settings

### Per-Event Settings
Control which notifications are sent for a specific event:

```javascript
{
  sendRegistrationConfirmation: true,  // Send on registration
  sendReminders: true,                  // Send reminders
  reminderTimes: [24, 2],              // When to send reminders (hours before)
  sendUpdateNotifications: true,        // Send on updates
  sendCancellationNotifications: true,  // Send on cancellation
  sendAttendanceConfirmation: true,     // Send on attendance
  sendFollowUp: true,                   // Send after event
  followUpDelayHours: 24               // When to send follow-up (hours after)
}
```

### User Preferences
Users can control which channels they receive notifications on:

```javascript
{
  event: {
    web: true,    // In-app notifications
    email: true,  // Email notifications
    sms: false,   // SMS notifications
    push: true    // Push notifications
  }
}
```

## Common Patterns

### Pattern 1: Event with Multiple Reminders
```javascript
const event = await Event.create({
  // ... event details ...
  notificationSettings: {
    sendReminders: true,
    reminderTimes: [168, 48, 24, 2]  // 1 week, 2 days, 1 day, 2 hours
  }
});

// Schedule all reminders
await eventService.scheduleEventReminders(event._id);
```

### Pattern 2: Urgent Event (Short Notice)
```javascript
const event = await Event.create({
  // ... event details ...
  notificationSettings: {
    sendReminders: true,
    reminderTimes: [2, 0.5]  // 2 hours and 30 minutes before
  }
});
```

### Pattern 3: Event with Extended Follow-up
```javascript
const event = await Event.create({
  // ... event details ...
  notificationSettings: {
    sendFollowUp: true,
    followUpDelayHours: 72  // 3 days after event
  }
});
```

### Pattern 4: Silent Event (No Notifications)
```javascript
const event = await Event.create({
  // ... event details ...
  notificationSettings: {
    sendRegistrationConfirmation: false,
    sendReminders: false,
    sendUpdateNotifications: false,
    sendCancellationNotifications: false,
    sendAttendanceConfirmation: false,
    sendFollowUp: false
  }
});
```

## Troubleshooting

### Notifications Not Sending

1. **Check event settings:**
```javascript
const event = await Event.findById(eventId);
console.log(event.notificationSettings);
```

2. **Check user preferences:**
```javascript
const prefs = await NotificationPreferences.findByUserId(userId);
console.log(prefs.preferences.event);
```

3. **Check notification records:**
```javascript
const notifications = await Notification.find({ 
  userId: userId,
  category: 'event'
});
console.log(notifications);
```

### Reminders Not Scheduled

1. **Verify event is in the future:**
```javascript
const event = await Event.findById(eventId);
console.log('Event starts:', event.startDate);
console.log('Current time:', new Date());
```

2. **Check registration status:**
```javascript
const registrations = await EventRegistration.find({
  eventId: eventId,
  status: 'confirmed'
});
console.log(`${registrations.length} confirmed registrations`);
```

### Follow-up Not Sending

1. **Verify event has ended:**
```javascript
const event = await Event.findById(eventId);
console.log('Event ended:', event.endDate);
console.log('Current time:', new Date());
```

2. **Check for attendees:**
```javascript
const tickets = await EventTicket.find({
  eventId: eventId,
  status: 'used'
});
console.log(`${tickets.length} attendees`);
```

## Best Practices

1. **Always set notification settings when creating events**
2. **Use appropriate reminder times based on event type**
3. **Test notifications in development before production**
4. **Monitor notification delivery rates**
5. **Respect user preferences and provide opt-out options**
6. **Use appropriate priority levels**
7. **Keep notification messages concise and actionable**
8. **Include relevant event details in notifications**
9. **Provide clear action URLs for user engagement**
10. **Schedule reminders immediately after event creation**

## Examples

### Complete Event Creation with Notifications
```javascript
// Create event
const event = await Event.create({
  title: 'Annual Tech Conference',
  description: 'Join us for the biggest tech event of the year',
  category: 'conference',
  startDate: new Date('2025-11-01T09:00:00'),
  endDate: new Date('2025-11-03T17:00:00'),
  venue: 'Convention Center',
  capacity: 500,
  organizer: organizerId,
  status: 'published',
  notificationSettings: {
    sendRegistrationConfirmation: true,
    sendReminders: true,
    reminderTimes: [168, 48, 24],  // 1 week, 2 days, 1 day
    sendUpdateNotifications: true,
    sendCancellationNotifications: true,
    sendAttendanceConfirmation: true,
    sendFollowUp: true,
    followUpDelayHours: 72  // 3 days after
  }
});

// Schedule reminders
await eventService.scheduleEventReminders(event._id);

// Schedule follow-up
await eventService.scheduleEventFollowUp(event._id);

console.log('Event created with notifications configured');
```

### Updating Event and Notifying Users
```javascript
// Update event details
const result = await eventService.updateEvent(
  eventId,
  {
    venue: 'New Convention Center',
    startDate: new Date('2025-11-02T09:00:00')
  },
  organizerId
);

// Notifications sent automatically to all registered users
console.log('Event updated, notifications sent');
```

### Manual Reminder Before Event
```javascript
// Send reminder 24 hours before event
const result = await eventService.sendEventReminders(eventId, 24);
console.log(`Sent reminders to ${result.totalSent} users`);
```

## Support

For more detailed information, see:
- `EVENT_NOTIFICATIONS_GUIDE.md` - Comprehensive guide
- `TASK_9.1_COMPLETION_SUMMARY.md` - Implementation details
- `test-event-notifications-simple.js` - Test examples

For issues or questions, contact the development team.
