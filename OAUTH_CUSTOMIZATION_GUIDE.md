# OAuth Customization Guide - Change "Choose an account" Message

## Current Issue
The Google OAuth flow shows: **"Choose an account to continue to pccweb.onrender.com"**

You want to change it to show: **"Choose an account to continue to pccweb"**

## Solution

The domain name in the OAuth message comes from your **redirect URI domain**. To change it, you have two options:

### Option 1: Use a Custom Domain (Recommended)
1. Set up a custom domain (e.g., `pccweb.com` or `portal.pccweb.com`)
2. Update your Google OAuth redirect URI to use the custom domain
3. Update `GOOGLE_CALLBACK_URL` environment variable in your backend
4. The message will show: "Choose an account to continue to pccweb.com"

### Option 2: Customize OAuth Consent Screen (Changes App Name)
While you can't change the domain in the message, you can customize the app name:

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Navigate to**: APIs & Services > OAuth consent screen
3. **Update App Information**:
   - **App name**: Change to "PCC" or "PCC Portal" (this affects the overall OAuth experience)
   - **User support email**: Your support email
   - **App logo**: Upload your logo
4. **Authorized domains**: Add your domain
5. **Save changes**

### Option 3: Update Backend OAuth Configuration
If you have access to the backend code, you can customize the OAuth request:

```javascript
// In your backend OAuth route
router.get('/auth/google', 
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    // Custom parameters
    prompt: 'select_account',
    // You can add custom state or other parameters
  })
);
```

## Environment Variables to Update

In your backend `.env` or Render environment variables:

```bash
# Update these if using custom domain
GOOGLE_CALLBACK_URL=https://your-custom-domain.com/api/auth/google/callback
FRONTEND_URL=https://your-custom-domain.com
```

## Important Notes

⚠️ **The domain in "continue to [domain]" cannot be changed to just "pccweb"** - it will always show the actual domain from your redirect URI.

✅ **What you CAN change**:
- App name in OAuth consent screen
- App logo
- Support email
- Privacy policy and terms URLs

✅ **Best Solution**: Use a custom domain like `pccweb.com` instead of `pccweb.onrender.com`

## Steps to Set Up Custom Domain

1. **Purchase/Configure Custom Domain**: Get `pccweb.com` or similar
2. **Update DNS**: Point domain to your Render service
3. **Update Render Settings**: Add custom domain in Render dashboard
4. **Update Google OAuth**:
   - Go to Google Cloud Console > APIs & Services > Credentials
   - Edit your OAuth 2.0 Client ID
   - Update "Authorized redirect URIs" to use custom domain
   - Example: `https://pccweb.com/api/auth/google/callback`
5. **Update Environment Variables**: Set `GOOGLE_CALLBACK_URL` to custom domain
6. **Redeploy**: Restart your backend service

After these changes, the OAuth message will show your custom domain instead of `pccweb.onrender.com`.


