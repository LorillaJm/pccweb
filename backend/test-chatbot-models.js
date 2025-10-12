#!/usr/bin/env node

/**
 * Chatbot Models Test Script
 * Tests the ChatConversation and FAQ models
 */

require('dotenv').config();

const mongoose = require('mongoose');
const ChatConversation = require('./models/ChatConversation');
const FAQ = require('./models/FAQ');
const User = require('./models/User');
const KnowledgeBaseService = require('./services/KnowledgeBaseService');

// Test data
const testUser = {
  email: 'test.chatbot@example.com',
  password: 'testpassword123',
  firstName: 'Test',
  lastName: 'Chatbot',
  role: 'student'
};

const testConversation = {
  sessionId: 'test_session_' + Date.now(),
  messages: [
    {
      content: 'Hello, I need help with enrollment',
      sender: 'user',
      timestamp: new Date()
    },
    {
      content: 'I can help you with enrollment. What specific information do you need?',
      sender: 'bot',
      timestamp: new Date(),
      confidence: 0.95,
      intent: 'enrollment_help'
    }
  ],
  language: 'en',
  context: {
    userRole: 'student',
    currentPage: '/enrollment'
  }
};

const testFAQ = {
  question: 'How do I reset my password?',
  answer: 'To reset your password, go to the login page and click "Forgot Password". Enter your email address and follow the instructions sent to your email.',
  category: 'technical',
  keywords: ['password', 'reset', 'forgot', 'login'],
  priority: 8,
  language: 'en'
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
    await ChatConversation.deleteMany({ sessionId: { $regex: 'test_session_' } });
    await FAQ.deleteMany({ question: { $regex: 'How do I reset my password' } });
    console.log('🧹 Cleaned up test data');
  } catch (error) {
    console.log('⚠️ Cleanup warning:', error.message);
  }
}

async function testChatConversationModel() {
  console.log('\n💬 Testing ChatConversation Model...');
  
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
    
    // Test 1: Basic conversation creation
    console.log('   Testing conversation creation...');
    const conversation = await ChatConversation.create({
      ...testConversation,
      userId: user._id
    });
    
    if (conversation && conversation._id) {
      console.log('   ✅ Conversation created successfully');
      results.creation = true;
    }

    // Test 2: Validation tests
    console.log('   Testing validation rules...');
    try {
      // Test required fields
      await ChatConversation.create({
        userId: user._id,
        messages: []
        // sessionId is missing - should fail
      });
      console.log('   ❌ Validation test failed - should have required sessionId');
    } catch (validationError) {
      if (validationError.name === 'ValidationError') {
        console.log('   ✅ Required field validation working');
        results.validation = true;
      }
    }

    // Test enum validation for status
    try {
      await ChatConversation.create({
        ...testConversation,
        userId: user._id,
        sessionId: 'test_validation_' + Date.now(),
        status: 'invalid_status'
      });
      console.log('   ❌ Enum validation failed');
    } catch (enumError) {
      if (enumError.name === 'ValidationError') {
        console.log('   ✅ Status enum validation working');
      }
    }

    // Test 3: Index verification
    console.log('   Testing database indexes...');
    const indexes = await ChatConversation.collection.getIndexes();
    const expectedIndexes = ['userId_1', 'sessionId_1', 'status_1'];
    const hasRequiredIndexes = expectedIndexes.some(idx => 
      Object.keys(indexes).some(existingIdx => existingIdx.includes(idx.split('_')[0]))
    );
    
    if (hasRequiredIndexes) {
      console.log('   ✅ Database indexes created');
      results.indexes = true;
    }

    // Test 4: Instance methods
    console.log('   Testing instance methods...');
    
    // Test addMessage method
    const initialMessageCount = conversation.messages.length;
    const newMessage = conversation.addMessage({
      content: 'Thank you for the help!',
      sender: 'user'
    });
    
    if (conversation.messages.length === initialMessageCount + 1 && newMessage.messageId) {
      console.log('   ✅ addMessage method working');
    }

    // Test escalateToHuman method
    await conversation.escalateToHuman('Complex query requiring human assistance');
    
    if (conversation.status === 'escalated' && conversation.escalationReason) {
      console.log('   ✅ escalateToHuman method working');
    }

    // Test markResolved method
    const newConversation = await ChatConversation.create({
      ...testConversation,
      userId: user._id,
      sessionId: 'test_resolve_' + Date.now()
    });
    
    await newConversation.markResolved(5);
    
    if (newConversation.status === 'resolved' && newConversation.satisfaction === 5) {
      console.log('   ✅ markResolved method working');
      results.methods = true;
    }

    // Test 5: Static methods
    console.log('   Testing static methods...');
    
    // Create an active conversation for testing
    const activeConversation = await ChatConversation.create({
      ...testConversation,
      userId: user._id,
      sessionId: 'test_active_' + Date.now(),
      status: 'active'
    });

    const foundActive = await ChatConversation.findActiveByUser(user._id);
    
    if (foundActive && foundActive.status === 'active') {
      console.log('   ✅ findActiveByUser method working');
    }

    const foundBySession = await ChatConversation.findBySessionId(activeConversation.sessionId);
    
    if (foundBySession && foundBySession._id.equals(activeConversation._id)) {
      console.log('   ✅ findBySessionId method working');
    }

    const history = await ChatConversation.getConversationHistory(user._id, 5);
    
    if (Array.isArray(history) && history.length > 0) {
      console.log('   ✅ getConversationHistory method working');
      results.statics = true;
    }

  } catch (error) {
    console.log('   ❌ ChatConversation model test failed:', error.message);
  }

  return results;
}

