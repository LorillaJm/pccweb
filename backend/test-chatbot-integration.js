#!/usr/bin/env node

/**
 * Chatbot Integration Test Script
 * Tests the complete chatbot integration including API routes
 */

require('dotenv').config();

const mongoose = require('mongoose');
const request = require('supertest');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Import components
const chatbotRoutes = require('./routes/chatbot');
const User = require('./models/User');
const ChatConversation = require('./models/ChatConversation');
const FAQ = require('./models/FAQ');
const KnowledgeBaseService = require('./services/KnowledgeBaseService');

// Test data
const testUser = {
  email: 'test.integration@example.com',
  password: 'testpassword123',
  firstName: 'Test',
  lastName: 'Integration',
  role: 'student'
};

const testAdmin = {
  email: 'admin.integration@example.com',
  password: 'adminpassword123',
  firstName: 'Admin',
  lastName: 'Integration',
  role: 'admin'
};

// Create test app
function createTestApp() {
  const app = express();
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Session configuration
  app.use(session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/pcc_portal_test'
    }),
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));
  
  app.use('/api/chatbot', chatbotRoutes);
  
  return app;
}

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
    await User.deleteMany({ email: { $regex: 'integration@example.com' } });
    await ChatConversation.deleteMany({ sessionId: { $regex: 'test_integration_' } });
    await FAQ.deleteMany({ question: { $regex: 'Test integration FAQ' } });
    console.log('🧹 Cleaned up test data');
  } catch (error) {
    console.log('⚠️ Cleanup warning:', error.message);
  }
}

async function setupTestData() {
  try {
    // Create test users with unique emails
    const timestamp = Date.now();
    const user = await User.create({
      ...testUser,
      email: `test.integration.${timestamp}@example.com`
    });
    const admin = await User.create({
      ...testAdmin,
      email: `admin.integration.${timestamp}@example.com`
    });
    
    // Create test FAQ
    await FAQ.create({
      question: 'Test integration FAQ about enrollment',
      answer: 'This is a test answer for integration testing.',
      category: 'enrollment',
      keywords: ['test', 'integration', 'enrollment'],
      priority: 8,
      createdBy: admin._id
    });

    return { user, admin };
  } catch (error) {
    console.error('Error setting up test data:', error);
    throw error;
  }
}

// Helper function to create authenticated session
async function createAuthenticatedAgent(app, user) {
  const agent = request.agent(app);
  
  // Simulate login by setting session
  await new Promise((resolve, reject) => {
    agent
      .post('/test-login') // We'll create this endpoint
      .send({ userId: user._id, role: user.role })
      .end((err) => {
        if (err) reject(err);
        else resolve();
      });
  });
  
  return agent;
}

async function testChatbotAPI() {
  console.log('\n🤖 Testing Chatbot API...');
  
  const results = {
    messageEndpoint: false,
    endConversationEndpoint: false,
    historyEndpoint: false,
    authenticationRequired: false
  };

  try {
    const app = createTestApp();
    const { user, admin } = await setupTestData();
    
    // Add test login endpoint for session setup
    app.post('/test-login', (req, res) => {
      req.session.user = {
        id: req.body.userId,
        role: req.body.role
      };
      res.json({ success: true });
    });

    // Test 1: Authentication required
    console.log('   Testing authentication requirement...');
    const unauthenticatedResponse = await request(app)
      .post('/api/chatbot/message')
      .send({ message: 'Hello' });
    
    if (unauthenticatedResponse.status === 401) {
      console.log('   ✅ Authentication requirement working');
      results.authenticationRequired = true;
    }

    // Create authenticated agent
    const authenticatedAgent = await createAuthenticatedAgent(app, user);

    // Test 2: Send message endpoint
    console.log('   Testing message endpoint...');
    const messageResponse = await authenticatedAgent
      .post('/api/chatbot/message')
      .send({
        message: 'Hello, I need help with enrollment',
        context: {
          currentPage: '/enrollment',
          deviceType: 'desktop'
        }
      });
    
    if (messageResponse.status === 200 && messageResponse.body.response) {
      console.log('   ✅ Message endpoint working');
      results.messageEndpoint = true;
    }

    // Test 3: Get conversation history
    console.log('   Testing history endpoint...');
    const historyResponse = await authenticatedAgent
      .get('/api/chatbot/history');
    
    if (historyResponse.status === 200 && historyResponse.body.conversations) {
      console.log('   ✅ History endpoint working');
      results.historyEndpoint = true;
    }

    // Test 4: End conversation (if we have a conversation)
    if (messageResponse.body.conversationId) {
      console.log('   Testing end conversation endpoint...');
      const endResponse = await authenticatedAgent
        .post('/api/chatbot/end-conversation')
        .send({
          conversationId: messageResponse.body.conversationId,
          satisfaction: 5
        });
      
      if (endResponse.status === 200 && endResponse.body.success) {
        console.log('   ✅ End conversation endpoint working');
        results.endConversationEndpoint = true;
      }
    }

  } catch (error) {
    console.log('   ❌ Chatbot API test failed:', error.message);
  }

  return results;
}

