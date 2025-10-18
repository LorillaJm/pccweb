# 🔧 Vercel Environment Variable Setup (Optional but Recommended)

## Current Status:
✅ Your backend URL is now hardcoded as fallback: `https://pccweb.onrender.com/api`
✅ This works fine for now!

## Why Set Environment Variable? (Optional)

Setting `NEXT_PUBLIC_API_URL` in Vercel is better because:
- ✅ Easy to change without redeploying code
- ✅ Can have different URLs for preview vs production
- ✅ Follows best practices
- ✅ More secure and flexible

---

## How to Set Environment Variable in Vercel (5 minutes)

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Click on your `pccweb` project

### Step 2: Add Environment Variable
1. Click **Settings** (top menu)
2. Click **Environment Variables** (left sidebar)
3. Add new variable:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://pccweb.onrender.com/api`
   - **Environments**: Check all (Production, Preview, Development)
4. Click **Save**

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Click the three dots (...) on latest deployment
3. Click **Redeploy**
4. Wait 2-3 minutes

### Step 4: Verify
Visit your site and check browser console:
```javascript
// Should log your backend URL
console.log(process.env.NEXT_PUBLIC_API_URL)
```

---

## ⚠️ Important Notes:

### Environment Variable Priority:
```javascript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pccweb.onrender.com/api';
```

This means:
1. **If set in Vercel**: Uses Vercel environment variable
2. **If not set**: Uses hardcoded fallback `https://pccweb.onrender.com/api`

### Current Behavior:
- ✅ Works without setting environment variable (uses fallback)
- ✅ Will use environment variable if you set it later
- ✅ No rush to set it - your app works now!

---

## 🎯 When to Update Environment Variable:

Update the environment variable when:
- ❌ Backend URL changes
- ❌ You want different URLs for staging/production
- ❌ You're setting up a custom domain

For now, **you don't need to do anything** - your app is working! 🎉

---

## 🔄 If Backend URL Changes Later:

### Option 1: Update Environment Variable (Recommended)
1. Vercel → Settings → Environment Variables
2. Edit `NEXT_PUBLIC_API_URL`
3. Change value to new URL
4. Redeploy

### Option 2: Update Code (Quick but not ideal)
1. Edit `src/lib/api.ts`
2. Change the fallback URL
3. Commit and push

---

## ✅ Your Current Setup:

**Frontend**: https://pccweb-a46e-az5tvay2o-lorillajms-projects.vercel.app
**Backend**: https://pccweb.onrender.com/api
**Status**: ✅ Connected and working!

**You're all set!** Your app is now fully deployed and accessible online! 🚀
