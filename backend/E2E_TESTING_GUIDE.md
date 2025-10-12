# End-to-End Testing Guide

## Overview

This guide covers the comprehensive end-to-end (E2E) testing suite for the PCC Portal advanced features. The test suite validates complete user workflows, security features, and performance characteristics across all implemented features.

## Test Coverage

### 1. Complete User Workflows (`test-e2e-complete-workflows.js`)

Tests complete user journeys across all advanced features:

#### Chatbot Workflow
- User initiates conversation
- Chatbot processes natural language queries
- Follow-up questions maintain context
- Escalation to human support when needed
- Conversation history is properly saved

#### Event Registration and Attendance
- Event creation by organizer
- Student registration for events
- QR ticket generation with security features
- QR code scanning for attendance
- Duplicate scan prevention
- Notification delivery for registration

#### Digital ID and Campus Access
- Digital ID generation for users
- QR code creation with encrypted data
- Facility access validation
- Permission-based access control
- Access logging and audit trails
- Offline access capability
- Security feature validation

#### OJT/Internship Application
- Company creates internship posting
- Student submits application
- Application status tracking
- Company reviews and updates status
- Interview scheduling
- Candidate acceptance
- Progress tracking
- Notification delivery throughout process

#### Alumni Networking and Jobs
- Alumni profile creation and verification
- Job posting by alumni
- Job search and filtering
- Job application submission
- Mentorship request and matching
- Alumni directory search
- Notification system integration

#### Cross-Feature Integration
- Multiple features used by single user
- Data consistency across features
- Real-time notifications across all features
- Notification preferences management
- System-wide search functionality

### 2. Security Validation (`test-e2e-security-validation.js`)

Tests security features and vulnerability prevention:

#### QR Code Security
- Invalid QR code format rejection
- Expired QR code detection
- Tampered data detection
- Replay attack prevention
- Duplicate scan prevention

#### Access Control Security
- Unauthorized facility access denial
- Time-based access restrictions
- Suspended account access denial
- Role-based permission enforcement
- Access attempt logging

#### API Security
- Authentication requirement enforcement
- Invalid token rejection
- SQL injection prevention
- XSS attack prevention
- Rate limiting validation

### 3. Performance Testing (`test-e2e-performance.js`)

Tests system performance under various conditions:

#### Chatbot Response Time
- Average response time measurement
- Response time consistency
- Target: <3 seconds average

#### Event Registration Load
- Concurrent registration handling
- System stability under load
- Success rate measurement
- Target: >90% success rate

#### Notification Delivery Speed
- Real-time notification creation
- Delivery time measurement
- Target: <500ms average

#### Database Query Performance
- Complex query execution time
- Aggregation performance
- Index effectiveness
- Target: <100ms average

#### Mobile App Responsiveness
- API response times for mobile
- Offline capability validation
- Target: <3 seconds for standard connections

## Running the Tests

### Prerequisites

1. **MongoDB Running**: Ensure MongoDB is running locally or accessible
2. **Backend Server**: The backend server should be running on port 5000 (or configured port)
3. **Environment Variables**: Ensure `.env` file is properly configured
4. **Dependencies**: All npm packages installed

### Running Individual Test Suites

```bash
# Complete workflows test
node backend/test-e2e-complete-workflows.js

# Security validation test
node backend/test-e2e-security-validation.js

# Performance test
node backend/test-e2e-performance.js
```

### Running All Tests

```bash
# Run all E2E test suites in sequence
node backend/run-all-e2e-tests.js
```

### Quick Test Commands

```bash
# From project root
cd backend

# Run complete workflows
npm run test:e2e:workflows

# Run security tests
npm run test:e2e:security

# Run performance tests
npm run test:e2e:performance

# Run all E2E tests
npm run test:e2e:all
```

## Test Data Management

### Automatic Cleanup

All test suites automatically:
- Clean up test data before running
- Clean up test data after completion
- Use identifiable test data patterns (e.g., `test-e2e-*@test.com`)

### Manual Cleanup

If tests are interrupted, you can manually clean up:

```javascript
// In MongoDB shell or Compass
db.users.deleteMany({ email: /test-e2e-.*@test\.com/ });
db.chatconversations.deleteMany({ sessionId: /test-e2e-/ });
db.events.deleteMany({ title: /E2E Test Event/ });
db.eventtickets.deleteMany({ ticketNumber: /E2E-/ });
db.digitalids.deleteMany({ qrCode: /E2E-/ });
db.internships.deleteMany({ title: /E2E Test Internship/ });
db.jobpostings.deleteMany({ title: /E2E Test Job/ });
db.notifications.deleteMany({ title: /E2E Test/ });
```

## Understanding Test Results

### Success Indicators

- ✓ Green checkmarks indicate passed tests
- Test summary shows passed/failed counts
- Exit code 0 indicates all tests passed

### Failure Indicators

- ✗ Red X marks indicate failed tests
- Error messages provide failure details
- Exit code 1 indicates test failures

### Performance Metrics

- Response times are measured in milliseconds
- Benchmarks are compared against targets
- Yellow warnings indicate acceptable but suboptimal performance

## Troubleshooting

### Common Issues

#### 1. Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:5000
```
**Solution**: Ensure backend server is running

#### 2. Database Connection Failed
```
Error: MongoNetworkError
```
**Solution**: Ensure MongoDB is running and accessible

#### 3. Timeout Errors
```
Error: timeout of 5000ms exceeded
```
**Solution**: 
- Check server performance
- Increase timeout values if needed
- Verify external services (OpenAI API) are accessible

#### 4. Test Data Conflicts
```
Error: E11000 duplicate key error
```
**Solution**: Run cleanup script or manually remove test data

### Debug Mode

Enable verbose logging by setting environment variable:

```bash
DEBUG=true node backend/test-e2e-complete-workflows.js
```

## Continuous Integration

### GitHub Actions Integration

Add to `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:latest
        ports:
          - 27017:27017
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          npm install
          cd backend && npm install
      
      - name: Start backend server
        run: |
          cd backend
          npm start &
          sleep 10
      
      - name: Run E2E tests
        run: node backend/run-all-e2e-tests.js
```

## Test Maintenance

### Adding New Tests

1. Create test function following naming convention
2. Add to appropriate test suite file
3. Include in test runner array
4. Update documentation

### Updating Test Data

- Use realistic but identifiable test data
- Follow naming patterns for easy cleanup
- Avoid hardcoded IDs when possible

### Performance Baselines

Update performance targets as system evolves:
- Monitor actual production metrics
- Adjust test thresholds accordingly
- Document baseline changes

## Best Practices

1. **Run tests regularly**: Before commits, after major changes
2. **Review failures carefully**: Don't ignore intermittent failures
3. **Keep tests updated**: Update tests when features change
4. **Monitor performance**: Track performance trends over time
5. **Clean test data**: Ensure proper cleanup after tests

## Support

For issues or questions about E2E testing:
- Check test output for detailed error messages
- Review this guide for troubleshooting steps
- Consult development team for persistent issues

## Test Metrics

Track these metrics over time:
- Test execution time
- Pass/fail rates
- Performance benchmarks
- Code coverage (when integrated with coverage tools)

## Future Enhancements

Planned improvements to the test suite:
- Visual regression testing
- Accessibility testing
- Browser compatibility testing
- Load testing with higher concurrency
- Chaos engineering tests
