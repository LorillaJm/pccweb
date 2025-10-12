#!/usr/bin/env node

/**
 * Quick verification script for E2E test fixes
 * Tests that all required models and routes are properly configured
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

// Import models to verify they load correctly
const User = require('./models/User');
const Company = require('./models/Company');
const DigitalID = require('./models/DigitalID');
const AccessLog = require('./models/AccessLog');
const Internship = require('./models/Internship');
const InternshipApplication = require('./models/InternshipApplication');
const AlumniProfile = require('./models/AlumniProfile');
const JobPosting = require('./models/JobPosting');
const Event = require('./models/Event');
const EventTicket = require('./models/EventTicket');

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

function logInfo(message) {
  console.log(`${colors.blue}ℹ${colors.reset} ${message}`);
}

async function verifyFixes() {
  console.log('\n' + '='.repeat(60));
  console.log('E2E TEST FIXES VERIFICATION');
  console.log('='.repeat(60) + '\n');

  let allPassed = true;

  // Test 1: Verify User model has new roles
  logInfo('Test 1: Verifying User model roles...');
  try {
    const userSchema = User.schema.path('role');
    const enumValues = userSchema.enumValues;
    
    if (enumValues.includes('alumni') && enumValues.includes('company')) {
      logSuccess('User model has alumni and company roles');
    } else {
      logError('User model missing alumni or company roles');
      allPassed = false;
    }
  } catch (error) {
    logError(`User model verification failed: ${error.message}`);
    allPassed = false;
  }

  // Test 2: Verify Company model exists
  logInfo('Test 2: Verifying Company model...');
  try {
    const companySchema = Company.schema;
    if (companySchema) {
      logSuccess('Company model exists and loads correctly');
    }
  } catch (error) {
    logError(`Company model verification failed: ${error.message}`);
    allPassed = false;
  }

  // Test 3: Verify DigitalID model
  logInfo('Test 3: Verifying DigitalID model...');
  try {
    const digitalIdSchema = DigitalID.schema;
    if (digitalIdSchema) {
      logSuccess('DigitalID model exists and loads correctly');
    }
  } catch (error) {
    logError(`DigitalID model verification failed: ${error.message}`);
    allPassed = false;
  }

  // Test 4: Verify AccessLog model
  logInfo('Test 4: Verifying AccessLog model...');
  try {
    const accessLogSchema = AccessLog.schema;
    if (accessLogSchema) {
      logSuccess('AccessLog model exists and loads correctly');
    }
  } catch (error) {
    logError(`AccessLog model verification failed: ${error.message}`);
    allPassed = false;
  }

  // Test 5: Verify Internship models
  logInfo('Test 5: Verifying Internship models...');
  try {
    const internshipSchema = Internship.schema;
    const applicationSchema = InternshipApplication.schema;
    if (internshipSchema && applicationSchema) {
      logSuccess('Internship and InternshipApplication models exist');
    }
  } catch (error) {
    logError(`Internship models verification failed: ${error.message}`);
    allPassed = false;
  }

  // Test 6: Verify Alumni models
  logInfo('Test 6: Verifying Alumni models...');
  try {
    const alumniSchema = AlumniProfile.schema;
    const jobSchema = JobPosting.schema;
    if (alumniSchema && jobSchema) {
      logSuccess('AlumniProfile and JobPosting models exist');
    }
  } catch (error) {
    logError(`Alumni models verification failed: ${error.message}`);
    allPassed = false;
  }

  // Test 7: Verify Event models
  logInfo('Test 7: Verifying Event models...');
  try {
    const eventSchema = Event.schema;
    const ticketSchema = EventTicket.schema;
    if (eventSchema && ticketSchema) {
      logSuccess('Event and EventTicket models exist');
    }
  } catch (error) {
    logError(`Event models verification failed: ${error.message}`);
    allPassed = false;
  }

  // Test 8: Verify routes file exists
  logInfo('Test 8: Verifying digital-id routes file...');
  try {
    const fs = require('fs');
    const path = require('path');
    const routePath = path.join(__dirname, 'routes', 'digital-id.js');
    
    if (fs.existsSync(routePath)) {
      logSuccess('Digital ID routes file exists');
      
      // Try to require it
      const digitalIdRoutes = require('./routes/digital-id');
      if (digitalIdRoutes) {
        logSuccess('Digital ID routes load correctly');
      }
    } else {
      logError('Digital ID routes file not found');
      allPassed = false;
    }
  } catch (error) {
    logError(`Digital ID routes verification failed: ${error.message}`);
    allPassed = false;
  }

  // Test 9: Verify server.js has route registrations
  logInfo('Test 9: Verifying server.js route registrations...');
  try {
    const fs = require('fs');
    const path = require('path');
    const serverPath = path.join(__dirname, 'server.js');
    const serverContent = fs.readFileSync(serverPath, 'utf8');
    
    const hasDigitalIdRoute = serverContent.includes("require('./routes/digital-id')");
    const hasInternshipsRoute = serverContent.includes("require('./routes/internships')");
    const hasDigitalIdUse = serverContent.includes("app.use('/api/digital-id'");
    const hasInternshipsUse = serverContent.includes("app.use('/api/internships'");
    
    if (hasDigitalIdRoute && hasDigitalIdUse) {
      logSuccess('Digital ID routes registered in server.js');
    } else {
      logError('Digital ID routes not properly registered in server.js');
      allPassed = false;
    }
    
    if (hasInternshipsRoute && hasInternshipsUse) {
      logSuccess('Internships routes registered in server.js');
    } else {
      logError('Internships routes not properly registered in server.js');
      allPassed = false;
    }
  } catch (error) {
    logError(`Server.js verification failed: ${error.message}`);
    allPassed = false;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  if (allPassed) {
    logSuccess('ALL VERIFICATIONS PASSED');
    console.log('\nYou can now run the E2E tests:');
    console.log('  node test-e2e-complete-workflows.js');
  } else {
    logError('SOME VERIFICATIONS FAILED');
    console.log('\nPlease review the errors above before running E2E tests.');
  }
  console.log('='.repeat(60) + '\n');

  return allPassed;
}

// Run verification
verifyFixes()
  .then(passed => {
    process.exit(passed ? 0 : 1);
  })
  .catch(error => {
    console.error('Verification script error:', error);
    process.exit(1);
  });
