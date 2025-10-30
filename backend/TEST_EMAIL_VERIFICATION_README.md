# Email Verification & Security Integration Tests

## Quick Start Guide

### Step 1: Ensure MongoDB is Running

```bash
# Check MongoDB status
mongosh

# If not running, start it:
# Windows: net start MongoDB
# Linux: sudo systemctl start mongod
# macOS: brew services start mongodb-community
```

### Step 2: Start the Backend Server

**Open Terminal 1:**
```bash
cd backend
npm start
```

**Wait for these messages:**
```
✓ Connected to MongoDB
✓ Server running on port 5000
```

### Step 3: Run the Integration Tests

**Open Terminal 2:**
```bash
cd backend
node test-email-verification-security-integration.js
```

## Expected Test Results

When the backend server is running, you should see:

```
============================================================
EMAIL VERIFICATION & SECURITY - INTEGRATION TESTS
============================================================

✓ Connected to MongoDB
✓ Database cleaned up

============================================================
TEST 1: Registration with Email Verification Flow
============================================================
ℹ Step 1: Registering new user...
✓ User registered: test-email-sec-user1@test.com
✓ Email verification required: true
...

============================================================
TEST SUMMARY
============================================================

Total Tests: 7
Passed: 7
Failed: 0

✅ All tests passed!
```

## What Each Test Validates

### Test 1: Registration with Email Verification Flow
- User can register with email/password
- Verification token and OTP are generated
- User is created with `emailVerified: false`
- Audit log is created

### Test 2: Email Verification with Token and OTP
- Token-based verification works (email link)
- OTP-based verification works (manual code)
- Expired tokens are rejected
- Resend verification works

### Test 3: Login with Unverified Email
- Unverified users cannot login
- Proper error message is shown
- Login works after verification

### Test 4: Two-Factor Authentication (2FA)
- Users can enable 2FA
- 2FA codes are required during login
- Invalid codes are rejected
- Account locks after 3 failed attempts

### Test 5: Rate Limiting
- Registration is rate limited
- Login is rate limited
- Verification is rate limited
- Resend email is rate limited

### Test 6: Admin Verification Actions
- Admins can list users
- Admins can manually verify users
- Admins can resend verification emails
- Admin actions are logged

### Test 7: Password Reset Flow
- Users can request password reset
- Reset tokens work correctly
- Expired tokens are rejected
- Old passwords stop working after reset

## Troubleshooting

### All Tests Fail with "connect ECONNREFUSED"

**Problem:** Backend server is not running.

**Solution:**
1. Open a new terminal
2. Run `cd backend && npm start`
3. Wait for "Server running on port 5000"
4. Run tests again

### Tests Fail with "Rate Limit Exceeded" (429)

**Problem:** You've hit the rate limit from previous test runs.

**Solution:**
The tests now automatically clear rate limits before running. If you still see this error:

```bash
# Option 1: Clear rate limits manually
node clear-rate-limits.js

# Option 2: Wait for rate limit to expire (shown in error message)
# Usually 15 minutes to 1 hour depending on the endpoint
```

### Some Tests Pass, Some Fail

**Problem:** Partial implementation or configuration issues.

**Solution:**
1. Check which specific test failed
2. Review the error message
3. Verify the corresponding feature is implemented
4. Check environment variables in `.env`

### Rate Limiting Tests Show "not hit"

**Problem:** Rate limiting may be disabled in test environment.

**Solution:** This is expected behavior and not a failure. Rate limiting might be configured differently for testing.

## Test Data Cleanup

The tests automatically:
- Clean up before running (removes old test data)
- Clean up after running (removes new test data)
- Use email pattern: `test-email-sec-*@test.com`

You can manually clean up test data:
```javascript
// In MongoDB shell
use pcc-portal
db.users.deleteMany({ email: /test-email-sec-.*@test\.com/ })
db.emailverifications.deleteMany({ email: /test-email-sec-.*@test\.com/ })
```

## Adding to CI/CD

### GitHub Actions Example

```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
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
          cd backend
          npm install
      
      - name: Start backend server
        run: |
          cd backend
          npm start &
          sleep 10
        env:
          MONGODB_URI: mongodb://localhost:27017/pcc-portal-test
          PORT: 5000
      
      - name: Run integration tests
        run: |
          cd backend
          node test-email-verification-security-integration.js
```

## Need Help?

1. **Check server logs** - Look for errors in the backend terminal
2. **Check MongoDB** - Ensure it's running and accessible
3. **Check .env file** - Verify all required variables are set
4. **Check port 5000** - Make sure nothing else is using it

## Test File Location

- **Test File:** `backend/test-email-verification-security-integration.js`
- **Documentation:** `EMAIL_VERIFICATION_INTEGRATION_TESTS.md`
- **This Guide:** `backend/TEST_EMAIL_VERIFICATION_README.md`

---

**Last Updated:** 2025-10-20
**Status:** ✅ Tests implemented and ready to run
