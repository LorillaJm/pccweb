/**
 * Configuration Validation
 * Validates required environment variables on server startup
 */

const requiredEnvVars = {
  // Database
  DB_HOST: 'Database host',
  DB_PORT: 'Database port',
  DB_NAME: 'Database name',
  DB_USER: 'Database user',
  DB_PASS: 'Database password',

  // JWT
  JWT_SECRET: 'JWT secret key',
  JWT_EXPIRE: 'JWT expiration time',
  JWT_REFRESH_SECRET: 'JWT refresh secret',
  JWT_REFRESH_EXPIRE: 'JWT refresh expiration',

  // Server
  PORT: 'Server port',
  NODE_ENV: 'Node environment',
  FRONTEND_URL: 'Frontend URL',

  // Redis
  REDIS_HOST: 'Redis host',
  REDIS_PORT: 'Redis port',

  // Email
  EMAIL_HOST: 'Email host',
  EMAIL_PORT: 'Email port',
  EMAIL_USER: 'Email user',
  EMAIL_PASS: 'Email password',
  EMAIL_FROM: 'Email from address',

  // Session
  SESSION_SECRET: 'Session secret'
};

const optionalEnvVars = {
  // Email Verification
  EMAIL_VERIFICATION_EXPIRE: '24h',
  EMAIL_VERIFICATION_TOKEN_LENGTH: '32',

  // Two-Factor Authentication
  TWO_FACTOR_CODE_EXPIRE: '10m',
  TWO_FACTOR_CODE_LENGTH: '6',
  TWO_FACTOR_MAX_ATTEMPTS: '3',
  TWO_FACTOR_LOCKOUT_DURATION: '15m',
  TWO_FACTOR_BACKUP_CODES_COUNT: '10',

  // Rate Limiting
  RATE_LIMIT_REGISTRATION_MAX: '5',
  RATE_LIMIT_REGISTRATION_WINDOW: '1h',
  RATE_LIMIT_LOGIN_MAX: '5',
  RATE_LIMIT_LOGIN_WINDOW: '15m',
  RATE_LIMIT_VERIFICATION_MAX: '10',
  RATE_LIMIT_VERIFICATION_WINDOW: '1h',
  RATE_LIMIT_RESEND_MAX: '3',
  RATE_LIMIT_RESEND_WINDOW: '1h',
  RATE_LIMIT_2FA_MAX: '5',
  RATE_LIMIT_2FA_WINDOW: '15m',

  // reCAPTCHA
  RECAPTCHA_SITE_KEY: '',
  RECAPTCHA_SECRET_KEY: '',
  RECAPTCHA_MIN_SCORE: '0.5',

  // Security
  ACCOUNT_LOCKOUT_ATTEMPTS: '3',
  ACCOUNT_LOCKOUT_DURATION: '15m',
  PASSWORD_MIN_LENGTH: '8',
  PASSWORD_REQUIRE_UPPERCASE: 'true',
  PASSWORD_REQUIRE_LOWERCASE: 'true',
  PASSWORD_REQUIRE_NUMBER: 'true',
  PASSWORD_REQUIRE_SPECIAL: 'true',

  // Session
  SESSION_MAX_AGE: '7d',
  SESSION_SECURE: 'false',
  SESSION_HTTP_ONLY: 'true',
  SESSION_SAME_SITE: 'lax'
};

/**
 * Parse time string to milliseconds
 * @param {string} timeStr - Time string (e.g., '15m', '1h', '7d')
 * @returns {number} - Time in milliseconds
 */
