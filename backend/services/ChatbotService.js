const OpenAI = require('openai');
const ChatConversation = require('../models/ChatConversation');
const KnowledgeBaseService = require('./KnowledgeBaseService');
const NotificationService = require('./NotificationService');

class ChatbotService {
  constructor() {
    // Initialize OpenAI only if API key is available
    this.openaiEnabled = process.env.OPENAI_API_KEY && 
                        process.env.OPENAI_API_KEY !== 'your_openai_api_key_here';
    
    if (this.openaiEnabled) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    } else {
      console.warn('OpenAI API key not configured. Chatbot will use fallback responses.');
    }
    
    this.model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    this.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS) || 150;
    
    // Intent patterns for classification
    this.intentPatterns = {
      enrollment: ['enroll', 'enrollment', 'register', 'registration', 'subjects', 'courses'],
      academics: ['grade', 'grades', 'marks', 'score', 'gpa', 'transcript'],
      payment: ['payment', 'tuition', 'fee', 'fees', 'bill', 'billing', 'pay'],
      schedule: ['schedule', 'class', 'time', 'timetable', 'calendar'],
      facilities: ['library', 'lab', 'laboratory', 'gym', 'cafeteria', 'facility'],
      technical: ['password', 'login', 'access', 'account', 'portal', 'system'],
      admissions: ['admission', 'apply', 'application', 'requirements', 'entrance'],
      general: ['help', 'information', 'contact', 'about', 'location']
    };

    // Fallback responses for different scenarios
    this.fallbackResponses = {
      noMatch: [
        "I'm not sure I understand that question. Could you please rephrase it?",
        "I don't have information about that topic. Let me connect you with a human assistant.",
        "That's an interesting question, but I need more context to help you properly."
      ],
      error: [
        "I'm experiencing some technical difficulties. Please try again in a moment.",
        "Something went wrong on my end. Let me try to help you differently."
      ],
      escalation: [
        "This seems like a complex question that would be better handled by our support team.",
        "I think a human assistant would be better equipped to help you with this."
      ]
    };
  }

  /**
   * Process a user message and generate a response
   * @param {string} message - User's message
   * @param {string} userId - User ID
   * @param {Object} context - Conversation context
   * @returns {Promise<Object>} Response object
   */
  async processMessage(message, userId, context = {}) {
    try {
      // Find or create conversation
      let conversation = await this._getOrCreateConversation(userId, context);
      
      // Add user message to conversation
      conversation.addMessage({
        content: message,
        sender: 'user'
      });

      // Classify intent and extract entities
      const intent = this._classifyIntent(message);
      const entities = this._extractEntities(message);

      // Search knowledge base for relevant information
      const relevantFAQs = await this._searchKnowledgeBase(message, intent);

      // Generate AI response
      const aiResponse = await this._generateAIResponse(
        message, 
        conversation, 
        relevantFAQs, 
        intent,
        context
      );

      // Add bot response to conversation
      const botMessage = conversation.addMessage({
        content: aiResponse.content,
        sender: 'bot',
        confidence: aiResponse.confidence,
        intent: intent,
        entities: entities
      });

      // Save conversation
      await conversation.save();

      // Check if escalation is needed
      const shouldEscalate = this._shouldEscalate(aiResponse.confidence, conversation);
      
      if (shouldEscalate) {
        await this._escalateToHuman(conversation, 'Low confidence response');
      }

      return {
        response: aiResponse.content,
        confidence: aiResponse.confidence,
        intent: intent,
        entities: entities,
        conversationId: conversation._id,
        sessionId: conversation.sessionId,
        escalated: shouldEscalate,
        suggestedActions: this._getSuggestedActions(intent),
        relatedFAQs: relevantFAQs.slice(0, 3) // Return top 3 related FAQs
      };

    } catch (error) {
      console.error('Error processing message:', error);
      
      // Return fallback response
      return {
        response: this._getRandomFallback('error'),
        confidence: 0.1,
        intent: 'error',
        entities: [],
        error: true
      };
    }
  }

  /**
   * Generate AI response using OpenAI
   * @param {string} userMessage - User's message
   * @param {Object} conversation - Conversation object
   * @param {Array} relevantFAQs - Relevant FAQs from knowledge base
   * @param {string} intent - Classified intent
   * @param {Object} context - Additional context
   * @returns {Promise<Object>} AI response
   * @private
   */
  async _generateAIResponse(userMessage, conversation, relevantFAQs, intent, context) {
    try {
      // If OpenAI is not enabled, use knowledge base or fallback
      if (!this.openaiEnabled) {
        if (relevantFAQs.length > 0) {
          return {
            content: relevantFAQs[0].answer,
            confidence: 0.8
          };
        }
        
        return {
          content: this._getRandomFallback('noMatch'),
          confidence: 0.5
        };
      }

      // Build context for AI
      const systemPrompt = this._buildSystemPrompt(context);
      const conversationHistory = this._buildConversationHistory(conversation);
      const knowledgeContext = this._buildKnowledgeContext(relevantFAQs);

      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { 
          role: 'user', 
          content: `${userMessage}\n\nRelevant Information:\n${knowledgeContext}` 
        }
      ];

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: messages,
        max_tokens: this.maxTokens,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      const response = completion.choices[0].message.content.trim();
      
      // Calculate confidence based on various factors
      const confidence = this._calculateConfidence(
        response, 
        relevantFAQs, 
        completion.choices[0].finish_reason
      );

      return {
        content: response,
        confidence: confidence
      };

    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Fallback to knowledge base if AI fails
      if (relevantFAQs.length > 0) {
        return {
          content: relevantFAQs[0].answer,
          confidence: 0.8
        };
      }

      return {
        content: this._getRandomFallback('noMatch'),
        confidence: 0.3
      };
    }
  }

  /**
   * Build system prompt for AI
   * @param {Object} context - Context information
   * @returns {string} System prompt
   * @private
   */
  _buildSystemPrompt(context) {
    const basePrompt = `You are a helpful AI assistant for Passi City College (PCC) Portal. 
    You help students, faculty, and staff with questions about the college.
    
    Guidelines:
    - Be friendly, professional, and concise
    - Provide accurate information based on the knowledge base
    - If you don't know something, admit it and suggest contacting human support
    - Keep responses under 150 words
    - Use simple, clear language
    - Be empathetic and understanding
    `;

    const contextInfo = [];
    
    if (context.userRole) {
      contextInfo.push(`User Role: ${context.userRole}`);
    }
    
    if (context.currentPage) {
      contextInfo.push(`Current Page: ${context.currentPage}`);
    }

    if (context.language && context.language !== 'en') {
      contextInfo.push(`Preferred Language: ${context.language}`);
    }

    if (contextInfo.length > 0) {
      return `${basePrompt}\n\nContext:\n${contextInfo.join('\n')}`;
    }

    return basePrompt;
  }

  /**
   * Build conversation history for AI context
   * @param {Object} conversation - Conversation object
   * @returns {Array} Formatted conversation history
   * @private
   */
  _buildConversationHistory(conversation) {
    const history = [];
    const recentMessages = conversation.messages.slice(-6); // Last 6 messages for context

    recentMessages.forEach(msg => {
      if (msg.sender === 'user') {
        history.push({ role: 'user', content: msg.content });
      } else if (msg.sender === 'bot') {
        history.push({ role: 'assistant', content: msg.content });
      }
    });

    return history;
  }

  /**
   * Build knowledge context from FAQs
   * @param {Array} faqs - Relevant FAQs
   * @returns {string} Formatted knowledge context
   * @private
   */
  _buildKnowledgeContext(faqs) {
    if (faqs.length === 0) return 'No specific information found in knowledge base.';

    return faqs.map((faq, index) => 
      `${index + 1}. Q: ${faq.question}\n   A: ${faq.answer}`
    ).join('\n\n');
  }

  /**
   * Calculate confidence score for AI response
   * @param {string} response - AI response
   * @param {Array} relevantFAQs - Relevant FAQs
   * @param {string} finishReason - OpenAI finish reason
   * @returns {number} Confidence score (0-1)
   * @private
   */
  _calculateConfidence(response, relevantFAQs, finishReason) {
    let confidence = 0.5; // Base confidence

    // Boost confidence if we have relevant FAQs
    if (relevantFAQs.length > 0) {
      confidence += 0.2;
    }

    // Boost confidence if response is complete
    if (finishReason === 'stop') {
      confidence += 0.1;
    }

    // Reduce confidence for very short responses
    if (response.length < 20) {
      confidence -= 0.2;
    }

    // Boost confidence for longer, detailed responses
    if (response.length > 100) {
      confidence += 0.1;
    }

    // Check for uncertainty indicators
    const uncertaintyWords = ['maybe', 'might', 'possibly', 'not sure', 'don\'t know'];
    const hasUncertainty = uncertaintyWords.some(word => 
      response.toLowerCase().includes(word)
    );
    
    if (hasUncertainty) {
      confidence -= 0.2;
    }

    return Math.max(0.1, Math.min(1.0, confidence));
  }

  /**
   * Classify user intent based on message content
   * @param {string} message - User message
   * @returns {string} Classified intent
   * @private
   */
  _classifyIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    for (const [intent, keywords] of Object.entries(this.intentPatterns)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return intent;
      }
    }
    
    return 'general';
  }

  /**
   * Extract entities from user message
   * @param {string} message - User message
   * @returns {Array} Extracted entities
   * @private
   */
  _extractEntities(message) {
    const entities = [];
    
    // Extract email addresses
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = message.match(emailRegex);
    if (emails) {
      emails.forEach(email => entities.push({ type: 'email', value: email }));
    }

    // Extract student IDs (assuming format like 2023-1234)
    const studentIdRegex = /\b\d{4}-\d{4}\b/g;
    const studentIds = message.match(studentIdRegex);
    if (studentIds) {
      studentIds.forEach(id => entities.push({ type: 'student_id', value: id }));
    }

    // Extract dates
    const dateRegex = /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g;
    const dates = message.match(dateRegex);
    if (dates) {
      dates.forEach(date => entities.push({ type: 'date', value: date }));
    }

    return entities;
  }

  /**
   * Search knowledge base for relevant information
   * @param {string} message - User message
   * @param {string} intent - Classified intent
   * @returns {Promise<Array>} Relevant FAQs
   * @private
   */
  async _searchKnowledgeBase(message, intent) {
    try {
      // First try searching by intent category
      let faqs = await KnowledgeBaseService.getFAQsByCategory(intent, 'en');
      
      if (faqs.length === 0) {
        // If no category match, try text search
        faqs = await KnowledgeBaseService.searchRelevantInfo(message, {
          limit: 5
        });
      }

      return faqs;
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      return [];
    }
  }

  /**
   * Get or create conversation for user
   * @param {string} userId - User ID
   * @param {Object} context - Context information
   * @returns {Promise<Object>} Conversation object
   * @private
   */
  async _getOrCreateConversation(userId, context) {
    // Try to find active conversation
    let conversation = await ChatConversation.findActiveByUser(userId);
    
    if (!conversation) {
      // Create new conversation
      conversation = new ChatConversation({
        userId: userId,
        sessionId: `chat_${userId}_${Date.now()}`,
        language: context.language || 'en',
        context: {
          userRole: context.userRole,
          currentPage: context.currentPage,
          sessionStartTime: new Date(),
          lastActivity: new Date()
        },
        metadata: {
          userAgent: context.userAgent,
          deviceType: context.deviceType,
          referrer: context.referrer
        }
      });
    }

    return conversation;
  }

  /**
   * Check if conversation should be escalated to human
   * @param {number} confidence - Response confidence
   * @param {Object} conversation - Conversation object
   * @returns {boolean} Whether to escalate
   * @private
   */
  _shouldEscalate(confidence, conversation) {
    // Escalate if confidence is very low
    if (confidence < 0.3) return true;
    
    // Escalate if conversation has many messages without resolution
    if (conversation.messages.length > 10 && conversation.status === 'active') {
      return true;
    }

    // Escalate if user explicitly asks for human help
    const lastUserMessage = conversation.messages
      .filter(msg => msg.sender === 'user')
      .pop();
    
    if (lastUserMessage) {
      const escalationKeywords = ['human', 'person', 'agent', 'representative', 'help me'];
      const messageContent = lastUserMessage.content.toLowerCase();
      
      if (escalationKeywords.some(keyword => messageContent.includes(keyword))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Escalate conversation to human support
   * @param {Object} conversation - Conversation object
   * @param {string} reason - Escalation reason
   * @returns {Promise<void>}
   * @private
   */
  async _escalateToHuman(conversation, reason) {
    try {
      await conversation.escalateToHuman(reason);
      
      // Notify support team (if notification service is available)
      if (NotificationService && typeof NotificationService.sendNotification === 'function') {
        await NotificationService.sendNotification(null, {
          title: 'Chatbot Escalation',
          message: `A conversation has been escalated to human support. Reason: ${reason}`,
          type: 'info',
          category: 'system',
          priority: 'high',
          data: {
            conversationId: conversation._id,
            userId: conversation.userId,
            reason: reason
          }
        }, ['web', 'email']);
      } else {
        console.log(`Chatbot escalation: ${reason} for conversation ${conversation._id}`);
      }

    } catch (error) {
      console.error('Error escalating to human:', error);
    }
  }

  /**
   * Get suggested actions based on intent
   * @param {string} intent - User intent
   * @returns {Array} Suggested actions
   * @private
   */
  _getSuggestedActions(intent) {
    const actions = {
      enrollment: [
        { text: 'View Enrollment Guide', action: 'navigate', target: '/enrollment' },
        { text: 'Check Available Subjects', action: 'navigate', target: '/subjects' }
      ],
      academics: [
        { text: 'View My Grades', action: 'navigate', target: '/grades' },
        { text: 'Download Transcript', action: 'navigate', target: '/transcript' }
      ],
      payment: [
        { text: 'View Payment History', action: 'navigate', target: '/payments' },
        { text: 'Make Payment', action: 'navigate', target: '/pay' }
      ],
      schedule: [
        { text: 'View My Schedule', action: 'navigate', target: '/schedule' },
        { text: 'Academic Calendar', action: 'navigate', target: '/calendar' }
      ],
      technical: [
        { text: 'Reset Password', action: 'navigate', target: '/reset-password' },
        { text: 'Contact IT Support', action: 'contact', target: 'it-support' }
      ]
    };

    return actions[intent] || [
      { text: 'Contact Support', action: 'contact', target: 'general-support' }
    ];
  }

  /**
   * Get random fallback response
   * @param {string} type - Fallback type
   * @returns {string} Fallback response
   * @private
   */
  _getRandomFallback(type) {
    const responses = this.fallbackResponses[type] || this.fallbackResponses.noMatch;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Get conversation history for a user
   * @param {string} userId - User ID
   * @param {number} limit - Number of conversations to return
   * @returns {Promise<Array>} Conversation history
   */
  async getConversationHistory(userId, limit = 10) {
    try {
      return await ChatConversation.getConversationHistory(userId, limit);
    } catch (error) {
      console.error('Error getting conversation history:', error);
      throw new Error('Failed to get conversation history');
    }
  }

  /**
   * End conversation
   * @param {string} conversationId - Conversation ID
   * @param {number} satisfaction - User satisfaction rating (1-5)
   * @returns {Promise<Object>} Updated conversation
   */
  async endConversation(conversationId, satisfaction = null) {
    try {
      const conversation = await ChatConversation.findById(conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      await conversation.markResolved(satisfaction);
      return conversation;
    } catch (error) {
      console.error('Error ending conversation:', error);
      throw error;
    }
  }

  /**
   * Get chatbot analytics
   * @param {Object} dateRange - Date range for analytics
   * @returns {Promise<Object>} Analytics data
   */
  async getAnalytics(dateRange = {}) {
    try {
      const conversationAnalytics = await ChatConversation.getAnalytics(dateRange);
      const knowledgeBaseAnalytics = await KnowledgeBaseService.getAnalytics(dateRange);

      return {
        conversations: conversationAnalytics[0] || {
          totalConversations: 0,
          activeConversations: 0,
          resolvedConversations: 0,
          escalatedConversations: 0,
          averageMessages: 0,
          averageSatisfaction: 0
        },
        knowledgeBase: knowledgeBaseAnalytics
      };
    } catch (error) {
      console.error('Error getting chatbot analytics:', error);
      throw new Error('Failed to get analytics');
    }
  }
}

module.exports = new ChatbotService();