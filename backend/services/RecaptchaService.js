const axios = require('axios');

class RecaptchaService {
  constructor() {
    this.secretKey = process.env.RECAPTCHA_SECRET_KEY;
    this.minScore = parseFloat(process.env.RECAPTCHA_MIN_SCORE) || 0.5;
    this.verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
    this.enabled = process.env.RECAPTCHA_ENABLED !== 'false';
  }

  /**
   * Verify reCAPTCHA token
   * @param {string} token - reCAPTCHA token from client
   * @param {string} remoteIp - Client IP address (optional)
   * @returns {Promise<{success: boolean, score?: number, action?: string, error?: string}>}
   */
  async verifyToken(token, remoteIp = null) {
    // If reCAPTCHA is disabled, allow all requests
    if (!this.enabled) {
      return {
        success: true,
        score: 1.0,
        action: 'disabled',
        message: 'reCAPTCHA verification disabled'
      };
    }

    // Check if secret key is configured
    if (!this.secretKey) {
      console.warn('reCAPTCHA secret key not configured');
      return {
        success: false,
        error: 'RECAPTCHA_NOT_CONFIGURED',
        message: 'reCAPTCHA is not properly configured'
      };
    }

    // Validate token format
    if (!token || typeof token !== 'string') {
      return {
        success: false,
        error: 'INVALID_TOKEN',
        message: 'Invalid reCAPTCHA token'
      };
    }

    try {
      // Make request to Google's verification endpoint
      const response = await axios.post(
        this.verifyUrl,
        null,
        {
          params: {
            secret: this.secretKey,
            response: token,
            ...(remoteIp && { remoteip: remoteIp })
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 5000 // 5 second timeout
        }
      );

      const data = response.data;

      // Check if verification was successful
      if (!data.success) {
        return {
          success: false,
          error: 'VERIFICATION_FAILED',
          message: 'reCAPTCHA verification failed',
          errorCodes: data['error-codes']
        };
      }

      // For reCAPTCHA v3, check the score
      if (data.score !== undefined) {
        if (data.score < this.minScore) {
          return {
            success: false,
            error: 'LOW_SCORE',
            message: `reCAPTCHA score too low: ${data.score}`,
            score: data.score,
            action: data.action
          };
        }

        return {
          success: true,
          score: data.score,
          action: data.action,
          hostname: data.hostname,
          challengeTs: data.challenge_ts
        };
      }

      // For reCAPTCHA v2 (checkbox)
      return {
        success: true,
        hostname: data.hostname,
        challengeTs: data.challenge_ts
      };

    } catch (error) {
      console.error('reCAPTCHA verification error:', error.message);

      // Handle specific error cases
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return {
          success: false,
          error: 'TIMEOUT',
          message: 'reCAPTCHA verification timeout'
        };
      }

      if (error.response) {
        return {
          success: false,
          error: 'API_ERROR',
          message: 'reCAPTCHA API error',
          statusCode: error.response.status
        };
      }

      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Failed to verify reCAPTCHA'
      };
    }
  }

  /**
   * Get minimum required score
   * @returns {number}
   */
  getMinScore() {
    return this.minScore;
  }

  /**
   * Set minimum required score
   * @param {number} score - Score between 0.0 and 1.0
   */
  setMinScore(score) {
    if (score >= 0 && score <= 1) {
      this.minScore = score;
    }
  }

  /**
   * Check if reCAPTCHA is enabled
   * @returns {boolean}
   */
  isEnabled() {
    return this.enabled;
  }
}

module.exports = new RecaptchaService();
