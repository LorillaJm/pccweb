#!/usr/bin/env node

/**
 * Email and SMS Configuration Test Script
 * 
 * This script tests your email and SMS service configuration
 * to ensure they're working properly.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const externalServices = require('./config/external-services');

async function testEmailConfiguration() {
  console.log('\n📧 Testing Email Configuration...\n');
  
  // Debug: Show what environment variables are loaded
  console.log('Debug - Environment variables:');
  console.log(`EMAIL_HOST: ${process.env.EMAIL_HOST ? '✓ Set' : '✗ Missing'}`);
  console.log(`EMAIL_USER: ${process.env.EMAIL_USER ? '✓ Set' : '✗ Missing'}`);
  console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? '✓ Set' : '✗ Missing'}`);
  console.log('');
  
  try {
    // Initialize email service
    const emailInitialized = externalServices.email.initialize();
    
    if (!emailInitialized) {
      console.log('❌ Email service not configured');
      console.log('   Required environment variables:');
      console.log('   - EMAIL_HOST');
      console.log('   - EMAIL_USER');
      console.log('   - EMAIL_PASS');
      return false;
    }
    
    // Test email service health
    const healthCheck = await externalServices.email.healthCheck();
    console.log(`Email Health Check: ${healthCheck.status} - ${healthCheck.message}`);
    
    if (healthCheck.status === 'healthy') {
      console.log('✅ Email service is properly configured and ready!');
      return true;
    } else {
      console.log('❌ Email service configuration has issues');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Email configuration test failed:', error.message);
    return false;
  }
}

async function testSMSConfiguration() {
  console.log('\n📱 Testing SMS Configuration...\n');
  
  // Debug: Show what environment variables are loaded
  console.log('Debug - Environment variables:');
  console.log(`TWILIO_ACCOUNT_SID: ${process.env.TWILIO_ACCOUNT_SID ? '✓ Set' : '✗ Missing'}`);
  console.log(`TWILIO_AUTH_TOKEN: ${process.env.TWILIO_AUTH_TOKEN ? '✓ Set' : '✗ Missing'}`);
  console.log(`TWILIO_PHONE_NUMBER: ${process.env.TWILIO_PHONE_NUMBER ? '✓ Set' : '✗ Missing'}`);
  console.log('');
  
  try {
    // Initialize SMS service
    const smsInitialized = externalServices.sms.initialize();
    
    if (!smsInitialized) {
      console.log('❌ SMS service not configured');
      console.log('   Required environment variables:');
      console.log('   - TWILIO_ACCOUNT_SID');
      console.log('   - TWILIO_AUTH_TOKEN');
      console.log('   - TWILIO_PHONE_NUMBER');
      return false;
    }
    
    // Test SMS service health
    const healthCheck = await externalServices.sms.healthCheck();
    console.log(`SMS Health Check: ${healthCheck.status} - ${healthCheck.message}`);
    
    if (healthCheck.status === 'healthy') {
      console.log('✅ SMS service is properly configured and ready!');
      return true;
    } else {
      console.log('❌ SMS service configuration has issues');
      return false;
    }
    
  } catch (error) {
    console.error('❌ SMS configuration test failed:', error.message);
    return false;
  }
}

async function sendTestEmail() {
  console.log('\n📧 Sending Test Email...\n');
  
  const testEmail = process.argv[2];
  if (!testEmail) {
    console.log('ℹ️  To send a test email, run: node test-email-sms-config.js your-email@example.com');
    return;
  }
  
  try {
    const result = await externalServices.email.sendEmail(
      testEmail,
      'PCC Portal - Email Configuration Test',
      '<h2>Email Configuration Test</h2><p>If you receive this email, your email service is working correctly!</p><p>Sent at: ' + new Date().toISOString() + '</p>'
    );
    
    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${result.messageId}`);
    
  } catch (error) {
    console.error('❌ Failed to send test email:', error.message);
  }
}

async function sendTestSMS() {
  console.log('\n📱 Sending Test SMS...\n');
  
  const testPhone = process.argv[3];
  if (!testPhone) {
    console.log('ℹ️  To send a test SMS, run: node test-email-sms-config.js email@example.com +1234567890');
    return;
  }
  
  try {
    const result = await externalServices.sms.sendSMS(
      testPhone,
      'PCC Portal SMS test - Configuration working! Sent at: ' + new Date().toLocaleString()
    );
    
    console.log('✅ Test SMS sent successfully!');
    console.log(`   Message SID: ${result.sid}`);
    console.log(`   Status: ${result.status}`);
    
  } catch (error) {
    console.error('❌ Failed to send test SMS:', error.message);
  }
}

async function main() {
  console.log('🔧 PCC Portal - Email & SMS Configuration Test\n');
  console.log('='.repeat(50));
  
  // Test configurations
  const emailWorking = await testEmailConfiguration();
  const smsWorking = await testSMSConfiguration();
  
  // Show current configuration status
  console.log('\n📊 Configuration Summary:');
  console.log('='.repeat(30));
  console.log(`Email Service: ${emailWorking ? '✅ Ready' : '❌ Not Configured'}`);
  console.log(`SMS Service:   ${smsWorking ? '✅ Ready' : '❌ Not Configured'}`);
  
  // Send test messages if requested
  if (process.argv.length > 2) {
    if (emailWorking) {
      await sendTestEmail();
    }
    
    if (process.argv.length > 3 && smsWorking) {
      await sendTestSMS();
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('Test completed!');
  
  if (!emailWorking || !smsWorking) {
    console.log('\n💡 Next Steps:');
    if (!emailWorking) {
      console.log('   1. Configure email settings in backend/.env');
      console.log('   2. For Gmail: Enable 2FA and create an App Password');
    }
    if (!smsWorking) {
      console.log('   3. Sign up for Twilio and get your credentials');
      console.log('   4. Add Twilio settings to backend/.env');
    }
    console.log('   5. Run this test again to verify');
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