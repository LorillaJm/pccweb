# 🔐 Google OAuth Setup Guide

## ✅ Status: OAuth Buttons Re-enabled!

The Google and Apple login buttons are now visible on your login page.

**However**, they won't work yet until you configure Google OAuth credentials.

---

## 🚀 Setup Google OAuth (10 minutes)

### Step 1: Create Google Cloud Project

1. **Go to**: https://console.cloud.google.com
2. **Create New Project**:
   - Click "Select a project" (top left)
   - Click "New Project"
   - Name: `PCC Portal`
   - Click "Create"

### Step 2: Enable Google+ API

1. **Go to**: APIs & Services → Library
2. **Search**: "Google+ API"
3. **Click** on it
4. **Click** "Enable"

### Step 3: Configure OAuth Consent Screen

1. **Go to**: APIs & Services → OAuth consent screen
2. **User Type**: External
3. **Click** "Create"
4. **Fill in**:
   - App name: `Passi City College Portal`
   - User support email: your-email@gmail.com
   - Developer contact: your-email@gmail.com
5. **Click** "Save and Continue"
6. **Scopes**: Skip (click "Save and Continue")
7. **Test users**: Skip (click "Save and Continue")
8. **Click** "Back to Dashboard"

### Step 4: Create OAuth Credentials

1. **Go to**: APIs & Services → Credentials
2. **Click** "Create Credentials" → "OAuth client ID"
3. **Application type**: Web application
4. **Name**: `PCC Portal Web Client`
5. **Authorized JavaScript origins**:
   - Add: `https://pccweb-a46e-az5tvay2o-lorillajms-projects.vercel.app`
   - Add: `https://pccweb.onrender.com`
6. **Authorized redirect URIs**:
   - Add: `https://pccweb.onrender.com/api/auth/google/callback`
7. **Click** "Create"

### Step 5: Save Your Credentials

You'll see:
- **Client ID**: `123456789-abcdefg.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-abc123xyz`

**Save these!** You'll need them next.

---

## 🔧 Add Credentials to Render

### Step 1: Go to Render Dashboard

1. Visit: https://dashboard.render.com
2. Click your `pcc-backend` service
3. Click **Environment** (left sidebar)

### Step 2: Add Environment Variables

Add these three variables:

```env
GOOGLE_CLIENT_ID=your-client-id-from-google
GOOGLE_CLIENT_SECRET=your-client-secret-from-google
GOOGLE_CALLBACK_URL=https://pccweb.onrender.com/api/auth/google/callback
```

**Replace** `your-client-id-from-google` and `your-client-secret-from-google` with the actual values from Google.

### Step 3: Save

Click **Save** → Render will automatically redeploy (2-3 minutes)

---

## ✅ Test Google Login

1. **Wait** for Render to finish redeploying
2. **Visit** your site: https://pccweb-a46e-az5tvay2o-lorillajms-projects.vercel.app
3. **Click** "Login"
4. **Click** "Continue with Google"
5. **Select** your Google account
6. **Should redirect** back to your portal!

---

## 🍎 Setup Apple Login (Optional)

Apple login is more complex and requires:
- Apple Developer Account ($99/year)
- App ID configuration
- Service ID setup
- Private key generation

**Recommendation**: Skip Apple login for now unless you specifically need it.

To disable Apple button only:
1. Edit `src/app/auth/login/page.tsx`
2. Find the Apple button section (around line 325)
3. Comment it out or wrap in `{false && ...}`

---

## 🔍 Troubleshooting

### "Error 400: redirect_uri_mismatch"
- Check your redirect URI in Google Console matches exactly:
  ```
  https://pccweb.onrender.com/api/auth/google/callback
  ```
- No trailing slash!
- Must be HTTPS

### "Error: invalid_client"
- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- No extra spaces or quotes
- Verify they're set in Render environment variables

### Button clicks but nothing happens
- Check browser console for errors
- Verify backend is running: `https://pccweb.onrender.com/api/health`
- Check Render logs for errors

### "This app isn't verified"
- Normal for testing
- Click "Advanced" → "Go to [app name] (unsafe)"
- To remove this warning, submit app for Google verification (takes time)

---

## 📝 Current Status

**Frontend**: ✅ OAuth buttons visible
**Backend**: ✅ Deployed and running
**Google OAuth**: ⏳ Needs credentials (follow steps above)
**Apple OAuth**: ⏳ Optional (can disable)

---

## 🎯 Quick Summary

To make Google login work:
1. Create Google Cloud project
2. Enable Google+ API
3. Configure OAuth consent screen
4. Create OAuth credentials
5. Add credentials to Render environment variables
6. Test!

**Time needed**: ~10 minutes

---

## 💡 Alternative: Disable OAuth Temporarily

If you don't want to set up OAuth right now:

1. Edit `src/app/auth/login/page.tsx`
2. Change line 297 from `{true &&` to `{false &&`
3. Commit and push
4. OAuth buttons will be hidden again

Users can still login with email/password! ✅
