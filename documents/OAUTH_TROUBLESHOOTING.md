# 🔧 Google OAuth 500 Error - Troubleshooting Guide

## Current Issue:
Getting 500 error on `/api/auth/google/callback`

---

## ✅ Step-by-Step Fix

### Step 1: Check Render Environment Variables

Go to Render Dashboard → Your Service → Environment

**Required variables for Google OAuth:**
```env
GOOGLE_CLIENT_ID=[YOUR_GOOGLE_CLIENT_ID]
GOOGLE_CLIENT_SECRET=[YOUR_GOOGLE_CLIENT_SECRET]
GOOGLE_CALLBACK_URL=https://pccweb.onrender.com/api/auth/google/callback
FRONTEND_URL=https://your-frontend-url.vercel.app
MONGODB_URI=[YOUR_MONGODB_URI]
SESSION_SECRET=[YOUR_SESSION_SECRET]
```

**⚠️ Common mistakes:**
- Missing `FRONTEND_URL` → Tries to redirect to localhost
- Wrong `GOOGLE_CALLBACK_URL` → Must be HTTPS, not HTTP
- Missing `SESSION_SECRET` → Session fails

---

### Step 2: Update Google Cloud Console

1. **Go to**: https://console.cloud.google.com
2. **Select your project** (with Client ID: 362418930607...)
3. **Go to**: APIs & Services → Credentials
4. **Click** on your OAuth 2.0 Client ID
5. **Add Authorized redirect URIs**:
   ```
   https://pccweb.onrender.com/api/auth/google/callback
   http://localhost:5000/api/auth/google/callback
   ```
6. **Add Authorized JavaScript origins**:
   ```
   https://pccweb.onrender.com
   https://pccweb-a46e-az5tvay2o-lorillajms-projects.vercel.app
   http://localhost:3000
   http://localhost:5000
   ```
7. **Click Save**

---

### Step 3: Check Render Logs

1. **Go to**: https://dashboard.render.com
2. **Click** your backend service
3. **Click** "Logs" tab
4. **Look for** error messages around the time you tried to login

**Common errors you might see:**
- `MongoServerError` → Database connection issue
- `redirect_uri_mismatch` → Google Console not configured
- `Session store error` → MongoDB session store issue
- `Cannot read property of undefined` → Missing environment variable

---

### Step 4: Test Locally First

Before deploying, test locally:

1. **Start backend**:
   ```bash
   cd backend
   npm start
   ```

2. **Start frontend**:
   ```bash
   npm run dev
   ```

3. **Try Google login** at http://localhost:3000
4. **If it works locally**, the issue is with Render configuration

---

## 🔍 Common Issues & Solutions

### Issue 1: redirect_uri_mismatch
**Error**: "The redirect URI in the request does not match..."

**Solution**:
- Check Google Console redirect URIs match exactly
- Must be HTTPS for production
- No trailing slashes

### Issue 2: Session Error
**Error**: "Failed to serialize user into session"

**Solution**:
- Verify `MONGODB_URI` is set in Render
- Check MongoDB Atlas allows connections from `0.0.0.0/0`
- Verify `SESSION_SECRET` is set

### Issue 3: User Creation Fails
**Error**: "Error creating Google user"

**Solution**:
- Check MongoDB connection is working
- Verify User model has `createSocialUser` method
- Check database has proper indexes

### Issue 4: CORS Error
**Error**: "Access-Control-Allow-Origin"

**Solution**:
- Verify `FRONTEND_URL` is set in Render
- Check CORS configuration in `server.js`

---

## 🧪 Quick Test Commands

### Test Backend Health:
```bash
curl https://pccweb.onrender.com/api/health
```
Should return: `{"status":"ok"}`

### Test Google OAuth Route Exists:
```bash
curl -I https://pccweb.onrender.com/api/auth/google
```
Should return: `302` redirect (not 404)

### Test MongoDB Connection:
Check Render logs for:
```
✅ MongoDB connected successfully
```

---

## 📋 Checklist

Before Google OAuth will work:

- [ ] Set `GOOGLE_CLIENT_ID` in Render environment variables
- [ ] Set `GOOGLE_CLIENT_SECRET` in Render environment variables
- [ ] Set `GOOGLE_CALLBACK_URL` in Render (HTTPS)
- [ ] Set `FRONTEND_URL` in Render
- [ ] `MONGODB_URI` set in Render
- [ ] `SESSION_SECRET` set in Render
- [ ] Google Console redirect URI added (HTTPS)
- [ ] Google Console JavaScript origins added
- [ ] MongoDB Atlas allows `0.0.0.0/0` connections
- [ ] Backend redeployed after adding env vars

---

## 🆘 If Still Not Working

### Get Detailed Error:

1. **Add more logging** to `backend/routes/auth-new.js`:
   ```javascript
   router.get('/google/callback', 
     (req, res, next) => {
       console.log('=== GOOGLE CALLBACK START ===');
       console.log('Query params:', req.query);
       console.log('Session:', req.session);
       
       passport.authenticate('google', (err, user, info) => {
         console.log('Auth result:', { err, user: user?.email, info });
         // ... rest of code
       })(req, res, next);
     }
   );
   ```

2. **Commit and push**
3. **Check Render logs** for detailed output

---

## 💡 Temporary Workaround

If you can't get OAuth working, disable it:

1. Edit `src/app/auth/login/page.tsx`
2. Change line 297: `{true &&` to `{false &&`
3. Users can still use email/password login

---

## ✅ Success Indicators

When OAuth is working correctly:

1. Click "Continue with Google"
2. Redirects to Google login
3. Select Google account
4. Redirects back to your site
5. Logged in and redirected to portal

---

## 📞 Need More Help?

Share these from Render logs:
1. The exact error message
2. Stack trace (if any)
3. Any console.log output around the error
4. Environment variables list (without values)

This will help diagnose the specific issue!
