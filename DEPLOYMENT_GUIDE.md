# Deployment Guide - PCC Web Portal

## Quick Start (Recommended: Vercel + Render)

### Prerequisites
- GitHub account
- Vercel account (free)
- Render account (free)
- MongoDB Atlas account (free)
- Redis Cloud account (free)

---

## Step 1: Prepare Your Code

### 1.1 Update Backend for Production

Ensure `backend/server.js` has proper CORS:
```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
};
app.use(cors(corsOptions));
```

### 1.2 Update Frontend API URL

In `src/lib/api.ts`, ensure it uses environment variable:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
```

---

## Step 2: Setup Free Databases

### MongoDB Atlas (Database)
1. Visit: https://www.mongodb.com/cloud/atlas/register
2. Create free M0 cluster (512MB)
3. Create database user
4. Whitelist IP: `0.0.0.0/0` (allow all)
5. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/pcc-portal
   ```

### Redis Cloud (Cache/Sessions)
1. Visit: https://redis.com/try-free/
2. Create free database (30MB)
3. Get connection URL:
   ```
   redis://default:password@host:port
   ```

---

## Step 3: Deploy Backend to Render

### 3.1 Create Account
- Visit: https://render.com
- Sign up with GitHub

### 3.2 Create Web Service
1. Click "New +" → "Web Service"
2. Connect GitHub repository
3. Configure:
   - **Name**: `pcc-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

### 3.3 Add Environment Variables
```env
NODE_ENV=production
PORT=10000
SESSION_SECRET=your-random-secret-here-min-32-chars
JWT_SECRET=your-jwt-secret-here-min-32-chars
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pcc-portal
REDIS_URL=redis://default:password@host:port
FRONTEND_URL=https://your-project.vercel.app
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-backend.onrender.com/api/auth/google/callback
```

### 3.4 Deploy
- Click "Create Web Service"
- Wait 5-10 minutes for first deploy
- Note your backend URL: `https://pcc-backend.onrender.com`

---

## Step 4: Deploy Frontend to Vercel

### 4.1 Push to GitHub
```bash
git init
git add .
git commit -m "Initial deployment"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/pcc-portal.git
git push -u origin main
```

### 4.2 Import to Vercel
1. Visit: https://vercel.com
2. Sign up with GitHub
3. Click "Add New Project"
4. Import your repository
5. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 4.3 Add Environment Variables
```env
NEXT_PUBLIC_API_URL=https://pcc-backend.onrender.com
```

### 4.4 Deploy
- Click "Deploy"
- Wait 2-3 minutes
- Your site: `https://pcc-portal.vercel.app`

---

## Step 5: Configure Custom Domain (Optional)

### Free Domain Options:
1. **Freenom** (free .tk, .ml, .ga domains): https://www.freenom.com
2. **InfinityFree** (free subdomain): https://infinityfree.net
3. **Vercel subdomain** (included): `your-project.vercel.app`

### Add Custom Domain to Vercel:
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

---

## Step 6: Initialize Database

### Run migrations:
```bash
# SSH into Render or use Render Shell
cd backend
npm run migrate
node scripts/create-admin.js
node scripts/seed-subjects.js
```

---

## Alternative: Railway (All-in-One)

### Simpler but limited free tier

1. Visit: https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub"
4. Select repository
5. Add services:
   - MongoDB plugin
   - Redis plugin
6. Configure environment variables
7. Deploy automatically

**Free tier**: $5 credit/month (enough for small projects)

---

## Post-Deployment Checklist

- [ ] Backend is accessible at your Render URL
- [ ] Frontend is accessible at your Vercel URL
- [ ] Database connection works
- [ ] Redis connection works
- [ ] User registration works
- [ ] Login/logout works
- [ ] OAuth (Google) works
- [ ] File uploads work
- [ ] WebSocket connections work

---

## Monitoring & Maintenance

### Free Tier Limitations:
- **Render Free**: Spins down after 15 min inactivity (cold starts)
- **Vercel Free**: 100GB bandwidth/month
- **MongoDB Atlas Free**: 512MB storage
- **Redis Cloud Free**: 30MB storage

### Keep Backend Alive:
Use a free uptime monitor:
- **UptimeRobot**: https://uptimerobot.com (free)
- Ping your backend every 14 minutes

---

## Troubleshooting

### Backend won't start:
- Check Render logs
- Verify all environment variables
- Ensure MongoDB/Redis URLs are correct

### Frontend can't connect to backend:
- Check CORS settings in backend
- Verify `NEXT_PUBLIC_API_URL` in Vercel
- Check browser console for errors

### Database connection fails:
- Whitelist all IPs in MongoDB Atlas: `0.0.0.0/0`
- Check connection string format
- Verify username/password

---

## Cost Breakdown (Free Tier)

| Service | Free Tier | Limits |
|---------|-----------|--------|
| Vercel | ✅ Free | 100GB bandwidth, unlimited projects |
| Render | ✅ Free | 750 hours/month, sleeps after 15min |
| MongoDB Atlas | ✅ Free | 512MB storage |
| Redis Cloud | ✅ Free | 30MB storage |
| **Total** | **$0/month** | Good for 1000+ users |

---

## Upgrade Path (When You Grow)

- **Vercel Pro**: $20/month (more bandwidth)
- **Render Starter**: $7/month (no sleep, better performance)
- **MongoDB M10**: $9/month (2GB storage)
- **Redis Standard**: $5/month (250MB)

**Total for production**: ~$40/month
