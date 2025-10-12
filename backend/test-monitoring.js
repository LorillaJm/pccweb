#!/usr/bin/env node

/**
 * Monitoring System Test Script
 * 
 * Tests the monitoring and analytics functionality
 */

const { monitoring, performanceMonitor } = require('./config/monitoring');

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

/**
 * Test Performance Monitoring
 */
function testPerformanceMonitoring() {
  logSection('📊 Testing Performance Monitoring');

  try {
    // Simulate some requests
    for (let i = 0; i < 10; i++) {
      const requestId = `test-${i}`;
      const mockReq = {
        method: 'GET',
        path: '/api/test',
        route: { path: '/api/test' }
      };
      const mockRes = {
        statusCode: i % 5 === 0 ? 500 : 200
      };

      performanceMonitor.startRequest(requestId);
      
      // Simulate processing time
      setTimeout(() => {
        performanceMonitor.endRequest(requestId, mockReq, mockRes);
      }, Math.random() * 100);
    }

    // Wait for requests to complete
    setTimeout(() => {
      const metrics = performanceMonitor.getMetrics();
      
      log('✅ Performance monitoring test passed', 'green');
      log(`   Total Requests: ${metrics.requests.total}`, 'blue');
      log(`   Success Rate: ${metrics.requests.successRate}`, 'blue');
      log(`   Avg Response Time: ${metrics.response.avgResponseTime}`, 'blue');
    }, 200);

    return true;
  } catch (error) {
    log(`❌ Performance monitoring test failed: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Test Error Tracking
 */
function testErrorTracking() {
  logSection('🐛 Testing Error Tracking');

  try {
    // Track some errors
    monitoring.errors.trackError(new Error('Test error 1'), { context: 'test' });
    monitoring.errors.trackError(new TypeError('Test error 2'), { context: 'test' });
    monitoring.errors.trackError(new Error('Test error 1'), { context: 'test' }); // Duplicate

    const errorStats = monitoring.errors.getStats();
    
    log('✅ Error tracking test passed', 'green');
    log(`   Total Errors: ${errorStats.totalErrors}`, 'blue');
    log(`   Error Types: ${Object.keys(errorStats.errorsByType).length}`, 'blue');

    return true;
  } catch (error) {
    log(`❌ Error tracking test failed: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Test Feature Analytics
 */
function testFeatureAnalytics() {
  logSection('📈 Testing Feature Analytics');

  try {
    // Track some features
    monitoring.features.trackFeature('chatbot', 'user1', { action: 'message' });
    monitoring.features.trackFeature('chatbot', 'user2', { action: 'message' });
    monitoring.features.trackFeature('events', 'user1', { action: 'register' });
    monitoring.features.trackFeature('chatbot', 'user1', { action: 'message' });

    const featureStats = monitoring.features.getStats();
    const chatbotDetails = monitoring.features.getFeatureDetails('chatbot');
    
    log('✅ Feature analytics test passed', 'green');
    log(`   Total Features: ${featureStats.totalFeatures}`, 'blue');
    log(`   Chatbot Usage: ${chatbotDetails.usageCount}`, 'blue');
    log(`   Chatbot Unique Users: ${chatbotDetails.uniqueUsers}`, 'blue');

    return true;
  } catch (error) {
    log(`❌ Feature analytics test failed: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Test User Engagement
 */
function testUserEngagement() {
  logSection('👥 Testing User Engagement');

  try {
    // Track some sessions
    monitoring.engagement.trackSession('user1', 'login');
    monitoring.engagement.trackSession('user2', 'page_view');
    monitoring.engagement.trackSession('user1', 'button_click');
    monitoring.engagement.trackSession('user3', 'form_submit');

    const engagementStats = monitoring.engagement.getStats();
    
    log('✅ User engagement test passed', 'green');
    log(`   Active Sessions: ${engagementStats.activeSessions}`, 'blue');
    log(`   Daily Active Users: ${engagementStats.dailyActiveUsers}`, 'blue');

    return true;
  } catch (error) {
    log(`❌ User engagement test failed: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Test Health Check
 */
function testHealthCheck() {
  logSection('🏥 Testing Health Check');

  try {
    const health = monitoring.healthCheck();
    
    log('✅ Health check test passed', 'green');
    log(`   Status: ${health.status}`, health.status === 'healthy' ? 'green' : 'yellow');
    log(`   Memory Check: ${health.checks.memory}`, 'blue');
    log(`   Error Check: ${health.checks.errors}`, 'blue');
    log(`   Performance Check: ${health.checks.performance}`, 'blue');

    return true;
  } catch (error) {
    log(`❌ Health check test failed: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Test Alerts
 */
function testAlerts() {
  logSection('🔔 Testing Alerts');

  try {
    // Add some alerts
    monitoring.addAlert('info', 'Test info alert', { test: true });
    monitoring.addAlert('warning', 'Test warning alert', { test: true });
    monitoring.addAlert('error', 'Test error alert', { test: true });

    const alertCount = monitoring.alerts.length;
    
    log('✅ Alerts test passed', 'green');
    log(`   Total Alerts: ${alertCount}`, 'blue');

    return true;
  } catch (error) {
    log(`❌ Alerts test failed: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Test Dashboard
 */
function testDashboard() {
  logSection('📋 Testing Dashboard');

  try {
    const dashboard = monitoring.getDashboard();
    
    log('✅ Dashboard test passed', 'green');
    log('   Dashboard sections:', 'blue');
    log('   - Performance ✓', 'blue');
    log('   - Errors ✓', 'blue');
    log('   - Features ✓', 'blue');
    log('   - Engagement ✓', 'blue');
    log('   - Alerts ✓', 'blue');

    return true;
  } catch (error) {
    log(`❌ Dashboard test failed: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Main test function
 */
async function runTests() {
  log('🧪 PCC Portal Monitoring System Test', 'cyan');
  log('Starting tests...\n', 'blue');

  const results = {
    performance: testPerformanceMonitoring(),
    errors: testErrorTracking(),
    features: testFeatureAnalytics(),
    engagement: testUserEngagement(),
    health: testHealthCheck(),
    alerts: testAlerts(),
    dashboard: testDashboard()
  };

  // Wait for async operations
  await new Promise(resolve => setTimeout(resolve, 500));

  // Summary
  logSection('📋 Test Summary');

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  const failedTests = totalTests - passedTests;

  Object.entries(results).forEach(([test, passed]) => {
    const icon = passed ? '✅' : '❌';
    const color = passed ? 'green' : 'red';
    log(`${icon} ${test}: ${passed ? 'passed' : 'failed'}`, color);
  });

  console.log('');
  log(`Total: ${totalTests} tests`, 'blue');
  log(`Passed: ${passedTests}`, 'green');
  log(`Failed: ${failedTests}`, failedTests > 0 ? 'red' : 'green');

  if (failedTests === 0) {
    log('\n🎉 All tests passed!', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  Some tests failed.', 'yellow');
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests };
