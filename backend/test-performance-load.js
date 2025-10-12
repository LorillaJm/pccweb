/**
 * Performance Load Testing Suite
 * Tests system performance under various load conditions
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

const BASE_URL = process.env.API_URL || 'http://localhost:5000';
const TEST_DURATION = 30000; // 30 seconds
const CONCURRENT_USERS = [10, 50, 100, 200];

// Performance metrics storage
const metrics = {
  requests: [],
  errors: [],
  responseTime: {
    min: Infinity,
    max: 0,
    avg: 0,
    p95: 0,
    p99: 0
  },
  throughput: 0,
  errorRate: 0
};

// Test user credentials
const testUsers = [];
for (let i = 0; i < 200; i++) {
  testUsers.push({
    email: `loadtest${i}@test.com`,
    password: 'TestPassword123!',
    token: null
  });
}

/**
 * Simulate user authentication
 */
async function authenticateUser(user) {
  const start = performance.now();
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: user.email,
      password: user.password
    }, { timeout: 10000 });
    
    const duration = performance.now() - start;
    user.token = response.data.token;
    
    metrics.requests.push({
      endpoint: '/api/auth/login',
      duration,
      status: response.status,
      success: true
    });
    
    return true;
  } catch (error) {
    const duration = performance.now() - start;
    metrics.requests.push({
      endpoint: '/api/auth/login',
      duration,
      status: error.response?.status || 0,
      success: false,
      error: error.message
    });
    metrics.errors.push(error.message);
    return false;
  }
}

/**
 * Simulate API request
 */
async function makeRequest(endpoint, method = 'GET', data = null, token = null) {
  const start = performance.now();
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      timeout: 10000,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    const duration = performance.now() - start;
    
    metrics.requests.push({
      endpoint,
      method,
      duration,
      status: response.status,
      success: true
    });
    
    return { success: true, duration, data: response.data };
  } catch (error) {
    const duration = performance.now() - start;
    metrics.requests.push({
      endpoint,
      method,
      duration,
      status: error.response?.status || 0,
      success: false,
      error: error.message
    });
    metrics.errors.push(error.message);
    return { success: false, duration, error: error.message };
  }
}

/**
 * Simulate user workflow
 */
async function simulateUserWorkflow(user) {
  // Login
  const authenticated = await authenticateUser(user);
  if (!authenticated) return;
  
  // Browse events
  await makeRequest('/api/events', 'GET', null, user.token);
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // View notifications
  await makeRequest('/api/notifications', 'GET', null, user.token);
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Check digital ID
  await makeRequest('/api/digital-id', 'GET', null, user.token);
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Browse internships
  await makeRequest('/api/internships', 'GET', null, user.token);
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Chatbot interaction
  await makeRequest('/api/chatbot/message', 'POST', {
    message: 'What are the admission requirements?',
    sessionId: `session-${user.email}`
  }, user.token);
}

/**
 * Run load test with specified concurrent users
 */
async function runLoadTest(concurrentUsers) {
  console.log(`\n🔄 Running load test with ${concurrentUsers} concurrent users...`);
  
  const startTime = Date.now();
  const promises = [];
  
  // Start concurrent user simulations
  for (let i = 0; i < concurrentUsers; i++) {
    const user = testUsers[i % testUsers.length];
    promises.push(simulateUserWorkflow(user));
  }
  
  // Wait for all requests to complete or timeout
  await Promise.allSettled(promises);
  
  const duration = Date.now() - startTime;
  console.log(`✅ Load test completed in ${duration}ms`);
  
  return duration;
}

/**
 * Calculate performance metrics
 */
function calculateMetrics() {
  const successfulRequests = metrics.requests.filter(r => r.success);
  const durations = successfulRequests.map(r => r.duration).sort((a, b) => a - b);
  
  if (durations.length > 0) {
    metrics.responseTime.min = durations[0];
    metrics.responseTime.max = durations[durations.length - 1];
    metrics.responseTime.avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    metrics.responseTime.p95 = durations[Math.floor(durations.length * 0.95)];
    metrics.responseTime.p99 = durations[Math.floor(durations.length * 0.99)];
  }
  
  metrics.throughput = metrics.requests.length / (TEST_DURATION / 1000);
  metrics.errorRate = (metrics.errors.length / metrics.requests.length) * 100;
}

