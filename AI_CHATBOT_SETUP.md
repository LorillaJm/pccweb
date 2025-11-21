# AI Chatbot Setup Guide

The PCC Assistant now uses real AI reasoning powered by OpenAI GPT or Anthropic Claude!

## Features

✅ **Real AI Reasoning** - Uses GPT-4 or Claude for intelligent responses
✅ **System Knowledge** - Understands the entire PCC system architecture
✅ **Fast Responses** - Optimized for quick, accurate answers
✅ **Context Aware** - Remembers user role, current page, and conversation
✅ **Fallback Support** - Works even without API keys (rule-based responses)

## Setup Instructions

### Option 1: OpenAI (Recommended)

1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add to your `.env.local` file:
```bash
OPENAI_API_KEY=sk-your-api-key-here
```

### Option 2: Anthropic Claude

1. Get your API key from [Anthropic Console](https://console.anthropic.com/)
2. Add to your `.env.local` file:
```bash
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

### Option 3: No API Key (Fallback Mode)

If no API key is provided, the chatbot will use intelligent rule-based responses. This works but is less sophisticated than AI-powered responses.

## Environment Variables

Create or update `.env.local` in your project root:

```bash
# Choose one:
OPENAI_API_KEY=sk-your-openai-key
# OR
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# Existing variables
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## How It Works

1. **User sends message** → Frontend calls `/api/ai/chatbot`
2. **AI Processing** → System knowledge + user context + message → AI API
3. **Smart Response** → AI generates contextual, accurate response
4. **User receives** → Fast, helpful answer with suggested actions

## System Knowledge

The AI understands:
- Student services (grades, enrollment, payments, materials)
- Academic information (subjects, schedules, faculty)
- Administrative services (registration, library, facilities)
- Navigation help (how to use features, where to find things)

## Cost Considerations

- **OpenAI GPT-4o-mini**: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- **Anthropic Claude Haiku**: ~$0.25 per 1M input tokens, ~$1.25 per 1M output tokens

Both models are optimized for cost-effectiveness while maintaining quality.

## Troubleshooting

**"AI service unavailable" error:**
- Check your API key is correct
- Verify you have credits/quota available
- Check network connectivity

**Fallback responses:**
- If no API key, you'll get rule-based responses
- Still helpful but less sophisticated

**Authentication issues:**
- The AI endpoint doesn't require backend authentication
- Works with session cookies or JWT tokens

## Testing

1. Start your dev server: `npm run dev`
2. Log in to the portal
3. Open the chatbot widget
4. Ask questions like:
   - "How do I check my grades?"
   - "Where can I enroll in subjects?"
   - "How do I make a payment?"
   - "What learning materials are available?"

The AI will provide intelligent, contextual responses!

