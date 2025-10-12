const express = require('express');
const router = express.Router();
const ChatbotService = require('../services/ChatbotService');
const KnowledgeBaseService = require('../services/KnowledgeBaseService');
const { body, validationResult } = require('express-validator');
const { requireAuth, requireAdminOrSuperAdmin } = require('../middleware/sessionAuth');

// Use the existing authentication middleware

// Validation middleware
const validateMessage = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Message must be between 1 and 500 characters'),
  body('context')
    .optional()
    .isObject()
    .withMessage('Context must be an object'),
];

const validateEndConversation = [
  body('conversationId')
    .isMongoId()
    .withMessage('Invalid conversation ID'),
  body('satisfaction')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Satisfaction must be between 1 and 5'),
];

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

/**
 * POST /api/chatbot/message
 * Send a message to the chatbot
 */
router.post('/message', requireAuth, validateMessage, handleValidationErrors, async (req, res) => {
  try {
    const { message, context = {} } = req.body;
    const userId = req.user._id;

    // Add user info to context
    const enrichedContext = {
      ...context,
      userRole: req.user.role,
      userId: userId
    };

    // Process message through chatbot service
    const response = await ChatbotService.processMessage(message, userId, enrichedContext);

    res.json(response);

  } catch (error) {
    console.error('Chatbot message error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process message'
    });
  }
});

/**
 * POST /api/chatbot/end-conversation
 * End a conversation with optional satisfaction rating
 */
router.post('/end-conversation', requireAuth, validateEndConversation, handleValidationErrors, async (req, res) => {
  try {
    const { conversationId, satisfaction } = req.body;

    const result = await ChatbotService.endConversation(conversationId, satisfaction);

    res.json({
      success: true,
      message: 'Conversation ended successfully',
      conversation: result
    });

  } catch (error) {
    console.error('End conversation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to end conversation'
    });
  }
});

/**
 * GET /api/chatbot/history
 * Get conversation history for the current user
 */
router.get('/history', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;

    const conversations = await ChatbotService.getConversationHistory(userId, limit);

    res.json({
      success: true,
      conversations
    });

  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get conversation history'
    });
  }
});

/**
 * GET /api/chatbot/analytics
 * Get chatbot analytics (admin only)
 */
router.get('/analytics', ...requireAdminOrSuperAdmin, async (req, res) => {
  try {

    const { startDate, endDate } = req.query;
    const dateRange = {};
    
    if (startDate) dateRange.start = new Date(startDate);
    if (endDate) dateRange.end = new Date(endDate);

    const analytics = await ChatbotService.getAnalytics(dateRange);

    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get analytics'
    });
  }
});

// FAQ Management Routes (Admin only)

/**
 * GET /api/chatbot/faqs
 * Get FAQs with optional filtering
 */
router.get('/faqs', requireAuth, async (req, res) => {
  try {
    const { category, language = 'en', search, limit = 20 } = req.query;

    let faqs;
    
    if (search) {
      faqs = await KnowledgeBaseService.searchRelevantInfo(search, {
        category,
        language,
        limit: parseInt(limit)
      });
    } else if (category) {
      faqs = await KnowledgeBaseService.getFAQsByCategory(category, language);
    } else {
      faqs = await KnowledgeBaseService.getPopularFAQs(language, parseInt(limit));
    }

    res.json({
      success: true,
      faqs
    });

  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get FAQs'
    });
  }
});

/**
 * POST /api/chatbot/faqs
 * Create a new FAQ (admin only)
 */