function parseTimeToMs(timeStr) {
  const units = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };

  const match = timeStr.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid time format: ${timeStr}`);
  }

  const [, value, unit] = match;
  return parseInt(value) * units[unit];
}

/**
 * Validate configuration
 * @returns {Object} - Validation result
 */
function validateConfig() {
  const errors = [];
  const warnings = [];
  const config = {};

  // Check required variables
  for (const [key, description] of Object.entries(requiredEnvVars)) {
    if (!process.env[key]) {
      errors.push(`Missing required environment variable: ${key} (${description})`);
    } else {
      config[key] = process.env[key];
    }
  }

  // Set defaults for optional variables
  for (const [key, defaultValue] of Object.entries(optionalEnvVars)) {
    if (!process.env[key]) {
      if (defaultValue) {
        config[key] = defaultValue;
        warnings.push(`Using default value for ${key}: ${defaultValue}`);
      }
    } else {
      config[key] = process.env[key];
    }
  }

  // Validate specific configurations
  try {
    // Validate JWT expiration
    if (config.JWT_EXPIRE) {
      const jwtExpireMs = parseTimeToMs(config.JWT_EXPIRE);
      if (jwtExpireMs > 60 * 60 * 1000) { // More than 1 hour
        warnings.push('JWT_EXPIRE is set to more than 1 hour. Consider using shorter expiration for better security.');
      }
    }

    // Validate password requirements
    const minLength = parseInt(config.PASSWORD_MIN_LENGTH);
    if (minLength < 8) {
      warnings.push('PASSWORD_MIN_LENGTH is less than 8. Consider using at least 8 characters for better security.');
    }

    // Validate rate limits
    const loginMax = parseInt(config.RATE_LIMIT_LOGIN_MAX);
    if (loginMax > 10) {
      warnings.push('RATE_LIMIT_LOGIN_MAX is high. Consider lowering it to prevent brute force attacks.');
    }

    // Validate 2FA settings
    const twoFactorAttempts = parseInt(config.TWO_FACTOR_MAX_ATTEMPTS);
    if (twoFactorAttempts > 5) {
      warnings.push('TWO_FACTOR_MAX_ATTEMPTS is high. Consider lowering it for better security.');
    }

    // Check reCAPTCHA configuration
    if (!config.RECAPTCHA_SITE_KEY || !config.RECAPTCHA_SECRET_KEY) {
      warnings.push('reCAPTCHA is not configured. Registration will not have bot protection.');
    }

    // Validate session security in production
    if (process.env.NODE_ENV === 'production') {
      if (config.SESSION_SECURE !== 'true') {
        warnings.push('SESSION_SECURE should be true in production for HTTPS.');
      }
      if (config.SESSION_SAME_SITE !== 'strict' && config.SESSION_SAME_SITE !== 'lax') {
        warnings.push('SESSION_SAME_SITE should be "strict" or "lax" in production.');
      }
    }

  } catch (error) {
    errors.push(`Configuration validation error: ${error.message}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    config
  };
}

/**
 * Print validation results
 * @param {Object} result - Validation result
 */
function printValidationResults(result) {
  console.log('\n=== Configuration Validation ===\n');

  if (result.errors.length > 0) {
    console.error('❌ ERRORS:');
    result.errors.forEach(error => console.error(`  - ${error}`));
    console.log('');
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️  WARNINGS:');
    result.warnings.forEach(warning => console.warn(`  - ${warning}`));
    console.log('');
  }

  if (result.valid) {
    console.log('✅ Configuration is valid!');
  } else {
    console.error('❌ Configuration validation failed!');
    console.error('Please check your .env file and ensure all required variables are set.');
  }

  console.log('\n================================\n');
}

/**
 * Get configuration value with default
 * @param {string} key - Configuration key
 * @param {*} defaultValue - Default value
 * @returns {*} - Configuration value
 */
function getConfig(key, defaultValue = null) {
  return process.env[key] || optionalEnvVars[key] || defaultValue;
}

/**
 * Get configuration as number
 * @param {string} key - Configuration key
 * @param {number} defaultValue - Default value
 * @returns {number} - Configuration value as number
 */
function getConfigNumber(key, defaultValue = 0) {
  const value = getConfig(key, defaultValue.toString());
  return parseInt(value) || defaultValue;
}

/**
 * Get configuration as boolean
 * @param {string} key - Configuration key
 * @param {boolean} defaultValue - Default value
 * @returns {boolean} - Configuration value as boolean
 */
function getConfigBoolean(key, defaultValue = false) {
  const value = getConfig(key, defaultValue.toString());
  return value === 'true' || value === '1' || value === 'yes';
}

/**
 * Get configuration as time in milliseconds
 * @param {string} key - Configuration key
 * @param {string} defaultValue - Default value (e.g., '15m')
 * @returns {number} - Time in milliseconds
 */
function getConfigTime(key, defaultValue = '0s') {
  const value = getConfig(key, defaultValue);
  return parseTimeToMs(value);
}

module.exports = {
  validateConfig,
  printValidationResults,
  getConfig,
  getConfigNumber,
  getConfigBoolean,
  getConfigTime,
  parseTimeToMs
};
