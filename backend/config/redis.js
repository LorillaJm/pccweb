const redis = require('redis');

class RedisConnection {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.fallbackMode = false;
    this.memoryCache = new Map(); // In-memory fallback
  }

  async connect() {
    // Check if Redis is disabled
    if (process.env.REDIS_ENABLED === 'false') {
      console.log('ℹ️  Redis disabled in configuration, using in-memory fallback');
      this.fallbackMode = true;
      this.isConnected = false;
      return null;
    }

    try {
      this.client = redis.createClient({
        socket: {
          host: process.env.REDIS_HOST || 'localhost',
          port: process.env.REDIS_PORT || 6379,
          connectTimeout: 5000,
          lazyConnect: true
        },
        password: process.env.REDIS_PASSWORD || undefined,
        database: process.env.REDIS_DB || 0
      });

      this.client.on('connect', () => {
        console.log('✅ Redis client connected');
        this.isConnected = true;
        this.fallbackMode = false;
      });

      this.client.on('error', (err) => {
        console.warn('⚠️  Redis client error, switching to fallback mode:', err.message);
        this.isConnected = false;
        this.fallbackMode = true;
      });

      this.client.on('end', () => {
        console.log('Redis client disconnected');
        this.isConnected = false;
        this.fallbackMode = true;
      });

      // Try to connect with timeout
      await Promise.race([
        this.client.connect(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Redis connection timeout')), 5000)
        )
      ]);

      return this.client;
    } catch (error) {
      console.warn('⚠️  Redis connection failed, using in-memory fallback:', error.message);
      this.isConnected = false;
      this.fallbackMode = true;
      return null;
    }
  }

  getClient() {
    if (!this.client || !this.isConnected) {
      if (this.fallbackMode) {
        return null; // Indicate fallback mode
      }
      throw new Error('Redis client not connected');
    }
    return this.client;
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      try {
        await this.client.quit();
      } catch (error) {
        console.warn('Error disconnecting Redis:', error.message);
      }
    }
    this.isConnected = false;
    this.memoryCache.clear();
  }

  // Cache helper methods with fallback
  async set(key, value, expireInSeconds = 3600) {
    try {
      if (this.isConnected && this.client) {
        const serializedValue = JSON.stringify(value);
        await this.client.setEx(key, expireInSeconds, serializedValue);
        return true;
      } else if (this.fallbackMode) {
        // Use in-memory cache as fallback
        const expireAt = Date.now() + (expireInSeconds * 1000);
        this.memoryCache.set(key, { value, expireAt });
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Cache SET error, using fallback:', error.message);
      // Fallback to memory cache
      const expireAt = Date.now() + (expireInSeconds * 1000);
      this.memoryCache.set(key, { value, expireAt });
      return true;
    }
  }

  async get(key) {
    try {
      if (this.isConnected && this.client) {
        const value = await this.client.get(key);
        return value ? JSON.parse(value) : null;
      } else if (this.fallbackMode) {
        // Use in-memory cache as fallback
        const cached = this.memoryCache.get(key);
        if (cached) {
          if (Date.now() > cached.expireAt) {
            this.memoryCache.delete(key);
            return null;
          }
          return cached.value;
        }
        return null;
      }
      return null;
    } catch (error) {
      console.warn('Cache GET error:', error.message);
      // Try fallback
      const cached = this.memoryCache.get(key);
      if (cached && Date.now() <= cached.expireAt) {
        return cached.value;
      }
      return null;
    }
  }

  async del(key) {
    try {
      if (this.isConnected && this.client) {
        await this.client.del(key);
      }
      // Always clean from memory cache
      this.memoryCache.delete(key);
      return true;
    } catch (error) {
      console.warn('Cache DEL error:', error.message);
      this.memoryCache.delete(key);
      return true;
    }
  }

  async exists(key) {
    try {
      if (this.isConnected && this.client) {
        const result = await this.client.exists(key);
        return result === 1;
      } else if (this.fallbackMode) {
        const cached = this.memoryCache.get(key);
        if (cached && Date.now() <= cached.expireAt) {
          return true;
        }
        return false;
      }
      return false;
    } catch (error) {
      console.warn('Cache EXISTS error:', error.message);
      const cached = this.memoryCache.get(key);
      return cached && Date.now() <= cached.expireAt;
    }
  }

  // Cleanup expired entries from memory cache
  cleanupMemoryCache() {
    const now = Date.now();
    for (const [key, cached] of this.memoryCache.entries()) {
      if (now > cached.expireAt) {
        this.memoryCache.delete(key);
      }
    }
  }
}

// Create singleton instance
const redisConnection = new RedisConnection();

module.exports = redisConnection;