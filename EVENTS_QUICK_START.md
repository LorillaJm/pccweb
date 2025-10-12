# QR-Based Event Ticketing System - Quick Start Guide

## 🚀 Getting Started

The QR-based event ticketing system is now fully implemented and ready to use. Here's how to get started:

### 1. Backend Setup

The backend services are already integrated into your existing server. No additional setup required!

**Available API Endpoints:**
- Events: `/api/events`
- Tickets: `/api/tickets`

### 2. Frontend Components

Import and use the new event components in your React application:

```tsx
import EventList from '@/components/events/EventList';
import EventRegistration from '@/components/events/EventRegistration';
import DigitalTicket from '@/components/events/DigitalTicket';
import QRScanner from '@/components/events/QRScanner';
```

### 3. Basic Usage Examples

#### Display Events List
```tsx
function EventsPage() {
  const [events, setEvents] = useState([]);
  
  const handleRegister = async (eventId) => {
    // Handle event registration
    const response = await fetch(`/api/events/${eventId}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData)
    });
  };

  return (
    <EventList 
      events={events}
      onRegister={handleRegister}
      userRole="student"
    />
  );
}
```

#### Event Registration Form
```tsx
function RegisterPage({ event }) {
  const handleSubmit = async (registrationData) => {
    const response = await fetch(`/api/events/${event._id}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData)
    });
    
    if (response.ok) {
      // Registration successful
      const result = await response.json();
      console.log('Ticket generated:', result.data.ticket);
    }
  };

  return (
    <EventRegistration 
      event={event}
      onSubmit={handleSubmit}
    />
  );
}
```

#### Display Digital Ticket
```tsx
function TicketPage({ ticket }) {
  const handleDownload = () => {
    // Ticket download/print functionality is built-in
  };

  const handleShare = () => {
    // Implement sharing logic
    navigator.share({
      title: `Ticket for ${ticket.eventId.title}`,
      text: `My ticket: ${ticket.ticketNumber}`,
      url: window.location.href
    });
  };

  return (
    <DigitalTicket 
      ticket={ticket}
      onDownload={handleDownload}
      onShare={handleShare}
      showQRCode={true}
    />
  );
}
```

#### QR Code Scanner
```tsx
function ScannerPage({ eventId }) {
  const handleScan = async (qrData) => {
    const response = await fetch('/api/tickets/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        qrData,
        eventId,
        location: 'Main Entrance',
        scanType: 'entry'
      })
    });
    
    return await response.json();
  };

  return (
    <QRScanner 
      onScan={handleScan}
      eventId={eventId}
      eventTitle="Sample Event"
      location="Main Entrance"
    />
  );
}
```

## 🔧 Configuration

### Environment Variables
Add these to your `.env` file:

```env
# QR Code Encryption (Required for security)
QR_ENCRYPTION_KEY=your-very-secure-encryption-key-here

# Optional: Customize QR settings
QR_SCAN_WINDOW_MINUTES=30
QR_MAX_AGE_HOURS=24
```

### Database Indexes
The system automatically creates required indexes, but you can verify with:

```bash
# Run the infrastructure test
node backend/test-infrastructure.js
```

## 📱 Mobile Usage

The system is fully mobile-optimized:

- **Responsive Design**: All components work on mobile devices
- **Camera Integration**: QR scanner uses device camera
- **Offline Support**: Scans work without internet connection
- **Touch-Friendly**: Optimized for touch interfaces

## 🔐 Security Features

### Automatic Security
- QR codes are encrypted and tamper-proof
- Rate limiting prevents abuse
- Input validation on all endpoints
- Session-based authentication

### Manual Security Checks
```javascript
// Validate QR code before scanning
const validation = await fetch('/api/tickets/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ qrData, eventId })
});
```

## 📊 Analytics & Reporting

### Get Event Analytics
```javascript
const analytics = await fetch(`/api/events/${eventId}/analytics`);
const data = await analytics.json();

console.log('Registration stats:', data.registrations);
console.log('Attendance stats:', data.attendance);
```

### Multi-Event Analytics
```javascript
const analytics = await fetch(`/api/tickets/analytics/multi-event?eventIds=${eventIds.join(',')}`);
```

## 🛠️ Testing

### Run Unit Tests
```bash
# Test backend services
node backend/test-services-unit.js

# Test QR code functionality
node backend/test-qr-unit.js
```

### Test Frontend Components
```bash
# Run React component tests
npm test src/components/events/
```

## 🚨 Troubleshooting

### Common Issues

1. **QR Code Not Scanning**
   - Check camera permissions
   - Ensure good lighting
   - Try manual entry option

2. **Registration Fails**
   - Verify event capacity
   - Check registration deadline
   - Ensure user authentication

3. **Offline Scans Not Syncing**
   - Check internet connection
   - Verify localStorage permissions
   - Use sync button in scanner

### Debug Mode
Enable detailed logging:

```javascript
// Add to your environment
DEBUG=events:*,tickets:*,qr:*
```

## 📞 Support

### Getting Help
1. Check the implementation summary: `backend/EVENTS_IMPLEMENTATION_SUMMARY.md`
2. Review test files for usage examples
3. Check API documentation in route files
4. Examine service classes for business logic

### Feature Requests
The system is designed to be extensible. Common enhancement areas:
- Payment integration
- Advanced analytics
- Bulk operations
- Custom event types
- Integration with external systems

---

## 🎉 You're Ready!

The QR-based event ticketing system is now fully operational. Start by creating your first event through the API or admin interface, then use the frontend components to build your user experience.

**Next Steps:**
1. Create a test event using the API
2. Register for the event to generate a ticket
3. Test the QR scanner functionality
4. Explore the analytics features
5. Customize the UI components for your needs

Happy event managing! 🎫