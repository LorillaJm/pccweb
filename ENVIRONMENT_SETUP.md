# Environment Variables Setup for MongoDB & Social Authentication

This document outlines the required environment variables for the PCC Portal with MongoDB and social authentication support.

## Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

### Database Configuration
```env
# MongoDB Connection (Required)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pcc_portal?retryWrites=true&w=majority

# For local MongoDB (alternative)
# MONGODB_URI=mongodb://localhost:27017/pcc_portal
```

### JWT Configuration
```env
# JWT Secrets (Required - Generate strong random strings)
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here-make-it-different
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d

# Session Secret (Required)
SESSION_SECRET=your-session-secret-key-here-also-make-it-random
```

### Google OAuth Configuration
```env
# Google OAuth (Required for Google login)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

### Apple ID Configuration
```env
# Apple ID OAuth (Required for Apple login)
APPLE_CLIENT_ID=your.apple.service.id
APPLE_TEAM_ID=YOUR_TEAM_ID
APPLE_KEY_ID=YOUR_KEY_ID
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"
APPLE_CALLBACK_URL=http://localhost:5000/api/auth/apple/callback
```

### Server Configuration
```env
# Server Settings
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Frontend Environment Variables

Create a `.env.local` file in the root directory with:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free account and cluster

2. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

3. **Configure Network Access**
   - Add your IP address to the IP Access List
   - For development, you can use `0.0.0.0/0` (not recommended for production)

## Google OAuth Setup

1. **Google Cloud Console**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Google+ API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback` (development)
     - `https://yourdomain.com/api/auth/google/callback` (production)

## Apple ID Setup

1. **Apple Developer Account**
   - You need a paid Apple Developer account
   - Go to [Apple Developer Portal](https://developer.apple.com/)

2. **Create App ID**
   - Register a new App ID with Sign In with Apple capability

3. **Create Service ID**
   - Create a Services ID for web authentication
   - Configure the return URLs

4. **Generate Private Key**
   - Create a private key for Sign In with Apple
   - Download the .p8 file and convert to PEM format

## Security Notes

- **Never commit `.env` files to version control**
- **Use strong, unique secrets for JWT and session keys**
- **For production, use environment-specific URLs**
- **Regularly rotate your secrets**
- **Use HTTPS in production**

## Testing the Setup

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend:
   ```bash
   npm run dev
   ```

3. Test authentication:
   - Regular login/register should work
   - Google login button should redirect to Google OAuth
   - Apple login button should work (requires proper Apple setup)

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Failed**
   - Check your connection string
   - Verify network access settings
   - Ensure database user has proper permissions

2. **Google OAuth Error**
   - Verify client ID and secret
   - Check redirect URI configuration
   - Ensure Google+ API is enabled

3. **Apple ID Issues**
   - Verify all Apple credentials are correct
   - Check private key format
   - Ensure Service ID is properly configured

4. **CORS Issues**
   - Verify FRONTEND_URL matches your frontend URL
   - Check that credentials are included in requests

For additional help, check the server logs and browser console for specific error messages.
