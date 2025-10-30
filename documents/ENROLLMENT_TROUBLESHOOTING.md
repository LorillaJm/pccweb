# 🔧 Enrollment Troubleshooting Guide

## ✅ Current Status

**Database:** ✅ All 17 students have 5 enrolled subjects each  
**Backend API:** ✅ Working correctly  
**Frontend:** ❓ May need restart/refresh  

---

## 📊 Verified Data

### Students with Enrollments (17 total)
All students are enrolled in 5 subjects:
1. CS101 - Introduction to Computer Science
2. CS102 - Programming Fundamentals
3. CS201 - Data Structures and Algorithms
4. CS202 - Web Development
5. CS301 - Database Systems

### Test Accounts
- `dev080022jm@gmail.com` ✅ 5 subjects
- `lavillajero944@gmail.com` ✅ 5 subjects
- `anna.garcia@student.pcc.edu.ph` ✅ 5 subjects

---

## 🐛 Issue: "No enrolled subjects yet"

If you're seeing this message on the dashboard, try these fixes:

### Fix 1: Restart Frontend (Most Common)
```bash
# Stop frontend (Ctrl+C)
# Then restart:
npm run dev
```

### Fix 2: Clear Browser Cache
1. Press `Ctrl+Shift+Delete`
2. Select "Cookies and other site data"
3. Select "Cached images and files"
4. Click "Clear data"
5. Refresh page (`Ctrl+F5`)

### Fix 3: Re-login
1. Logout from current session
2. Clear cookies
3. Login again with student account
4. Navigate to dashboard

### Fix 4: Check API URL
Make sure your `.env` file has:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Fix 5: Verify Backend is Running
```bash
# Backend should be running on port 5000
node backend/server.js
# Or
cd backend && npm run dev
```

---

## 🧪 Testing Steps

### Step 1: Verify Database
```bash
node backend/scripts/check-enrollments.js
```
Expected: Shows all 17 students with 5 subjects each

### Step 2: Test API Directly
1. Make sure you're logged in as a student
2. Open browser and visit: `http://localhost:5000/api/subjects/enrolled`
3. Should see JSON with 5 subjects

### Step 3: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for any errors
4. Check Network tab for API calls

### Step 4: Check Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Navigate to: `http://localhost:3000/portal/student`
4. Look for request to `/api/subjects/enrolled`
5. Check response - should have 5 subjects

---

## 🎯 Quick Test Procedure

1. **Ensure backend is running**
   ```bash
   node backend/server.js
   ```

2. **Restart frontend**
   ```bash
   # Ctrl+C to stop, then:
   npm run dev
   ```

3. **Clear browser cache**
   - Ctrl+Shift+Delete
   - Clear everything
   - Close and reopen browser

4. **Login as student**
   - Email: `dev080022jm@gmail.com`
   - Password: (your password)

5. **Navigate to dashboard**
   - Go to: `http://localhost:3000/portal/student`
   - Should see "Enrolled Subjects: 5"

6. **Navigate to courses page**
   - Go to: `http://localhost:3000/portal/student/subjects`
   - Should see 5 courses with 3D tilt effects!

---

## 🔍 Debugging Checklist

- [ ] Backend server is running (port 5000)
- [ ] Frontend server is running (port 3000)
- [ ] Logged in as a student (not admin/faculty)
- [ ] Browser cache cleared
- [ ] No errors in browser console
- [ ] API URL is correct in .env
- [ ] Database has enrollments (verified with check script)

---

## 📝 Common Issues

### Issue: "401 Unauthorized"
**Cause:** Not logged in or session expired  
**Fix:** Logout and login again

### Issue: "No enrolled subjects yet"
**Cause:** Frontend cache or not restarted  
**Fix:** Restart frontend and clear browser cache

### Issue: API returns empty array
**Cause:** Wrong user or no enrollments  
**Fix:** Check which user you're logged in as

### Issue: "Failed to fetch"
**Cause:** Backend not running  
**Fix:** Start backend server

### Issue: Wrong API URL
**Cause:** Frontend calling production API  
**Fix:** Update NEXT_PUBLIC_API_URL in .env

---

## 🛠️ Re-seed If Needed

If you need to reset all enrollments:

```bash
node backend/scripts/seed-student-enrollments.js
```

This will:
- Clear existing enrollments
- Enroll all students in 5 subjects
- Update enrollment counts

---

## 📊 Expected Results

### Dashboard (`/portal/student`)
- **Enrolled Subjects card:** Shows "5"
- **My Subjects section:** Shows 4 subject cards
- **View All link:** Goes to subjects page

### Subjects Page (`/portal/student/subjects`)
- **Ongoing tab:** Shows "5" count
- **Grid view:** 5 cards with 3D tilt
- **List view:** 5 rows with details
- **Each card shows:**
  - Subject code and name
  - Instructor name
  - Schedule and room
  - Progress ring (60-100%)
  - Units badge

### Subject Detail Page (`/portal/student/subjects/[id]`)
- Course information
- Tabs: Overview, Materials, Assignments, Grades
- Progress bars
- Recent activity

---

## 💡 Pro Tips

1. **Always restart frontend after backend changes**
2. **Clear browser cache when data doesn't update**
3. **Check browser console for errors first**
4. **Use Network tab to see API responses**
5. **Verify you're logged in as the right user**

---

## 🎉 Success Indicators

You'll know it's working when you see:

✅ Dashboard shows "Enrolled Subjects: 5"  
✅ My Subjects section shows 4 cards  
✅ Subjects page shows 5 courses  
✅ 3D tilt effect works on hover  
✅ Progress rings show percentages  
✅ Clicking card opens detail page  

---

## 🆘 Still Not Working?

1. **Check browser console** - Look for red errors
2. **Check Network tab** - See what API returns
3. **Verify user role** - Must be logged in as student
4. **Check database** - Run check-enrollments.js
5. **Re-run seed** - Reset all enrollments
6. **Restart everything** - Backend, frontend, browser

---

## 📞 Quick Commands

```bash
# Check enrollments in database
node backend/scripts/check-enrollments.js

# Re-seed enrollments
node backend/scripts/seed-student-enrollments.js

# Start backend
node backend/server.js

# Start frontend
npm run dev

# Test API guide
node test-enrolled-api.js
```

---

## ✨ Final Notes

The data IS in the database (verified). If you're still seeing "No enrolled subjects yet", it's almost certainly a frontend caching issue or you're not logged in as a student.

**Most common fix:** Restart frontend + Clear browser cache + Re-login

---

**Last Updated:** After successful enrollment seeding  
**Status:** ✅ Database has data, frontend may need refresh
