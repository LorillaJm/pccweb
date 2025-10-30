const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const redisConnection = require('../config/redis');

class JWTTokenService {
  constructor() {
    this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRE || '15m';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRE || '7d';
    this.jwtSecret = process.env.JWT_SECRET;
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  }

  /**
   * Generate access and refresh tokens
   * @param {string} userId - User ID
   * @param {string} email - User email
   * @param {string} role - User role
   * @returns {Promise<{accessToken: string, refreshToken: string, jti: string}>}
   */
  async generateTokens(userId, email, role) {
    // Generate unique JTI (JWT ID) for refresh token
    const jti = uuidv4();

    // Create access token payload
    const accessPayload = {
      userId,
      email,
      role,
      type: 'access'
    };

    // Create refresh token payload
    const refreshPayload = {
      userId,
      type: 'refresh',
      jti
    };

    // Sign tokens
    const accessToken = jwt.sign(accessPayload, this.jwtSecret, {
      expiresIn: this.accessTokenExpiry
    });

    const refreshToken = jwt.sign(refreshPayload, this.jwtRefreshSecret, {
      expiresIn: this.refreshTokenExpiry
    });

    // Store refresh token JTI in Redis
    await this.storeRefreshToken(userId, jti);

    return {
      accessToken,
      refreshToken,
      jti
    };
  }

  /**
   * Store refresh token JTI in Redis
   * @param {string} userId - User ID
   * @param {string} jti - JWT ID
   * @returns {Promise<void>}
   */
  async storeRefreshToken(userId, jti) {
    const key = `refresh_token:${userId}:${jti}`;
    // Store for 7 days (matching refresh token expiry)
    const expirySeconds = 7 * 24 * 60 * 60;
    
    await redisConnection.set(key, {
      userId,
      jti,
      createdAt: new Date().toISOString()
    }, expirySeconds);
  }

  /**
   * Verify refresh token and check if it exists in Redis
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<{valid: boolean, payload?: object, error?: string}>}
   */
  async verifyRefreshToken(refreshToken) {
    try {
      // Verify token signature and expiration
      const payload = jwt.verify(refreshToken, this.jwtRefreshSecret);

      // Check if it's a refresh token
      if (payload.type !== 'refresh') {
        return { valid: false, error: 'Invalid token type' };
      }

      // Check if JTI exists in Redis
      const key = `refresh_token:${payload.userId}:${payload.jti}`;
      const exists = await redisConnection.exists(key);

      if (!exists) {
        return { valid: false, error: 'Token has been revoked or expired' };
      }

      return { valid: true, payload };

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return { valid: false, error: 'Token expired' };
      }
      if (error.name === 'JsonWebTokenError') {
        return { valid: false, error: 'Invalid token' };
      }
      return { valid: false, error: error.message };
    }
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Refresh token
   * @param {object} user - User object with id, email, role
   * @returns {Promise<{accessToken: string, refreshToken: string}>}
   */
  async refreshAccessToken(refreshToken, user) {
    // Verify refresh token
    const verification = await this.verifyRefreshToken(refreshToken);

    if (!verification.valid) {
      throw new Error(verification.error);
    }

    // Invalidate old refresh token
    await this.invalidateRefreshToken(verification.payload.userId, verification.payload.jti);

    // Generate new tokens (with token rotation)
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return tokens;
  }

  /**
   * Invalidate a refresh token
   * @param {string} userId - User ID
   * @param {string} jti - JWT ID
   * @returns {Promise<void>}
   */
  async invalidateRefreshToken(userId, jti) {
    const key = `refresh_token:${userId}:${jti}`;
    await redisConnection.del(key);
  }

  /**
   * Invalidate all refresh tokens for a user
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async invalidateAllUserTokens(userId) {
    // Note: This requires scanning Redis keys, which can be slow
    // In production, consider maintaining a set of JTIs per user
    const pattern = `refresh_token:${userId}:*`;
    
    // For now, we'll use a simple approach
    // In production, consider using Redis SCAN command
    try {
      const client = redisConnection.getClient();
      if (client) {
        const keys = await client.keys(pattern);
        if (keys && keys.length > 0) {
          await Promise.all(keys.map(key => redisConnection.del(key)));
        }
      }
    } catch (error) {
      console.error('Error invalidating user tokens:', error);
    }
  }

  /**
   * Verify access token
   * @param {string} accessToken - Access token
   * @returns {{valid: boolean, payload?: object, error?: string}}
   */
  verifyAccessToken(accessToken) {
    try {
      const payload = jwt.verify(accessToken, this.jwtSecret);

      if (payload.type !== 'access') {
        return { valid: false, error: 'Invalid token type' };
      }

      return { valid: true, payload };

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return { valid: false, error: 'Token expired' };
      }
      if (error.name === 'JsonWebTokenError') {
        return { valid: false, error: 'Invalid token' };
      }
      return { valid: false, error: error.message };
    }
  }

  /**
   * Decode token without verification (for debugging)
   * @param {string} token - JWT token
   * @returns {object|null}
   */
  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }
}

module.exports = new JWTTokenService();
