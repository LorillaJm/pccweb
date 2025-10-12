# 🚀 Quick Facebook Setup (5 Minutes)

## Current Status
✅ Facebook integration is **working with mock data**  
⚠️ Need Facebook token for **real posts**

## Option 1: Keep Mock Data (Easiest)
Your news page already works perfectly with realistic sample posts. No setup needed!

## Option 2: Get Real Facebook Posts (5 minutes)

### Step 1: Get Facebook Token
1. Go to https://developers.facebook.com/tools/explorer/
2. Click "Generate Access Token"
3. Select "Page" → Choose "PCC SOICT" page
4. Copy the token

### Step 2: Add Token to Your App
1. Open `backend/.env`
2. Find this line:
   ```env
   FACEBOOK_ACCESS_TOKEN=
   ```
3. Paste your token:
   ```env
   FACEBOOK_ACCESS_TOKEN=your_token_here
   ```
4. Save the file

### Step 3: Restart & Test
```bash
# Restart backend
npm start

# Test the token
node test-facebook-token.js
```

### Step 4: Verify
Visit http://localhost:3000/news - real Facebook posts should appear!

## ✅ That's It!

Your news page will now show:
- Real posts from PCC SOICT Facebook
- Actual likes, comments, shares
- Auto-refresh every 5 minutes
- Direct links to Facebook

## 🔧 Troubleshooting

**Still seeing mock data?**
- Restart backend server
- Check token in test script
- Verify page permissions

**Token not working?**
- Regenerate from Facebook
- Make sure you selected the page (not user)
- Check if page is public

## 📞 Need Help?

The integration **always works** - it just falls back to mock data if there are any issues. Your site will never break!

For detailed help, see `GET_FACEBOOK_TOKEN_GUIDE.md`