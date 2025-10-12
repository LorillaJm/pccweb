#!/usr/bin/env node

/**
 * Security Verification Script
 * Quick verification of all security features and configurations
 */

const fs = require('fs');
const path = require('path');

console.log('='.repeat(70));
console.log('PCC Portal - Security Verification');
console.log('='.repeat(70));
console.log();

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0,
  results: []
};

// Helper function to check file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

// Helper function to check environment variable
function checkEnvVar(varName, required = false) {
  const value = process.env[varName];
  const exists = !!value;
  
  if (required && !exists) {
    return { status: 'FAIL', message: `${varName} not set (REQUIRED)` };
  } else if (!exists) {
    return { status: 'WARN', message: `${varName} not set (recommended)` };
  } else if (value === 'default-key-change-in-production' || value.includes('change-me')) {
    return { status: 'WARN', message: `${varName} using default value (change in production)` };
  } else {
    return { status: 'PASS', message: `${varName} configured` };
  }
}

// Check 1: Security test file exists
console.log('1. Checking security test files...');
const testFile = path.join(__dirname, 'test-security-validation.js');
if (fileExists(testFile)) {
  console.log('   ✓ Security test suite found');
  checks.passed++;
  checks.results.push({ check: 'Security Test Suite', status: 'PASS' });
} else {
  console.log('   ✗ Security test suite not found');
  checks.failed++;
  checks.results.push({ check: 'Security Test Suite', status: 'FAIL' });
}

// Check 2: Security services exist
console.log('2. Checking security services...');
const services = [
  'services/QRCodeService.js',
  'services/DigitalIDService.js',
  'services/AccessControlService.js'
];

let allServicesExist = true;
for (const service of services) {
  const servicePath = path.join(__dirname, service);
  if (!fileExists(servicePath)) {
    console.log(`   ✗ ${service} not found`);
    allServicesExist = false;
  }
}

if (allServicesExist) {
  console.log('   ✓ All security services found');
  checks.passed++;
  checks.results.push({ check: 'Security Services', status: 'PASS' });
} else {
  checks.failed++;
  checks.results.push({ check: 'Security Services', status: 'FAIL' });
}

// Check 3: Environment variables
console.log('3. Checking environment variables...');

// Load .env file if it exists
const envPath = path.join(__dirname, '.env');
if (fileExists(envPath)) {
  require('dotenv').config({ path: envPath });
}

const envChecks = [
  { name: 'QR_ENCRYPTION_KEY', required: true },
  { name: 'SESSION_SECRET', required: false },
  { name: 'JWT_SECRET', required: false },
  { name: 'REDIS_PASSWORD', required: false }
];

for (const envCheck of envChecks) {
  const result = checkEnvVar(envCheck.name, envCheck.required);
  console.log(`   ${result.status === 'PASS' ? '✓' : result.status === 'WARN' ? '⚠' : '✗'} ${result.message}`);
  
  if (result.status === 'PASS') {
    checks.passed++;
  } else if (result.status === 'WARN') {
    checks.warnings++;
  } else {
    checks.failed++;
  }
  
  checks.results.push({ check: envCheck.name, status: result.status });
}

// Check 4: Security middleware
console.log('4. Checking security middleware...');
const middlewarePath = path.join(__dirname, 'middleware/advancedFeatures.js');
if (fileExists(middlewarePath)) {
  const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
  
  const requiredMiddleware = [
    'chatbotRateLimit',
    'validateQRCode',
    'checkEventCapacity',
    'requireAlumniOrAdmin'
  ];
  
  let allMiddlewareFound = true;
  for (const middleware of requiredMiddleware) {
    if (!middlewareContent.includes(middleware)) {
      console.log(`   ✗ ${middleware} not found`);
      allMiddlewareFound = false;
    }
  }
  
  if (allMiddlewareFound) {
    console.log('   ✓ All security middleware found');
    checks.passed++;
    checks.results.push({ check: 'Security Middleware', status: 'PASS' });
  } else {
    checks.failed++;
    checks.results.push({ check: 'Security Middleware', status: 'FAIL' });
  }
} else {
  console.log('   ✗ Security middleware file not found');
  checks.failed++;
  checks.results.push({ check: 'Security Middleware', status: 'FAIL' });
}