router.post('/faqs', ...requireAdminOrSuperAdmin, [
  body('question').trim().isLength({ min: 1, max: 500 }).withMessage('Question is required and must be under 500 characters'),
  body('answer').trim().isLength({ min: 1, max: 2000 }).withMessage('Answer is required and must be under 2000 characters'),
  body('category').isIn(['admissions', 'academics', 'enrollment', 'schedules', 'payments', 'facilities', 'events', 'policies', 'technical', 'general']).withMessage('Invalid category'),
  body('priority').optional().isInt({ min: 1, max: 10 }).withMessage('Priority must be between 1 and 10'),
], handleValidationErrors, async (req, res) => {
  try {
    const faqData = req.body;
    const createdBy = req.user._id;

    const faq = await KnowledgeBaseService.addFAQ(faqData, createdBy);

    res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      faq
    });

  } catch (error) {
    console.error('Create FAQ error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create FAQ'
    });
  }
});

/**
 * PUT /api/chatbot/faqs/:id
 * Update an existing FAQ (admin only)
 */
router.put('/faqs/:id', ...requireAdminOrSuperAdmin, [
  body('question').optional().trim().isLength({ min: 1, max: 500 }).withMessage('Question must be under 500 characters'),
  body('answer').optional().trim().isLength({ min: 1, max: 2000 }).withMessage('Answer must be under 2000 characters'),
  body('category').optional().isIn(['admissions', 'academics', 'enrollment', 'schedules', 'payments', 'facilities', 'events', 'policies', 'technical', 'general']).withMessage('Invalid category'),
  body('priority').optional().isInt({ min: 1, max: 10 }).withMessage('Priority must be between 1 and 10'),
], handleValidationErrors, async (req, res) => {
  try {
    const faqId = req.params.id;
    const updateData = req.body;
    const updatedBy = req.user._id;

    const faq = await KnowledgeBaseService.updateFAQ(faqId, updateData, updatedBy);

    res.json({
      success: true,
      message: 'FAQ updated successfully',
      faq
    });

  } catch (error) {
    console.error('Update FAQ error:', error);
    
    if (error.message === 'FAQ not found') {
      return res.status(404).json({
        error: 'Not found',
        message: 'FAQ not found'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update FAQ'
    });
  }
});

/**
 * DELETE /api/chatbot/faqs/:id
 * Delete an FAQ (admin only)
 */
router.delete('/faqs/:id', ...requireAdminOrSuperAdmin, async (req, res) => {
  try {

    const faqId = req.params.id;
    const success = await KnowledgeBaseService.deleteFAQ(faqId);

    if (!success) {
      return res.status(404).json({
        error: 'Not found',
        message: 'FAQ not found'
      });
    }

    res.json({
      success: true,
      message: 'FAQ deleted successfully'
    });

  } catch (error) {
    console.error('Delete FAQ error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete FAQ'
    });
  }
});

/**
 * POST /api/chatbot/faqs/:id/feedback
 * Add feedback to an FAQ
 */
router.post('/faqs/:id/feedback', requireAuth, [
  body('helpful').isBoolean().withMessage('Helpful must be a boolean'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
], handleValidationErrors, async (req, res) => {
  try {
    const faqId = req.params.id;
    const { helpful, rating } = req.body;

    const faq = await KnowledgeBaseService.addFeedback(faqId, helpful, rating);

    res.json({
      success: true,
      message: 'Feedback added successfully',
      faq: {
        _id: faq._id,
        feedback: faq.feedback
      }
    });

  } catch (error) {
    console.error('Add feedback error:', error);
    
    if (error.message === 'FAQ not found') {
      return res.status(404).json({
        error: 'Not found',
        message: 'FAQ not found'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to add feedback'
    });
  }
});

/**
 * GET /api/chatbot/categories
 * Get available FAQ categories
 */
router.get('/categories', (req, res) => {
  const categories = [
    { value: 'admissions', label: 'Admissions' },
    { value: 'academics', label: 'Academics' },
    { value: 'enrollment', label: 'Enrollment' },
    { value: 'schedules', label: 'Schedules' },
    { value: 'payments', label: 'Payments' },
    { value: 'facilities', label: 'Facilities' },
    { value: 'events', label: 'Events' },
    { value: 'policies', label: 'Policies' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'general', label: 'General' }
  ];

  res.json({
    success: true,
    categories
  });
});

module.exports = router;