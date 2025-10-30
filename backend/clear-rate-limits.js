#!/usr/bin/env node

/**
 * Clear Rate Limits Utility
 * 
 * This script clears all rate limit entries from the cache
 * to allow tests to run without hitting rate limits.
 */

const redisConnection = require('./config/redis');

async function clearAllRateLimits() {
  console.log('🧹 Clearing rate limits...\n');

  try {
    // Check if Redis is connected
    if (!redisConnection.isConnected || redisConnection.fallbackMode) {
      console.log('ℹ️  Redis not connected, using in-memory cache');
      
      // Clear memory cache
      if (redisConnection.memoryCache) {
        const keysToDelete = [];
        for (const key of redisConnection.memoryCache.keys()) {
          keysToDelete.push(key);
        }
        
        keysToDelete.forEach(key => redisConnection.memoryCache.delete(key));
        
        console.log(`✅ Cleared ${keysToDelete.length} entries from memory cache`);
        
        if (keysToDelete.length > 0) {
          console.log('\nCleared keys:');
          keysToDelete.forEach(key => console.log(`  - ${key}`));
        }
      } else {
        console.log('⚠️  No memory cache found');
      }
    } else {
      // Redis is connected
      const client = redisConnection.getClient();
      
      if (!client) {
        console.log('⚠️  Redis client not available');
        return;
      }

      const patterns = [
        'ratelimit:*',
        'rate_limit:*'
      ];

      let totalCleared = 0;

      for (const pattern of patterns) {
        try {
          let cursor = 0;
          do {
            const result = await client.scan(cursor, {
              MATCH: pattern,
              COUNT: 100
            });
            cursor = result.cursor;
            const keys = result.keys;
            
            if (keys && keys.length > 0) {
              for (const key of keys) {
                await client.del(key);
                console.log(`  - Deleted: ${key}`);
                totalCleared++;
              }
            }
          } while (cursor !== 0);
        } catch (error) {
          console.error(`❌ Error clearing pattern ${pattern}:`, error.message);
        }
      }

      console.log(`\n✅ Cleared ${totalCleared} entries from Redis`);
    }

    console.log('\n✨ Rate limits cleared successfully!');
    console.log('You can now run the tests again.\n');
    
  } catch (error) {
    console.error('❌ Error clearing rate limits:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

// Run the script
clearAllRateLimits();
