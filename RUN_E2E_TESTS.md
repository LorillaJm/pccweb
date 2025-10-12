# How to Run E2E Tests

The E2E (End-to-End) tests verify complete user workflows across all features. These tests require the backend server to be running.

## Quick Start

### Option 1: Manual (Recommended for Development)

**Terminal 1 - Start Backend Server:**
```bash
cd backend
npm start
```

Wait for these messages:
```
✅ MongoDB connected successfully
✅ Redis connected successfully (or fallback mode)
✅ Socket.IO initialized successfully
Server running on port 5000
```

**Terminal 2 - Run E2E Tests:**
```bash
cd backend
node test-e2e-complete-workflows.js
```

### Option 2: Using Helper Script

The helper script checks if the server is running and provides helpful instructions:

```bash
cd backend
node run-e2e-tests.js
```

## What the Tests Cover

The E2E test suite includes 6 comprehensive workflow tests:

1. **Chatbot Workflow** - Conversation flows and escalation
2. **Event Registration** - Event creation, registration, and attendance
3. **Digital ID Generation** - ID generation and facility access validation
4. **Internship Application** - Complete OJT/internship application process
5. **Alumni Networking** - Alumni profiles and job postings
6. **Cross-Feature Integration** - Real-time notifications across features

## Test Results

After running, you'll see:
- ✓ Green checkmarks for passed tests
- ✗ Red X marks for failed tests
- Detailed error messages for failures
- Summary statistics at the end

## Common Issues

### Server Not Running
**Error:** `connect ECONNREFUSED ::1:5000`

**Solution:** Start the backend server first (see Terminal 1 above)

### Database Connection Issues
**Error:** `MongoServerError` or connection timeout

**Solution:** 
1. Check your `.env` file has correct `MONGODB_URI`
2. Ensure MongoDB is accessible
3. Check network connectivity

### Port Already in Use
**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
1. Stop any other process using port 5000
2. Or change the port in `.env`: `PORT=5001`

### Missing Dependencies
**Error:** `Cannot find module 'axios'` or similar

**Solution:**
```bash
cd backend
npm install
```

## Test Data Cleanup

The E2E tests automatically:
- Create test data at the start
- Clean up test data at the end
- Use a test database prefix to avoid conflicts

Test users have emails like: `test-e2e-*@test.com`

## Debugging Failed Tests

If tests fail:

1. **Check the error message** - It usually indicates what went wrong
2. **Review the test output** - Shows which step failed
3. **Check server logs** - Look at Terminal 1 for backend errors
4. **Verify models** - Run verification script:
   ```bash
   node test-fixes-verification.js
   ```
5. **Check database** - Ensure MongoDB is accessible and has data

## Running Individual Tests

To run specific test workflows, you can modify `test-e2e-complete-workflows.js`:

```javascript
// Comment out tests you don't want to run
const tests = [
  // { name: 'Chatbot Workflow', fn: testChatbotWorkflow },
  { name: 'Event Workflow', fn: testEventWorkflow },
  // { name: 'Digital ID Workflow', fn: testDigitalIDWorkflow },
  // ... etc
];
```

## Performance Notes

- Full test suite takes ~30-60 seconds
- Tests include deliberate delays to simulate real user behavior
- Database operations may be slower on first run (index creation)

## CI/CD Integration

For automated testing in CI/CD pipelines:

```bash
# Start server in background
npm start &
SERVER_PID=$!

# Wait for server to be ready
sleep 10

# Run tests
node test-e2e-complete-workflows.js

# Cleanup
kill $SERVER_PID
```

## Need Help?

If you encounter issues:
1. Check `E2E_TEST_FIXES.md` for recent fixes
2. Review `backend/test-fixes-verification.js` output
3. Ensure all dependencies are installed
4. Verify environment variables in `.env`
