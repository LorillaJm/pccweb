# Troubleshooting E2E Tests

## Common Issue: Server Crashes During Tests

### Symptom
```
✗ ✗ Alumni workflow test FAILED: connect ECONNREFUSED ::1:5000
```

This error appears **after** some tests have passed, indicating the server crashed or stopped responding during the test run.

### Why This Happens

1. **Service Initialization Errors** - A service required by a route doesn't exist or has errors
2. **Database Connection Lost** - MongoDB connection dropped during tests
3. **Unhandled Promise Rejection** - An async error wasn't caught
4. **Memory Issues** - Server ran out of memory
5. **Port Conflict** - Another process took over port 5000

### How to Diagnose

#### Step 1: Check Server Logs

Look at the terminal where you ran `npm start`. You should see error messages before the server crashed.

Common errors:
```
Error: Cannot find module '../services/SomeService'
MongoServerError: connection timed out
UnhandledPromiseRejectionWarning
```

#### Step 2: Test Server Health

Run the health check script:
```bash
cd backend
node test-server-health.js
```

This will test if:
- Server is running
- Health endpoint responds
- Alumni routes work
- Digital ID routes work
- Internships routes work

#### Step 3: Start Server with More Logging

```bash
cd backend
NODE_ENV=development DEBUG=* npm start
```

This enables verbose logging to see exactly what's happening.

#### Step 4: Test Individual Routes

Use curl or Postman to test routes manually:

```bash
# Test health
curl http://localhost:5000/api/health

# Test alumni jobs
curl http://localhost:5000/api/alumni/jobs

# Test digital ID (will fail without valid userId, but should return 400, not crash)
curl -X POST http://localhost:5000/api/digital-id/generate \
  -H "Content-Type: application/json" \
  -d '{"userId":"507f1f77bcf86cd799439011"}'
```

### Common Fixes

#### Fix 1: Missing Service Files

**Error:**
```
Error: Cannot find module '../services/JobWorkflowService'
```

**Solution:**
Check if all services required by routes exist:
```bash
ls backend/services/
```

If a service is missing, either:
- Create a stub service
- Comment out the route that uses it
- Remove the require statement if not used

#### Fix 2: Database Connection Issues

**Error:**
```
MongoServerError: connection timed out
```

**Solution:**
1. Check MongoDB is running
2. Verify `.env` has correct `MONGODB_URI`
3. Test connection:
   ```bash
   node backend/test-backend-connection.js
   ```

#### Fix 3: Unhandled Promise Rejections

**Error:**
```
UnhandledPromiseRejectionWarning: Error: ...
```

**Solution:**
Add error handling to routes:
```javascript
router.get('/some-route', async (req, res) => {
  try {
    // ... route logic
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

#### Fix 4: Port Already in Use

**Error:**
```
EADDRINUSE: address already in use :::5000
```

**Solution:**
Kill the process using port 5000:

**Windows:**
```cmd
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -ti:5000 | xargs kill -9
```

Or use a different port in `.env`:
```
PORT=5001
```

### Prevention Tips

1. **Always check server logs** - Keep the server terminal visible
2. **Test routes individually** - Before running full E2E suite
3. **Use try-catch blocks** - In all async route handlers
4. **Monitor memory** - Watch for memory leaks during tests
5. **Restart server between test runs** - Ensures clean state

### Quick Recovery Steps

If the server crashes during tests:

1. **Stop the server** (Ctrl+C in server terminal)
2. **Check the error message** in server logs
3. **Fix the issue** (see common fixes above)
4. **Restart the server**:
   ```bash
   cd backend
   npm start
   ```
5. **Wait for "Server running on port 5000"**
6. **Run tests again**:
   ```bash
   cd backend
   node test-e2e-complete-workflows.js
   ```

### Testing Strategy

Instead of running all tests at once, test incrementally:

1. **Test server health first:**
   ```bash
   node test-server-health.js
   ```

2. **Run one test at a time:**
   Edit `test-e2e-complete-workflows.js` and comment out tests:
   ```javascript
   const tests = [
     // { name: 'Chatbot Workflow', fn: testChatbotWorkflow },
     // { name: 'Event Workflow', fn: testEventWorkflow },
     // { name: 'Digital ID Workflow', fn: testDigitalIDWorkflow },
     // { name: 'Internship Workflow', fn: testInternshipWorkflow },
     { name: 'Alumni Workflow', fn: testAlumniWorkflow }, // Test only this
     // { name: 'Cross-Feature Integration', fn: testCrossFeatureIntegration }
   ];
   ```

3. **Once one test passes, enable the next**

4. **Finally, run all tests together**

### Getting Help

If you're still stuck:

1. **Check server logs** - Copy the full error message
2. **Check test output** - Note which test step failed
3. **Run health check** - `node test-server-health.js`
4. **Check documentation**:
   - `E2E_TEST_FIXES.md` - Initial fixes
   - `E2E_TEST_ADDITIONAL_FIXES.md` - Validation fixes
   - `RUN_E2E_TESTS.md` - How to run tests

### Files to Check

When debugging server crashes:

1. **`backend/server.js`** - Route registrations
2. **`backend/routes/*.js`** - Route handlers
3. **`backend/services/*.js`** - Service implementations
4. **`backend/models/*.js`** - Model schemas
5. **`backend/.env`** - Environment variables
6. **`backend/package.json`** - Dependencies

### Useful Commands

```bash
# Check if server is running
curl http://localhost:5000/api/health

# Check server health
node backend/test-server-health.js

# Test database connection
node backend/test-backend-connection.js

# Verify fixes are applied
node backend/test-fixes-verification.js

# Check what's using port 5000 (Windows)
netstat -ano | findstr :5000

# Check what's using port 5000 (Mac/Linux)
lsof -i :5000

# View server logs with more detail
cd backend
NODE_ENV=development npm start

# Run tests with more output
cd backend
node test-e2e-complete-workflows.js 2>&1 | tee test-output.log
```

### Next Steps

1. ✅ Check server logs for the actual error
2. ✅ Run `node test-server-health.js` to verify server
3. ✅ Fix any missing services or routes
4. ✅ Restart server
5. ✅ Run tests again

The key is to **look at the server logs** - they will tell you exactly what went wrong!
