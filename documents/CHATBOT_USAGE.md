# PCC Portal Chatbot - Usage Guide

## Overview

The PCC Portal now includes an AI-powered chatbot that helps students, faculty, and staff get quick answers to common questions about the college. The chatbot appears as a floating chat widget in the bottom-right corner of all portal pages.

## Features

### 🤖 AI-Powered Responses
- Natural language processing using OpenAI GPT
- Fallback to knowledge base when AI is unavailable
- Context-aware responses based on user role and current page

### 💬 Smart Conversation Management
- Intent classification (enrollment, academics, payments, etc.)
- Entity extraction (emails, student IDs, dates)
- Conversation history and context tracking
- Human escalation when needed

### 🌐 Multilingual Support
- English and Filipino language support
- Automatic language detection
- Localized responses

### 📚 Knowledge Base
- Comprehensive FAQ database
- Categories: Admissions, Academics, Enrollment, Payments, Facilities, Technical Support
- Admin-managed content with analytics

## How to Use

### For Students, Faculty, and Staff

1. **Access the Chatbot**
   - Log into your portal account
   - Look for the blue chat bubble in the bottom-right corner
   - Click to open the chat widget

2. **Start a Conversation**
   - Type your question in natural language
   - Use the quick start suggestions for common topics
   - Ask follow-up questions for more details

3. **Example Questions**
   - "How do I enroll for next semester?"
   - "What are the library hours?"
   - "How can I check my grades?"
   - "When is the tuition payment due?"
   - "I forgot my password, how do I reset it?"

4. **Get Help**
   - If the bot can't help, it will escalate to human support
   - Rate your experience to help improve the service
   - Use the "Contact support" option for complex issues

### For Administrators

1. **FAQ Management**
   - Access the admin panel to manage FAQs
   - Add, edit, or delete knowledge base entries
   - Organize content by categories and priorities

2. **Analytics Dashboard**
   - View conversation statistics
   - Monitor chatbot performance
   - Track popular questions and user satisfaction

3. **API Endpoints**
   ```
   GET /api/chatbot/faqs - Get FAQs
   POST /api/chatbot/faqs - Create FAQ (admin only)
   PUT /api/chatbot/faqs/:id - Update FAQ (admin only)
   DELETE /api/chatbot/faqs/:id - Delete FAQ (admin only)
   GET /api/chatbot/analytics - Get analytics (admin only)
   ```

## Technical Implementation

### Frontend Components
- `ChatWidget` - Main chat interface
- `ChatMessage` - Message display component
- `ChatInput` - Input field with validation
- `ChatHeader` - Header with controls and status
- `ChatbotProvider` - Context provider for chat state

### Backend Services
- `ChatbotService` - Main AI service with OpenAI integration
- `KnowledgeBaseService` - FAQ management and search
- API routes for chat, FAQ management, and analytics

### Database Models
- `ChatConversation` - Conversation storage and tracking
- `FAQ` - Knowledge base entries with search indexing

## Configuration

### Environment Variables
```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=150

# Database
MONGODB_URI=mongodb://localhost:27017/pcc_portal
```

### Initialization
Run the initialization script to set up default FAQs:
```bash
cd backend
node scripts/init-chatbot.js
```

## Testing

### Manual Testing
- Visit `/test-chatbot` for component testing interface
- Test different user scenarios and edge cases
- Verify responsive design on mobile devices

### Automated Tests
```bash
# Backend tests
cd backend
node test-chatbot-models.js      # Model tests
node test-chatbot-service.js     # Service tests
node test-chatbot-integration.js # API integration tests
```

## Troubleshooting

### Common Issues

1. **Chatbot not appearing**
   - Ensure user is logged in
   - Check that ChatbotProvider is included in layout
   - Verify backend server is running

2. **AI responses not working**
   - Check OpenAI API key configuration
   - Verify internet connection
   - Fallback responses should still work

3. **Knowledge base empty**
   - Run the initialization script
   - Add FAQs through admin panel
   - Check database connection

### Debug Mode
Set `NODE_ENV=development` to see additional debug information including:
- Intent classification results
- Entity extraction details
- Confidence scores
- API response times

## Best Practices

### For Content Managers
1. Keep FAQ answers concise but comprehensive
2. Use clear, simple language
3. Include relevant keywords for better search
4. Regularly update content based on analytics
5. Test new FAQs with the chatbot

### For Users
1. Ask specific questions for better results
2. Use natural language - no need for keywords
3. Provide context when asking follow-up questions
4. Rate conversations to help improve the service
5. Use escalation for complex or urgent issues

## Future Enhancements

- Voice input/output capabilities
- Integration with student information system
- Proactive notifications and reminders
- Advanced analytics and reporting
- Mobile app integration
- Sentiment analysis and mood detection

## Support

For technical issues or questions about the chatbot system:
- Contact IT Support: itsupport@pcc.edu.ph
- Visit the IT office during business hours
- Submit a ticket through the admin panel

---

*Last updated: December 2024*