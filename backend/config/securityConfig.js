/**
 * Security Configuration Constants
 * Centralized configuration for security features
 */

const { getConfig, getConfigNumber, getConfigBoolean, getConfigTime } = require('./validateConfig');

const securityConfig = {
  // Email Verification
  emailVerification: {
    expire: getConfigTime('EMAIL_VERIFICATION_EXPIRE', '24h'),
    tokenLength: getConfigNumber('EMAIL_VERIFICATION_TOKEN_LENGTH', 32),
    expirationHours: 24 // For display purposes
  },

  // Two-Factor Authentication
  twoFactor: {
    codeExpire: getConfigTime('TWO_FACTOR_CODE_EXPIRE', '10m'),
    codeLength: getConfigNumber('TWO_FACTOR_CODE_LENGTH', 6),
    maxAttempts: getConfigNumber('TWO_FACTOR_MAX_ATTEMPTS', 3),
    lockoutDuration: getConfigTime('TWO_FACTOR_LOCKOUT_DURATION', '15m'),
    backupCodesCount: getConfigNumber('TWO_FACTOR_BACKUP_CODES_COUNT', 10),
    expirationMinutes: 10 // For display purposes
  },

  // Rate Limiting
  rateLimit: {
    registration: {
      max: getConfigNumber('RATE_LIMIT_REGISTRATION_MAX', 5),
      window: getConfigTime('RATE_LIMIT_REGISTRATION_WINDOW', '1h')
    },
    login: {
      max: getConfigNumber('RATE_LIMIT_LOGIN_MAX', 5),
      window: getConfigTime('RATE_LIMIT_LOGIN_WINDOW', '15m')
    },
    verification: {
      max: getConfigNumber('RATE_LIMIT_VERIFICATION_MAX', 10),
      window: getConfigTime('RATE_LIMIT_VERIFICATION_WINDOW', '1h')
    },
    resend: {
      max: getConfigNumber('RATE_LIMIT_RESEND_MAX', 3),
      window: getConfigTime('RATE_LIMIT_RESEND_WINDOW', '1h')
    },
    twoFactor: {
      max: getConfigNumber('RATE_LIMIT_2FA_MAX', 5),
      window: getConfigTime('RATE_LIMIT_2FA_WINDOW', '15m')
    }
  },

  // reCAPTCHA
  recaptcha: {
    siteKey: getConfig('RECAPTCHA_SITE_KEY', ''),
    secretKey: getConfig('RECAPTCHA_SECRET_KEY', ''),
    minScore: parseFloat(getConfig('RECAPTCHA_MIN_SCORE', '0.5')),
    enabled: !!getConfig('RECAPTCHA_SECRET_KEY')
  },

  // Account Security
  account: {
    lockoutAttempts: getConfigNumber('ACCOUNT_LOCKOUT_ATTEMPTS', 3),
    lockoutDuration: getConfigTime('ACCOUNT_LOCKOUT_DURATION', '15m'),
    lockoutMinutes: 15 // For display purposes
  },

  // Password Requirements
  password: {
    minLength: getConfigNumber('PASSWORD_MIN_LENGTH', 8),
    requireUppercase: getConfigBoolean('PASSWORD_REQUIRE_UPPERCASE', true),
    requireLowercase: getConfigBoolean('PASSWORD_REQUIRE_LOWERCASE', true),
    requireNumber: getConfigBoolean('PASSWORD_REQUIRE_NUMBER', true),
    requireSpecial: getConfigBoolean('PASSWORD_REQUIRE_SPECIAL', true)
  },

  // JWT
  jwt: {
    secret: getConfig('JWT_SECRET'),
    expire: getConfig('JWT_EXPIRE', '15m'),
    refreshSecret: getConfig('JWT_REFRESH_SECRET'),
    refreshExpire: getConfig('JWT_REFRESH_EXPIRE', '7d')
  },

  // Session
  session: {
    secret: getConfig('SESSION_SECRET'),
    maxAge: getConfigTime('SESSION_MAX_AGE', '7d'),
    secure: getConfigBoolean('SESSION_SECURE', false),
    httpOnly: getConfigBoolean('SESSION_HTTP_ONLY', true),
    sameSite: getConfig('SESSION_SAME_SITE', 'lax')
  }
};

/**
 * Validate password against requirements
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result
 */
function validatePassword(password) {
  const errors = [];
  const { minLength, requireUppercase, requireLowercase, requireNumber, requireSpecial } = securityConfig.password;

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (requireNumber && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get rate limit key
 * @param {string} type - Rate limit type
 * @param {string} identifier - Identifier (IP, email, etc.)
 * @returns {string} - Rate limit key
 */
function getRateLimitKey(type, identifier) {
  return `ratelimit:${type}:${identifier}`;
}

/**
 * Calculate lockout end time
 * @param {number} duration - Lockout duration in milliseconds
 * @returns {Date} - Lockout end time
 */
function calculateLockoutEndTime(duration = securityConfig.account.lockoutDuration) {
  return new Date(Date.now() + duration);
}

module.exports = {
  securityConfig,
  validatePassword,
  getRateLimitKey,
  calculateLockoutEndTime
};
