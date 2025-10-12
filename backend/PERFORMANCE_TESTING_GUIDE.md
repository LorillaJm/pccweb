# Performance Testing and Optimization Guide

## Overview

This guide covers the comprehensive performance testing and optimization system implemented for the PCC Portal advanced features. The system tests performance under load, validates real-time notification delivery, tests mobile responsiveness and offline capabilities, and optimizes database queries and API responses.

## Requirements Coverage

This implementation addresses the following requirements:

- **Requirement 1.7**: Chatbot response time under 3 seconds
- **Requirement 6.3**: Fast loading times under 3 seconds on standard connections
- **Requirement 6.5**: Offline capabilities for critical features
- **Requirement 7.8**: Real-time notification delivery when users are offline

## Test Suite Components

### 1. Load Testing (`test-performance-load.js`)

Tests system performance under various concurrent user loads.

**Features:**
- Simulates 10, 50, 100, and 200 concurrent users
- Tests complete user workflows (login, browse events, notifications, etc.)
- Measures response times (min, max, avg, p95, p99)
- Calculates throughput (requests/second)
- Tracks error rates
- Provides endpoint-specific performance breakdown

**Usage:**
```bash
node backend/test-performance-load.js
```

**Performance Thresholds:**
- 🟢 Excellent: Avg < 200ms, P95 < 500ms
- 🟡 Good: Avg < 500ms, P95 < 1000ms
- 🟠 Fair: Avg < 1000ms, P95 < 2000ms
- 🔴 Poor: Avg > 1000ms or P95 > 2000ms

### 2. Notification Performance Testing (`test-performance-notifications.js`)

Tests real-time notification delivery speed and reliability.

**Features:**
- Tests WebSocket connection performance
- Measures notification delivery times
- Tests broadcast notification performance
- Validates delivery rates
- Tracks reconnection behavior

**Usage:**
```bash
node backend/test-performance-notifications.js
```

**Performance Thresholds:**
- 🟢 Excellent: Avg delivery < 100ms, Rate > 95%
- 🟡 Good: Avg delivery < 500ms, Rate > 90%
- 🟠 Fair: Avg delivery < 1000ms, Rate > 80%
- 🔴 Poor: Avg delivery > 1000ms or Rate < 80%

### 3. Mobile Performance Testing (`test-performance-mobile.js`)

Tests mobile app responsiveness and offline capabilities.

**Features:**
- Simulates different network conditions (3G, 4G, WiFi)
- Tests page load times on mobile devices
- Validates API response times
- Tests offline capabilities (Digital ID, QR scanning, cached content)
- Validates touch interface responsiveness
- Tests responsive design breakpoints
- Validates PWA features

**Usage:**
```bash
node backend/test-performance-mobile.js
```

**Network Scenarios:**
- 3G: 100ms latency, 750 Kbps bandwidth
- 4G: 50ms latency, 10 Mbps bandwidth
- WiFi: 10ms latency, 50 Mbps bandwidth

### 4. Database Performance Testing (`test-performance-database.js`)

Tests and optimizes database queries and API responses.

**Features:**
- Measures query execution times
- Identifies slow queries (> 100ms)
- Validates index usage
- Generates optimization suggestions
- Tests common query patterns across all models

**Usage:**
```bash
node backend/test-performance-database.js
```

**Query Categories Tested:**
- User queries (authentication, role-based)
- Event queries (upcoming, registrations, categories)
- Notification queries (unread, mark as read, cleanup)
- Internship queries (active, search, available slots)
- Digital ID queries (validation, expiration)

## Performance Monitoring Service

### Real-time Monitoring

The `PerformanceMonitor` service provides real-time performance tracking:

```javascript
const { performanceMonitor } = require('./services/PerformanceMonitor');

// Start monitoring
performanceMonitor.startMonitoring(60000); // Every 60 seconds

// Get summary
const summary = performanceMonitor.getSummary();

// Get detailed metrics
const metrics = performanceMonitor.getDetailedMetrics();
```

### Monitoring Features

- **Request Tracking**: Automatic tracking of all API requests
- **Query Performance**: Database query execution time tracking
- **Error Tracking**: Comprehensive error logging
- **System Resources**: CPU and memory usage monitoring
- **Slow Operation Detection**: Automatic flagging of slow operations

### Performance Middleware

Add to Express app for automatic request tracking:

```javascript
const { performanceMiddleware } = require('./services/PerformanceMonitor');

app.use(performanceMiddleware);
```

## Performance API Endpoints

### Get Performance Summary
```
GET /api/performance/summary
Authorization: Bearer <admin_token>
```

Returns:
- Request statistics (total, successful, error rate)
- Average response time
- Top endpoints by usage
- Recent slow operations
- System resource usage

### Get Health Status
```
GET /api/performance/health
```

Returns:
- Overall health status (healthy/degraded/unhealthy)
- Individual health checks (uptime, error rate, response time, memory)
- Timestamp

### Get Slow Operations
```
GET /api/performance/slow-operations
Authorization: Bearer <admin_token>
```

Returns list of operations exceeding performance thresholds.

### Get Error Logs
```
GET /api/performance/errors
Authorization: Bearer <admin_token>
```

Returns recent error logs with context.

## Running the Complete Test Suite

### Run All Tests
```bash
node backend/run-performance-tests.js
```

