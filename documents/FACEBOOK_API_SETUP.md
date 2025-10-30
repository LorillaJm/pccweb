# Facebook API Setup Guide

This guide explains how to set up Facebook API integration to fetch real-time posts from the PCC SOICT Facebook page.

## Overview

The news page at `localhost:3000/news` now includes a Facebook feed that automatically fetches and displays posts from https://www.facebook.com/pccsoict2005/. 

## Current Status

- ✅ Backend service created (`FacebookService.js`)
- ✅ API routes implemented (`/api/facebook/posts`)
- ✅ Frontend component ready (`FacebookFeed.tsx`)
- ✅ Mock data working (displays sample posts)
- ⚠️ Facebook API token needed for live data

## Quick Start (Mock Data)

The system works immediately with mock data:

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000/news`

3. Scroll down to see the "Latest from Facebook" section

## Facebook API Configuration (Optional)

To fetch real Facebook posts, you need to set up Facebook API access:

### Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use existing one
3. Add "Pages" product to your app

### Step 2: Get Page Access Token

1. In your Facebook app dashboard, go to Tools > Graph API Explorer
2. Select your app from the dropdown
3. Generate a Page Access Token for the page `pccsoict2005`
4. Copy the access token

### Step 3: Configure Environment Variables

Add to your `backend/.env` file:

```env
FACEBOOK_ACCESS_TOKEN=your_page_access_token_here
FACEBOOK_PAGE_ID=pccsoict2005
```

### Step 4: Test the Connection

1. Restart your backend server
2. Visit: `http://localhost:5000/api/facebook/status`
3. Should show: `"configured": true`

## API Endpoints

### Get Facebook Posts
```
GET /api/facebook/posts?limit=10
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "post_id",
      "title": "Post Title",
      "content": "Post content...",
      "image": "image_url",
      "date": "12/20/2024",
      "url": "facebook_post_url",
      "likes": 245,
      "comments": 32,
      "shares": 18,
      "category": "Facebook Post",
      "author": "PCC SOICT"
    }
  ],
  "count": 10,
  "source": "facebook"
}
```

### Check API Status
```
GET /api/facebook/status
```

## Features

### Auto-Refresh
- Posts refresh every 5 minutes automatically
- Manual refresh button available
- Shows last updated time

### Responsive Design
- Mobile-friendly layout
- Smooth animations with Framer Motion
- Loading states and error handling

### Engagement Metrics
- Displays likes, comments, and shares
- Links to original Facebook posts
- Formatted numbers (1.2k instead of 1200)

## Fallback Behavior

If Facebook API is not configured or fails:
- Displays mock data automatically
- Shows configuration status
- Provides retry functionality
- No errors or broken functionality

## Troubleshooting

### Mock Data Only
If you see "Using mock data" message:
- Facebook API token not configured
- This is normal for development
- Real posts will show once token is added

### API Errors
Common issues:
- Invalid access token
- Token expired (regenerate from Facebook)
- Rate limiting (Facebook API limits)
- Network connectivity issues

### Rate Limits
Facebook API has strict rate limits:
- 200 calls per hour per user
- Auto-refresh respects these limits
- Falls back to mock data if exceeded

## Security Notes

- Never commit Facebook tokens to git
- Use environment variables only
- Tokens should be page-specific
- Consider token rotation for production

## Alternative Solutions

If Facebook API is too restrictive:

1. **RSS Feeds**: Facebook discontinued RSS, but other platforms support it
2. **Manual Updates**: Admin panel to post news manually
3. **Social Media Aggregators**: Third-party services like Hootsuite
4. **Webhook Integration**: Facebook can send updates to your server

## Production Deployment

For production:
1. Use long-lived page access tokens
2. Implement proper error logging
3. Set up monitoring for API failures
4. Consider caching to reduce API calls
5. Implement rate limit handling

## Testing

Test the Facebook integration:

```bash
# Test API endpoint
curl http://localhost:5000/api/facebook/posts

# Test status
curl http://localhost:5000/api/facebook/status
```

## Support

For issues with Facebook API:
- Check Facebook Developer documentation
- Verify page permissions
- Test tokens in Graph API Explorer
- Monitor API usage in Facebook dashboard