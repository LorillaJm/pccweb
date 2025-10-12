// Ensure environment variables are loaded
require('dotenv').config();

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const AppleStrategy = require('passport-apple').Strategy;
const User = require('../models/User');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Local Strategy
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return done(null, false, { message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return done(null, false, { message: 'Account is deactivated' });
    }

    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return done(null, false, { message: 'Invalid email or password' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Google OAuth Strategy (conditional init)
if (process.env.GOOGLE_CLIENT_ID && 
    process.env.GOOGLE_CLIENT_SECRET && 
    process.env.GOOGLE_CLIENT_ID !== 'dummy' && 
    process.env.GOOGLE_CLIENT_SECRET !== 'dummy') {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google OAuth profile received:', {
        id: profile.id,
        emails: profile.emails,
        name: profile.name,
        displayName: profile.displayName
      });

      // Validate profile data
      if (!profile.emails || !profile.emails[0] || !profile.emails[0].value) {
        console.error('Google profile missing email');
        return done(new Error('Email is required for Google authentication'), null);
      }

      const email = profile.emails[0].value.toLowerCase();

      // Check if user already exists with this Google ID
      let user = await User.findBySocialId('google', profile.id);
      
      if (user) {
        console.log('Existing Google user found:', user.email);
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        return done(null, user);
      }

      // Check if user exists with same email
      const existingUser = await User.findOne({ email });
      
      if (existingUser) {
        console.log('Linking Google account to existing user:', existingUser.email);
        // Link Google account to existing user
        existingUser.googleId = profile.id;
        existingUser.authProvider = 'google';
        existingUser.emailVerified = true;
        existingUser.lastLogin = new Date();
        if (profile.photos && profile.photos[0] && !existingUser.profilePicture) {
          existingUser.profilePicture = profile.photos[0].value;
        }
        await existingUser.save();
        return done(null, existingUser);
      }

      // Create new user
      try {
        console.log('Creating new Google user for:', email);
        user = await User.createSocialUser(profile, 'google');
        console.log('Google user created successfully:', user.email);
        return done(null, user);
      } catch (createError) {
        console.error('Error creating Google user:', createError);
        return done(createError, null);
      }
      
    } catch (error) {
      console.error('Google OAuth strategy error:', error);
      return done(error, null);
    }
  }));
} else {
  console.log('ℹ️  Google OAuth not configured: missing or invalid credentials');
}

// Apple ID Strategy (conditional init)
if (
  process.env.APPLE_OAUTH_ENABLED !== 'false' &&
  process.env.APPLE_CLIENT_ID &&
  process.env.APPLE_TEAM_ID &&
  process.env.APPLE_KEY_ID &&
  process.env.APPLE_PRIVATE_KEY &&
  process.env.APPLE_CLIENT_ID !== 'dummy' &&
  process.env.APPLE_TEAM_ID !== 'dummy' &&
  process.env.APPLE_KEY_ID !== 'dummy' &&
  process.env.APPLE_PRIVATE_KEY !== 'dummy'
) {
  passport.use(new AppleStrategy({
    clientID: process.env.APPLE_CLIENT_ID,
    teamID: process.env.APPLE_TEAM_ID,
    keyID: process.env.APPLE_KEY_ID,
    privateKeyString: process.env.APPLE_PRIVATE_KEY,
    callbackURL: process.env.APPLE_CALLBACK_URL || '/api/auth/apple/callback',
    scope: ['name', 'email']
  }, async (accessToken, refreshToken, idToken, profile, done) => {
    try {
      console.log('Apple OAuth profile received:', {
        id: profile.id,
        email: profile.email,
        name: profile.name
      });

      // Validate profile data
      if (!profile.email) {
        console.error('Apple profile missing email');
        return done(new Error('Email is required for Apple authentication'), null);
      }

      const email = profile.email.toLowerCase();

      // Check if user already exists with this Apple ID
      let user = await User.findBySocialId('apple', profile.id);
      
      if (user) {
        console.log('Existing Apple user found:', user.email);
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        return done(null, user);
      }

      // Check if user exists with same email
      const existingUser = await User.findOne({ email });
      
      if (existingUser) {
        console.log('Linking Apple account to existing user:', existingUser.email);
        // Link Apple account to existing user
        existingUser.appleId = profile.id;
        existingUser.authProvider = 'apple';
        existingUser.emailVerified = true;
        existingUser.lastLogin = new Date();
        await existingUser.save();
        return done(null, existingUser);
      }

      // Create new user using the static method
      try {
        console.log('Creating new Apple user for:', email);
        user = await User.createSocialUser(profile, 'apple');
        console.log('Apple user created successfully:', user.email);
        return done(null, user);
      } catch (createError) {
        console.error('Error creating Apple user:', createError);
        return done(createError, null);
      }
      
    } catch (error) {
      console.error('Apple OAuth strategy error:', error);
      return done(error, null);
    }
  }));
} else {
  if (process.env.APPLE_OAUTH_ENABLED === 'false') {
    console.log('ℹ️  Apple OAuth disabled in configuration');
  } else {
    console.warn('Apple OAuth not configured: missing or invalid Apple env variables');
  }
}

module.exports = passport;