async function testFAQModel() {
  console.log('\n❓ Testing FAQ Model...');
  
  const results = {
    creation: false,
    validation: false,
    indexes: false,
    methods: false,
    statics: false
  };

  try {
    // Create test user for FAQ creation
    const user = await User.create({
      ...testUser,
      email: 'test.faq.' + Date.now() + '@example.com'
    });

    // Test 1: Basic FAQ creation
    console.log('   Testing FAQ creation...');
    const faq = await FAQ.create({
      ...testFAQ,
      createdBy: user._id
    });
    
    if (faq && faq._id) {
      console.log('   ✅ FAQ created successfully');
      results.creation = true;
    }

    // Test 2: Validation tests
    console.log('   Testing validation rules...');
    try {
      // Test required fields
      await FAQ.create({
        answer: 'Missing question',
        category: 'technical',
        createdBy: user._id
        // question is missing - should fail
      });
      console.log('   ❌ Validation test failed - should have required question');
    } catch (validationError) {
      if (validationError.name === 'ValidationError') {
        console.log('   ✅ Required field validation working');
        results.validation = true;
      }
    }

    // Test enum validation for category
    try {
      await FAQ.create({
        ...testFAQ,
        category: 'invalid_category',
        createdBy: user._id
      });
      console.log('   ❌ Category enum validation failed');
    } catch (enumError) {
      if (enumError.name === 'ValidationError') {
        console.log('   ✅ Category enum validation working');
      }
    }

    // Test 3: Index verification
    console.log('   Testing database indexes...');
    const indexes = await FAQ.collection.getIndexes();
    const expectedIndexes = ['category_1', 'isActive_1', 'language_1'];
    const hasRequiredIndexes = expectedIndexes.some(idx => 
      Object.keys(indexes).some(existingIdx => existingIdx.includes(idx.split('_')[0]))
    );
    
    if (hasRequiredIndexes) {
      console.log('   ✅ Database indexes created');
      results.indexes = true;
    }

    // Test 4: Instance methods
    console.log('   Testing instance methods...');
    
    // Test incrementUsage method
    const initialUsage = faq.usageCount;
    await faq.incrementUsage();
    
    if (faq.usageCount === initialUsage + 1 && faq.lastUsed) {
      console.log('   ✅ incrementUsage method working');
    }

    // Test addFeedback method
    const initialHelpful = faq.feedback.helpful;
    await faq.addFeedback(true, 4);
    
    if (faq.feedback.helpful === initialHelpful + 1 && faq.feedback.totalRatings > 0) {
      console.log('   ✅ addFeedback method working');
    }

    // Test addTranslation method (using 'en' to avoid MongoDB language issues)
    await faq.addTranslation('en', 'How can I reset my password?', 'To reset your password, go to the login page...');
    
    if (faq.translations.length > 0 && faq.translations[0].language === 'en') {
      console.log('   ✅ addTranslation method working');
      results.methods = true;
    }

    // Test 5: Static methods
    console.log('   Testing static methods...');
    
    // Create additional FAQs for testing
    await FAQ.create({
      question: 'How do I check my grades?',
      answer: 'You can check your grades in the student portal under the Grades section.',
      category: 'academics',
      keywords: ['grades', 'check', 'portal'],
      priority: 9,
      createdBy: user._id
    });

    const searchResults = await FAQ.searchFAQs('password reset');
    
    if (Array.isArray(searchResults) && searchResults.length > 0) {
      console.log('   ✅ searchFAQs method working');
    }

    const categoryFAQs = await FAQ.findByCategory('technical');
    
    if (Array.isArray(categoryFAQs) && categoryFAQs.length > 0) {
      console.log('   ✅ findByCategory method working');
    }

    const popularFAQs = await FAQ.getPopularFAQs('en', 5);
    
    if (Array.isArray(popularFAQs)) {
      console.log('   ✅ getPopularFAQs method working');
      results.statics = true;
    }

  } catch (error) {
    console.log('   ❌ FAQ model test failed:', error.message);
  }

  return results;
}

