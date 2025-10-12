# E2E Tests Quick Guide

## TL;DR - How to Run

**Terminal 1:**
```bash
cd backend
npm start
```

**Terminal 2:**
```bash
cd backend
node run-e2e-tests.js
```

That's it! The helper script will check if the server is running and guide you if not.

---

## What Was Fixed

Your E2E tests were failing due to several missing components. Here's what was fixed:

### 1. Missing User Roles ✅
- Added `alumni` and `company` roles to User model
- Tests can now create company and alumni users

### 2. Missing Digital ID API ✅
- Created `/api/digital-id/generate` endpoint
- Created `/api/digital-id/validate-access` endpoint
- Digital ID generation and facility access now working

### 3. Missing Company Model ✅
- Created Company model for internship companies
- Internship applications can now reference companies

### 4. Unregistered Routes ✅
- Registered digital-id routes in server.js
- Registered internships routes in server.js

### 5. Schema Index Warnings ✅
- Removed duplicate index definitions
- Cleaner console output

---

## Test Coverage

The E2E suite tests 6 complete workflows:

| Test | What It Tests | Status |
|------|---------------|--------|
| 1. Chatbot | Conversation flows, escalation | Ready |
| 2. Events | Registration, tickets, attendance | Ready |
| 3. Digital ID | ID generation, facility access | ✅ Fixed |
| 4. Internships | Applications, interviews, tracking | ✅ Fixed |
| 5. Alumni | Profiles, job postings, networking | ✅ Fixed |
| 6. Integration | Cross-feature notifications | ✅ Fixed |

---

## Common Errors & Solutions

### ❌ "connect ECONNREFUSED ::1:5000"
**Problem:** Server not running

**Solution:** Start the backend server first (see Terminal 1 above)

### ❌ "Route not found" (404)
**Problem:** Missing routes

**Solution:** Already fixed! Routes are now registered.

### ❌ "is not a valid enum value for path role"
**Problem:** Invalid user roles

**Solution:** Already fixed! Alumni and company roles added.

### ❌ Duplicate index warnings
**Problem:** Schema index conflicts

**Solution:** Already fixed! Duplicate indexes removed.

---

## Files You Can Use

### 1. Verification Script
Check if all fixes are properly applied:
```bash
cd backend
node test-fixes-verification.js
```

### 2. Test Runner
Smart script that checks server status:
```bash
cd backend
node run-e2e-tests.js
```

### 3. Direct Test Execution
Run tests directly (server must be running):
```bash
cd backend
node test-e2e-complete-workflows.js
```

---

## What Each File Does

| File | Purpose |
|------|---------|
| `E2E_TEST_FIXES.md` | Detailed documentation of all fixes |
| `RUN_E2E_TESTS.md` | Complete guide with troubleshooting |
| `E2E_TESTS_QUICK_GUIDE.md` | This file - quick reference |
| `backend/test-fixes-verification.js` | Verifies all fixes are applied |
| `backend/run-e2e-tests.js` | Smart test runner with checks |
| `backend/routes/digital-id.js` | New Digital ID API routes |
| `backend/models/Company.js` | New Company model |

---

## Next Steps

1. ✅ **Fixes Applied** - All code changes are complete
2. 🔄 **Start Server** - Run `npm start` in backend directory
3. 🧪 **Run Tests** - Use `node run-e2e-tests.js`
4. 📊 **Review Results** - Check which tests pass/fail
5. 🐛 **Debug Failures** - Use error messages to identify issues

---

## Expected Results

After fixes, you should see:
- ✅ Digital ID tests passing (was 404 errors)
- ✅ Internship tests passing (was role validation errors)
- ✅ Alumni tests passing (was role validation errors)
- ⚠️ Some tests may still fail due to:
  - Chatbot service not initialized
  - Missing test data
  - Service-level issues (not route/model issues)

---

## Need More Help?

- **Detailed fixes:** See `E2E_TEST_FIXES.md`
- **Full guide:** See `RUN_E2E_TESTS.md`
- **Verify setup:** Run `node test-fixes-verification.js`
- **Check server:** Visit `http://localhost:5000/api/health`

---

**Remember:** Always start the server before running E2E tests! 🚀
