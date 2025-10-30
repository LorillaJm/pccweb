# Backend NotificationService Fix Summary

## Issue
The backend was crashing with the error:
```
TypeError: NotificationService is not a constructor
```

This occurred in two service files:
- `backend/services/JobWorkflowService.js`
- `backend/services/JobService.js`

## Root Cause
The `NotificationService.js` file exports a **singleton instance** of the class, not the class itself:

```javascript
// At the end of NotificationService.js
const notificationService = new NotificationService();
module.exports = notificationService;
```

However, both `JobWorkflowService.js` and `JobService.js` were trying to instantiate it as a constructor:

```javascript
const NotificationService = require('./NotificationService');
// ...
this.notificationService = new NotificationService(); // ❌ Error!
```

## Solution

### 1. Fixed Import Statement
Changed from importing as a class to importing as an instance:

**Before:**
```javascript
const NotificationService = require('./NotificationService');
```

**After:**
```javascript
const notificationService = require('./NotificationService');
```

### 2. Fixed Constructor Assignment
Removed the `new` keyword since we're using the singleton instance:

**Before:**
```javascript
constructor() {
  this.notificationService = new NotificationService();
}
```

**After:**
```javascript
constructor() {
  this.notificationService = notificationService;
}
```

### 3. Fixed Method Calls
Updated method calls to match the actual NotificationService API:

**Before:**
```javascript
this.notificationService.sendNotification(userId, {...})
```

**After:**
```javascript
this.notificationService.sendToUser(userId, {...})
```

## Files Modified

### NotificationService Singleton Fix (6 files)

1. **backend/services/JobWorkflowService.js**
   - Fixed import statement
   - Fixed constructor assignment
   - Updated 1 method call
   - Added missing `getPendingApprovals()` method
   - Added missing `reviewJobPosting()` method

2. **backend/services/JobService.js**
   - Fixed import statement
   - Fixed constructor assignment
   - Updated 5 method calls

3. **backend/services/MentorshipService.js**
   - Fixed import statement
   - Fixed constructor assignment

4. **backend/services/MentorshipMatchingService.js**
   - Fixed import statement
   - Fixed constructor assignment

5. **backend/services/AlumniEventService.js**
   - Fixed import statement
   - Fixed constructor assignment

6. **backend/services/AccessControlService.js**
   - Fixed import statement
   - Fixed constructor assignment

### Route Fixes (7 files)

7. **backend/routes/admin-jobs.js**
   - Fixed middleware import (authenticateToken → requireAdmin)

8. **backend/routes/alumni.js**
   - Fixed middleware import and all usages (authenticateToken → requireAuth)

9. **backend/routes/mentorship.js**
   - Fixed middleware import and all usages (authenticateToken → requireAuth)

10. **backend/routes/jobs.js**
    - Fixed middleware import and all usages (authenticateToken → requireAuth)

11. **backend/routes/internships.js**
    - Fixed middleware import and all usages (authenticateToken → requireAuth)

12. **backend/routes/companies.js**
    - Fixed middleware import and all usages (authenticateToken → requireAuth)

13. **backend/routes/campus-access.js**
    - Fixed middleware import and all usages (authenticateToken → requireAuth)

## Additional Fixes

### 1. Missing Methods in JobWorkflowService
Added two missing methods that were being called by `admin-jobs.js` routes:

1. **getPendingApprovals(pagination)**
   - Retrieves job postings with 'pending_approval' status
   - Supports pagination
   - Returns jobs with poster information

2. **reviewJobPosting(jobId, reviewerId, decision, feedback)**
   - Allows admins to approve or reject job postings
   - Updates job status to 'active' or 'rejected'
   - Sends notifications to job poster
   - Records reviewer and feedback

### 2. Incorrect Middleware Import in admin-jobs.js
Fixed the middleware import in `backend/routes/admin-jobs.js`:

**Before:**
```javascript
const { authenticateToken } = require('../middleware/sessionAuth');
// ...
router.get('/jobs/pending', authenticateToken, requireAdmin, async (req, res) => {
```

**After:**
```javascript
const { requireAuth, requireAdmin } = require('../middleware/sessionAuth');
// ...
router.get('/jobs/pending', requireAdmin, async (req, res) => {
```

The `requireAdmin` middleware already includes authentication checking, so no need for separate `authenticateToken`.

## Testing
After these changes, the backend should start successfully without any errors.

## Why Singleton Pattern?
The `NotificationService` uses a singleton pattern because:
1. It maintains shared state (cache connections, configuration)
2. It should have only one instance across the application
3. It's more efficient for resource management

## Best Practice
When importing services that export singleton instances:
- Use lowercase variable names: `const notificationService = require(...)`
- Don't use `new` keyword
- Use the instance directly

---

**Status:** ✅ Fixed
**Date:** 2025-10-02
**Impact:** Backend now starts without errors