/**
 * Display performance report
 */
function displayReport() {
  calculateMetrics();
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 PERFORMANCE LOAD TEST REPORT');
  console.log('='.repeat(60));
  
  console.log('\n📈 Request Statistics:');
  console.log(`   Total Requests: ${metrics.requests.length}`);
  console.log(`   Successful: ${metrics.requests.filter(r => r.success).length}`);
  console.log(`   Failed: ${metrics.errors.length}`);
  console.log(`   Error Rate: ${metrics.errorRate.toFixed(2)}%`);
  
  console.log('\n⏱️  Response Time (ms):');
  console.log(`   Min: ${metrics.responseTime.min.toFixed(2)}`);
  console.log(`   Max: ${metrics.responseTime.max.toFixed(2)}`);
  console.log(`   Average: ${metrics.responseTime.avg.toFixed(2)}`);
  console.log(`   95th Percentile: ${metrics.responseTime.p95.toFixed(2)}`);
  console.log(`   99th Percentile: ${metrics.responseTime.p99.toFixed(2)}`);
  
  console.log('\n🚀 Throughput:');
  console.log(`   Requests/second: ${metrics.throughput.toFixed(2)}`);
  
  // Endpoint breakdown
  const endpointStats = {};
  metrics.requests.forEach(req => {
    if (!endpointStats[req.endpoint]) {
      endpointStats[req.endpoint] = { count: 0, totalDuration: 0, errors: 0 };
    }
    endpointStats[req.endpoint].count++;
    endpointStats[req.endpoint].totalDuration += req.duration;
    if (!req.success) endpointStats[req.endpoint].errors++;
  });
  
  console.log('\n📍 Endpoint Performance:');
  Object.entries(endpointStats).forEach(([endpoint, stats]) => {
    const avgDuration = stats.totalDuration / stats.count;
    const errorRate = (stats.errors / stats.count) * 100;
    console.log(`   ${endpoint}:`);
    console.log(`      Requests: ${stats.count}, Avg: ${avgDuration.toFixed(2)}ms, Errors: ${errorRate.toFixed(1)}%`);
  });
  
  // Performance assessment
  console.log('\n✅ Performance Assessment:');
  const avgResponseTime = metrics.responseTime.avg;
  const p95ResponseTime = metrics.responseTime.p95;
  
  if (avgResponseTime < 200 && p95ResponseTime < 500) {
    console.log('   🟢 EXCELLENT - System performs well under load');
  } else if (avgResponseTime < 500 && p95ResponseTime < 1000) {
    console.log('   🟡 GOOD - System performance is acceptable');
  } else if (avgResponseTime < 1000 && p95ResponseTime < 2000) {
    console.log('   🟠 FAIR - System shows signs of stress');
  } else {
    console.log('   🔴 POOR - System performance needs optimization');
  }
  
  if (metrics.errorRate > 5) {
    console.log('   ⚠️  WARNING - High error rate detected');
  }
  
  console.log('\n' + '='.repeat(60));
}

/**
 * Main test execution
 */
async function runPerformanceTests() {
  console.log('🚀 Starting Performance Load Tests...');
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Test Duration: ${TEST_DURATION / 1000}s per load level`);
  
  try {
    // Test with increasing load
    for (const userCount of CONCURRENT_USERS) {
      await runLoadTest(userCount);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Cool down
    }
    
    displayReport();
    
    // Exit with appropriate code
    if (metrics.errorRate > 10 || metrics.responseTime.avg > 1000) {
      console.log('\n❌ Performance tests failed - system performance below threshold');
      process.exit(1);
    } else {
      console.log('\n✅ Performance tests passed - system performance acceptable');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n❌ Performance test error:', error.message);
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runPerformanceTests();
}

module.exports = { runPerformanceTests, makeRequest, calculateMetrics };
