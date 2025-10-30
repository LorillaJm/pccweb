const redisConnection = require('../config/redis');

class RateLimitService {
  constructor() {
    // Rate limit configurations (attempts per window)
    this.limits = {
      register: {
        maxAttempts: parseInt(process.env.RATE_LIMIT_REGISTER) || 5,
        windowMs: 60 * 60 * 1000, // 1 hour
        keyPrefix: 'ratelimit:register'
      },
      login: {
        maxAttempts: parseInt(process.env.RATE_LIMIT_LOGIN) || 5,
        windowMs: 15 * 60 * 1000, // 15 minutes
        keyPrefix: 'ratelimit:login'
      },
      verification: {
        maxAttempts: parseInt(process.env.RATE_LIMIT_VERIFICATION) || 10,
        windowMs: 60 * 60 * 1000, // 1 hour
        keyPrefix: 'ratelimit:verification'
      },
      resendEmail: {
        maxAttempts: parseInt(process.env.RATE_LIMIT_RESEND) || 3,
        windowMs: 60 * 60 * 1000, // 1 hour
        keyPrefix: 'ratelimit:resend'
      },
      twoFactor: {
        maxAttempts: parseInt(process.env.RATE_LIMIT_2FA) || 3,
        windowMs: 15 * 60 * 1000, // 15 minutes
        keyPrefix: 'ratelimit:2fa'
      }
    };
  }

  /**
   * Generate rate limit key
   * @param {string} action - Action type (register, login, etc.)
   * @param {string} identifier - Unique identifier (IP, email, userId)
   * @returns {string}
   */
  _generateKey(action, identifier) {
    const config = this.limits[action];
    if (!config) {
      throw new Error(`Unknown rate limit action: ${action}`);
    }
    return `${config.keyPrefix}:${identifier}`;
  }

  /**
   * Check if rate limit is exceeded
   * @param {string} action - Action type
   * @param {string} identifier - Unique identifier
   * @returns {Promise<{allowed: boolean, remaining: number, resetAt: Date, retryAfter?: number}>}
   */
  async checkRateLimit(action, identifier) {
    const config = this.limits[action];
    if (!config) {
      throw new Error(`Unknown rate limit action: ${action}`);
    }

    const key = this._generateKey(action, identifier);
    const now = Date.now();

    try {
      // Get current count and expiry
      const data = await redisConnection.get(key);
      
      if (!data) {
        // No previous attempts, create new entry
        const resetAt = new Date(now + config.windowMs);
        await redisConnection.set(
          key,
          { count: 1, resetAt: resetAt.getTime() },
          Math.ceil(config.windowMs / 1000)
        );

        return {
          allowed: true,
          remaining: config.maxAttempts - 1,
          resetAt
        };
      }

      // Check if window has expired
      if (now > data.resetAt) {
        // Window expired, reset counter
        const resetAt = new Date(now + config.windowMs);
        await redisConnection.set(
          key,
          { count: 1, resetAt: resetAt.getTime() },
          Math.ceil(config.windowMs / 1000)
        );

        return {
          allowed: true,
          remaining: config.maxAttempts - 1,
          resetAt
        };
      }

      // Check if limit exceeded
      if (data.count >= config.maxAttempts) {
        const resetAt = new Date(data.resetAt);
        const retryAfter = Math.ceil((data.resetAt - now) / 1000);

        return {
          allowed: false,
          remaining: 0,
          resetAt,
          retryAfter
        };
      }

      // Increment counter
      const newCount = data.count + 1;
      const resetAt = new Date(data.resetAt);
      const ttl = Math.ceil((data.resetAt - now) / 1000);
      
      await redisConnection.set(
        key,
        { count: newCount, resetAt: data.resetAt },
        ttl
      );

      return {
        allowed: true,
        remaining: config.maxAttempts - newCount,
        resetAt
      };
    } catch (error) {
      console.error('Rate limit check error:', error);
      // On error, allow the request (fail open)
      return {
        allowed: true,
        remaining: config.maxAttempts,
        resetAt: new Date(now + config.windowMs)
      };
    }
  }

  /**
   * Record a rate limit attempt (for manual tracking)
   * @param {string} action - Action type
   * @param {string} identifier - Unique identifier
   * @returns {Promise<void>}
   */
  async recordAttempt(action, identifier) {
    await this.checkRateLimit(action, identifier);
  }

  /**
   * Reset rate limit for an identifier
   * @param {string} action - Action type
   * @param {string} identifier - Unique identifier
   * @returns {Promise<void>}
   */
  async resetRateLimit(action, identifier) {
    const key = this._generateKey(action, identifier);
    await redisConnection.del(key);
  }

  /**
   * Get current rate limit status without incrementing
   * @param {string} action - Action type
   * @param {string} identifier - Unique identifier
   * @returns {Promise<{count: number, remaining: number, resetAt: Date}>}
   */
  async getRateLimitStatus(action, identifier) {
    const config = this.limits[action];
    if (!config) {
      throw new Error(`Unknown rate limit action: ${action}`);
    }

    const key = this._generateKey(action, identifier);
    const now = Date.now();

    try {
      const data = await redisConnection.get(key);

      if (!data || now > data.resetAt) {
        return {
          count: 0,
          remaining: config.maxAttempts,
          resetAt: new Date(now + config.windowMs)
        };
      }

      return {
        count: data.count,
        remaining: Math.max(0, config.maxAttempts - data.count),
        resetAt: new Date(data.resetAt)
      };
    } catch (error) {
      console.error('Get rate limit status error:', error);
      return {
        count: 0,
        remaining: config.maxAttempts,
        resetAt: new Date(now + config.windowMs)
      };
    }
  }

  /**
   * Create Express middleware for rate limiting
   * @param {string} action - Action type
   * @param {function} identifierFn - Function to extract identifier from request
   * @returns {function}
   */
  createMiddleware(action, identifierFn) {
    return async (req, res, next) => {
      try {
        const identifier = identifierFn(req);
        const result = await this.checkRateLimit(action, identifier);

        // Set rate limit headers
        res.set({
          'X-RateLimit-Limit': this.limits[action].maxAttempts,
          'X-RateLimit-Remaining': result.remaining,
          'X-RateLimit-Reset': result.resetAt.toISOString()
        });

        if (!result.allowed) {
          res.set('Retry-After', result.retryAfter);
          return res.status(429).json({
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: 'Too many attempts. Please try again later.',
              retryAfter: result.retryAfter,
              resetAt: result.resetAt
            }
          });
        }

        next();
      } catch (error) {
        console.error('Rate limit middleware error:', error);
        // On error, allow the request
        next();
      }
    };
  }

  /**
   * Get rate limit configuration
   * @param {string} action - Action type
   * @returns {object}
   */
  getConfig(action) {
    return this.limits[action];
  }

  /**
   * Update rate limit configuration
   * @param {string} action - Action type
   * @param {object} config - New configuration
   */
  updateConfig(action, config) {
    if (this.limits[action]) {
      this.limits[action] = { ...this.limits[action], ...config };
    }
  }
}

module.exports = new RateLimitService();
