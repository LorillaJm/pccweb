# E2E Testing Quick Reference

## Quick Start

```bash
# Run all E2E tests
npm run test:e2e:all

# Run specific test suite
npm run test:e2e:workflows
npm run test:e2e:security
npm run test:e2e:performance

# Validate setup
node validate-e2e-setup.js
```

## Prerequisites Checklist

- [ ] MongoDB running
- [ ] Backend server running (port 5000)
- [ ] `.env` file configured
- [ ] All dependencies installed (`npm install`)

## Test Suites

### 1. Complete Workflows (`test:e2e:workflows`)
Tests complete user journeys:
- Chatbot conversations
- Event registration & attendance
- Digital ID & campus access
- Internship applications
- Alumni networking
- Cross-feature integration

### 2. Security Validation (`test:e2e:security`)
Tests security features:
- QR code security
- Access control
- API security
- Injection prevention

### 3. Performance Testing (`test:e2e:performance`)
Tests system performance:
- Response times
- Load handling
- Database performance
- Mobile responsiveness

## Common Commands

```bash
# Start backend server
cd backend
npm start

# Run tests in another terminal
npm run test:e2e:all

# Check test setup
node validate-e2e-setup.js
```

## Troubleshooting

### Server Not Running
```
Error: connect ECONNREFUSED
```
**Fix**: Start backend server with `npm start`

### Database Connection Failed
```
Error: MongoNetworkError
```
**Fix**: Start MongoDB service

### Test Data Conflicts
```
Error: E11000 duplicate key
```
**Fix**: Tests auto-cleanup, but if needed:
```javascript
// In MongoDB
db.users.deleteMany({ email: /test-e2e-/ });
```

## Performance Targets

| Test | Target | Status |
|------|--------|--------|
| Chatbot Response | <3s | ✓ |
| Event Registration | >90% | ✓ |
| Notifications | <500ms | ✓ |
| Database Queries | <100ms | ✓ |
| Mobile API | <3s | ✓ |

## Test Results

### Success
```
✓ All tests passed
Exit code: 0
```

### Failure
```
✗ Some tests failed
Exit code: 1
Check output for details
```

## Files

- `test-e2e-complete-workflows.js` - Main workflow tests
- `test-e2e-security-validation.js` - Security tests
- `test-e2e-performance.js` - Performance tests
- `run-all-e2e-tests.js` - Test runner
- `E2E_TESTING_GUIDE.md` - Full documentation

## Support

For detailed information, see `E2E_TESTING_GUIDE.md`
