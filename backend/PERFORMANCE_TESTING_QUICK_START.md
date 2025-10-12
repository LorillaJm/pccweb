# Performance Testing Quick Start Guide

## Quick Overview

This guide provides a quick reference for running performance tests and monitoring system performance.

## Prerequisites

- Node.js installed
- MongoDB running (for database tests)
- Server running (for load, notification, and mobile tests)

## Quick Commands

### Run All Tests
```bash
node backend/run-performance-tests.js
```

### Run Individual Tests

**Database Performance** (no server required):
```bash
node backend/test-performance-database.js
```

**Load Testing** (requires running server):
```bash
node backend/test-performance-load.js
```

**Notification Performance** (requires running server):
```bash
node backend/test-performance-notifications.js
```

**Mobile Performance** (requires running server):
```bash
node backend/test-performance-mobile.js
```

**Validate Implementation**:
```bash
node backend/validate-performance-tests.js
```

## Performance Monitoring API

### Check System Health
```bash
curl http://localhost:5000/api/performance/health
```

### Get Performance Summary (Admin only)
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     http://localhost:5000/api/performance/summary
```

### Get Slow Operations (Admin only)
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     http://localhost:5000/api/performance/slow-operations
```

## Performance Thresholds

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| API Response (avg) | < 200ms | < 500ms | > 1000ms |
| Page Load | < 2s | < 3s | > 5s |
| Database Query | < 50ms | < 100ms | > 200ms |
| Notification Delivery | < 100ms | < 500ms | > 1000ms |
| Error Rate | < 1% | < 5% | > 10% |

## Requirements Coverage

✅ **Requirement 1.7**: Chatbot response time < 3 seconds  
✅ **Requirement 6.3**: Page load times < 3 seconds  
✅ **Requirement 6.5**: Offline capabilities for critical features  
✅ **Requirement 7.8**: Real-time notification delivery with offline queue  

## Test Components

### 1. Load Testing
- Tests system under 10, 50, 100, 200 concurrent users
- Measures response times and throughput
- Tracks error rates
- Provides endpoint-specific breakdown

### 2. Notification Performance
- Tests WebSocket connection speed
- Measures notification delivery times
- Tests broadcast performance
- Validates delivery rates

### 3. Mobile Performance
- Simulates 3G, 4G, WiFi conditions
- Tests page load times
- Validates offline capabilities
- Tests PWA features

### 4. Database Performance
- Measures query execution times
- Identifies slow queries
- Validates index usage
- Generates optimization suggestions

## Quick Optimization Tips

### Database
```javascript
// Use .lean() for read-only queries
const users = await User.find().lean();

// Limit fields with .select()
const users = await User.find().select('name email').lean();

// Use pagination
const users = await User.find().limit(20).skip(0).lean();
```

### API
```javascript
// Implement caching
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

// Use compression
app.use(compression());

// Rate limiting
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
```

### Frontend
```javascript
// Code splitting
const Component = lazy(() => import('./Component'));

// Image optimization
<Image src="/image.jpg" width={500} height={300} loading="lazy" />

// Service worker caching
self.addEventListener('fetch', (event) => {
  event.respondWith(caches.match(event.request));
});
```

## Monitoring in Production

### Enable Monitoring
```javascript
const { performanceMonitor, performanceMiddleware } = require('./services/PerformanceMonitor');

app.use(performanceMiddleware);
performanceMonitor.startMonitoring(60000);
```

### Set Up Alerts
- High error rate: > 5%
- Slow response time: Avg > 1000ms
- High memory usage: > 85%
- Slow queries: > 10 per minute

## Troubleshooting

### High Response Times
1. Check slow query logs
2. Verify database indexes
3. Check Redis cache hit rate
4. Review API endpoint complexity

### High Error Rates
1. Review error logs
2. Check database connection
3. Verify external services
4. Check rate limiting

### Memory Issues
1. Check for memory leaks
2. Review cache size limits
3. Verify connection pools
4. Check data transfer sizes

## Full Documentation

For complete documentation, see: `backend/PERFORMANCE_TESTING_GUIDE.md`

## Support

For issues or questions:
1. Check test output logs
2. Review PERFORMANCE_TESTING_GUIDE.md
3. Check slow operations endpoint
4. Review error logs endpoint