async function testKnowledgeBaseService() {
  console.log('\n🧠 Testing KnowledgeBase Service...');
  
  const results = {
    search: false,
    management: false,
    analytics: false,
    feedback: false
  };

  try {
    // Create test user
    const user = await User.create({
      ...testUser,
      email: 'test.kb.' + Date.now() + '@example.com'
    });

    // Test 1: FAQ management
    console.log('   Testing FAQ management...');
    const createdFAQ = await KnowledgeBaseService.addFAQ({
      question: 'What are the library hours?',
      answer: 'The library is open Monday to Friday from 8 AM to 6 PM.',
      category: 'facilities',
      priority: 7
    }, user._id);
    
    if (createdFAQ && createdFAQ._id) {
      console.log('   ✅ FAQ creation through service working');
      results.management = true;
    }

    // Test 2: Search functionality
    console.log('   Testing search functionality...');
    const searchResults = await KnowledgeBaseService.searchRelevantInfo('library hours', {
      category: 'facilities',
      limit: 3
    });
    
    if (Array.isArray(searchResults) && searchResults.length > 0) {
      console.log('   ✅ Search functionality working');
      results.search = true;
    }

    // Test 3: Feedback system
    console.log('   Testing feedback system...');
    await KnowledgeBaseService.addFeedback(createdFAQ._id, true, 5);
    const updatedFAQ = await FAQ.findById(createdFAQ._id);
    
    if (updatedFAQ.feedback.helpful > 0 && updatedFAQ.feedback.totalRatings > 0) {
      console.log('   ✅ Feedback system working');
      results.feedback = true;
    }

    // Test 4: Analytics
    console.log('   Testing analytics...');
    const analytics = await KnowledgeBaseService.getAnalytics();
    
    if (analytics && typeof analytics.totalFAQs === 'number') {
      console.log('   ✅ Analytics working');
      results.analytics = true;
    }

  } catch (error) {
    console.log('   ❌ KnowledgeBase service test failed:', error.message);
  }

  return results;
}

async function testModelIntegration() {
  console.log('\n🔗 Testing Model Integration...');
  
  const results = {
    userRelation: false,
    conversationFAQLink: false,
    contextTracking: false
  };

  try {
    // Create test user with unique email
    const user = await User.create({
      ...testUser,
      email: 'test.integration.' + Date.now() + '@example.com'
    });

    // Create FAQ and conversation
    const faq = await FAQ.create({
      ...testFAQ,
      createdBy: user._id,
      question: 'Integration test FAQ'
    });

    const conversation = await ChatConversation.create({
      ...testConversation,
      userId: user._id,
      sessionId: 'integration_test_' + Date.now()
    });

    // Test population
    const populatedConversation = await ChatConversation.findById(conversation._id).populate('userId');
    
    if (populatedConversation.userId && populatedConversation.userId.email === user.email) {
      console.log('   ✅ User relation and population working');
      results.userRelation = true;
    }

    // Test context tracking
    conversation.addMessage({
      content: 'Can you help me with password reset?',
      sender: 'user'
    });
    
    await conversation.save();
    
    if (conversation.context.lastActivity && conversation.messages.length > testConversation.messages.length) {
      console.log('   ✅ Context tracking working');
      results.contextTracking = true;
    }

    // Test FAQ-conversation relationship through search
    const relatedFAQs = await KnowledgeBaseService.searchRelevantInfo('password reset');
    
    if (relatedFAQs.length > 0) {
      console.log('   ✅ FAQ-conversation integration working');
      results.conversationFAQLink = true;
    }

  } catch (error) {
    console.log('   ❌ Model integration test failed:', error.message);
  }

  return results;
}

async function runAllTests() {
  console.log('🧪 Testing Chatbot Models and Services...\n');

  // Connect to database
  const connected = await connectToDatabase();
  if (!connected) {
    process.exit(1);
  }

  // Clean up any existing test data
  await cleanupTestData();

  // Run tests
  const conversationResults = await testChatConversationModel();
  const faqResults = await testFAQModel();
  const serviceResults = await testKnowledgeBaseService();
  const integrationResults = await testModelIntegration();

  // Clean up test data
  await cleanupTestData();

  // Summary
  console.log('\n📋 Test Summary:');
  console.log('================');

  const allResults = {
    'ChatConversation Model': conversationResults,
    'FAQ Model': faqResults,
    'KnowledgeBase Service': serviceResults,
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
    console.log('🎉 All chatbot model tests passed!');
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