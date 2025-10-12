#!/usr/bin/env node

/**
 * Simple script to test if the backend server and chatbot routes are working
 */

const http = require('http');

function testEndpoint(host, port, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: host,
      port: port,
      path: path,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data,
          headers: res.headers
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function runTests() {
  console.log('🔍 Testing Backend Connection...\n');

  const tests = [
    { name: 'Backend Health Check', path: '/api/health' },
    { name: 'Chatbot Categories', path: '/api/chatbot/categories' }
  ];

  for (const test of tests) {
    try {
      console.log(`Testing ${test.name}...`);
      const result = await testEndpoint('localhost', 5000, test.path);
      
      if (result.status === 200) {
        console.log(`✅ ${test.name}: OK (Status: ${result.status})`);
      } else {
        console.log(`⚠️ ${test.name}: Unexpected status ${result.status}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: Failed - ${error.message}`);
      
      if (error.code === 'ECONNREFUSED') {
        console.log('   💡 Backend server might not be running on port 5000');
        console.log('   💡 Try: cd backend && npm run dev');
      }
    }
    console.log('');
  }

  console.log('📋 Next Steps:');
  console.log('1. Make sure backend server is running: cd backend && npm run dev');
  console.log('2. Make sure frontend server is running: npm run dev');
  console.log('3. Visit http://localhost:3000 and log in to test the chatbot');
  console.log('4. Look for the blue chat bubble in the bottom-right corner');
}

runTests().catch(console.error);