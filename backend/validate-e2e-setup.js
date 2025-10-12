#!/usr/bin/env node

/**
 * E2E Test Setup Validation
 * Verifies that all E2E test files and dependencies are properly configured
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function logSection(message) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(message, 'cyan');
  log('='.repeat(60), 'cyan');
}

function checkFileExists(filePath, description) {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    logSuccess(`${description} exists`);
    return true;
  } else {
    logError(`${description} not found: ${filePath}`);
    return false;
  }
}

function checkDependency(packageName) {
  try {
    require.resolve(packageName);
    logSuccess(`${packageName} installed`);
    return true;
  } catch (error) {
    logError(`${packageName} not installed`);
    return false;
  }
}

async function validateSetup() {
  log('\n' + '='.repeat(60), 'cyan');
  log('E2E TEST SETUP VALIDATION', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');

  let allValid = true;

  // Check test files
  logSection('Checking Test Files');
  const testFiles = [
    ['test-e2e-complete-workflows.js', 'Complete Workflows Test'],
    ['test-e2e-security-validation.js', 'Security Validation Test'],
    ['test-e2e-performance.js', 'Performance Test'],
    ['run-all-e2e-tests.js', 'Test Runner'],
    ['E2E_TESTING_GUIDE.md', 'Testing Guide']
  ];

  for (const [file, description] of testFiles) {
    if (!checkFileExists(file, description)) {
      allValid = false;
    }
  }

  // Check required models
  logSection('Checking Required Models');
  const models = [
    'models/User.js',
    'models/ChatConversation.js',
    'models/Event.js',
    'models/EventTicket.js',
    'models/DigitalID.js',
    'models/AccessLog.js',
    'models/Internship.js',
    'models/InternshipApplication.js',
    'models/AlumniProfile.js',
    'models/JobPosting.js',
    'models/Notification.js'
  ];

  for (const model of models) {
    if (!checkFileExists(model, model)) {
      allValid = false;
    }
  }

  // Check dependencies
  logSection('Checking Dependencies');
  const dependencies = [
    'axios',
    'mongoose',
    'dotenv'
  ];

  for (const dep of dependencies) {
    if (!checkDependency(dep)) {
      allValid = false;
    }
  }

  // Check environment configuration
  logSection('Checking Environment Configuration');
  if (checkFileExists('.env', 'Environment file')) {
    const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
    
    const requiredVars = ['MONGODB_URI', 'PORT'];
    const optionalVars = ['API_URL', 'OPENAI_API_KEY'];
    
    for (const varName of requiredVars) {
      if (envContent.includes(varName)) {
        logSuccess(`${varName} configured`);
      } else {
        logError(`${varName} not configured`);
        allValid = false;
      }
    }
    
    for (const varName of optionalVars) {
      if (envContent.includes(varName)) {
        logSuccess(`${varName} configured`);
      } else {
        logWarning(`${varName} not configured (optional)`);
      }
    }
  } else {
    allValid = false;
  }

  // Check package.json scripts
  logSection('Checking NPM Scripts');
  const packageJsonPath = path.join(__dirname, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const scripts = packageJson.scripts || {};
    
    const requiredScripts = [
      'test:e2e:workflows',
      'test:e2e:security',
      'test:e2e:performance',
      'test:e2e:all'
    ];
    
    for (const script of requiredScripts) {
      if (scripts[script]) {
        logSuccess(`Script "${script}" configured`);
      } else {
        logError(`Script "${script}" not configured`);
        allValid = false;
      }
    }
  } else {
    logError('package.json not found');
    allValid = false;
  }

  // Final summary
  logSection('VALIDATION SUMMARY');
  
  if (allValid) {
    log('\n✓ All checks passed! E2E test suite is ready to run.', 'green');
    log('\nTo run tests:', 'cyan');
    log('  npm run test:e2e:all        - Run all E2E tests', 'cyan');
    log('  npm run test:e2e:workflows  - Run workflow tests', 'cyan');
    log('  npm run test:e2e:security   - Run security tests', 'cyan');
    log('  npm run test:e2e:performance - Run performance tests', 'cyan');
  } else {
    log('\n✗ Some checks failed. Please review the errors above.', 'red');
    log('\nRefer to E2E_TESTING_GUIDE.md for setup instructions.', 'yellow');
  }

  log('\n' + '='.repeat(60) + '\n', 'cyan');

  process.exit(allValid ? 0 : 1);
}

// Run validation
validateSetup().catch(error => {
  logError(`Validation failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});
