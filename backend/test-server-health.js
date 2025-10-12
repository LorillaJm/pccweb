#!/usr/bin/env node

/**
 * Quick server health check
 * Tests if the server is running and responding
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function checkHealth() {
  console.log('Checking server health...\n');
  
  try {
    // Test 1: Health endpoint
    console.log('1. Testing /api/health...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`, { timeout: 5000 });
    console.log('   ✓ Health endpoint OK:', healthResponse.data.status);
    
    // Test 2: Alumni routes exist
    console.log('\n2. Testing /api/alumni/jobs...');
    try {
      const jobsResponse = await axios.get(`${BASE_URL}/api/alumni/jobs`, { timeout: 5000 });
      console.log('   ✓ Alumni jobs endpoint OK');
    } catch (error) {
      if (error.response) {
        console.log(`   ⚠ Alumni jobs endpoint responded with ${error.response.status}`);
        console.log('   Response:', error.response.data);
      } else {
        throw error;
      }
    }
    
    // Test 3: Digital ID routes
    console.log('\n3. Testing /api/digital-id/...');
    try {
      const digitalIdResponse = await axios.post(`${BASE_URL}/api/digital-id/generate`, 
        { userId: '507f1f77bcf86cd799439011' }, 
        { timeout: 5000 }
      );
      console.log('   ✓ Digital ID endpoint OK');
    } catch (error) {
      if (error.response) {
        console.log(`   ⚠ Digital ID endpoint responded with ${error.response.status}`);
        console.log('   Response:', error.response.data);
      } else {
        throw error;
      }
    }
    
    // Test 4: Internships routes
    console.log('\n4. Testing /api/internships...');
    try {
      const internshipsResponse = await axios.get(`${BASE_URL}/api/internships`, { timeout: 5000 });
      console.log('   ✓ Internships endpoint OK');
    } catch (error) {
      if (error.response) {
        console.log(`   ⚠ Internships endpoint responded with ${error.response.status}`);
        console.log('   Response:', error.response.data);
      } else {
        throw error;
      }
    }
    
    console.log('\n✓ Server is running and responding to requests');
    console.log('\nYou can now run the E2E tests:');
    console.log('  node test-e2e-complete-workflows.js');
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('\n✗ Server is NOT running!');
      console.log('\nPlease start the server first:');
      console.log('  cd backend');
      console.log('  npm start');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('\n✗ Server is not responding (timeout)');
      console.log('\nThe server might be starting up or having issues.');
      console.log('Check the server logs for errors.');
    } else {
      console.log('\n✗ Error checking server health:');
      console.log(error.message);
    }
    process.exit(1);
  }
}

checkHealth();