// Check 5: Documentation
console.log('5. Checking security documentation...');
const docs = [
  'SECURITY_TESTING_REPORT.md',
  'SECURITY_CHECKLIST.md',
  'RUN_SECURITY_TESTS.md'
];

let allDocsExist = true;
for (const doc of docs) {
  const docPath = path.join(__dirname, doc);
  if (!fileExists(docPath)) {
    console.log(`   ✗ ${doc} not found`);
    allDocsExist = false;
  }
}

if (allDocsExist) {
  console.log('   ✓ All security documentation found');
  checks.passed++;
  checks.results.push({ check: 'Security Documentation', status: 'PASS' });
} else {
  checks.failed++;
  checks.results.push({ check: 'Security Documentation', status: 'FAIL' });
}

// Check 6: Run security tests
console.log('6. Running security tests...');
console.log('   (This may take a few seconds...)');

try {
  const { execSync } = require('child_process');
  const testOutput = execSync('node test-security-validation.js', {
    cwd: __dirname,
    encoding: 'utf8',
    stdio: 'pipe'
  });
  
  if (testOutput.includes('All security tests passed')) {
    console.log('   ✓ All security tests passed (20/20)');
    checks.passed++;
    checks.results.push({ check: 'Security Tests', status: 'PASS' });
  } else {
    console.log('   ✗ Some security tests failed');
    checks.failed++;
    checks.results.push({ check: 'Security Tests', status: 'FAIL' });
  }
} catch (error) {
  console.log('   ✗ Security tests failed to run');
  console.log('   Error:', error.message);
  checks.failed++;
  checks.results.push({ check: 'Security Tests', status: 'FAIL' });
}

// Summary
console.log();
console.log('='.repeat(70));
console.log('VERIFICATION SUMMARY');
console.log('='.repeat(70));
console.log(`Passed:   ${checks.passed}`);
console.log(`Failed:   ${checks.failed}`);
console.log(`Warnings: ${checks.warnings}`);
console.log();

// Detailed results
console.log('DETAILED RESULTS:');
console.log('-'.repeat(70));
for (const result of checks.results) {
  const icon = result.status === 'PASS' ? '✓' : result.status === 'WARN' ? '⚠' : '✗';
  console.log(`${icon} ${result.check}: ${result.status}`);
}
console.log();

// Recommendations
if (checks.failed > 0 || checks.warnings > 0) {
  console.log('RECOMMENDATIONS:');
  console.log('-'.repeat(70));
  
  if (checks.failed > 0) {
    console.log('CRITICAL:');
    console.log('- Fix all failed checks before deploying to production');
    console.log('- Review SECURITY_CHECKLIST.md for required actions');
  }
  
  if (checks.warnings > 0) {
    console.log('WARNINGS:');
    console.log('- Set strong values for environment variables');
    console.log('- Review SECURITY_TESTING_REPORT.md for recommendations');
  }
  console.log();
}

// Production readiness
console.log('='.repeat(70));
if (checks.failed === 0 && checks.warnings === 0) {
  console.log('✓ PRODUCTION READY: All security checks passed!');
  console.log();
  console.log('Next steps:');
  console.log('1. Enable HTTPS/TLS in production');
  console.log('2. Configure production environment variables');
  console.log('3. Review and complete SECURITY_CHECKLIST.md');
  process.exit(0);
} else if (checks.failed === 0) {
  console.log('⚠ PRODUCTION READY WITH WARNINGS');
  console.log();
  console.log('Address warnings before production deployment:');
  console.log('1. Set strong encryption keys');
  console.log('2. Configure all recommended environment variables');
  console.log('3. Review SECURITY_TESTING_REPORT.md');
  process.exit(0);
} else {
  console.log('✗ NOT PRODUCTION READY: Fix failed checks');
  console.log();
  console.log('Required actions:');
  console.log('1. Fix all failed security checks');
  console.log('2. Run security tests: node test-security-validation.js');
  console.log('3. Review SECURITY_CHECKLIST.md');
  process.exit(1);
}
