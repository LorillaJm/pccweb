# 🚀 Render Backend Deployment Guide

## The Error You're Seeing:

```
npm error Missing script: "build"
```

**Why:** Render is trying to run `npm run build` from the root directory, but:
1. The backend code is in the `backend/` folder
2. Node.js backends don't need a build step

---

## ✅ Fix: Configure Render Correctly

### Step 1: Go to Your Render Service Settings

1. Go to https://dashboard.render.com
2. Click on your `pcc-backend` service
3. Click **Settings** (left sidebar)

### Step 2: Update These Settings

**Root Directory:**
```
backend
```
⚠️ This is CRITICAL - tells Render where your backend code is

**Build Command:**
```
npm install
```
(Just install dependencies, no build needed)

**Start Command:**
```
npm start
```
(This runs `node server.js` from package.json)

### Step 3: Add Environment Variables

Still in Settings, scroll to **Environment Variables** and add:

```env
NODE_ENV=production
PORT=10000
SESSION_SECRET=ee5a7a9644e02b4c2236b96b007de4aaeebb382bc440fd8429aacd45b2cc2c81
JWT_SECRET=a8fa8f217d62c7400364d2d04bb05bd67a6f51bad6e68e2e68447821c1c91860
MONGODB_URI=your-mongodb-connection-string-here
REDIS_URL=your-redis-connection-string-here
FRONTEND_URL=https://pccweb.vercel.app
```

**Don't have MongoDB/Redis yet?** See setup below ⬇️

### Step 4: Save & Redeploy

1. Click **Save Changes**
2. Render will automatically redeploy
3. Build should succeed in 2-3 minutes

---

## 📦 Setup Free Databases (Required)

### MongoDB Atlas (Free 512MB)

1. **Sign up**: https://www.mongodb.com/cloud/atlas/register
2. **Create Cluster**:
   - Choose FREE tier (M0)
   - Select region closest to you
   - Click "Create Cluster"
3. **Create Database User**:
   - Database Access → Add New User
   - Username: `pccadmin`
   - Password: (generate strong password)
   - User Privileges: Read and write to any database
4. **Whitelist All IPs**:
   - Network Access → Add IP Address
   - Enter: `0.0.0.0/0` (allows Render to connect)
   - Click "Confirm"
5. **Get Connection String**:
   - Clusters → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Replace `<dbname>` with `pcc-portal`
   
   Example:
   ```
   mongodb+srv://pccadmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/pcc-portal?retryWrites=true&w=majority
   ```

6. **Add to Render**:
   - Paste this as `MONGODB_URI` in Render environment variables

### Redis Cloud (Free 30MB)

1. **Sign up**: https://redis.com/try-free/
2. **Create Database**:
   - Click "New subscription"
   - Choose FREE tier (30MB)
   - Select region closest to you
   - Click "Create subscription"
3. **Get Connection URL**:
   - Click on your database
   - Copy the "Public endpoint"
   - Format: `redis://default:PASSWORD@host:port`
   
   Example:
   ```
   redis://default:abc123xyz@redis-12345.c1.us-east-1-1.ec2.redns.redis-cloud.com:12345
   ```

4. **Add to Render**:
   - Paste this as `REDIS_URL` in Render environment variables

---

## 🔍 Verify Deployment

### Check Build Logs:
1. Go to your Render service
2. Click "Logs" tab
3. Look for:
   ```
   ==> Build succeeded 🎉
   ==> Starting service...
   Server running on port 10000
   ```

### Test Your Backend:
Once deployed, visit:
```
https://your-backend.onrender.com/api/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-10-12T..."
}
```

---

## 🎯 Complete Deployment Checklist

- [ ] Render Root Directory set to `backend`
- [ ] Build Command set to `npm install`
- [ ] Start Command set to `npm start`
- [ ] MongoDB Atlas database created
- [ ] MongoDB connection string added to Render
- [ ] Redis Cloud database created
- [ ] Redis connection URL added to Render
- [ ] All environment variables added
- [ ] Backend deployed successfully
- [ ] Health check endpoint working
- [ ] Update Vercel `NEXT_PUBLIC_API_URL` with Render URL

---

## 🔗 Update Frontend

Once backend is deployed:

1. **Get your Render URL**:
   ```
   https://pcc-backend.onrender.com
   ```

2. **Update Vercel**:
   - Go to Vercel dashboard
   - Your project → Settings → Environment Variables
   - Edit `NEXT_PUBLIC_API_URL`
   - Change to: `https://pcc-backend.onrender.com`
   - Click "Save"
   - Redeploy frontend

---

## 🆘 Troubleshooting

### Build still fails?
- Double-check Root Directory is exactly `backend`
- Make sure Build Command is `npm install` (not `npm run build`)

### Backend starts but crashes?
- Check you added all environment variables
- Verify MongoDB and Redis connection strings are correct
- Check Render logs for specific error messages

### Can't connect to database?
- MongoDB: Make sure you whitelisted `0.0.0.0/0`
- Redis: Verify the connection URL format is correct
- Check credentials are correct (no typos)

---

## 💰 Cost: $0/month

All services are 100% free:
- ✅ Render Free: 750 hours/month
- ✅ MongoDB Atlas: 512MB storage
- ✅ Redis Cloud: 30MB storage
- ✅ Vercel: 100GB bandwidth

**Note:** Render free tier sleeps after 15 minutes of inactivity. First request after sleep takes ~30 seconds to wake up.

---

## 🎉 Success!

Once everything is deployed:
- Frontend: `https://pccweb.vercel.app`
- Backend: `https://pcc-backend.onrender.com`
- Your app is live and accessible worldwide! 🌍
