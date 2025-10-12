#!/usr/bin/env node

/**
 * Helper script to run E2E tests with proper checks
 */

const axios = require('axios');
const { spawn } = require('child_process');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m'
};

function logSuccess(message) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function logError(message) {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ${colors.reset} ${message}`);
}

async function checkServerRunning() {
  try {
    const response = await axios.get('http://localhost:5000/api/health', {
      timeout: 3000
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('E2E TEST RUNNER');
  console.log('='.repeat(60) + '\n');

  logInfo('Checking if backend server is running...');
  
  const serverRunning = await checkServerRunning();
  
  if (!serverRunning) {
    logError('Backend server is not running!');
    console.log('\n' + colors.yellow + 'To run E2E tests, you need to:' + colors.reset);
    console.log('\n1. Start the backend server in one terminal:');
    console.log('   ' + colors.blue + 'cd backend && npm start' + colors.reset);
    console.log('   (or: ' + colors.blue + 'node server.js' + colors.reset + ')');
    console.log('\n2. Wait for the server to fully start');
    console.log('   Look for: ' + colors.green + '"Server running on port 5000"' + colors.reset);
    console.log('\n3. Then run this script again in another terminal:');
    console.log('   ' + colors.blue + 'node run-e2e-tests.js' + colors.reset);
    console.log('\n' + '='.repeat(60) + '\n');
    process.exit(1);
  }

  logSuccess('Backend server is running!');
  logInfo('Starting E2E tests...\n');
  
  console.log('='.repeat(60) + '\n');

  // Run the E2E tests
  const testProcess = spawn('node', ['test-e2e-complete-workflows.js'], {
    stdio: 'inherit',
    cwd: __dirname
  });

  testProcess.on('close', (code) => {
    console.log('\n' + '='.repeat(60));
    if (code === 0) {
      logSuccess('E2E tests completed successfully!');
    } else {
      logError(`E2E tests failed with exit code ${code}`);
    }
    console.log('='.repeat(60) + '\n');
    process.exit(code);
  });

  testProcess.on('error', (error) => {
    logError(`Failed to run E2E tests: ${error.message}`);
    process.exit(1);
  });
}

main().catch(error => {
  logError(`Error: ${error.message}`);
  process.exit(1);
});
