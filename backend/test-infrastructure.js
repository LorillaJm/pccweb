#!/usr/bin/env node

/**
 * Infrastructure Test Script
 * Tests the advanced features infrastructure components
 */

require('dotenv').config();

const redisConnection = require('./config/redis');
const { getQueueStats } = require('./config/queue');
const taskScheduler = require('./config/scheduler');

async function testInfrastructure() {
  console.log('🧪 Testing Advanced Features Infrastructure...\n');
  
  const results = {
    redis: false,
    queues: false,
    scheduler: false
  };

  // Test Redis Connection
  console.log('1️⃣ Testing Redis Connection...');
  try {
    await redisConnection.connect();
    
    // Test basic operations
    const testKey = 'infrastructure_test';
    const testValue = { message: 'Hello Redis!', timestamp: new Date() };
    
    await redisConnection.set(testKey, testValue, 60);
    const retrieved = await redisConnection.get(testKey);
    
    if (JSON.stringify(retrieved) === JSON.stringify(testValue)) {
      console.log('   ✅ Redis connection and operations working');
      results.redis = true;
    } else {
      console.log('   ❌ Redis data integrity test failed');
    }
    
    await redisConnection.del(testKey);
  } catch (error) {
    console.log('   ❌ Redis connection failed:', error.message);
  }

  // Test Queue System
  console.log('\n2️⃣ Testing Queue System...');
  try {
    const stats = await getQueueStats();
    
    if (stats && typeof stats === 'object') {
      console.log('   ✅ Queue system accessible');
      console.log('   📊 Queue Statistics:');
      
      Object.entries(stats).forEach(([queueName, queueStats]) => {
        console.log(`      ${queueName}: ${JSON.stringify(queueStats)}`);
      });
      
      results.queues = true;
    } else {
      console.log('   ❌ Queue statistics not available');
    }
  } catch (error) {
    console.log('   ❌ Queue system test failed:', error.message);
  }

  // Test Task Scheduler
  console.log('\n3️⃣ Testing Task Scheduler...');
  try {
    taskScheduler.initialize();
    const taskStatus = taskScheduler.getTaskStatus();
    
    if (Object.keys(taskStatus).length > 0) {
      console.log('   ✅ Task scheduler initialized');
      console.log('   📋 Scheduled Tasks:');
      
      Object.entries(taskStatus).forEach(([taskName, status]) => {
        console.log(`      ${taskName}: ${status.status} (${status.schedule})`);
      });
      
      results.scheduler = true;
    } else {
      console.log('   ❌ No scheduled tasks found');
    }
  } catch (error) {
    console.log('   ❌ Task scheduler test failed:', error.message);
  }

  // Test Environment Variables
  console.log('\n4️⃣ Testing Environment Configuration...');
  const requiredEnvVars = [
    'REDIS_HOST',
    'OPENAI_API_KEY',
    'EMAIL_HOST',
    'EMAIL_USER',
    'TWILIO_ACCOUNT_SID'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length === 0) {
    console.log('   ✅ All required environment variables are set');
  } else {
    console.log('   ⚠️  Missing environment variables:');
    missingVars.forEach(varName => {
      console.log(`      - ${varName}`);
    });
    console.log('   💡 Check your .env file and update missing values');
  }

  // Summary
  console.log('\n📋 Infrastructure Test Summary:');
  console.log('================================');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  
  Object.entries(results).forEach(([component, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`   ${component.toUpperCase()}: ${status}`);
  });
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All infrastructure components are working correctly!');
  } else {
    console.log('⚠️  Some components need attention. Check the logs above.');
  }

  // Cleanup
  try {
    await redisConnection.disconnect();
    taskScheduler.stopAllTasks();
  } catch (error) {
    console.log('Cleanup error:', error.message);
  }

  process.exit(passedTests === totalTests ? 0 : 1);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

// Run tests
testInfrastructure().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});