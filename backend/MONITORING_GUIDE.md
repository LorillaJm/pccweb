# Monitoring and Analytics Guide

This guide provides comprehensive information about the monitoring and analytics system implemented in the PCC Portal.

## Table of Contents

1. [Overview](#overview)
2. [Performance Monitoring](#performance-monitoring)
3. [Error Tracking](#error-tracking)
4. [Feature Analytics](#feature-analytics)
5. [User Engagement](#user-engagement)
6. [Health Checks](#health-checks)
7. [Alerts and Notifications](#alerts-and-notifications)
8. [API Endpoints](#api-endpoints)
9. [Dashboard Access](#dashboard-access)
10. [Best Practices](#best-practices)

---

## Overview

The PCC Portal includes a comprehensive monitoring and analytics system that tracks:

- **Performance Metrics**: Request/response times, throughput, system resources
- **Error Tracking**: Application errors, error rates, error patterns
- **Feature Analytics**: Feature usage, user engagement, adoption rates
- **User Engagement**: Active users, session tracking, user behavior
- **System Health**: Overall system status, component health, service availability

### Key Features

- Real-time performance monitoring
- Automatic error tracking and logging
- Feature usage analytics
- User engagement metrics
- Health check endpoints
- Alert system for critical issues
- Export capabilities for reporting

---

## Performance Monitoring

### Metrics Collected

#### Request Metrics
- Total requests
- Success rate
- Error rate
- Requests by endpoint
- Requests by HTTP method
- Requests by status code

#### Response Time Metrics
- Average response time
- Minimum response time
- Maximum response time
- Response time distribution

#### System Metrics
- Memory usage (heap, RSS, external)
- CPU usage
- System uptime
- Platform information

### Accessing Performance Metrics

```bash
GET /api/monitoring/performance
```

Response:
```json
{
  "success": true,
  "data": {
    "requests": {
      "total": 15234,
      "success": 14892,
      "errors": 342,
      "successRate": "97.76%",
      "byEndpoint": {
        "GET /api/users": {
          "count": 5432,
          "avgTime": "45.23ms"
        }
      }
    },
    "response": {
      "avgResponseTime": "123.45ms",
      "minResponseTime": "12ms",
      "maxResponseTime": "2345ms"
    },
    "system": {
      "uptime": "5d 12h 34m",
      "memory": {
        "heapUsed": "145.67 MB",
        "heapTotal": "256.00 MB"
      }
    }
  }
}
```

### Performance Thresholds

| Metric | Good | Warning | Critical |
|--------|------|---------|----------|
| Avg Response Time | < 500ms | 500-2000ms | > 2000ms |
| Error Rate | < 1% | 1-5% | > 5% |
| Memory Usage | < 75% | 75-90% | > 90% |
| Success Rate | > 99% | 95-99% | < 95% |

---

## Error Tracking

### Error Information Captured

- Error message
- Error type/name
- Stack trace
- Request context
- User information
- Timestamp

### Accessing Error Statistics

```bash
GET /api/monitoring/errors
```

Response:
```json
{
  "success": true,
  "data": {
    "totalErrors": 45,
    "recentErrors": [
      {
        "message": "Database connection timeout",
        "name": "MongoError",
        "timestamp": "2024-01-03T10:30:00Z"
      }
    ],
    "errorsByType": {
      "ValidationError": 12,
      "MongoError": 8,
      "AuthenticationError": 5
    }
  }
}
```

### Error Logging

Errors are automatically logged to:
- Console (development)
- Log files (`logs/error.log`)
- Monitoring system (in-memory)

### Common Error Patterns

1. **Database Errors**
   - Connection timeouts
   - Query failures
   - Validation errors

2. **Authentication Errors**
   - Invalid credentials
   - Expired tokens
   - Unauthorized access

3. **Validation Errors**
   - Invalid input data
   - Missing required fields
   - Type mismatches

---

## Feature Analytics

### Tracking Feature Usage

Features are automatically tracked when users interact with them. You can also manually track features:

```javascript
// Backend
monitoring.features.trackFeature('chatbot', userId, {
  action: 'message_sent',
  messageLength: 50
});

// Frontend API call
POST /api/monitoring/track-feature
{
  "featureName": "event_registration",
  "metadata": {
    "eventId": "123",
    "registrationType": "student"
  }
}
```

### Accessing Feature Analytics

```bash
GET /api/monitoring/features
```

Response:
```json
{
  "success": true,
  "data": {
    "features": {
      "chatbot": {
        "usageCount": 1234,
        "uniqueUsers": 456,
        "lastUsed": "2024-01-03T10:30:00Z"
      },
      "event_registration": {
        "usageCount": 789,
        "uniqueUsers": 234,
        "lastUsed": "2024-01-03T09:15:00Z"
      }
    },
    "totalFeatures": 12
  }
}
```

### Feature Details

Get detailed analytics for a specific feature:

```bash
GET /api/monitoring/features/chatbot
```

### Tracked Features

- AI Chatbot interactions
- Event registrations
- Digital ID scans
- Internship applications
- Alumni networking
- Document uploads
- Notification interactions

---

## User Engagement

### Engagement Metrics

- Active sessions
- Daily active users (DAU)
- Monthly active users (MAU)
- User actions
- Session duration

### Accessing Engagement Data

```bash
GET /api/monitoring/engagement
```

Response:
```json
{
  "success": true,
  "data": {
    "activeSessions": 234,
    "dailyActiveUsers": 567,
    "monthlyActiveUsers": 2345
  }
}
```

### Tracking User Actions

```javascript
monitoring.engagement.trackSession(userId, 'page_view');
monitoring.engagement.trackSession(userId, 'button_click');
monitoring.engagement.trackSession(userId, 'form_submit');
```

---

## Health Checks

### Basic Health Check

```bash
GET /api/monitoring/health
```

Response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "checks": {
      "memory": "healthy",
      "errors": "healthy",
      "performance": "healthy"
    },
    "details": {
      "memoryUsage": "65.43%",
      "errorRate": "0.23%",
      "avgResponseTime": "145.67ms"
    }
  }
}
```

### Detailed Health Check

Includes external services:

```bash
GET /api/monitoring/health/detailed
```

Response:
```json
{
  "success": true,
  "data": {
    "system": {
      "status": "healthy"
    },
    "services": {
      "openai": {
        "status": "healthy",
        "message": "OpenAI API is responding"
      },
      "email": {
        "status": "healthy",
        "message": "Email service is ready"
      },
      "sms": {
        "status": "disabled",
        "message": "SMS service not configured"
      }
    },
    "overall": "healthy"
  }
}
```

### Health Status Levels

- **healthy**: All systems operational
- **degraded**: Some non-critical issues
- **unhealthy**: Critical issues detected

---

## Alerts and Notifications

### Alert Levels

- **info**: Informational messages
- **warning**: Potential issues
- **error**: Error conditions
- **critical**: Critical failures

### Creating Alerts

```javascript
monitoring.addAlert('warning', 'High memory usage detected', {
  memoryUsage: '85%',
  threshold: '75%'
});

monitoring.addAlert('critical', 'Database connection lost', {
  service: 'mongodb',
  lastAttempt: new Date()
});
```

### Accessing Alerts

```bash
GET /api/monitoring/alerts?limit=50
```

### Alert Triggers

Automatic alerts are generated for:
- Memory usage > 90%
- Error rate > 10%
- Response time > 5 seconds
- Service failures
- Database connection issues

---

## API Endpoints

### Monitoring Endpoints

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/monitoring/dashboard` | GET | Complete dashboard | Admin |
| `/api/monitoring/performance` | GET | Performance metrics | Admin |
| `/api/monitoring/errors` | GET | Error statistics | Admin |
| `/api/monitoring/features` | GET | Feature analytics | Admin |
| `/api/monitoring/features/:name` | GET | Feature details | Admin |
| `/api/monitoring/engagement` | GET | User engagement | Admin |
| `/api/monitoring/health` | GET | Health check | Public |
| `/api/monitoring/health/detailed` | GET | Detailed health | Admin |
| `/api/monitoring/services` | GET | Service stats | Admin |
| `/api/monitoring/alerts` | GET | Recent alerts | Admin |
| `/api/monitoring/reset` | POST | Reset metrics | Admin |
| `/api/monitoring/track-feature` | POST | Track feature | Auth |
| `/api/monitoring/export` | GET | Export data | Admin |

### Authentication

Most endpoints require admin authentication:

```bash
# Include JWT token in header
Authorization: Bearer <your-jwt-token>
```

---

## Dashboard Access

### Admin Dashboard

Access the monitoring dashboard at:

```
https://portal.pcc.edu.ph/admin/monitoring
```

### Dashboard Sections

1. **Overview**
   - System status
   - Key metrics
   - Recent alerts

2. **Performance**
   - Request statistics
   - Response times
   - System resources

3. **Errors**
   - Error log
   - Error trends
   - Error types

4. **Features**
   - Feature usage
   - Adoption rates
   - User engagement

5. **Services**
   - External services status
   - Service statistics
   - Health checks

### Exporting Data

Export monitoring data for reporting:

```bash
# JSON format
GET /api/monitoring/export?format=json

# CSV format
GET /api/monitoring/export?format=csv
```

---

## Best Practices

### 1. Regular Monitoring

- Check dashboard daily
- Review error logs weekly
- Analyze trends monthly
- Set up automated alerts

### 2. Performance Optimization

- Monitor response times
- Identify slow endpoints
- Optimize database queries
- Implement caching

### 3. Error Management

- Review error patterns
- Fix recurring errors
- Improve error handling
- Update error messages

### 4. Feature Analytics

- Track feature adoption
- Identify unused features
- Gather user feedback
- Plan improvements

### 5. Capacity Planning

- Monitor resource usage
- Plan for growth
- Scale proactively
- Optimize infrastructure

### 6. Security Monitoring

- Track failed login attempts
- Monitor suspicious activity
- Review access logs
- Implement rate limiting

### 7. Documentation

- Document incidents
- Record resolutions
- Update runbooks
- Share knowledge

---

## Troubleshooting

### High Memory Usage

1. Check memory metrics
2. Identify memory leaks
3. Restart application if needed
4. Optimize code

### High Error Rate

1. Review error logs
2. Identify error patterns
3. Fix underlying issues
4. Deploy fixes

### Slow Response Times

1. Check performance metrics
2. Identify slow endpoints
3. Optimize queries
4. Add caching

### Service Failures

1. Check service health
2. Review service logs
3. Restart services
4. Contact service provider

---

## Integration with External Tools

### Sentry (Error Tracking)

```javascript
// Configure in production.js
monitoring: {
  sentry: {
    dsn: process.env.SENTRY_DSN,
    environment: 'production'
  }
}
```

### New Relic (APM)

```javascript
// Configure in production.js
monitoring: {
  newRelic: {
    licenseKey: process.env.NEW_RELIC_LICENSE_KEY,
    appName: 'PCC Portal API'
  }
}
```

### Custom Webhooks

Send alerts to external systems:

```javascript
// Example: Send to Slack
async function sendSlackAlert(alert) {
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify({
      text: `[${alert.level}] ${alert.message}`
    })
  });
}
```

---

## Support

For monitoring-related issues:

1. Check this documentation
2. Review system logs
3. Contact system administrator
4. Refer to external service documentation

---

## Changelog

### Version 1.0.0 (2024-01-03)
- Initial monitoring system implementation
- Performance metrics tracking
- Error tracking and logging
- Feature analytics
- User engagement tracking
- Health check endpoints
- Alert system
- Admin dashboard