async function testFAQAPI() {
  console.log('\n❓ Testing FAQ API...');
  
  const results = {
    getFAQs: false,
    createFAQ: false,
    updateFAQ: false,
    deleteFAQ: false,
    addFeedback: false,
    adminPermissions: false
  };

  try {
    const app = createTestApp();
    const { user, admin } = await setupTestData();
    
    // Add test login endpoint
    app.post('/test-login', (req, res) => {
      req.session.user = {
        id: req.body.userId,
        role: req.body.role
      };
      res.json({ success: true });
    });

    const userAgent = await createAuthenticatedAgent(app, user);
    const adminAgent = await createAuthenticatedAgent(app, admin);

    // Test 1: Get FAQs (public endpoint)
    console.log('   Testing get FAQs endpoint...');
    const getFAQsResponse = await userAgent
      .get('/api/chatbot/faqs?category=enrollment');
    
    if (getFAQsResponse.status === 200 && getFAQsResponse.body.faqs) {
      console.log('   ✅ Get FAQs endpoint working');
      results.getFAQs = true;
    }

    // Test 2: Create FAQ (admin only)
    console.log('   Testing create FAQ endpoint...');
    
    // Test with regular user (should fail)
    const userCreateResponse = await userAgent
      .post('/api/chatbot/faqs')
      .send({
        question: 'Test FAQ from user',
        answer: 'This should fail',
        category: 'general'
      });
    
    if (userCreateResponse.status === 403) {
      console.log('   ✅ Admin permission check working');
      results.adminPermissions = true;
    }

    // Test with admin (should succeed)
    const adminCreateResponse = await adminAgent
      .post('/api/chatbot/faqs')
      .send({
        question: 'Test FAQ from admin',
        answer: 'This should work',
        category: 'general',
        priority: 5
      });
    
    if (adminCreateResponse.status === 201 && adminCreateResponse.body.faq) {
      console.log('   ✅ Create FAQ endpoint working');
      results.createFAQ = true;
      
      const createdFAQId = adminCreateResponse.body.faq._id;

      // Test 3: Update FAQ
      console.log('   Testing update FAQ endpoint...');
      const updateResponse = await adminAgent
        .put(`/api/chatbot/faqs/${createdFAQId}`)
        .send({
          answer: 'Updated answer',
          priority: 7
        });
      
      if (updateResponse.status === 200) {
        console.log('   ✅ Update FAQ endpoint working');
        results.updateFAQ = true;
      }

      // Test 4: Add feedback
      console.log('   Testing add feedback endpoint...');
      const feedbackResponse = await userAgent
        .post(`/api/chatbot/faqs/${createdFAQId}/feedback`)
        .send({
          helpful: true,
          rating: 4
        });
      
      if (feedbackResponse.status === 200) {
        console.log('   ✅ Add feedback endpoint working');
        results.addFeedback = true;
      }

      // Test 5: Delete FAQ
      console.log('   Testing delete FAQ endpoint...');
      const deleteResponse = await adminAgent
        .delete(`/api/chatbot/faqs/${createdFAQId}`);
      
      if (deleteResponse.status === 200) {
        console.log('   ✅ Delete FAQ endpoint working');
        results.deleteFAQ = true;
      }
    }

  } catch (error) {
    console.log('   ❌ FAQ API test failed:', error.message);
  }

  return results;
}

async function testErrorHandling() {
  console.log('\n🚨 Testing Error Handling...');
  
  const results = {
    validationErrors: false,
    notFoundErrors: false,
    serverErrors: false
  };

  try {
    const app = createTestApp();
    const { user } = await setupTestData();
    
    app.post('/test-login', (req, res) => {
      req.session.user = {
        id: req.body.userId,
        role: req.body.role
      };
      res.json({ success: true });
    });

    const authenticatedAgent = await createAuthenticatedAgent(app, user);

    // Test 1: Validation errors
    console.log('   Testing validation errors...');
    const validationResponse = await authenticatedAgent
      .post('/api/chatbot/message')
      .send({ message: '' }); // Empty message should fail validation
    
    if (validationResponse.status === 400) {
      console.log('   ✅ Validation error handling working');
      results.validationErrors = true;
    }

    // Test 2: Not found errors (need admin for FAQ operations)
    console.log('   Testing not found errors...');
    const { admin } = await setupTestData();
    const adminAgent = await createAuthenticatedAgent(app, admin);
    
    const notFoundResponse = await adminAgent
      .put('/api/chatbot/faqs/507f1f77bcf86cd799439011') // Non-existent FAQ ID
      .send({ answer: 'Updated answer' });
    
    if (notFoundResponse.status === 404) {
      console.log('   ✅ Not found error handling working');
      results.notFoundErrors = true;
    }

    // Test 3: Server errors (invalid ObjectId)
    console.log('   Testing server errors...');
    const serverErrorResponse = await authenticatedAgent
      .post('/api/chatbot/end-conversation')
      .send({ conversationId: 'invalid-id' });
    
    if (serverErrorResponse.status === 400) {
      console.log('   ✅ Server error handling working');
      results.serverErrors = true;
    }

  } catch (error) {
    console.log('   ❌ Error handling test failed:', error.message);
  }

  return results;
}

async function runAllTests() {
  console.log('🧪 Testing Chatbot Integration...\n');

  // Connect to database
  const connected = await connectToDatabase();
  if (!connected) {
    process.exit(1);
  }

  // Clean up and setup test data
  await cleanupTestData();

  // Run tests
  const chatbotResults = await testChatbotAPI();
  const faqResults = await testFAQAPI();
  const errorResults = await testErrorHandling();

  // Clean up test data
  await cleanupTestData();

  // Summary
  console.log('\n📋 Integration Test Summary:');
  console.log('============================');

  const allResults = {
    'Chatbot API': chatbotResults,
    'FAQ API': faqResults,
    'Error Handling': errorResults
  };

  let totalTests = 0;
  let passedTests = 0;

  Object.entries(allResults).forEach(([testGroup, results]) => {
    console.log(`\n${testGroup}:`);
    Object.entries(results).forEach(([testName, passed]) => {
      const status = passed ? '✅ PASS' : '❌ FAIL';
      console.log(`   ${testName}: ${status}`);
      totalTests++;
      if (passed) passedTests++;
    });
  });

  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log('🎉 All integration tests passed!');
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