This runs all performance tests sequentially and generates a comprehensive report.

### Run Individual Tests

**Database Performance:**
```bash
node backend/test-performance-database.js
```

**Load Testing** (requires running server):
```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Run load tests
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

## Optimization Recommendations

### Database Optimization

1. **Use .lean() for Read-Only Queries**
   ```javascript
   // Instead of:
   const users = await User.find({ role: 'student' });
   
   // Use:
   const users = await User.find({ role: 'student' }).lean();
   ```

2. **Limit Fields with .select()**
   ```javascript
   const users = await User.find()
     .select('firstName lastName email')
     .lean();
   ```

3. **Use Pagination**
   ```javascript
   const page = 1;
   const limit = 20;
   const users = await User.find()
     .limit(limit)
     .skip((page - 1) * limit)
     .lean();
   ```

4. **Create Compound Indexes**
   ```javascript
   userSchema.index({ email: 1, role: 1 });
   eventSchema.index({ startDate: 1, status: 1 });
   ```

5. **Use Aggregation for Complex Queries**
   ```javascript
   const stats = await Event.aggregate([
     { $match: { status: 'published' } },
     { $group: { _id: '$category', count: { $sum: 1 } } }
   ]);
   ```

### API Optimization

1. **Implement Caching**
   ```javascript
   const redis = require('./config/redis');
   
   // Cache frequently accessed data
   const cacheKey = `events:upcoming`;
   const cached = await redis.get(cacheKey);
   if (cached) return JSON.parse(cached);
   
   const events = await Event.find({ ... });
   await redis.setex(cacheKey, 300, JSON.stringify(events)); // 5 min cache
   ```

2. **Use Compression**
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

3. **Implement Rate Limiting**
   ```javascript
   const rateLimit = require('express-rate-limit');
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   
   app.use('/api/', limiter);
   ```

### Frontend Optimization

1. **Code Splitting**
   ```javascript
   // Use dynamic imports
   const EventList = lazy(() => import('./components/events/EventList'));
   ```

2. **Image Optimization**
   ```javascript
   // Use Next.js Image component
   import Image from 'next/image';
   
   <Image
     src="/event.jpg"
     width={500}
     height={300}
     loading="lazy"
   />
   ```

3. **Implement Service Worker Caching**
   ```javascript
   // Cache API responses
   self.addEventListener('fetch', (event) => {
     event.respondWith(
       caches.match(event.request).then((response) => {
         return response || fetch(event.request);
       })
     );
   });
   ```

## Performance Benchmarks

### Target Performance Metrics

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| API Response Time (avg) | < 200ms | < 500ms | > 1000ms |
| API Response Time (p95) | < 500ms | < 1000ms | > 2000ms |
| Page Load Time | < 2s | < 3s | > 5s |
| Database Query | < 50ms | < 100ms | > 200ms |
| Notification Delivery | < 100ms | < 500ms | > 1000ms |
| Error Rate | < 1% | < 5% | > 10% |
| Memory Usage | < 70% | < 85% | > 90% |

### Requirement Validation

- ✅ **Requirement 1.7**: Chatbot responses < 3s (Target: < 1s)
- ✅ **Requirement 6.3**: Page loads < 3s (Target: < 2s)
- ✅ **Requirement 6.5**: Offline capabilities implemented
- ✅ **Requirement 7.8**: Real-time notifications with queue for offline users

## Monitoring in Production

### Enable Performance Monitoring

Add to `server.js`:

```javascript
const { performanceMonitor, performanceMiddleware } = require('./services/PerformanceMonitor');

// Add middleware
app.use(performanceMiddleware);

// Start monitoring
performanceMonitor.startMonitoring(60000); // Every 60 seconds

// Add performance routes
app.use('/api/performance', require('./routes/performance'));
```

### Set Up Alerts

Monitor these metrics and set up alerts:

1. **High Error Rate**: > 5%
2. **Slow Response Time**: Avg > 1000ms
3. **High Memory Usage**: > 85%
4. **Slow Queries**: > 10 per minute
5. **Failed Notifications**: Delivery rate < 90%

### Regular Performance Reviews

1. **Daily**: Check health endpoint and error logs
2. **Weekly**: Review slow operations and optimization opportunities
3. **Monthly**: Run full performance test suite
4. **Quarterly**: Review and update performance benchmarks

## Troubleshooting

### High Response Times

1. Check slow query logs
2. Verify database indexes
3. Check Redis cache hit rate
4. Review API endpoint complexity
5. Check system resource usage

### High Error Rates

1. Review error logs
2. Check database connection pool
3. Verify external service availability
4. Check rate limiting configuration
5. Review recent code changes

### Memory Issues

1. Check for memory leaks
2. Review cache size limits
3. Verify connection pool sizes
4. Check for large data transfers
5. Review background job processing

## Continuous Improvement

1. **Regular Testing**: Run performance tests before each release
2. **Monitoring**: Continuously monitor production metrics
3. **Optimization**: Regularly review and optimize slow operations
4. **Benchmarking**: Update benchmarks as system grows
5. **Documentation**: Keep performance documentation up to date

## Conclusion

This comprehensive performance testing and optimization system ensures the PCC Portal meets all performance requirements and provides a fast, reliable experience for all users across all devices and network conditions.

For questions or issues, refer to the test output logs or contact the development team.
