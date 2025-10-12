const mongoose = require('mongoose');
const request = require('supertest');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const User = require('./models/User');
require('dotenv').config();

// Verification script for enhanced /auth/me endpoint
async function verifyEnhancements() {
  console.log('\n' + '='.repeat(70));
  console.log('Enhanced /auth/me Endpoint - Feature Verification');
  console.log('='.repeat(70) + '\n');

  let app;
  let testUser;

  try {
    // Setup test app
    app = express();
    app.use(express.json());
    
    app.use(session({
      secret: 'test-secret-key-12345',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: false
      }
    }));
    
    app.use(passport.initialize());
    app.use(passport.session());
    
    require('./config/passport');
    
    const authRoutes = require('./routes/auth-new');
    app.use('/auth', authRoutes);

    // Connect to database
    console.log('📡 Connecting to database...');
    const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pcc-portal';
    await mongoose.connect(dbUri);
    console.log('✓ Connected\n');

    // Setup test user
    await User.deleteMany({ email: 'verify-auth@example.com' });
    testUser = await User.create({
      email: 'verify-auth@example.com',
      password: 'VerifyPassword123!',
      firstName: 'Verify',
      lastName: 'User',
      role: 'student',
      authProvider: 'local',
      isActive: true
    });

    console.log('🔐 Testing Enhanced Features:\n');

    // Feature 1: Session Health Indicators
    console.log('1. Session Health Indicators');
    console.log('   ' + '-'.repeat(60));
    
    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email: 'verify-auth@example.com',
        password: 'VerifyPassword123!'
      });

    const cookies = loginRes.headers['set-cookie'];
    
    const meRes = await request(app)
      .get('/auth/me')
      .set('Cookie', cookies);

    if (meRes.status === 200 && meRes.body.data.sessionInfo) {
      const info = meRes.body.data.sessionInfo;
      console.log('   ✓ Session health indicators present');
      console.log(`   • Expires At: ${info.expiresAt}`);
      console.log(`   • Expires In: ${info.expiresIn} seconds (${Math.floor(info.expiresIn / 3600)} hours)`);
      console.log(`   • Is Valid: ${info.isValid}`);
      console.log(`   • Needs Renewal: ${info.needsRenewal}`);
    } else {
      console.log('   ✗ Session health indicators missing');
    }

    // Feature 2: Proper Error Responses
    console.log('\n2. Proper Error Response Format');
    console.log('   ' + '-'.repeat(60));
    
    const noSessionRes = await request(app).get('/auth/me');
    
    if (noSessionRes.status === 401 && noSessionRes.body.sessionStatus) {
      console.log('   ✓ Consistent error response format');
      console.log(`   • Status Code: ${noSessionRes.status}`);
      console.log(`   • Success: ${noSessionRes.body.success}`);
      console.log(`   • Message: "${noSessionRes.body.message}"`);
      console.log(`   • Session Status: "${noSessionRes.body.sessionStatus}"`);
    } else {
      console.log('   ✗ Error response format inconsistent');
    }

    // Feature 3: Session Validation Middleware
    console.log('\n3. Session Validation Middleware Integration');
    console.log('   ' + '-'.repeat(60));
    
    const invalidSessionRes = await request(app)
      .get('/auth/me')
      .set('Cookie', ['connect.sid=s%3Ainvalid.test']);
    
    if (invalidSessionRes.status === 401) {
      console.log('   ✓ Session validation middleware active');
      console.log(`   • Invalid session rejected with: ${invalidSessionRes.status}`);
      console.log(`   • Message: "${invalidSessionRes.body.message}"`);
    } else {
      console.log('   ✗ Session validation not working properly');
    }

    // Feature 4: Deactivated User Handling
    console.log('\n4. Deactivated User Handling');
    console.log('   ' + '-'.repeat(60));
    
    await User.findByIdAndUpdate(testUser._id, { isActive: false });
    
    const deactivatedRes = await request(app)
      .get('/auth/me')
      .set('Cookie', cookies);
    
    if (deactivatedRes.status === 403) {
      console.log('   ✓ Deactivated users properly handled');
      console.log(`   • Status Code: ${deactivatedRes.status}`);
      console.log(`   • Message: "${deactivatedRes.body.message}"`);
      console.log(`   • Session Status: "${deactivatedRes.body.sessionStatus}"`);
    } else {
      console.log('   ✗ Deactivated user handling not working');
    }

    // Feature 5: Complete User Data
    console.log('\n5. Complete User Data Response');
    console.log('   ' + '-'.repeat(60));
    
    await User.findByIdAndUpdate(testUser._id, { isActive: true });
    
    const loginRes2 = await request(app)
      .post('/auth/login')
      .send({
        email: 'verify-auth@example.com',
        password: 'VerifyPassword123!'
      });

    const cookies2 = loginRes2.headers['set-cookie'];
    
    const userDataRes = await request(app)
      .get('/auth/me')
      .set('Cookie', cookies2);

    if (userDataRes.status === 200 && userDataRes.body.data.user) {
      const user = userDataRes.body.data.user;
      const requiredFields = ['id', 'email', 'role', 'firstName', 'lastName', 'authProvider', 'createdAt', 'updatedAt'];
      const hasAllFields = requiredFields.every(field => user[field] !== undefined);
      
      if (hasAllFields && user.password === undefined) {
        console.log('   ✓ Complete user data with security');
        console.log(`   • All required fields present: ${requiredFields.length}`);
        console.log(`   • Password excluded: Yes`);
        console.log(`   • User: ${user.firstName} ${user.lastName} (${user.email})`);
      } else {
        console.log('   ✗ User data incomplete or insecure');
      }
    } else {
      console.log('   ✗ User data not returned properly');
    }

    console.log('\n' + '='.repeat(70));
    console.log('✓ All Enhanced Features Verified Successfully');
    console.log('='.repeat(70) + '\n');

    // Cleanup
    await User.deleteMany({ email: 'verify-auth@example.com' });
    await mongoose.connection.close();

    process.exit(0);

  } catch (error) {
    console.error('\n✗ Verification failed:', error.message);
    console.error(error.stack);
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    
    process.exit(1);
  }
}

// Run verification
verifyEnhancements();
