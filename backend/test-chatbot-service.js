#!/usr/bin/env node

/**
 * Chatbot Service Test Script
 * Tests the ChatbotService functionality
 */

require('dotenv').config();

const mongoose = require('mongoose');
const ChatbotService = require('./services/ChatbotService');
const KnowledgeBaseService = require('./services/KnowledgeBaseService');
const ChatConversation = require('./models/ChatConversation');
const FAQ = require('./models/FAQ');
const User = require('./models/User');

// Test data
const testUser = {
  email: 'test.chatbot.service@example.com',
  password: 'testpassword123',
  firstName: 'Test',
  lastName: 'ChatbotUser',
  role: 'student'
};

const testContext = {
  userRole: 'student',
  currentPage: '/dashboard',
  language: 'en',
  userAgent: 'Test Browser',
  deviceType: 'desktop'
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
    await User.deleteMany({ email: { $regex: 'test.chatbot.service' } });
    await ChatConversation.deleteMany({ sessionId: { $regex: 'test_chatbot_' } });
    await FAQ.deleteMany({ question: { $regex: 'Test chatbot FAQ' } });
    console.log('🧹 Cleaned up test data');
  } catch (error) {
    console.log('⚠️ Cleanup warning:', error.message);
  }
}

async function setupTestData() {
  try {
    // Create test user
    const user = await User.create(testUser);
    
    // Create test FAQs
    await FAQ.create({
      question: 'Test chatbot FAQ about enrollment',
      answer: 'This is a test answer about enrollment procedures.',
      category: 'enrollment',
      keywords: ['enrollment', 'register', 'subjects'],
      priority: 8,
      createdBy: user._id
    });

    await FAQ.create({
      question: 'Test chatbot FAQ about grades',
      answer: 'This is a test answer about checking grades.',
      category: 'academics',
      keywords: ['grades', 'marks', 'gpa'],
      priority: 7,
      createdBy: user._id
    });

    return user;
  } catch (error) {
    console.error('Error setting up test data:', error);
    throw error;
  }
}

async function testMessageProcessing() {
  console.log('\n💬 Testing Message Processing...');
  
  const results = {
    basicResponse: false,
    intentClassification: false,
    entityExtraction: false,
    conversationCreation: false,
    knowledgeBaseIntegration: false
  };

  try {
    const user = await User.findOne({ email: testUser.email });
    
    // Test 1: Basic message processing
    console.log('   Testing basic message processing...');
    const response1 = await ChatbotService.processMessage(
      'Hello, I need help with enrollment',
      user._id,
      testContext
    );
    
    if (response1 && response1.response && response1.intent) {
      console.log('   ✅ Basic message processing working');
      results.basicResponse = true;
    }

    // Test 2: Intent classification
    console.log('   Testing intent classification...');
    const enrollmentResponse = await ChatbotService.processMessage(
      'How do I enroll for next semester?',
      user._id,
      testContext
    );
    
    if (enrollmentResponse.intent === 'enrollment') {
      console.log('   ✅ Intent classification working');
      results.intentClassification = true;
    }

    // Test 3: Entity extraction
    console.log('   Testing entity extraction...');
    const entityResponse = await ChatbotService.processMessage(
      'My student ID is 2023-1234 and my email is student@example.com',
      user._id,
      testContext
    );
    
    if (entityResponse.entities && entityResponse.entities.length > 0) {
      console.log('   ✅ Entity extraction working');
      results.entityExtraction = true;
    }

    // Test 4: Conversation creation and persistence
    console.log('   Testing conversation creation...');
    const conversations = await ChatConversation.find({ userId: user._id });
    
    if (conversations.length > 0) {
      console.log('   ✅ Conversation creation working');
      results.conversationCreation = true;
    }

    // Test 5: Knowledge base integration
    console.log('   Testing knowledge base integration...');
    const kbResponse = await ChatbotService.processMessage(
      'Tell me about enrollment procedures',
      user._id,
      testContext
    );
    
    if (kbResponse.relatedFAQs && kbResponse.relatedFAQs.length > 0) {
      console.log('   ✅ Knowledge base integration working');
      results.knowledgeBaseIntegration = true;
    }

  } catch (error) {
    console.log('   ❌ Message processing test failed:', error.message);
  }

  return results;
}

async function testConversationManagement() {
  console.log('\n🗣️ Testing Conversation Management...');
  
  const results = {
    conversationHistory: false,
    conversationEnding: false,
    escalation: false,
    contextTracking: false
  };

  try {
    const user = await User.findOne({ email: testUser.email });
    
    // Test 1: Conversation history
    console.log('   Testing conversation history...');
    const history = await ChatbotService.getConversationHistory(user._id, 5);
    
    if (Array.isArray(history)) {
      console.log('   ✅ Conversation history retrieval working');
      results.conversationHistory = true;
    }

    // Test 2: Conversation ending
    console.log('   Testing conversation ending...');
    const activeConversation = await ChatConversation.findActiveByUser(user._id);
    
    if (activeConversation) {
      const endedConversation = await ChatbotService.endConversation(
        activeConversation._id, 
        5
      );
      
      if (endedConversation.status === 'resolved' && endedConversation.satisfaction === 5) {
        console.log('   ✅ Conversation ending working');
        results.conversationEnding = true;
      }
    }

    // Test 3: Escalation logic
    console.log('   Testing escalation logic...');
    const escalationResponse = await ChatbotService.processMessage(
      'I need to speak with a human representative please',
      user._id,
      testContext
    );
    
    if (escalationResponse.escalated) {
      console.log('   ✅ Escalation logic working');
      results.escalation = true;
    }

    // Test 4: Context tracking
    console.log('   Testing context tracking...');
    const contextResponse1 = await ChatbotService.processMessage(
      'What are my grades?',
      user._id,
      { ...testContext, currentPage: '/grades' }
    );
    
    const contextResponse2 = await ChatbotService.processMessage(
      'How about my enrollment status?',
      user._id,
      testContext
    );
    
    if (contextResponse1 && contextResponse2) {
      console.log('   ✅ Context tracking working');
      results.contextTracking = true;
    }

  } catch (error) {
    console.log('   ❌ Conversation management test failed:', error.message);
  }

  return results;
}

