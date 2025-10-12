#!/usr/bin/env node

/**
 * OpenAI Configuration Test Script
 * 
 * This script tests your OpenAI API configuration for the chatbot.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const externalServices = require('./config/external-services');

async function testOpenAIConfiguration() {
  console.log('\n🤖 Testing OpenAI Configuration...\n');
  
  // Debug: Show what environment variables are loaded
  console.log('Debug - Environment variables:');
  console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✓ Set' : '✗ Missing'}`);
  console.log(`OPENAI_MODEL: ${process.env.OPENAI_MODEL || 'gpt-3.5-turbo (default)'}`);
  console.log(`OPENAI_MAX_TOKENS: ${process.env.OPENAI_MAX_TOKENS || '150 (default)'}`);
  console.log('');
  
  try {
    // Initialize OpenAI service
    const openaiInitialized = externalServices.openai.initialize();
    
    if (!openaiInitialized) {
      console.log('❌ OpenAI service not configured');
      console.log('   Required environment variable:');
      console.log('   - OPENAI_API_KEY');
      console.log('');
      console.log('💡 To get an API key:');
      console.log('   1. Go to https://platform.openai.com/api-keys');
      console.log('   2. Sign up or log in to your OpenAI account');
      console.log('   3. Create a new API key');
      console.log('   4. Add it to your .env file as OPENAI_API_KEY=sk-...');
      return false;
    }
    
    // Test OpenAI service health
    console.log('Testing OpenAI API connection...');
    const healthCheck = await externalServices.openai.healthCheck();
    console.log(`OpenAI Health Check: ${healthCheck.status} - ${healthCheck.message}`);
    
    if (healthCheck.status === 'healthy') {
      console.log('✅ OpenAI service is properly configured and ready!');
      return true;
    } else {
      console.log('❌ OpenAI service configuration has issues');
      console.log(`   Error: ${healthCheck.message}`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ OpenAI configuration test failed:', error.message);
    return false;
  }
}

async function sendTestMessage() {
  console.log('\n🤖 Sending Test Message to OpenAI...\n');
  
  const testMessage = process.argv[2] || 'Hello, can you help me with PCC Portal?';
  
  try {
    console.log(`Sending: "${testMessage}"`);
    console.log('Waiting for response...\n');
    
    const response = await externalServices.openai.getCompletion([
      { 
        role: 'system', 
        content: 'You are a helpful assistant for PCC Portal, a college management system. Be concise and helpful.' 
      },
      { 
        role: 'user', 
        content: testMessage 
      }
    ]);
    
    console.log('✅ OpenAI Response:');
    console.log('─'.repeat(50));
    console.log(response);
    console.log('─'.repeat(50));
    
  } catch (error) {
    console.error('❌ Failed to get response from OpenAI:', error.message);
    
    if (error.message.includes('401')) {
      console.log('\n💡 This looks like an authentication error.');
      console.log('   Please check that your OPENAI_API_KEY is correct.');
    } else if (error.message.includes('429')) {
      console.log('\n💡 Rate limit exceeded or quota reached.');
      console.log('   Please check your OpenAI account billing and usage.');
    } else if (error.message.includes('insufficient_quota')) {
      console.log('\n💡 Your OpenAI account has insufficient quota.');
      console.log('   Please add billing information to your OpenAI account.');
    }
  }
}

async function main() {
  console.log('🤖 PCC Portal - OpenAI Configuration Test\n');
  console.log('='.repeat(50));
  
  // Test configuration
  const openaiWorking = await testOpenAIConfiguration();
  
  // Show current configuration status
  console.log('\n📊 Configuration Summary:');
  console.log('='.repeat(30));
  console.log(`OpenAI Service: ${openaiWorking ? '✅ Ready' : '❌ Not Configured'}`);
  
  // Send test message if requested and working
  if (openaiWorking && (process.argv.length > 2 || process.argv.includes('--test'))) {
    await sendTestMessage();
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('Test completed!');
  
  if (!openaiWorking) {
    console.log('\n💡 Next Steps:');
    console.log('   1. Get an OpenAI API key from https://platform.openai.com/api-keys');
    console.log('   2. Add it to backend/.env as OPENAI_API_KEY=sk-...');
    console.log('   3. Run this test again to verify');
    console.log('\n💰 Pricing Info:');
    console.log('   - GPT-3.5-turbo: ~$0.002 per 1K tokens (very affordable)');
    console.log('   - You get $5 free credit when you sign up');
    console.log('   - Perfect for testing and small applications');
  } else {
    console.log('\n🎉 Your chatbot is ready to use!');
    console.log('\n🧪 Test Commands:');
    console.log('   node backend/test-openai-config.js "What is PCC Portal?"');
    console.log('   node backend/test-openai-config.js --test');
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