# 🐛 Debug: Why "No courses found"?

## ✅ What We Know

1. **Database has data** ✅
   - 17 students
   - Each has 5 enrolled subjects
   - Verified with `check-enrollments.js`

2. **API works correctly** ✅
   - Tested with `test-api-direct.js`
   - Returns 5 subjects for dev080022jm@gmail.com
   - API endpoint: `/api/subjects/enrolled`

3. **Frontend .env is correct** ✅
   - `NEXT_PUBLIC_API_URL=http://localhost:5000/api`

## ❓ So Why "No courses found"?

### Most Likely Causes:

#### 1. Backend Server Not Running ⚠️
**Check:** Is your backend running on port 5000?

```bash
# Start backend if not running:
cd backend
node server.js
# Or:
npm run dev
```

**Verify:** Open http://localhost:5000/api/health in browser
- Should see: `{"status":"ok"}`

#### 2. Not Logged In as Student ⚠️
**Check:** Open browser console (F12) and look for user info

The frontend might show you're logged in, but the session might be expired or you're logged in as a different role.

**Fix:**
1. Logout completely
2. Clear cookies (Ctrl+Shift+Delete)
3. Login again with: `dev080022jm@gmail.com`

#### 3. Session/Cookie Issue ⚠️
**Check:** Browser console Network tab

Look for the `/api/subjects/enrolled` request:
- Status should be 200 (not 401)
- Response should have 5 subjects

**Fix:**
1. Clear all cookies
2. Restart backend
3. Restart frontend
4. Login again

#### 4. CORS Issue ⚠️
**Check:** Browser console for CORS errors

**Fix:** Backend should have CORS enabled for localhost:3000

---

## 🔍 Step-by-Step Debug

### Step 1: Verify Backend is Running

```bash
# Terminal 1: Start backend
cd backend
node server.js
```

Expected output:
```
🚀 Server running on port 5000
🍃 MongoDB Connected
```

### Step 2: Test API Directly

Open browser and visit (while logged in):
```
http://localhost:5000/api/subjects/enrolled
```

**Expected:** JSON with 5 subjects  
**If 401:** Not logged in properly  
**If empty array:** Session issue  
**If connection refused:** Backend not running  

### Step 3: Check Frontend Console

1. Open http://localhost:3000/portal/student/subjects
2. Press F12 (DevTools)
3. Go to Console tab
4. Look for errors (red text)
5. Go to Network tab
6. Look for `/api/subjects/enrolled` request
7. Click on it and check:
   - Status code (should be 200)
   - Response (should have 5 subjects)
   - Headers (check cookies are sent)

### Step 4: Verify User

In browser console, type:
```javascript
localStorage.getItem('user')
```

Should show user object with `role: "student"`

### Step 5: Check Session

In Network tab, check if cookies are being sent:
- Look for `connect.sid` cookie
- Should be sent with every API request

---

## 🛠️ Quick Fixes

### Fix 1: Complete Reset
```bash
# Stop everything (Ctrl+C in all terminals)

# Terminal 1: Start backend
cd backend
node server.js

# Terminal 2: Start frontend (in new terminal)
npm run dev

# Browser:
# 1. Clear all cookies (Ctrl+Shift+Delete)
# 2. Close browser completely
# 3. Reopen browser
# 4. Go to http://localhost:3000
# 5. Login as: dev080022jm@gmail.com
# 6. Go to: http://localhost:3000/portal/student/subjects
```

### Fix 2: Check Backend Logs

When you visit the subjects page, check backend terminal for logs:
- Should see API requests
- Should NOT see errors
- Should see successful responses

### Fix 3: Add Debug Logging

Add this to `src/app/portal/student/subjects/page.tsx` after line 50:

```typescript
const response = await subjectsApi.getEnrolledSubjects();
console.log('🔍 API Response:', response); // ADD THIS LINE
if (response.success) {
  console.log('✅ Subjects:', response.data.enrolledSubjects); // ADD THIS LINE
  setSubjects(response.data.enrolledSubjects);
}
```

Then check browser console for these logs.

---

## 🎯 Most Common Issue

**You're probably not logged in properly or the session expired.**

### Solution:
1. **Logout** from the app
2. **Clear cookies** (Ctrl+Shift+Delete → Cookies)
3. **Close browser** completely
4. **Restart backend** (Ctrl+C, then `node backend/server.js`)
5. **Restart frontend** (Ctrl+C, then `npm run dev`)
6. **Open browser** fresh
7. **Login** as `dev080022jm@gmail.com`
8. **Navigate** to subjects page

---

## 📊 Expected vs Actual

### Expected Behavior:
1. Login as student
2. Go to `/portal/student/subjects`
3. See "Ongoing: 5" in tabs
4. See 5 course cards with 3D tilt
5. Each card shows CS101, CS102, CS201, CS202, CS301

### Actual Behavior:
- Seeing "No courses found"
- Message: "You are not enrolled in any courses yet"

### This Means:
- API returned empty array `[]`
- OR API call failed
- OR not authenticated

---

## 🧪 Test Commands

```bash
# 1. Check database
node backend/scripts/check-enrollments.js

# 2. Test API directly
node backend/scripts/test-api-direct.js

# 3. Check if backend is running
curl http://localhost:5000/api/health

# 4. Test enrolled API (need to be logged in)
# Open browser, login, then visit:
# http://localhost:5000/api/subjects/enrolled
```

---

## 💡 Pro Tip

Open TWO browser windows side by side:
1. **Left:** Your app (http://localhost:3000/portal/student/subjects)
2. **Right:** DevTools (F12) with Console and Network tabs open

Watch the Network tab when you load the page. You'll see exactly what's happening with the API call.

---

## 🆘 Still Not Working?

If you've tried everything above and it's still not working, the issue is likely:

1. **Backend not running** - Check terminal, should see "Server running on port 5000"
2. **Wrong user** - Make sure you're logged in as a STUDENT (not admin/faculty)
3. **Session expired** - Logout and login again
4. **Port conflict** - Something else might be using port 5000

### Nuclear Option:
```bash
# Kill everything
# Ctrl+C in all terminals

# Delete node_modules and reinstall
rm -rf node_modules
npm install

# Restart everything
# Terminal 1:
cd backend && node server.js

# Terminal 2:
npm run dev

# Browser:
# Clear everything, login fresh
```

---

## ✅ Success Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Logged in as student (dev080022jm@gmail.com)
- [ ] No errors in browser console
- [ ] API call returns 200 status
- [ ] API response has 5 subjects
- [ ] Cookies are being sent with requests

When all checked, you should see 5 courses! ✨

---

**Next Step:** Try the "Complete Reset" fix above. That solves 90% of cases.
