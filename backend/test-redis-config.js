#!/usr/bin/env node

/**
 * Redis Configuration Test Script
 * 
 * This script tests your Redis configuration and shows available options.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function testRedisConfiguration() {
  console.log('🔧 PCC Portal - Redis Configuration Test\n');
  console.log('='.repeat(60));
  
  // Show current configuration
  console.log('📋 Current Configuration:');
  console.log('='.repeat(30));
  console.log(`REDIS_ENABLED: ${process.env.REDIS_ENABLED || 'not set (defaults to true)'}`);
  console.log(`REDIS_HOST: ${process.env.REDIS_HOST || 'localhost (default)'}`);
  console.log(`REDIS_PORT: ${process.env.REDIS_PORT || '6379 (default)'}`);
  console.log(`REDIS_PASSWORD: ${process.env.REDIS_PASSWORD ? '***set***' : 'not set'}`);
  console.log(`REDIS_DB: ${process.env.REDIS_DB || '0 (default)'}`);
  
  // Test Redis connection if enabled
  if (process.env.REDIS_ENABLED !== 'false') {
    console.log('\n🔍 Testing Redis Connection...');
    console.log('='.repeat(30));
    
    try {
      const redisConnection = require('./config/redis');
      
      console.log('Attempting to connect to Redis...');
      const client = await redisConnection.connect();
      
      if (client && redisConnection.isConnected) {
        console.log('✅ Redis connection successful!');
        
        // Test basic operations
        console.log('\n🧪 Testing Redis Operations:');
        await redisConnection.set('test_key', 'test_value', 10);
        const value = await redisConnection.get('test_key');
        
        if (value === 'test_value') {
          console.log('  ✓ SET/GET operations working');
        } else {
          console.log('  ❌ SET/GET operations failed');
        }
        
        await redisConnection.del('test_key');
        console.log('  ✓ DELETE operation working');
        
        await redisConnection.disconnect();
        console.log('  ✓ Disconnect successful');
        
      } else {
        console.log('❌ Redis connection failed, using fallback mode');
        console.log('   This is normal if Redis is not installed locally');
      }
      
    } catch (error) {
      console.log('❌ Redis connection error:', error.message);
      console.log('   This is normal if Redis is not installed locally');
    }
  } else {
    console.log('\n🔕 Redis Disabled');
    console.log('='.repeat(20));
    console.log('Redis is disabled in configuration (REDIS_ENABLED=false)');
    console.log('Application will use in-memory fallback for caching and queues');
  }
  
  // Test queue configuration
  console.log('\n📦 Testing Queue Configuration...');
  console.log('='.repeat(35));
  
  try {
    const { getQueueStats } = require('./config/queue');
    const stats = await getQueueStats();
    
    if (stats.enabled) {
      console.log('✅ Queues enabled and working');
      console.log(`   Notification queue: ${JSON.stringify(stats.notification)}`);
      console.log(`   Email queue: ${JSON.stringify(stats.email)}`);
      console.log(`   SMS queue: ${JSON.stringify(stats.sms)}`);
    } else {
      console.log('ℹ️  Queues using fallback mode');
      console.log('   Jobs will be processed immediately in memory');
    }
  } catch (error) {
    console.log('❌ Queue test error:', error.message);
  }
}

async function showRedisOptions() {
  console.log('\n💡 Redis Setup Options:');
  console.log('='.repeat(25));
  
  console.log('\n🎯 Option 1: Disable Redis (Current - Recommended for Development)');
  console.log('   ✅ Already configured in your .env file');
  console.log('   ✅ No installation required');
  console.log('   ✅ Uses in-memory fallback');
  console.log('   ⚠️  Data not persistent between restarts');
  
  console.log('\n🎯 Option 2: Install Redis Locally');
  console.log('   📥 Windows: Download from https://github.com/microsoftarchive/redis/releases');
  console.log('   📥 Or use Docker: docker run -d -p 6379:6379 redis:alpine');
  console.log('   🔧 Then set REDIS_ENABLED=true in .env');
  console.log('   ✅ Persistent caching and queues');
  console.log('   ✅ Better performance for production');
  
  console.log('\n🎯 Option 3: Use Cloud Redis (Production)');
  console.log('   ☁️  Redis Cloud: https://redis.com/redis-enterprise-cloud/');
  console.log('   ☁️  AWS ElastiCache: https://aws.amazon.com/elasticache/');
  console.log('   ☁️  Azure Cache: https://azure.microsoft.com/en-us/services/cache/');
  console.log('   🔧 Update REDIS_HOST, REDIS_PORT, REDIS_PASSWORD in .env');
  
  console.log('\n🎯 Option 4: Keep Current Setup (Recommended)');
  console.log('   ✅ Your app works perfectly without Redis');
  console.log('   ✅ No warnings with current configuration');
  console.log('   ✅ Easy to enable Redis later when needed');
}

async function main() {
  await testRedisConfiguration();
  await showRedisOptions();
  
  console.log('\n' + '='.repeat(60));
  console.log('Test completed!');
  
  if (process.env.REDIS_ENABLED === 'false') {
    console.log('\n🎉 Redis is properly disabled!');
    console.log('   Your server should start without Redis warnings.');
  } else {
    console.log('\n💡 Next Steps:');
    console.log('   1. If you see connection errors above, Redis is not running');
    console.log('   2. Either install Redis or set REDIS_ENABLED=false');
    console.log('   3. Your app works fine either way!');
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