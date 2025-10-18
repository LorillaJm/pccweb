# 🚨 QUICK FIX: Session Not Authorized Error

## The Problem
You're logged in, but the frontend is calling the **production API** instead of your **local backend**.

## ✅ The Solution (Choose One)

### Option 1: Restart Frontend (Recommended)

Your `.env.local` is correct, but Next.js needs to be restarted to pick it up.

```bash
# 1. Stop the frontend (Ctrl+C in the terminal running npm run dev)

# 2. Start it again
npm run dev
```

Then refresh your browser and try again.

---

### Option 2: Temporary Code Fix (If Option 1 Doesn't Work)

Edit `src/lib/api.ts` line 4:

**Change FROM:**
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pccweb.onrender.com/api';
```

**Change TO:**
```typescript
const API_BASE_URL = 'http://localhost:5000/api';
```

⚠️ **IMPORTANT:** Change it back before committing/deploying!

---

### Option 3: Check Backend is Running

Make sure your backend is actually running:

```bash
# In a separate terminal
cd backend
npm start
```

You should see:
```
Server running on port 5000
MongoDB connected
```

---

## 🧪 How to Verify It's Fixed

1. **Open Browser DevTools** (F12)
2. **Go to Network tab**
3. **Refresh the student portal page**
4. **Look for the `/api/announcements` request**
5. **Check the URL:**
   - ✅ Should be: `http://localhost:5000/api/announcements`
   - ❌ NOT: `https://pccweb.onrender.com/api/announcements`

6. **Check the Status:**
   - ✅ Should be: `200 OK`
   - ❌ NOT: `401 Unauthorized`

---

## 🎯 Why This Happens

1. You logged in → Session cookie saved for `localhost:5000`
2. Frontend tries to call API → Uses `pccweb.onrender.com` (wrong!)
3. Browser doesn't send `localhost` cookies to remote server
4. Backend doesn't see your session → Returns 401

**Solution:** Make frontend use `localhost:5000` API

---

## 📋 Quick Checklist

- [ ] Backend is running (`cd backend && npm start`)
- [ ] Frontend restarted (`npm run dev`)
- [ ] Browser refreshed (F5)
- [ ] Network tab shows requests to `localhost:5000`
- [ ] Status is 200, not 401
- [ ] Dashboard loads successfully

---

## 💡 Still Not Working?

Run this in your browser console:
```javascript
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
```

If it shows `undefined` or the production URL, then Option 2 (temporary code fix) is your best bet.

---

**TL;DR:** Restart your frontend with `npm run dev` to pick up the `.env.local` file!
