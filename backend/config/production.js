/**
 * Production Configuration Module
 * 
 * This module provides production-specific configurations and utilities
 * for the PCC Portal application.
 */

const fs = require('fs');
const path = require('path');

/**
 * Production configuration object
 */
const productionConfig = {
  // Server configuration
  server: {
    port: process.env.PORT || 5000,
    host: process.env.HOST || '0.0.0.0',
    trustProxy: true,
    timeout: 30000 // 30 seconds
  },

  // Database configuration
  database: {
    uri: process.env.MONGODB_URI,
    options: {
      maxPoolSize: 50,
      minPoolSize: 10,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 10000,
      retryWrites: true,
      w: 'majority'
    }
  },

  // Redis configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0'),
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    enableOfflineQueue: true
  },

  // Security configuration
  security: {
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"]
        }
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    },
    cors: {
      origin: process.env.CORS_ALLOWED_ORIGINS 
        ? process.env.CORS_ALLOWED_ORIGINS.split(',')
        : [process.env.FRONTEND_URL],
      credentials: true,
      optionsSuccessStatus: 200
    },
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false
    }
  },

  // Session configuration
  session: {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // Requires HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'strict'
    },
    name: 'pcc.sid',
    rolling: true
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: {
      enabled: true,
      path: process.env.LOG_FILE_PATH || './logs/app.log',
      maxSize: process.env.LOG_MAX_SIZE || '10m',
      maxFiles: parseInt(process.env.LOG_MAX_FILES || '7')
    },
    console: {
      enabled: true,
      colorize: false
    }
  },

  // Monitoring configuration
  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true',
    sentry: {
      dsn: process.env.SENTRY_DSN,
      environment: 'production',
      tracesSampleRate: 0.1
    },
    newRelic: {
      licenseKey: process.env.NEW_RELIC_LICENSE_KEY,
      appName: 'PCC Portal API'
    }
  },

  // Backup configuration
  backup: {
    enabled: process.env.BACKUP_ENABLED === 'true',
    schedule: process.env.BACKUP_SCHEDULE || '0 2 * * *', // 2 AM daily
    retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
    path: process.env.BACKUP_PATH || './backups'
  },

  // CDN configuration
  cdn: {
    enabled: process.env.CDN_ENABLED === 'true',
    url: process.env.CDN_URL || ''
  },

  // Cache configuration
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '3600'), // 1 hour
    maxSize: parseInt(process.env.CACHE_MAX_SIZE || '100')
  },

  // SSL/TLS configuration
  ssl: {
    enabled: process.env.SSL_CERT_PATH && process.env.SSL_KEY_PATH,
    cert: process.env.SSL_CERT_PATH,
    key: process.env.SSL_KEY_PATH
  }
};

/**
 * Validate production configuration
 */
function validateConfig() {
  const errors = [];

  // Check required environment variables
  const required = [
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'SESSION_SECRET',
    'FRONTEND_URL'
  ];

  required.forEach(key => {
    if (!process.env[key]) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  });

  // Validate secret lengths
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long');
  }

  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 32) {
    errors.push('SESSION_SECRET must be at least 32 characters long');
  }

  // Check SSL configuration if enabled
  if (productionConfig.ssl.enabled) {
    if (!fs.existsSync(productionConfig.ssl.cert)) {
      errors.push(`SSL certificate not found: ${productionConfig.ssl.cert}`);
    }
    if (!fs.existsSync(productionConfig.ssl.key)) {
      errors.push(`SSL key not found: ${productionConfig.ssl.key}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get configuration value by path
 */
function getConfig(path) {
  return path.split('.').reduce((obj, key) => obj?.[key], productionConfig);
}

/**
 * Initialize production environment
 */
function initializeProduction() {
  console.log('🔧 Initializing production environment...');

  // Validate configuration
  const validation = validateConfig();
  if (!validation.valid) {
    console.error('❌ Production configuration validation failed:');
    validation.errors.forEach(error => console.error(`   - ${error}`));
    throw new Error('Invalid production configuration');
  }

  // Create required directories
  const directories = [
    'logs',
    'uploads',
    'uploads/materials',
    'uploads/profiles',
    'uploads/documents'
  ];

  if (productionConfig.backup.enabled) {
    directories.push(productionConfig.backup.path);
  }

  directories.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });

  console.log('✅ Production environment initialized');
}

/**
 * Get health check information
 */
function getHealthInfo() {
  return {
    environment: 'production',
    nodeVersion: process.version,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  config: productionConfig,
  validateConfig,
  getConfig,
  initializeProduction,
  getHealthInfo
};
