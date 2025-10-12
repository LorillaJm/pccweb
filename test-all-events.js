#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Running all event system tests...\n');

const tests = [
  {
    name: 'Backend Services Unit Tests',
    command: 'node',
    args: ['backend/test-services-unit.js'],
    cwd: process.cwd()
  },
  {
    name: 'QR Code Unit Tests',
    command: 'node',
    args: ['backend/test-qr-unit.js'],
    cwd: process.cwd()
  }
];

async function runTest(test) {
  return new Promise((resolve, reject) => {
    console.log(`\n📝 Running: ${test.name}`);
    console.log(`Command: ${test.command} ${test.args.join(' ')}\n`);
    
    const child = spawn(test.command, test.args, {
      cwd: test.cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32'
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${test.name} - PASSED\n`);
        resolve();
      } else {
        console.log(`❌ ${test.name} - FAILED (exit code: ${code})\n`);
        reject(new Error(`Test failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      console.log(`❌ ${test.name} - ERROR: ${error.message}\n`);
      reject(error);
    });
  });
}

async function runAllTests() {
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      await runTest(test);
      passed++;
    } catch (error) {
      failed++;
      console.error(`Test "${test.name}" failed:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total:  ${passed + failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Event system is ready to use.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please check the output above.');
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Tests interrupted by user');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n\n⚠️  Tests terminated');
  process.exit(1);
});

// Run all tests
runAllTests().catch((error) => {
  console.error('\n❌ Test runner failed:', error.message);
  process.exit(1);
});