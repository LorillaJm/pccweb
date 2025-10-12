#!/usr/bin/env node

/**
 * Notification Models Test Script
 * Tests the Notification and NotificationPreferences models
 */

require('dotenv').config();

const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const NotificationPreferences = require('./models/NotificationPreferences');
const User = require('./models/User');

// Test data
const testUser = {
  email: 'test.notification@example.com',
  password: 'testpassword123',
  firstName: 'Test',
  lastName: 'User',
  role: 'student'
};

const testNotification = {
  title: 'Test Notification',
  message: 'This is a test notification message',
  type: 'info',
  category: 'academic',
  priority: 'medium',
  channels: [
    { type: 'web', status: 'pending' },
    { type: 'email', status: 'pending' }
  ]
};

async function connectToDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pcc_portal_test';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (error) {
    console.log('❌ MongoDB connection failed:', error.message);
    return false;
  }
}

async function cleanupTestData() {
  try {
    await User.deleteMany({ email: testUser.email });
    await Notification.deleteMany({ title: testNotification.title });
    await NotificationPreferences.deleteMany({});
    console.log('🧹 Cleaned up test data');
  } catch (error) {
    console.log('⚠️ Cleanup warning:', error.message);
  }
}

async function testNotificationModel() {
  console.log('\n📧 Testing Notification Model...');
  
  const results = {
    creation: false,
    validation: false,
    indexes: false,
    methods: false,
    statics: false
  };

  try {
    // Create test user first
    const user = await User.create(testUser);
    
    // Test 1: Basic notification creation
    console.log('   Testing notification creation...');
    const notification = await Notification.create({
      ...testNotification,
      userId: user._id
    });
    
    if (notification && notification._id) {
      console.log('   ✅ Notification created successfully');
      results.creation = true;
    }

    // Test 2: Validation tests
    console.log('   Testing validation rules...');
    try {
      // Test required fields
      await Notification.create({
        userId: user._id,
        message: 'Missing title'
        // title is missing - should fail
      });
      console.log('   ❌ Validation test failed - should have required title');
    } catch (validationError) {
      if (validationError.name === 'ValidationError') {
        console.log('   ✅ Required field validation working');
        results.validation = true;
      }
    }

    // Test enum validation
    try {
      await Notification.create({
        ...testNotification,
        userId: user._id,
        type: 'invalid_type'
      });
      console.log('   ❌ Enum validation failed');
    } catch (enumError) {
      if (enumError.name === 'ValidationError') {
        console.log('   ✅ Enum validation working');
      }
    }

    // Test 3: Index verification
    console.log('   Testing database indexes...');
    const indexes = await Notification.collection.getIndexes();
    const expectedIndexes = ['userId_1', 'type_1', 'category_1', 'priority_1', 'isRead_1'];
    const hasRequiredIndexes = expectedIndexes.some(idx => 
      Object.keys(indexes).some(existingIdx => existingIdx.includes(idx.split('_')[0]))
    );
    
    if (hasRequiredIndexes) {
      console.log('   ✅ Database indexes created');
      results.indexes = true;
    }

    // Test 4: Instance methods
    console.log('   Testing instance methods...');
    
    // Test markAsRead method
    const wasRead = notification.isRead;
    await notification.markAsRead();
    
    if (!wasRead && notification.isRead && notification.readAt) {
      console.log('   ✅ markAsRead method working');
    }

    // Test updateChannelStatus method
    await notification.updateChannelStatus('web', 'sent');
    const webChannel = notification.channels.find(ch => ch.type === 'web');
    
    if (webChannel && webChannel.status === 'sent' && webChannel.sentAt) {
      console.log('   ✅ updateChannelStatus method working');
      results.methods = true;
    }

    // Test 5: Static methods
    console.log('   Testing static methods...');
    
    // Create another notification for testing
    await Notification.create({
      ...testNotification,
      userId: user._id,
      title: 'Unread Test Notification',
      isRead: false
    });

    const unreadNotifications = await Notification.findUnreadForUser(user._id);
    
    if (unreadNotifications && unreadNotifications.length > 0) {
      console.log('   ✅ findUnreadForUser method working');
    }

    const academicNotifications = await Notification.findByCategory(user._id, 'academic');
    
    if (academicNotifications && academicNotifications.length > 0) {
      console.log('   ✅ findByCategory method working');
      results.statics = true;
    }

  } catch (error) {
    console.log('   ❌ Notification model test failed:', error.message);
  }

  return results;
}

