#!/usr/bin/env node

/**
 * Production Deployment Script
 * 
 * This script handles the deployment of the PCC Portal to production environment.
 * It performs pre-deployment checks, database migrations, and configuration validation.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60) + '\n');
}

// Required environment variables for production
const REQUIRED_ENV_VARS = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'SESSION_SECRET',
  'REDIS_HOST',
  'REDIS_PORT',
  'EMAIL_HOST',
  'EMAIL_USER',
  'EMAIL_PASS',
  'FRONTEND_URL',
  'QR_ENCRYPTION_KEY'
];

// Optional but recommended environment variables
const RECOMMENDED_ENV_VARS = [
  'OPENAI_API_KEY',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'REDIS_PASSWORD'
];

/**
 * Check if all required environment variables are set
 */
function checkEnvironmentVariables() {
  logSection('🔍 Checking Environment Variables');
  
  const missing = [];
  const warnings = [];
  
  // Check required variables
  REQUIRED_ENV_VARS.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
      log(`❌ Missing required: ${varName}`, 'red');
    } else {
      log(`✅ Found: ${varName}`, 'green');
    }
  });
  
  // Check recommended variables
  RECOMMENDED_ENV_VARS.forEach(varName => {
    if (!process.env[varName]) {
      warnings.push(varName);
      log(`⚠️  Missing recommended: ${varName}`, 'yellow');
    } else {
      log(`✅ Found: ${varName}`, 'green');
    }
  });
  
  if (missing.length > 0) {
    log('\n❌ Deployment cannot proceed. Missing required environment variables:', 'red');
    missing.forEach(v => log(`   - ${v}`, 'red'));
    return false;
  }
  
  if (warnings.length > 0) {
    log('\n⚠️  Some optional features may not work:', 'yellow');
    warnings.forEach(v => log(`   - ${v}`, 'yellow'));
  }
  
  log('\n✅ Environment variables check passed', 'green');
  return true;
}

/**
 * Validate database connection
 */
async function validateDatabaseConnection() {
  logSection('🔍 Validating Database Connection');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    log('✅ Successfully connected to MongoDB', 'green');
    
    // Check database stats
    const admin = mongoose.connection.db.admin();
    const serverStatus = await admin.serverStatus();
    
    log(`📊 Database: ${mongoose.connection.name}`, 'blue');
    log(`📊 MongoDB Version: ${serverStatus.version}`, 'blue');
    log(`📊 Uptime: ${Math.floor(serverStatus.uptime / 3600)} hours`, 'blue');
    
    await mongoose.connection.close();
    return true;
  } catch (error) {
    log(`❌ Database connection failed: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Run database migrations
 */
async function runMigrations() {
  logSection('🔄 Running Database Migrations');
  
  try {
    log('Running migration script...', 'blue');
    execSync('node scripts/migrate.js', { stdio: 'inherit' });
    log('✅ Migrations completed successfully', 'green');
    return true;
  } catch (error) {
    log(`❌ Migration failed: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Check Redis connection
 */
async function checkRedisConnection() {
  logSection('🔍 Checking Redis Connection');
  
  try {
    const redis = require('redis');
    const client = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379')
      },
      password: process.env.REDIS_PASSWORD || undefined
    });
    
    await client.connect();
    await client.ping();
    log('✅ Redis connection successful', 'green');
    await client.quit();
    return true;
  } catch (error) {
    log(`⚠️  Redis connection failed: ${error.message}`, 'yellow');
    log('💡 Some features may work in fallback mode', 'yellow');
    return false;
  }
}

/**
 * Validate SSL/TLS configuration
 */
function validateSSLConfiguration() {
  logSection('🔒 Validating SSL/TLS Configuration');
  
  if (process.env.NODE_ENV !== 'production') {
    log('⚠️  Not in production mode, skipping SSL check', 'yellow');
    return true;
  }
  
  const sslCertPath = process.env.SSL_CERT_PATH;
  const sslKeyPath = process.env.SSL_KEY_PATH;
  
  if (!sslCertPath || !sslKeyPath) {
    log('⚠️  SSL certificate paths not configured', 'yellow');
    log('💡 Make sure to configure SSL at the reverse proxy level', 'yellow');
    return true;
  }
  
  if (!fs.existsSync(sslCertPath)) {
    log(`❌ SSL certificate not found: ${sslCertPath}`, 'red');
    return false;
  }
  
  if (!fs.existsSync(sslKeyPath)) {
    log(`❌ SSL key not found: ${sslKeyPath}`, 'red');
    return false;
  }
  
  log('✅ SSL configuration validated', 'green');
  return true;
}

/**
 * Create necessary directories
 */
function createDirectories() {
  logSection('📁 Creating Required Directories');
  
  const directories = [
    'uploads',
    'uploads/materials',
    'uploads/profiles',
    'uploads/documents',
    'logs'
  ];
  
  directories.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      log(`✅ Created directory: ${dir}`, 'green');
    } else {
      log(`✓ Directory exists: ${dir}`, 'blue');
    }
  });
  
  return true;
}

/**
 * Generate deployment report
 */
function generateDeploymentReport(checks) {
  logSection('📋 Deployment Report');
  
  const timestamp = new Date().toISOString();
  const report = {
    timestamp,
    environment: process.env.NODE_ENV || 'development',
    checks,
    status: Object.values(checks).every(v => v) ? 'READY' : 'ISSUES_FOUND'
  };
  
  // Save report to file
  const reportPath = path.join(__dirname, '..', 'logs', `deployment-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  log(`Report saved to: ${reportPath}`, 'blue');
  
  // Display summary
  console.log('\nDeployment Checks Summary:');
  Object.entries(checks).forEach(([check, passed]) => {
    const icon = passed ? '✅' : '❌';
    const color = passed ? 'green' : 'red';
    log(`${icon} ${check}`, color);
  });
  
  if (report.status === 'READY') {
    log('\n🎉 System is ready for production deployment!', 'green');
  } else {
    log('\n⚠️  Please resolve the issues before deploying to production', 'yellow');
  }
  
  return report;
}

/**
 * Main deployment function
 */
async function deploy() {
  log('🚀 PCC Portal Production Deployment Script', 'cyan');
  log('Starting pre-deployment checks...\n', 'blue');
  
  const checks = {
    environment: false,
    database: false,
    redis: false,
    ssl: false,
    directories: false,
    migrations: false
  };
  
  try {
    // Run all checks
    checks.environment = checkEnvironmentVariables();
    if (!checks.environment) {
      throw new Error('Environment validation failed');
    }
    
    checks.database = await validateDatabaseConnection();
    if (!checks.database) {
      throw new Error('Database validation failed');
    }
    
    checks.redis = await checkRedisConnection();
    checks.ssl = validateSSLConfiguration();
    checks.directories = createDirectories();
    checks.migrations = await runMigrations();
    
    // Generate report
    const report = generateDeploymentReport(checks);
    
    if (report.status === 'READY') {
      log('\n✅ Deployment preparation completed successfully!', 'green');
      log('You can now start the production server with: npm start', 'blue');
      process.exit(0);
    } else {
      log('\n❌ Deployment preparation failed', 'red');
      process.exit(1);
    }
    
  } catch (error) {
    log(`\n❌ Deployment failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run deployment if executed directly
if (require.main === module) {
  deploy();
}

module.exports = { deploy };
