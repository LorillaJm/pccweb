#!/usr/bin/env node

/**
 * External Services Integration Test Script
 * 
 * Tests all external service integrations to ensure they are properly configured
 * and functioning correctly.
 */

require('dotenv').config();
const externalServices = require('../config/external-services');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60) + '\n');
}

/**
 * Test OpenAI Service
 */
async function testOpenAI() {
  logSection('🤖 Testing OpenAI Service');

  try {
    const health = await externalServices.openai.healthCheck();
    
    if (health.status === 'disabled') {
      log('⚠️  OpenAI service is disabled', 'yellow');
      log('   Set OPENAI_API_KEY to enable chatbot functionality', 'yellow');
      return { passed: true, skipped: true };
    }

    if (health.status === 'healthy') {
      log('✅ OpenAI service is healthy', 'green');
      log(`   Model: ${externalServices.openai.model}`, 'blue');
      
      // Test a simple completion
      log('\n   Testing completion...', 'blue');
      const response = await externalServices.openai.getCompletion([
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say "Hello, PCC Portal!"' }
      ], { maxTokens: 20 });
      
      log(`   Response: ${response}`, 'green');
      return { passed: true };
    } else {
      log(`❌ OpenAI service is unhealthy: ${health.message}`, 'red');
      return { passed: false, error: health.message };
    }
  } catch (error) {
    log(`❌ OpenAI test failed: ${error.message}`, 'red');
    return { passed: false, error: error.message };
  }
}

/**
 * Test Email Service
 */
async function testEmail() {
  logSection('📧 Testing Email Service');

  try {
    const health = await externalServices.email.healthCheck();
    
    if (health.status === 'disabled') {
      log('⚠️  Email service is disabled', 'yellow');
      log('   Set EMAIL_HOST, EMAIL_USER, and EMAIL_PASS to enable email notifications', 'yellow');
      return { passed: true, skipped: true };
    }

    if (health.status === 'healthy') {
      log('✅ Email service is healthy', 'green');
      log(`   Host: ${externalServices.email.host}`, 'blue');
      log(`   From: ${externalServices.email.from}`, 'blue');
      
      // Optionally send a test email
      if (process.env.TEST_EMAIL_RECIPIENT) {
        log('\n   Sending test email...', 'blue');
        await externalServices.email.sendEmail(
          process.env.TEST_EMAIL_RECIPIENT,
          'PCC Portal - Email Service Test',
          '<h1>Email Service Test</h1><p>This is a test email from PCC Portal.</p>'
        );
        log('   ✅ Test email sent successfully', 'green');
      } else {
        log('   ℹ️  Set TEST_EMAIL_RECIPIENT to send a test email', 'blue');
      }
      
      return { passed: true };
    } else {
      log(`❌ Email service is unhealthy: ${health.message}`, 'red');
      return { passed: false, error: health.message };
    }
  } catch (error) {
    log(`❌ Email test failed: ${error.message}`, 'red');
    return { passed: false, error: error.message };
  }
}

/**
 * Test SMS Service
 */
async function testSMS() {
  logSection('📱 Testing SMS Service');

  try {
    const health = await externalServices.sms.healthCheck();
    
    if (health.status === 'disabled') {
      log('⚠️  SMS service is disabled', 'yellow');
      log('   Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to enable SMS', 'yellow');
      return { passed: true, skipped: true };
    }

    if (health.status === 'healthy') {
      log('✅ SMS service is healthy', 'green');
      log(`   Phone: ${externalServices.sms.phoneNumber}`, 'blue');
      
      // Optionally send a test SMS
      if (process.env.TEST_SMS_RECIPIENT) {
        log('\n   Sending test SMS...', 'blue');
        await externalServices.sms.sendSMS(
          process.env.TEST_SMS_RECIPIENT,
          'PCC Portal - SMS Service Test: This is a test message.'
        );
        log('   ✅ Test SMS sent successfully', 'green');
      } else {
        log('   ℹ️  Set TEST_SMS_RECIPIENT to send a test SMS', 'blue');
      }
      
      return { passed: true };
    } else {
      log(`❌ SMS service is unhealthy: ${health.message}`, 'red');
      return { passed: false, error: health.message };
    }
  } catch (error) {
    log(`❌ SMS test failed: ${error.message}`, 'red');
    return { passed: false, error: error.message };
  }
}

