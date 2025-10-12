const mongoose = require('mongoose');
const request = require('supertest');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const User = require('./models/User');
require('dotenv').config();

// Test suite for enhanced /auth/me endpoint
async function runTests() {
  console.log('='.repeat(60));
  console.log('Enhanced /auth/me Endpoint Tests');
  console.log('='.repeat(60));
  console.log('');
  
  let app;
  let testUser;
  let testsPassed = 0;
  let testsFailed = 0;

  // Setup test app
  async function setupTestApp() {
    app = express();
    app.use(express.json());
    
    // Session configuration
    app.use(session({
      secret: 'test-secret-key-12345',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
        secure: false
      }
    }));
    
    app.use(passport.initialize());
    app.use(passport.session());
    
    // Configure passport
    require('./config/passport');
    
    // Mount auth routes
    const authRoutes = require('./routes/auth-new');
    app.use('/auth', authRoutes);
    
    return app;
  }

  // Helper function to run a test
  async function runTest(name, testFn) {
    try {
      await testFn();
      console.log(`✓ ${name}`);
      testsPassed++;
    } catch (error) {
      console.log(`✗ ${name}`);
      console.log(`  Error: ${error.message}`);
      testsFailed++;
    }
  }

  // Helper to assert
  function assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  try {
    // Connect to test database
    console.log('Connecting to database...');
    const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pcc-portal';
    await mongoose.connect(dbUri);
    console.log('✓ Database connected\n');

    // Setup app
    app = await setupTestApp();

    // Clear and create test user
    console.log('Setting up test data...');
    await User.deleteMany({ email: 'test-auth-me@example.com' });
    testUser = await User.create({
      email: 'test-auth-me@example.com',
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User',
      role: 'student',
      authProvider: 'local',
      isActive: true
    });
    console.log('✓ Test user created\n');

    console.log('Running tests...\n');

    // Test 1: Valid session returns user data
    await runTest('Should return user data with valid session', async () => {
      const loginRes = await request(app)
        .post('/auth/login')
        .send({
          email: 'test-auth-me@example.com',
          password: 'TestPassword123!'
        });

      assert(loginRes.status === 200, `Login failed with status ${loginRes.status}`);
      const cookies = loginRes.headers['set-cookie'];

      const res = await request(app)
        .get('/auth/me')
        .set('Cookie', cookies);

      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(res.body.success === true, 'Expected success to be true');
      assert(res.body.sessionStatus === 'valid', 'Expected sessionStatus to be valid');
      assert(res.body.data.user.email === 'test-auth-me@example.com', 'Email mismatch');
    });

    // Test 2: Session health indicators
    await runTest('Should include session health indicators', async () => {
      const loginRes = await request(app)
        .post('/auth/login')
        .send({
          email: 'test-auth-me@example.com',
          password: 'TestPassword123!'
        });

      const cookies = loginRes.headers['set-cookie'];

      const res = await request(app)
        .get('/auth/me')
        .set('Cookie', cookies);

      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(res.body.data.sessionInfo !== undefined, 'sessionInfo missing');
      assert(res.body.data.sessionInfo.expiresAt !== undefined, 'expiresAt missing');
      assert(res.body.data.sessionInfo.expiresIn !== undefined, 'expiresIn missing');
      assert(res.body.data.sessionInfo.isValid === true, 'isValid should be true');
      assert(typeof res.body.data.sessionInfo.needsRenewal === 'boolean', 'needsRenewal should be boolean');
    });

    // Test 3: Missing session returns 401
    await runTest('Should return 401 for missing session', async () => {
      const res = await request(app)
        .get('/auth/me');

      assert(res.status === 401, `Expected 401, got ${res.status}`);
      assert(res.body.success === false, 'Expected success to be false');
      assert(res.body.sessionStatus === 'invalid', 'Expected sessionStatus to be invalid');
    });

    // Test 4: Invalid session returns 401
    await runTest('Should return 401 for invalid session', async () => {
      const res = await request(app)
        .get('/auth/me')
        .set('Cookie', ['connect.sid=s%3Ainvalid-session-id.invalid']);

      assert(res.status === 401, `Expected 401, got ${res.status}`);
      assert(res.body.success === false, 'Expected success to be false');
    });

    // Test 5: Deactivated user returns 403
    await runTest('Should return 403 for deactivated user', async () => {
      const loginRes = await request(app)
        .post('/auth/login')
        .send({
          email: 'test-auth-me@example.com',
          password: 'TestPassword123!'
        });

      const cookies = loginRes.headers['set-cookie'];

      await User.findByIdAndUpdate(testUser._id, { isActive: false });

      const res = await request(app)
        .get('/auth/me')
        .set('Cookie', cookies);

      assert(res.status === 403, `Expected 403, got ${res.status}`);
      assert(res.body.success === false, 'Expected success to be false');
      assert(res.body.sessionStatus === 'invalid', 'Expected sessionStatus to be invalid');
      assert(res.body.message.includes('deactivated'), 'Expected deactivated message');

      await User.findByIdAndUpdate(testUser._id, { isActive: true });
    });

    // Test 6: User not found returns 401
    await runTest('Should return 401 when user not found', async () => {
      const tempUser = await User.create({
        email: 'temp-user@example.com',
        password: 'TempPassword123!',
        firstName: 'Temp',
        lastName: 'User',
        role: 'student',
        authProvider: 'local',
        isActive: true
      });

      const loginRes = await request(app)
        .post('/auth/login')
        .send({
          email: 'temp-user@example.com',
          password: 'TempPassword123!'
        });

      const cookies = loginRes.headers['set-cookie'];

      await User.findByIdAndDelete(tempUser._id);

      const res = await request(app)
        .get('/auth/me')
        .set('Cookie', cookies);

      assert(res.status === 401, `Expected 401, got ${res.status}`);
      assert(res.body.success === false, 'Expected success to be false');
      assert(res.body.sessionStatus === 'invalid' || res.body.sessionStatus === 'expired', 
        'Expected sessionStatus to be invalid or expired');
      // Session validation middleware catches this first, which is correct behavior
      assert(res.body.message.includes('authenticated') || res.body.message.includes('User account'), 
        `Expected authentication error message, got: ${res.body.message}`);
    });

    // Test 7: Session expiration calculation
    await runTest('Should calculate session expiration correctly', async () => {
      const loginRes = await request(app)
        .post('/auth/login')
        .send({
          email: 'test-auth-me@example.com',
          password: 'TestPassword123!'
        });

      const cookies = loginRes.headers['set-cookie'];

      const res = await request(app)
        .get('/auth/me')
        .set('Cookie', cookies);

      assert(res.status === 200, `Expected 200, got ${res.status}`);
      
      const expiresIn = res.body.data.sessionInfo.expiresIn;
      assert(expiresIn > 0, 'expiresIn should be positive');
      assert(expiresIn <= 24 * 60 * 60, 'expiresIn should be <= 24 hours');
      
      const expiresAt = new Date(res.body.data.sessionInfo.expiresAt);
      assert(!isNaN(expiresAt.getTime()), 'expiresAt should be a valid date');
    });

    // Test 8: Response includes all required user fields
    await runTest('Should include all required user fields', async () => {
      const loginRes = await request(app)
        .post('/auth/login')
        .send({
          email: 'test-auth-me@example.com',
          password: 'TestPassword123!'
        });

      const cookies = loginRes.headers['set-cookie'];

      const res = await request(app)
        .get('/auth/me')
        .set('Cookie', cookies);

      assert(res.status === 200, `Expected 200, got ${res.status}`);
      
      const user = res.body.data.user;
      assert(user.id !== undefined, 'id missing');
      assert(user.email !== undefined, 'email missing');
      assert(user.role !== undefined, 'role missing');
      assert(user.firstName !== undefined, 'firstName missing');
      assert(user.lastName !== undefined, 'lastName missing');
      assert(user.authProvider !== undefined, 'authProvider missing');
      assert(user.createdAt !== undefined, 'createdAt missing');
      assert(user.updatedAt !== undefined, 'updatedAt missing');
    });

    // Test 9: Password field not included in response
    await runTest('Should not include password in response', async () => {
      const loginRes = await request(app)
        .post('/auth/login')
        .send({
          email: 'test-auth-me@example.com',
          password: 'TestPassword123!'
        });

      const cookies = loginRes.headers['set-cookie'];

      const res = await request(app)
        .get('/auth/me')
        .set('Cookie', cookies);

      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(res.body.data.user.password === undefined, 'Password should not be included');
    });

    console.log('\n' + '='.repeat(60));
    console.log(`Tests completed: ${testsPassed} passed, ${testsFailed} failed`);
    console.log('='.repeat(60));

    // Cleanup
    await User.deleteMany({ email: { $in: ['test-auth-me@example.com', 'temp-user@example.com'] } });
    await mongoose.connection.close();

    process.exit(testsFailed > 0 ? 1 : 0);

  } catch (error) {
    console.error('\n✗ Test suite failed:', error.message);
    console.error(error.stack);
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    
    process.exit(1);
  }
}

// Run tests
runTests();
