#!/usr/bin/env node

/**
 * Environment Variables Validation Script
 * Run this script to validate your .env configuration
 * 
 * Usage: node scripts/validate-env.js
 */

require('dotenv').config();
const { validateConfig, printValidationResults } = require('../config/validateConfig');
const { securityConfig } = require('../config/securityConfig');

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║   PCC Portal - Environment Configuration Validator        ║');
console.log('╚════════════════════════════════════════════════════════════╝');

// Validate configuration
const result = validateConfig();

// Print results
printValidationResults(result);

// Print security configuration summary
if (result.valid) {
  console.log('=== Security Configuration Summary ===\n');
  
  console.log('📧 Email Verification:');
  console.log(`  - Token expiration: ${securityConfig.emailVerification.expirationHours} hours`);
  console.log(`  - Token length: ${securityConfig.emailVerification.tokenLength} characters`);
  
  console.log('\n🔐 Two-Factor Authentication:');
  console.log(`  - Code expiration: ${securityConfig.twoFactor.expirationMinutes} minutes`);
  console.log(`  - Code length: ${securityConfig.twoFactor.codeLength} digits`);
  console.log(`  - Max attempts: ${securityConfig.twoFactor.maxAttempts}`);
  console.log(`  - Lockout duration: ${securityConfig.account.lockoutMinutes} minutes`);
  console.log(`  - Backup codes: ${securityConfig.twoFactor.backupCodesCount}`);
  
  console.log('\n⏱️  Rate Limiting:');
  console.log(`  - Registration: ${securityConfig.rateLimit.registration.max} per hour`);
  console.log(`  - Login: ${securityConfig.rateLimit.login.max} per 15 minutes`);
  console.log(`  - Verification: ${securityConfig.rateLimit.verification.max} per hour`);
  console.log(`  - Resend: ${securityConfig.rateLimit.resend.max} per hour`);
  console.log(`  - 2FA: ${securityConfig.rateLimit.twoFactor.max} per 15 minutes`);
  
  console.log('\n🤖 reCAPTCHA:');
  console.log(`  - Enabled: ${securityConfig.recaptcha.enabled ? 'Yes' : 'No'}`);
  if (securityConfig.recaptcha.enabled) {
    console.log(`  - Min score: ${securityConfig.recaptcha.minScore}`);
  }
  
  console.log('\n🔒 Password Requirements:');
  console.log(`  - Min length: ${securityConfig.password.minLength} characters`);
  console.log(`  - Require uppercase: ${securityConfig.password.requireUppercase ? 'Yes' : 'No'}`);
  console.log(`  - Require lowercase: ${securityConfig.password.requireLowercase ? 'Yes' : 'No'}`);
  console.log(`  - Require number: ${securityConfig.password.requireNumber ? 'Yes' : 'No'}`);
  console.log(`  - Require special: ${securityConfig.password.requireSpecial ? 'Yes' : 'No'}`);
  
  console.log('\n🛡️  Account Security:');
  console.log(`  - Lockout attempts: ${securityConfig.account.lockoutAttempts}`);
  console.log(`  - Lockout duration: ${securityConfig.account.lockoutMinutes} minutes`);
  
  console.log('\n🎫 JWT Configuration:');
  console.log(`  - Access token expiration: ${securityConfig.jwt.expire}`);
  console.log(`  - Refresh token expiration: ${securityConfig.jwt.refreshExpire}`);
  
  console.log('\n🍪 Session Configuration:');
  console.log(`  - Secure: ${securityConfig.session.secure ? 'Yes' : 'No'}`);
  console.log(`  - HTTP Only: ${securityConfig.session.httpOnly ? 'Yes' : 'No'}`);
  console.log(`  - Same Site: ${securityConfig.session.sameSite}`);
  
  console.log('\n======================================\n');
}

// Exit with appropriate code
process.exit(result.valid ? 0 : 1);
