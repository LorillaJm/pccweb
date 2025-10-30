# OpenAI API Setup Guide for PCC Portal Chatbot

## Current Status
- ⚠️ OpenAI API: Not configured (using fallback responses)
- ✅ Fallback System: Working (chatbot will still respond without OpenAI)

## What Happens Without OpenAI?

Your chatbot will still work! It uses:
1. **Knowledge Base**: Pre-configured FAQ responses
2. **Fallback Responses**: Generic helpful messages
3. **Intent Recognition**: Basic pattern matching for common questions

## Setting Up OpenAI (Optional but Recommended)

### Step 1: Create OpenAI Account
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up with your email or Google account
3. Verify your email address

### Step 2: Add Billing Information
1. Go to [Billing Settings](https://platform.openai.com/account/billing)
2. Add a payment method (credit card)
3. Set a usage limit (recommended: $5-10 for testing)

### Step 3: Generate API Key
1. Go to [API Keys](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Give it a name like "PCC Portal Chatbot"
4. Copy the key (starts with `sk-`)

### Step 4: Update Configuration
Edit your `backend/.env` file:
```bash
# Uncomment and replace with your actual API key
OPENAI_API_KEY=sk-your-actual-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=150
```

### Step 5: Test Configuration
```bash
# Test the configuration
node backend/test-openai-config.js

# Test with a custom message
node backend/test-openai-config.js "What courses does PCC offer?"
```

## Pricing Information

### GPT-3.5-Turbo Pricing (Recommended)
- **Input**: $0.0015 per 1K tokens
- **Output**: $0.002 per 1K tokens
- **Average cost per conversation**: ~$0.01-0.05
- **Monthly cost for small college**: $10-50

### Example Usage Costs
- **100 conversations/day**: ~$30/month
- **500 conversations/day**: ~$150/month
- **1000 conversations/day**: ~$300/month

### Free Credits
- New accounts get **$5 free credit**
- Enough for ~2,500 conversations
- Perfect for testing and initial deployment

## Alternative: GPT-4o-mini (Even Cheaper)
```bash
OPENAI_MODEL=gpt-4o-mini
```
- 60% cheaper than GPT-3.5-turbo
- Better performance for simple tasks
- Recommended for production

## Security Best Practices

### Environment Variables
- Never commit API keys to version control
- Use different keys for development/production
- Rotate keys regularly (every 3-6 months)

### Usage Monitoring
- Set up billing alerts in OpenAI dashboard
- Monitor usage in OpenAI usage dashboard
- Implement rate limiting in production

### API Key Management
```bash
# Development
OPENAI_API_KEY=sk-dev-key-here

# Production (use different key)
OPENAI_API_KEY=sk-prod-key-here
```

## Chatbot Features

### With OpenAI (Enhanced)
- ✅ Natural language understanding
- ✅ Context-aware responses
- ✅ Personalized answers
- ✅ Complex query handling
- ✅ Multi-turn conversations

### Without OpenAI (Fallback)
- ✅ FAQ-based responses
- ✅ Intent recognition
- ✅ Basic pattern matching
- ✅ Predefined helpful responses
- ✅ Knowledge base search

## Testing Your Chatbot

### Test Commands
```bash
# Test configuration
node backend/test-openai-config.js

# Test specific queries
node backend/test-openai-config.js "How do I enroll in subjects?"
node backend/test-openai-config.js "What are the tuition fees?"
node backend/test-openai-config.js "Where is the library located?"
```

### Frontend Testing
1. Start your server: `npm run dev` (in backend)
2. Start frontend: `npm run dev` (in root)
3. Open the chatbot widget
4. Try various questions

## Troubleshooting

### Common Issues

**401 Unauthorized**
- Check if API key is correct
- Ensure key starts with `sk-`
- Verify key is not expired

**429 Rate Limited**
- You've exceeded usage limits
- Add billing information
- Increase rate limits in OpenAI dashboard

**Insufficient Quota**
- Add billing information to your account
- Your free credits may be exhausted
- Check usage in OpenAI dashboard

**Network Errors**
- Check internet connection
- Verify firewall allows HTTPS to api.openai.com
- Try again after a few minutes

### Debug Mode
Add this to your `.env` for detailed logging:
```bash
OPENAI_DEBUG=true
```

## Production Considerations

### Performance
- Cache common responses
- Implement conversation memory
- Use streaming for long responses
- Add typing indicators

### Monitoring
- Log all conversations
- Track response times
- Monitor API usage
- Set up error alerts

### Scaling
- Implement rate limiting per user
- Use Redis for conversation storage
- Consider multiple API keys for load balancing
- Monitor costs and usage patterns

## Support

### If You Need Help
1. Check the troubleshooting section above
2. Run the test script for detailed error messages
3. Check OpenAI status page: https://status.openai.com/
4. Review OpenAI documentation: https://platform.openai.com/docs

### Cost Management
- Start with low usage limits
- Monitor daily/monthly spending
- Use GPT-3.5-turbo for cost efficiency
- Implement conversation limits per user

## Summary

Your chatbot works in two modes:
1. **With OpenAI**: Smart, context-aware responses
2. **Without OpenAI**: Basic but functional FAQ system

For development and testing, the fallback system is sufficient. For production with many users, OpenAI provides a much better user experience.

**Recommendation**: Start with the free $5 credit to test, then decide based on usage patterns.