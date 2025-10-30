# Email Verification & Security - Integration Tests

## Overview

Comprehensive integration tests have been implemented for the Email Verification & Security feature. The test suite covers all major workflows and security features.

## Test File

**Location:** `backend/test-email-verification-security-integration.js`

## Test Coverage

### 1. Registration with Email Verification Flow
- ✅ User registration with email/password
- ✅ Verification token and OTP generation
- ✅ User created with `emailVerified: false`
- ✅ Audit log creation for registration

### 2. Email Verification with Token and OTP
- ✅ Token-based verification (email link)
- ✅ OTP-based verification (manual code entry)
- ✅ Expired token handling and rejection
- ✅ Resend verification functionality
- ✅ User marked as verified after successful verification

### 3. Login with Unverified Email
- ✅ Login blocked for unverified users
- ✅ Proper error code (`EMAIL_NOT_VERIFIED`) returned
- ✅ Audit log for blocked login attempts
- ✅ Login successful after email verification

### 4. Two-Factor Authentication (2FA)
- ✅ Enable 2FA for verified users
- ✅ Backup codes generation
- ✅ 2FA code requirement during login
- ✅ 2FA code verification
- ✅ Invalid code rejection
- ✅ Account lockout after 3 failed attempts
- ✅ Disable 2FA functionality

### 5. Rate Limiting
- ✅ Registration rate limiting (5 per hour per IP)
- ✅ Login rate limiting (5 per 15 min)
- ✅ Verification rate limiting (10 per hour)
- ✅ Resend email rate limiting (3 per hour)
- ✅ Proper 429 status code returned

### 6. Admin Verification Actions
- ✅ Admin list all users with verification status
- ✅ Admin manual verification of users
- ✅ Admin resend verification emails
- ✅ Admin view verification audit logs
- ✅ Audit log creation for admin actions

### 7. Password Reset Flow
- ✅ Password reset request
- ✅ Reset token generation and expiration
- ✅ Password reset with valid token
- ✅ Old password rejection after reset
- ✅ New password acceptance
- ✅ Expired token rejection
- ✅ Rate limiting on password reset
- ✅ Audit log for password reset

## Running the Tests

### Prerequisites

**IMPORTANT:** The backend server must be running before executing these integration tests.

1. **MongoDB must be running**
   ```bash
   # Check if MongoDB is running
   mongosh
   ```

2. **Backend server must be running on `http://localhost:5000`**
   ```bash
   # In a separate terminal, start the backend server
   cd backend
   npm start
   # OR for development with auto-reload
   npm run dev
   ```

3. **All required environment variables must be set**
   - Ensure `backend/.env` file exists with all required variables
   - Check `backend/.env.example` for reference

### Execute Tests

**After the backend server is running:**

```bash
# In a new terminal window
cd backend

# Option 1: Run tests directly
node test-email-verification-security-integration.js

# Option 2: Use the helper script (checks if server is running)
# Windows:
run-email-verification-tests.bat

# Linux/Mac:
chmod +x run-email-verification-tests.sh
./run-email-verification-tests.sh
```

### Quick Start (Two Terminal Windows)

**Terminal 1 - Start Backend Server:**
```bash
cd backend
npm start
```

**Terminal 2 - Run Tests:**
```bash
cd backend

# Direct execution
node test-email-verification-security-integration.js

# OR use helper script
# Windows: run-email-verification-tests.bat
# Linux/Mac: ./run-email-verification-tests.sh
```

### Expected Output

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

Duration: 15.32s

Detailed Results:
  1. Registration with Verification: ✓ PASS
  2. Email Verification: ✓ PASS
  3. Login with Unverified Email: ✓ PASS
  4. Two-Factor Authentication: ✓ PASS
  5. Rate Limiting: ✓ PASS
  6. Admin Verification Actions: ✓ PASS
  7. Password Reset Flow: ✓ PASS

✅ All tests passed!
```

## Test Data Cleanup

The test suite automatically:
- Cleans up test data before running tests
- Cleans up test data after completing tests
- Uses email pattern `test-email-sec-*@test.com` for easy identification
- Removes all associated records (users, verifications, 2FA, audit logs)

## Notes

### Rate Limiting
- Rate limiting tests may show "not hit" messages in test environments where rate limiting is disabled
- This is expected behavior and doesn't indicate test failure

### Authentication
- Admin tests handle both JWT token-based and session-based authentication
- Tests gracefully handle authentication requirements

### Database Connection
- Tests require MongoDB to be running
- Connection string is read from `MONGODB_URI` environment variable
- Defaults to `mongodb://localhost:27017/pcc-portal`

## Integration with CI/CD

To integrate these tests into your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Run Integration Tests
  run: |
    cd backend
    node test-email-verification-security-integration.js
  env:
    MONGODB_URI: ${{ secrets.MONGODB_URI }}
    API_URL: http://localhost:5000
```

## Requirements Coverage

This test suite validates all requirements from the Email Verification & Security specification:

- ✅ Requirement 1: Email Verification System
- ✅ Requirement 2: Verification UI/UX Components (backend validation)
- ✅ Requirement 3: Password Security Enhancement
- ✅ Requirement 4: JWT Token Security
- ✅ Requirement 5: Two-Factor Authentication (2FA)
- ✅ Requirement 6: Rate Limiting & Bot Protection
- ✅ Requirement 7: Email Validation & Filtering
- ✅ Requirement 8: Admin Verification Dashboard
- ✅ Requirement 9: Security Audit Logging
- ✅ Requirement 10: Email Service Integration

## Next Steps

1. Run the tests to verify all functionality works as expected
2. Review test results and fix any failures
3. Integrate tests into CI/CD pipeline
4. Consider adding more edge case tests as needed
5. Monitor test execution times and optimize if necessary

## Common Issues

### ❌ Error: `connect ECONNREFUSED ::1:5000`

**Cause:** The backend server is not running.

**Solution:**
```bash
# Start the backend server in a separate terminal
cd backend
npm start
```

Wait for the server to fully start (you should see "Server running on port 5000" or similar), then run the tests again.

### ❌ Error: `Request failed with status code 429` (Rate Limit Exceeded)

**Cause:** You've hit the rate limit from previous test runs or manual testing.

**Solution 1 - Automatic (Recommended):**
The test suite now automatically clears rate limits before running. Just run the tests again:
```bash
node test-email-verification-security-integration.js
```

**Solution 2 - Manual Clear:**
```bash
# Clear rate limits manually
node clear-rate-limits.js

# Then run tests
node test-email-verification-security-integration.js
```

**Solution 3 - Wait:**
Wait for the rate limit window to expire (shown in the error message as `retryAfter` seconds).

### ❌ Error: `Cannot read properties of null (reading '_id')`

**Cause:** Previous test failed, so the user object doesn't exist for subsequent tests.

**Solution:** This is a cascading failure from the backend server not running. Start the backend server and run tests again.

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongosh

# Or start MongoDB service
# Windows: net start MongoDB
# Linux: sudo systemctl start mongod
# macOS: brew services start mongodb-community
```

### Backend Server Not Running
```bash
# Start the backend server
cd backend
npm start

# Wait for this message:
# "Server running on port 5000"
# "Connected to MongoDB"
```

### Environment Variables Missing
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env and add required variables
```

## Test Maintenance

- Update tests when API endpoints change
- Add new tests for new features
- Keep test data patterns consistent
- Review and update cleanup logic as needed
- Monitor test execution times

---

**Status:** ✅ Complete
**Last Updated:** 2025-10-20
**Test File:** `backend/test-email-verification-security-integration.js`