async function testNotificationPreferencesModel() {
  console.log('\n⚙️ Testing NotificationPreferences Model...');
  
  const results = {
    creation: false,
    validation: false,
    methods: false,
    statics: false,
    virtuals: false
  };

  try {
    // Create test user
    const user = await User.create({
      ...testUser,
      email: 'test.preferences@example.com'
    });

    // Test 1: Default preferences creation
    console.log('   Testing default preferences creation...');
    const preferences = await NotificationPreferences.createDefault(user._id);
    
    if (preferences && preferences.userId.equals(user._id)) {
      console.log('   ✅ Default preferences created successfully');
      results.creation = true;
    }

    // Test 2: Validation tests
    console.log('   Testing validation rules...');
    try {
      await NotificationPreferences.create({
        // Missing userId - should fail
        preferences: {}
      });
      console.log('   ❌ Validation test failed');
    } catch (validationError) {
      if (validationError.name === 'ValidationError') {
        console.log('   ✅ Required field validation working');
        results.validation = true;
      }
    }

    // Test 3: Instance methods
    console.log('   Testing instance methods...');
    
    // Test isChannelEnabled method
    const isEmailEnabled = preferences.isChannelEnabled('academic', 'email');
    const isSmsEnabled = preferences.isChannelEnabled('academic', 'sms');
    
    if (isEmailEnabled === true && isSmsEnabled === false) {
      console.log('   ✅ isChannelEnabled method working');
    }

    // Test getEnabledChannels method
    const enabledChannels = preferences.getEnabledChannels('academic');
    
    if (Array.isArray(enabledChannels) && enabledChannels.includes('web')) {
      console.log('   ✅ getEnabledChannels method working');
    }

    // Test addDeviceToken method
    await preferences.addDeviceToken('test_token_123', 'web');
    const hasToken = preferences.deviceTokens.some(token => 
      token.token === 'test_token_123' && token.platform === 'web'
    );
    
    if (hasToken) {
      console.log('   ✅ addDeviceToken method working');
      results.methods = true;
    }

    // Test 4: Static methods
    console.log('   Testing static methods...');
    
    const foundPreferences = await NotificationPreferences.findByUserId(user._id);
    
    if (foundPreferences && foundPreferences.userId.equals(user._id)) {
      console.log('   ✅ findByUserId method working');
      results.statics = true;
    }

    // Test 5: Virtual properties
    console.log('   Testing virtual properties...');
    
    const isEnabled = preferences.isEnabled;
    
    if (typeof isEnabled === 'boolean') {
      console.log('   ✅ isEnabled virtual working');
      results.virtuals = true;
    }

  } catch (error) {
    console.log('   ❌ NotificationPreferences model test failed:', error.message);
  }

  return results;
}

async function testModelIntegration() {
  console.log('\n🔗 Testing Model Integration...');
  
  const results = {
    userRelation: false,
    cascadeOperations: false
  };

  try {
    // Create test user
    const user = await User.create({
      ...testUser,
      email: 'test.integration@example.com'
    });

    // Create notification and preferences
    const notification = await Notification.create({
      ...testNotification,
      userId: user._id,
      title: 'Integration Test Notification'
    });

    const preferences = await NotificationPreferences.createDefault(user._id);

    // Test population
    const populatedNotification = await Notification.findById(notification._id).populate('userId');
    
    if (populatedNotification.userId && populatedNotification.userId.email === user.email) {
      console.log('   ✅ User relation and population working');
      results.userRelation = true;
    }

    // Test finding related data
    const userNotifications = await Notification.find({ userId: user._id });
    const userPreferences = await NotificationPreferences.findOne({ userId: user._id });

    if (userNotifications.length > 0 && userPreferences) {
      console.log('   ✅ Related data queries working');
      results.cascadeOperations = true;
    }

  } catch (error) {
    console.log('   ❌ Model integration test failed:', error.message);
  }

  return results;
}

async function runAllTests() {
  console.log('🧪 Testing Notification Models...\n');

  // Connect to database
  const connected = await connectToDatabase();
  if (!connected) {
    process.exit(1);
  }

  // Clean up any existing test data
  await cleanupTestData();

  // Run tests
  const notificationResults = await testNotificationModel();
  const preferencesResults = await testNotificationPreferencesModel();
  const integrationResults = await testModelIntegration();

  // Clean up test data
  await cleanupTestData();

  // Summary
  console.log('\n📋 Test Summary:');
  console.log('================');

  const allResults = {
    'Notification Model': notificationResults,
    'NotificationPreferences Model': preferencesResults,
    'Model Integration': integrationResults
  };

  let totalTests = 0;
  let passedTests = 0;

  Object.entries(allResults).forEach(([modelName, results]) => {
    console.log(`\n${modelName}:`);
    Object.entries(results).forEach(([testName, passed]) => {
      const status = passed ? '✅ PASS' : '❌ FAIL';
      console.log(`   ${testName}: ${status}`);
      totalTests++;
      if (passed) passedTests++;
    });
  });

  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log('🎉 All notification model tests passed!');
  } else {
    console.log('⚠️ Some tests failed. Check the logs above.');
  }

  // Disconnect from database
  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');

  process.exit(passedTests === totalTests ? 0 : 1);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

// Run tests
runAllTests().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});