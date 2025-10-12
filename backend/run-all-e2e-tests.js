#!/usr/bin/env node

/**
 * Master E2E Test Runner
 * Executes all end-to-end test suites in sequence
 */

const { spawn } = require('child_process');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(message) {
  log('\n' + '='.repeat(70), 'magenta');
  log(message, 'magenta');
  log('='.repeat(70), 'magenta');
}

async function runTestSuite(scriptName, description) {
  return new Promise((resolve) => {
    logSection(`Running: ${description}`);
    
    const scriptPath = path.join(__dirname, scriptName);
    const testProcess = spawn('node', [scriptPath], {
      stdio: 'inherit',
      shell: true
    });

    testProcess.on('close', (code) => {
      if (code === 0) {
        log(`\n✓ ${description} PASSED\n`, 'green');
        resolve({ name: description, passed: true });
      } else {
        log(`\n✗ ${description} FAILED\n`, 'red');
        resolve({ name: description, passed: false });
      }
    });

    testProcess.on('error', (error) => {
      log(`\n✗ ${description} ERROR: ${error.message}\n`, 'red');
      resolve({ name: description, passed: false });
    });
  });
}

async function runAllE2ETests() {
  const startTime = Date.now();
  
  log('\n' + '='.repeat(70), 'cyan');
  log('COMPREHENSIVE END-TO-END TEST SUITE', 'cyan');
  log('PCC Portal - Advanced Features Validation', 'cyan');
  log('='.repeat(70) + '\n', 'cyan');

  const testSuites = [
    {
      script: 'test-e2e-complete-workflows.js',
      description: 'Complete User Workflows'
    },
    {
      script: 'test-e2e-security-validation.js',
      description: 'Security Validation'
    },
    {
      script: 'test-e2e-performance.js',
      description: 'Performance and Load Testing'
    }
  ];

  const results = [];

  for (const suite of testSuites) {
    const result = await runTestSuite(suite.script, suite.description);
    results.push(result);
  }

  // Print final summary
  const endTime = Date.now();
  const totalDuration = ((endTime - startTime) / 1000).toFixed(2);

  logSection('FINAL TEST SUMMARY');
  
  log(`\nTotal Test Suites: ${results.length}`, 'cyan');
  log(`Passed: ${results.filter(r => r.passed).length}`, 'green');
  log(`Failed: ${results.filter(r => r.passed === false).length}`, 'red');
  log(`Total Duration: ${totalDuration}s`, 'cyan');
  
  log('\nDetailed Results:', 'cyan');
  results.forEach(result => {
    const status = result.passed ? '✓ PASSED' : '✗ FAILED';
    const color = result.passed ? 'green' : 'red';
    log(`  ${status} - ${result.name}`, color);
  });

  log('\n' + '='.repeat(70), 'cyan');
  
  const allPassed = results.every(r => r.passed);
  if (allPassed) {
    log('ALL E2E TEST SUITES PASSED! 🎉🎉🎉', 'green');
  } else {
    log('SOME TEST SUITES FAILED - REVIEW RESULTS ABOVE', 'red');
  }
  
  log('='.repeat(70) + '\n', 'cyan');

  process.exit(allPassed ? 0 : 1);
}

// Run all tests
runAllE2ETests().catch(error => {
  log(`\nFatal error running test suites: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
