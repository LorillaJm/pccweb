# ✅ Final Fix - Disable reCAPTCHA for Testing

## The Current Issues

1. ✅ **Redis not running** - OK, using in-memory fallback
2. ❌ **reCAPTCHA not configured** - Blocking all registration tests
3. ❌ **Rate limits in server memory** - Can't clear from test process

## Quick Fix - Add This to .env

Add this line to your `backend/.env` file:

```bash
# Disable reCAPTCHA for testing
RECAPTCHA_ENABLED=false
```

## Steps to Run Tests Successfully

### Step 1: Update .env File

```bash
cd backend
```

Open `.env` file and add at the end:
```
RECAPTCHA_ENABLED=false
```

### Step 2: Restart Backend Server

**IMPORTANT:** You must restart the backend server for the change to take effect!

```bash
# Stop the current server (Ctrl+C)
# Then start it again:
npm start
```

### Step 3: Run Tests

```bash
# In a new terminal
cd backend
node test-email-verification-security-integration.js
```

## Expected Output

```
============================================================
EMAIL VERIFICATION & SECURITY - INTEGRATION TESTS
============================================================

✓ Connected to MongoDB
✓ Database cleaned up
ℹ Note: Redis not connected, using in-memory cache
✓ Rate limits cleared (no entries found)

============================================================
TEST 1: Registration with Email Verification Flow
============================================================
ℹ Step 1: Registering new user...
✓ User registered: test-email-sec-user1@test.com
✓ Email verification required: true
...

[All tests should pass now]
```

## Why This Works

1. **reCAPTCHA disabled** - Tests can register without reCAPTCHA tokens
2. **Fresh server** - Rate limits reset when server restarts
3. **In-memory fallback** - Works without Redis

## Alternative: Configure reCAPTCHA Properly

If you want to test WITH reCAPTCHA:

1. Get reCAPTCHA keys from https://www.google.com/recaptcha/admin
2. Add to `.env`:
```bash
RECAPTCHA_ENABLED=true
RECAPTCHA_SECRET_KEY=your_secret_key_here
RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_MIN_SCORE=0.5
```

But for integration testing, it's easier to disable it.

## Summary

**Do this now:**
1. Add `RECAPTCHA_ENABLED=false` to `backend/.env`
2. Restart backend server (Ctrl+C, then `npm start`)
3. Run tests: `node test-email-verification-security-integration.js`

The tests should pass after these steps!
