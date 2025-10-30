# Session Authentication Debug Guide

## 🔍 Issue: "Your session is not authorized" Error

You're logged in but getting 401 errors when trying to access the student portal.

## 🎯 Root Cause

The frontend is trying to connect to the **wrong API endpoint**. Even though you have `.env.local` configured, the app might be using the fallback production URL.

## ✅ Quick Fix

### Step 1: Verify Backend is Running

```bash
# Check if backend is running on port 5000
curl http://localhost:5000/api/health

# Or in PowerShell
Invoke-WebRequest -Uri http://localhost:5000/api/health
```

**Expected Response:** `{"status":"ok"}`

If backend is NOT running:
```bash
cd backend
npm start
```

### Step 2: Restart Frontend with Environment Variables

The issue is likely that Next.js didn't pick up your `.env.local` file.

```bash
# Stop the frontend (Ctrl+C)
# Then restart it
npm run dev
```

### Step 3: Verify API URL in Browser Console

Open browser console and run:
```javascript
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
```

**Should show:** `http://localhost:5000/api`  
**If it shows:** `https://pccweb.onrender.com/api` ← This is the problem!

### Step 4: Force Environment Variable (If Step 2 Didn't Work)

If restarting didn't work, try this:

**Windows (PowerShell):**
```powershell
$env:NEXT_PUBLIC_API_URL="http://localhost:5000/api"
npm run dev
```

**Windows (CMD):**
```cmd
set NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm run dev
```

## 🔧 Alternative: Temporary Code Fix

If environment variables aren't working, you can temporarily hardcode the local URL:

**File:** `src/lib/api.ts`

```typescript
// Change this line:
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pccweb.onrender.com/api';

// To this (temporarily):
const API_BASE_URL = 'http://localhost:5000/api';
```

⚠️ **Remember to change it back before deploying!**

## 🧪 Verify the Fix

After applying the fix:

1. **Check Network Tab:**
   - Open DevTools → Network tab
   - Try to load student portal
   - Look for requests to `/api/announcements`
   - URL should be: `http://localhost:5000/api/announcements`
   - NOT: `https://pccweb.onrender.com/api/announcements`

2. **Check Response:**
   - Status should be `200 OK` (not 401)
   - Response should contain data

3. **Check Console:**
   - No 401 errors
   - Dashboard loads successfully

## 🎯 Why This Happens

### The Problem:
1. You log in → Session cookie is set for `localhost:5000`
2. Frontend tries to call API → Uses `pccweb.onrender.com`
3. Browser doesn't send `localhost` cookies to `pccweb.onrender.com`
4. Backend sees no session → Returns 401

### The Solution:
- Frontend and backend must be on same domain (both localhost)
- Or use CORS with credentials properly configured
- For local development, always use `localhost:5000`

## 📋 Checklist

- [ ] Backend is running on `localhost:5000`
- [ ] Frontend is running on `localhost:3000`
- [ ] `.env.local` exists with correct API URL
- [ ] Frontend restarted after `.env.local` changes
- [ ] Browser console shows correct API URL
- [ ] Network tab shows requests to `localhost:5000`
- [ ] No 401 errors in console
- [ ] Dashboard loads successfully

## 🔍 Still Not Working?

### Check Backend Logs
Look for incoming requests in backend terminal:
```
POST /api/auth/login - 200
GET /api/announcements - 401 ← This means session not found
```

### Check Session Cookie
In browser DevTools:
1. Application tab → Cookies
2. Look for `connect.sid` cookie
3. Domain should be `localhost`
4. If domain is `pccweb.onrender.com`, that's the problem

### Check CORS Configuration
**File:** `backend/server.js`

Should have:
```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

## 💡 Pro Tip

Create a script to start both frontend and backend:

**File:** `package.json` (root)
```json
{
  "scripts": {
    "dev:all": "concurrently \"cd backend && npm start\" \"npm run dev\""
  }
}
```

Then just run:
```bash
npm run dev:all
```

---

**Quick Summary:**
1. Make sure backend is running
2. Restart frontend to pick up `.env.local`
3. Verify API URL in console
4. Check that requests go to `localhost:5000`

The error message you're seeing is actually correct - your session IS not authorized for the remote API because you logged into the local one!
