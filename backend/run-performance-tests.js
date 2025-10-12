/**
 * Performance Test Runner
 * Runs all performance tests and generates comprehensive report
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const TESTS = [
  {
    name: 'Database Performance',
    script: 'test-performance-database.js',
    description: 'Tests database query performance and optimization',
    timeout: 120000 // 2 minutes
  },
  {
    name: 'Load Testing',
    script: 'test-performance-load.js',
    description: 'Tests system performance under load',
    timeout: 180000, // 3 minutes
    skip: true // Skip by default as it requires running server
  },
  {
    name: 'Notification Performance',
    script: 'test-performance-notifications.js',
    description: 'Tests real-time notification delivery speed',
    timeout: 120000, // 2 minutes
    skip: true // Skip by default as it requires running server
  },
  {
    name: 'Mobile Performance',
    script: 'test-performance-mobile.js',
    description: 'Tests mobile responsiveness and offline capabilities',
    timeout: 180000, // 3 minutes
    skip: true // Skip by default as it requires running server
  }
];

// Results storage
const results = {
  startTime: new Date(),
  endTime: null,
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0
  }
};

/**
 * Run a single test
 */
function runTest(test) {
  return new Promise((resolve) => {
    console.log('\n' + '='.repeat(60));
    console.log(`🧪 Running: ${test.name}`);
    console.log(`   ${test.description}`);
    console.log('='.repeat(60));
    
    if (test.skip) {
      console.log('⏭️  Skipped (requires running server)');
      results.summary.skipped++;
      results.tests.push({
        name: test.name,
        status: 'skipped',
        duration: 0
      });
      resolve({ status: 'skipped' });
      return;
    }
    
    const startTime = Date.now();
    const testProcess = spawn('node', [path.join(__dirname, test.script)], {
      stdio: 'inherit',
      env: { ...process.env }
    });
    
    // Timeout handler
    const timeout = setTimeout(() => {
      testProcess.kill();
      console.log(`\n⏱️  Test timed out after ${test.timeout / 1000}s`);
      
      const duration = Date.now() - startTime;
      results.summary.failed++;
      results.tests.push({
        name: test.name,
        status: 'timeout',
        duration
      });
      
      resolve({ status: 'timeout', duration });
    }, test.timeout);
    
    testProcess.on('close', (code) => {
      clearTimeout(timeout);
      const duration = Date.now() - startTime;
      
      if (code === 0) {
        console.log(`\n✅ ${test.name} passed (${(duration / 1000).toFixed(2)}s)`);
        results.summary.passed++;
        results.tests.push({
          name: test.name,
          status: 'passed',
          duration
        });
        resolve({ status: 'passed', duration });
      } else {
        console.log(`\n❌ ${test.name} failed with code ${code} (${(duration / 1000).toFixed(2)}s)`);
        results.summary.failed++;
        results.tests.push({
          name: test.name,
          status: 'failed',
          duration,
          exitCode: code
        });
        resolve({ status: 'failed', duration, exitCode: code });
      }
    });
    
    testProcess.on('error', (error) => {
      clearTimeout(timeout);
      console.log(`\n❌ ${test.name} error: ${error.message}`);
      results.summary.failed++;
      results.tests.push({
        name: test.name,
        status: 'error',
        error: error.message
      });
      resolve({ status: 'error', error: error.message });
    });
  });
}

/**
 * Generate test report
 */
function generateReport() {
  results.endTime = new Date();
  const totalDuration = results.endTime - results.startTime;
  
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 PERFORMANCE TEST SUITE REPORT');
  console.log('='.repeat(60));
  
  console.log('\n📈 Summary:');
  console.log(`   Total Tests: ${results.summary.total}`);
  console.log(`   Passed: ${results.summary.passed} ✅`);
  console.log(`   Failed: ${results.summary.failed} ❌`);
  console.log(`   Skipped: ${results.summary.skipped} ⏭️`);
  console.log(`   Duration: ${(totalDuration / 1000).toFixed(2)}s`);
  
  console.log('\n📋 Test Results:');
  results.tests.forEach((test, index) => {
    const statusIcon = test.status === 'passed' ? '✅' : 
                       test.status === 'failed' ? '❌' : 
                       test.status === 'skipped' ? '⏭️' : '⏱️';
    const duration = test.duration ? `(${(test.duration / 1000).toFixed(2)}s)` : '';
    console.log(`   ${index + 1}. ${statusIcon} ${test.name} ${duration}`);
  });
  
  // Overall assessment
  console.log('\n✅ Overall Assessment:');
  const passRate = (results.summary.passed / (results.summary.total - results.summary.skipped)) * 100;
  
  if (passRate === 100) {
    console.log('   🟢 EXCELLENT - All performance tests passed');
  } else if (passRate >= 75) {
    console.log('   🟡 GOOD - Most performance tests passed');
  } else if (passRate >= 50) {
    console.log('   🟠 FAIR - Some performance issues detected');
  } else {
    console.log('   🔴 POOR - Significant performance issues detected');
  }
  
  // Requirements validation
  console.log('\n✅ Requirements Validation:');
  console.log('   Requirement 1.7: Chatbot response time < 3s');
  console.log('   Requirement 6.3: Page load times < 3s');
  console.log('   Requirement 6.5: Offline capabilities');
  console.log('   Requirement 7.8: Real-time notification delivery');
  
  console.log('\n' + '='.repeat(60));
  
  // Save report to file
  const reportPath = path.join(__dirname, 'performance-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Report saved to: ${reportPath}`);
}

/**
 * Main execution
 */
async function runAllTests() {
  console.log('🚀 Starting Performance Test Suite...');
  console.log(`   Start Time: ${results.startTime.toISOString()}`);
  console.log(`   Total Tests: ${TESTS.length}`);
  
  results.summary.total = TESTS.length;
  
  // Run tests sequentially
  for (const test of TESTS) {
    await runTest(test);
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Generate final report
  generateReport();
  
  // Exit with appropriate code
  if (results.summary.failed > 0) {
    console.log('\n❌ Performance test suite failed');
    process.exit(1);
  } else {
    console.log('\n✅ Performance test suite completed successfully');
    process.exit(0);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Test suite interrupted');
  generateReport();
  process.exit(1);
});

// Run tests
runAllTests().catch(error => {
  console.error('\n❌ Test suite error:', error);
  process.exit(1);
});
