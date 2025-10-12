#!/usr/bin/env node

/**
 * OAuth Configuration Test Script
 * 
 * This script tests your OAuth providers configuration (Google and Apple).
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

function testGoogleOAuth() {
  console.log('🔍 Testing Google OAuth Configuration...\n');
  
  const hasClientId = !!process.env.GOOGLE_CLIENT_ID;
  const hasClientSecret = !!process.env.GOOGLE_CLIENT_SECRET;
  const hasCallbackUrl = !!process.env.GOOGLE_CALLBACK_URL;
  
  console.log('Google OAuth Environment Variables:');
  console.log(`  GOOGLE_CLIENT_ID: ${hasClientId ? '✓ Set' : '✗ Missing'}`);
  console.log(`  GOOGLE_CLIENT_SECRET: ${hasClientSecret ? '✓ Set' : '✗ Missing'}`);
  console.log(`  GOOGLE_CALLBACK_URL: ${hasCallbackUrl ? '✓ Set' : '✗ Missing'}`);
  
  const isGoogleConfigured = hasClientId && hasClientSecret;
  
  if (isGoogleConfigured) {
    console.log('\n✅ Google OAuth is properly configured!');
    console.log(`   Callback URL: ${process.env.GOOGLE_CALLBACK_URL}`);
    
    // Validate client ID format
    if (process.env.GOOGLE_CLIENT_ID.includes('.apps.googleusercontent.com')) {
      console.log('   ✓ Client ID format looks correct');
    } else {
      console.log('   ⚠️  Client ID format might be incorrect');
    }
    
    return true;
  } else {
    console.log('\n❌ Google OAuth not configured');
    console.log('   Missing required environment variables');
    return false;
  }
}

function testAppleOAuth() {
  console.log('\n🍎 Testing Apple OAuth Configuration...\n');
  
  const isEnabled = process.env.APPLE_OAUTH_ENABLED !== 'false';
  const hasClientId = !!process.env.APPLE_CLIENT_ID;
  const hasTeamId = !!process.env.APPLE_TEAM_ID;
  const hasKeyId = !!process.env.APPLE_KEY_ID;
  const hasPrivateKey = !!process.env.APPLE_PRIVATE_KEY;
  
  console.log('Apple OAuth Configuration:');
  console.log(`  APPLE_OAUTH_ENABLED: ${isEnabled ? 'true (default)' : 'false (disabled)'}`);
  console.log(`  APPLE_CLIENT_ID: ${hasClientId ? '✓ Set' : '✗ Missing'}`);
  console.log(`  APPLE_TEAM_ID: ${hasTeamId ? '✓ Set' : '✗ Missing'}`);
  console.log(`  APPLE_KEY_ID: ${hasKeyId ? '✓ Set' : '✗ Missing'}`);
  console.log(`  APPLE_PRIVATE_KEY: ${hasPrivateKey ? '✓ Set' : '✗ Missing'}`);
  
  if (!isEnabled) {
    console.log('\n✅ Apple OAuth is disabled (recommended for development)');
    console.log('   No Apple Sign-In button will be shown');
    return true;
  }
  
  // Check for dummy values
  const hasDummyValues = 
    process.env.APPLE_CLIENT_ID === 'dummy' ||
    process.env.APPLE_TEAM_ID === 'dummy' ||
    process.env.APPLE_KEY_ID === 'dummy' ||
    process.env.APPLE_PRIVATE_KEY === 'dummy';
  
  if (hasDummyValues) {
    console.log('\n⚠️  Apple OAuth has dummy values');
    console.log('   These placeholder values will be ignored');
    console.log('   Apple Sign-In will not be available');
    return false;
  }
  
  const isAppleConfigured = hasClientId && hasTeamId && hasKeyId && hasPrivateKey;
  
  if (isAppleConfigured) {
    console.log('\n✅ Apple OAuth is properly configured!');
    
    // Validate formats
    if (process.env.APPLE_TEAM_ID.length === 10) {
      console.log('   ✓ Team ID format looks correct (10 characters)');
    } else {
      console.log('   ⚠️  Team ID should be 10 characters long');
    }
    
    if (process.env.APPLE_KEY_ID.length === 10) {
      console.log('   ✓ Key ID format looks correct (10 characters)');
    } else {
      console.log('   ⚠️  Key ID should be 10 characters long');
    }
    
    return true;
  } else {
    console.log('\n❌ Apple OAuth not properly configured');
    console.log('   Missing required environment variables');
    return false;
  }
}

function testPassportConfiguration() {
  console.log('\n🛂 Testing Passport Configuration...\n');
  
  try {
    // Load passport configuration
    const passport = require('./config/passport');
    console.log('✅ Passport configuration loaded successfully');
    
    // Check if strategies are registered
    const strategies = passport._strategies;
    
    console.log('\nRegistered Passport Strategies:');
    Object.keys(strategies).forEach(strategyName => {
      console.log(`  ✓ ${strategyName}`);
    });
    
    return true;
  } catch (error) {
    console.log('❌ Error loading Passport configuration:', error.message);
    return false;
  }
}

function showOAuthSetupGuide() {
  console.log('\n💡 OAuth Setup Guide:');
  console.log('='.repeat(25));
  
  console.log('\n🔍 Google OAuth Setup:');
  console.log('1. Go to https://console.developers.google.com/');
  console.log('2. Create a new project or select existing');
  console.log('3. Enable Google+ API');
  console.log('4. Create OAuth 2.0 credentials');
  console.log('5. Add authorized redirect URI: http://localhost:5000/api/auth/google/callback');
  console.log('6. Copy Client ID and Client Secret to .env file');
  
  console.log('\n🍎 Apple OAuth Setup (Optional):');
  console.log('1. Join Apple Developer Program ($99/year)');
  console.log('2. Create App ID in Apple Developer Console');
  console.log('3. Enable Sign In with Apple capability');
  console.log('4. Create Service ID for web authentication');
  console.log('5. Generate private key for Sign In with Apple');
  console.log('6. Configure domain and redirect URLs');
  console.log('7. Update .env with Apple credentials');
  
  console.log('\n🎯 Recommended for Development:');
  console.log('✅ Keep Google OAuth enabled (easier to set up)');
  console.log('✅ Keep Apple OAuth disabled (complex setup, requires paid developer account)');
  console.log('✅ Users can still register with email/password');
}

async function main() {
  console.log('🔐 PCC Portal - OAuth Configuration Test\n');
  console.log('='.repeat(50));
  
  // Test configurations
  const googleWorking = testGoogleOAuth();
  const appleWorking = testAppleOAuth();
  const passportWorking = testPassportConfiguration();
  
  // Show summary
  console.log('\n📊 OAuth Configuration Summary:');
  console.log('='.repeat(35));
  console.log(`Google OAuth: ${googleWorking ? '✅ Working' : '❌ Not Configured'}`);
  console.log(`Apple OAuth:  ${appleWorking ? '✅ Working' : '⚠️  Disabled/Not Configured'}`);
  console.log(`Passport:     ${passportWorking ? '✅ Working' : '❌ Error'}`);
  
  // Show available login methods
  console.log('\n🔑 Available Login Methods:');
  console.log('='.repeat(30));
  console.log('✅ Email/Password (always available)');
  if (googleWorking) {
    console.log('✅ Google Sign-In');
  } else {
    console.log('❌ Google Sign-In (not configured)');
  }
  if (appleWorking) {
    console.log('✅ Apple Sign-In');
  } else {
    console.log('⚠️  Apple Sign-In (disabled/not configured)');
  }
  
  showOAuthSetupGuide();
  
  console.log('\n' + '='.repeat(50));
  console.log('Test completed!');
  
  if (googleWorking && !appleWorking) {
    console.log('\n🎉 OAuth configuration is optimal for development!');
    console.log('   Google OAuth working, Apple OAuth disabled');
    console.log('   Users can sign in with Google or email/password');
  } else if (!googleWorking && !appleWorking) {
    console.log('\n💡 Consider setting up Google OAuth for better user experience');
    console.log('   Currently only email/password login is available');
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Test interrupted by user');
  process.exit(0);
});

process.on('unhandledRejection', (error) => {
  console.error('\n❌ Unhandled error:', error.message);
  process.exit(1);
});

// Run the test
main().catch(error => {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
});