/**
 * Test Push Notification Service
 */
async function testPushNotifications() {
  logSection('🔔 Testing Push Notification Service');

  try {
    const health = await externalServices.push.healthCheck();
    
    log('✅ Push notification service is ready', 'green');
    log('   Push notifications are handled by service workers', 'blue');
    
    return { passed: true };
  } catch (error) {
    log(`❌ Push notification test failed: ${error.message}`, 'red');
    return { passed: false, error: error.message };
  }
}

/**
 * Display service statistics
 */
function displayStats() {
  logSection('📊 Service Statistics');

  const stats = externalServices.getAllStats();

  console.log('OpenAI Service:');
  log(`  Status: ${stats.openai.enabled ? 'Enabled' : 'Disabled'}`, stats.openai.enabled ? 'green' : 'yellow');
  if (stats.openai.enabled) {
    log(`  Model: ${stats.openai.model}`, 'blue');
    log(`  Requests: ${stats.openai.requestCount}`, 'blue');
    log(`  Errors: ${stats.openai.errorCount}`, 'blue');
    log(`  Success Rate: ${stats.openai.successRate}`, 'blue');
  }

  console.log('\nEmail Service:');
  log(`  Status: ${stats.email.enabled ? 'Enabled' : 'Disabled'}`, stats.email.enabled ? 'green' : 'yellow');
  if (stats.email.enabled) {
    log(`  Host: ${stats.email.host}`, 'blue');
    log(`  Sent: ${stats.email.sentCount}`, 'blue');
    log(`  Errors: ${stats.email.errorCount}`, 'blue');
    log(`  Success Rate: ${stats.email.successRate}`, 'blue');
  }

  console.log('\nSMS Service:');
  log(`  Status: ${stats.sms.enabled ? 'Enabled' : 'Disabled'}`, stats.sms.enabled ? 'green' : 'yellow');
  if (stats.sms.enabled) {
    log(`  Phone: ${stats.sms.phoneNumber}`, 'blue');
    log(`  Sent: ${stats.sms.sentCount}`, 'blue');
    log(`  Errors: ${stats.sms.errorCount}`, 'blue');
    log(`  Success Rate: ${stats.sms.successRate}`, 'blue');
  }

  console.log('\nPush Notification Service:');
  log(`  Status: Ready`, 'green');
  log(`  Sent: ${stats.push.sentCount}`, 'blue');
}

/**
 * Main test function
 */
async function runTests() {
  log('🧪 PCC Portal External Services Integration Test', 'cyan');
  log('Starting tests...\n', 'blue');

  // Initialize services
  await externalServices.initialize();

  // Run tests
  const results = {
    openai: await testOpenAI(),
    email: await testEmail(),
    sms: await testSMS(),
    push: await testPushNotifications()
  };

  // Display statistics
  displayStats();

  // Summary
  logSection('📋 Test Summary');

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r.passed).length;
  const skippedTests = Object.values(results).filter(r => r.skipped).length;
  const failedTests = totalTests - passedTests;

  Object.entries(results).forEach(([service, result]) => {
    const icon = result.passed ? '✅' : '❌';
    const status = result.skipped ? '(skipped)' : result.passed ? '(passed)' : '(failed)';
    const color = result.passed ? 'green' : result.skipped ? 'yellow' : 'red';
    log(`${icon} ${service}: ${status}`, color);
    if (result.error) {
      log(`   Error: ${result.error}`, 'red');
    }
  });

  console.log('');
  log(`Total: ${totalTests} tests`, 'blue');
  log(`Passed: ${passedTests}`, 'green');
  log(`Skipped: ${skippedTests}`, 'yellow');
  log(`Failed: ${failedTests}`, failedTests > 0 ? 'red' : 'green');

  if (failedTests === 0) {
    log('\n🎉 All tests passed!', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  Some tests failed. Please check the configuration.', 'yellow');
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests };
