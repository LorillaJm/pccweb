# 🔑 How to Get Facebook Access Token - Step by Step

## Quick Overview
You need a Facebook Page Access Token to fetch real posts from https://www.facebook.com/pccsoict2005/

## 📋 Prerequisites
- Facebook account with admin access to the PCC SOICT page
- 10 minutes of setup time

## 🚀 Step-by-Step Instructions

### Step 1: Go to Facebook Developers
1. Open https://developers.facebook.com/
2. Click **"My Apps"** in the top right
3. Click **"Create App"**

### Step 2: Create Facebook App
1. Choose **"Consumer"** as app type
2. Click **"Next"**
3. Fill in app details:
   - **App Name**: `PCC News Feed` (or any name)
   - **App Contact Email**: Your email
   - **App Purpose**: Choose "Yourself or your own business"
4. Click **"Create App"**

### Step 3: Add Pages Product
1. In your app dashboard, scroll down to **"Add Products to Your App"**
2. Find **"Facebook Login"** and click **"Set Up"**
3. On the left sidebar, click **"Facebook Login"** → **"Settings"**
4. Add this to **Valid OAuth Redirect URIs**:
   ```
   https://developers.facebook.com/tools/explorer/callback
   ```
5. Click **"Save Changes"**

### Step 4: Get Page Access Token
1. Go to **Graph API Explorer**: https://developers.facebook.com/tools/explorer/
2. In the top right:
   - Select your app from **"Facebook App"** dropdown
   - Click **"Generate Access Token"**
3. A popup will appear - click **"Continue as [Your Name]"**
4. Grant permissions when asked
5. In the **"User or Page"** dropdown, select **"Page"**
6. Choose the **PCC SOICT page** from the list
7. Copy the **Access Token** that appears

### Step 5: Configure Your App
1. Open your `backend/.env` file
2. Replace the empty `FACEBOOK_ACCESS_TOKEN=` with:
   ```env
   FACEBOOK_ACCESS_TOKEN=your_copied_token_here
   ```
3. Save the file

### Step 6: Test the Integration
1. Restart your backend server:
   ```bash
   # In backend folder
   npm start
   ```
2. Visit: http://localhost:5000/api/facebook/status
3. You should see: `"configured": true`
4. Visit: http://localhost:3000/news
5. Scroll to "Latest from Facebook" - real posts should appear!

## 🔧 Alternative Method (If Above Doesn't Work)

### Using Facebook Business Manager
1. Go to https://business.facebook.com/
2. Select your business account
3. Go to **"Business Settings"** → **"System Users"**
4. Create a system user with **"Admin"** role
5. Generate token with **"pages_read_engagement"** permission

## 🛠️ Troubleshooting

### Token Not Working?
- Make sure you selected the correct page
- Check if token has expired (regenerate if needed)
- Verify page permissions in Facebook

### Still Seeing Mock Data?
- Restart your backend server after adding token
- Check browser console for errors
- Verify token in Graph API Explorer

### Rate Limiting Issues?
- Facebook allows 200 calls per hour
- Our app refreshes every 5 minutes (12 calls/hour)
- Well within limits for normal usage

## 🔒 Security Notes

- **Never share your access token publicly**
- **Don't commit tokens to git**
- **Tokens can expire** - regenerate when needed
- **Use page tokens, not user tokens**

## ✅ Verification Checklist

- [ ] Facebook app created
- [ ] Page access token generated
- [ ] Token added to backend/.env
- [ ] Backend server restarted
- [ ] http://localhost:5000/api/facebook/status shows "configured": true
- [ ] Real Facebook posts appear on news page

## 🎉 Success!

Once configured, your news page will:
- ✅ Show real Facebook posts from PCC SOICT
- ✅ Auto-refresh every 5 minutes
- ✅ Display actual likes, comments, shares
- ✅ Link directly to Facebook posts
- ✅ Show real post images and content

## 📞 Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Verify the token in Facebook's Graph API Explorer
3. Make sure you have admin access to the Facebook page
4. Try regenerating the token

The integration will fall back to mock data if there are any issues, so your site will always work!