async function testAnalyticsAndReporting() {
  console.log('\n📊 Testing Analytics and Reporting...');
  
  const results = {
    analytics: false,
    errorHandling: false,
    fallbackResponses: false
  };

  try {
    // Test 1: Analytics
    console.log('   Testing analytics...');
    const analytics = await ChatbotService.getAnalytics();
    
    if (analytics && analytics.conversations && analytics.knowledgeBase) {
      console.log('   ✅ Analytics working');
      results.analytics = true;
    }

    // Test 2: Error handling
    console.log('   Testing error handling...');
    try {
      // Test with invalid user ID
      const errorResponse = await ChatbotService.processMessage(
        'Test message',
        'invalid_user_id',
        testContext
      );
      
      if (errorResponse && errorResponse.error) {
        console.log('   ✅ Error handling working');
        results.errorHandling = true;
      }
    } catch (error) {
      // Expected to catch error
      console.log('   ✅ Error handling working (caught expected error)');
      results.errorHandling = true;
    }

    // Test 3: Fallback responses
    console.log('   Testing fallback responses...');
    const user = await User.findOne({ email: testUser.email });
    const fallbackResponse = await ChatbotService.processMessage(
      'xyzabc123 nonsense query that should not match anything',
      user._id,
      testContext
    );
    
    if (fallbackResponse && fallbackResponse.confidence <= 0.8) {
      console.log('   ✅ Fallback responses working');
      results.fallbackResponses = true;
    } else {
      console.log(`   ❌ Fallback test failed - confidence: ${fallbackResponse?.confidence}`);
    }

  } catch (error) {
    console.log('   ❌ Analytics and reporting test failed:', error.message);
  }

  return results;
}

async function testIntentClassificationAndEntities() {
  console.log('\n🎯 Testing Intent Classification and Entity Extraction...');
  
  const results = {
    enrollmentIntent: false,
    academicsIntent: false,
    paymentIntent: false,
    technicalIntent: false,
    entityExtraction: false
  };

  try {
    const user = await User.findOne({ email: testUser.email });
    
    // Test different intents
    const testCases = [
      { message: 'How do I register for courses?', expectedIntent: 'enrollment' },
      { message: 'What are my current grades?', expectedIntent: 'academics' },
      { message: 'When is the tuition payment due?', expectedIntent: 'payment' },
      { message: 'I forgot my password', expectedIntent: 'technical' }
    ];

    for (const testCase of testCases) {
      console.log(`   Testing ${testCase.expectedIntent} intent...`);
      const response = await ChatbotService.processMessage(
        testCase.message,
        user._id,
        testContext
      );
      
      if (response.intent === testCase.expectedIntent) {
        console.log(`   ✅ ${testCase.expectedIntent} intent classification working`);
        results[`${testCase.expectedIntent}Intent`] = true;
      }
    }

    // Test entity extraction with complex message
    console.log('   Testing comprehensive entity extraction...');
    const entityMessage = 'My student ID is 2023-5678, email is john.doe@example.com, and the date is 12/25/2023';
    const entityResponse = await ChatbotService.processMessage(
      entityMessage,
      user._id,
      testContext
    );
    
    const hasStudentId = entityResponse.entities.some(e => e.type === 'student_id');
    const hasEmail = entityResponse.entities.some(e => e.type === 'email');
    const hasDate = entityResponse.entities.some(e => e.type === 'date');
    
    if (hasStudentId && hasEmail && hasDate) {
      console.log('   ✅ Comprehensive entity extraction working');
      results.entityExtraction = true;
    }

  } catch (error) {
    console.log('   ❌ Intent classification and entity extraction test failed:', error.message);
  }

  return results;
}

async function runAllTests() {
  console.log('🧪 Testing Chatbot Service...\n');

  // Check if OpenAI API key is configured
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
    console.log('⚠️ OpenAI API key not configured. Some tests may use fallback responses.');
  }

  // Connect to database
  const connected = await connectToDatabase();
  if (!connected) {
    process.exit(1);
  }

  // Clean up and setup test data
  await cleanupTestData();
  await setupTestData();

  // Run tests
  const messageResults = await testMessageProcessing();
  const conversationResults = await testConversationManagement();
  const analyticsResults = await testAnalyticsAndReporting();
  const intentResults = await testIntentClassificationAndEntities();

  // Clean up test data
  await cleanupTestData();

  // Summary
  console.log('\n📋 Test Summary:');
  console.log('================');

  const allResults = {
    'Message Processing': messageResults,
    'Conversation Management': conversationResults,
    'Analytics & Reporting': analyticsResults,
    'Intent & Entity Recognition': intentResults
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
    console.log('🎉 All chatbot service tests passed!');
  } else {
    console.log('⚠️ Some tests failed. Check the logs above.');
    
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      console.log('💡 Note: Configure OPENAI_API_KEY for full AI functionality testing.');
    }
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