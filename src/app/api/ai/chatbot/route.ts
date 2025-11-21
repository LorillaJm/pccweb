import { NextRequest, NextResponse } from 'next/server';

// System knowledge about PCC (Philippine Computer College) system
const SYSTEM_KNOWLEDGE = `You are an intelligent AI assistant for Philippine Computer College (PCC) Student Portal. You have comprehensive knowledge about the system and can help students, faculty, and staff with various tasks.

SYSTEM CAPABILITIES:
1. **Student Services:**
   - View grades and academic performance
   - Check enrollment status and enrolled subjects
   - Access learning materials and course content
   - View payment history and make payments
   - Check announcements and campus news
   - Access digital ID card

2. **Academic Information:**
   - Subject codes, course descriptions, and prerequisites
   - Class schedules and room assignments
   - Faculty information and office hours
   - Semester and academic year information
   - GPA calculation and grade interpretation

3. **Administrative Services:**
   - Registration and enrollment procedures
   - Payment methods and fee structures
   - Library services and resources
   - Campus facilities and locations
   - Contact information for departments

4. **Navigation Help:**
   - Guide users to specific pages (grades, enrollment, payments, materials)
   - Explain how to use different features
   - Troubleshoot common issues

RESPONSE GUIDELINES:
- Be helpful, friendly, and professional
- Provide accurate information based on the system's capabilities
- If you don't know something specific, guide the user to where they can find it
- Use clear, concise language
- For grade-related queries, explain how to access the grades page
- For enrollment, explain the enrollment process
- For payments, explain payment options and how to make payments
- Always be encouraging and supportive

IMPORTANT:
- You understand the full PCC system architecture
- You can help with navigation, explanations, and general questions
- You provide quick, accurate responses
- You maintain context throughout the conversation`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context } = body;
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get user info from cookies/headers if available (for context)
    const cookieHeader = request.headers.get('cookie');
    const authHeader = request.headers.get('authorization');
    
    // Note: This endpoint doesn't require authentication, but uses user context if available

    // Get API key from environment (supports both OpenAI and Anthropic)
    const openaiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    
    // Use OpenAI by default, fallback to Anthropic if OpenAI not available
    const useOpenAI = !!openaiKey;
    const apiKey = useOpenAI ? openaiKey : anthropicKey;
    
    if (!apiKey) {
      // Fallback to a simple rule-based response if no API key
      return NextResponse.json({
        response: generateFallbackResponse(message, context),
        confidence: 0.7,
        intent: 'general',
        entities: [],
        conversationId: `conv_${Date.now()}`,
        sessionId: context?.sessionId || `session_${Date.now()}`,
        escalated: false,
        suggestedActions: [],
        relatedFAQs: []
      });
    }

    // Build user context
    const userContext = context ? `
User Context:
- Role: ${context.userRole || 'student'}
- Current Page: ${context.currentPage || 'unknown'}
- Device: ${context.deviceType || 'desktop'}
` : '';

    // Call AI API
    if (useOpenAI) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Fast and cost-effective
          messages: [
            { role: 'system', content: SYSTEM_KNOWLEDGE },
            { role: 'user', content: `${userContext}\n\nUser Question: ${message}` }
          ],
          temperature: 0.7,
          max_tokens: 500,
          stream: false,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('OpenAI API error:', error);
        throw new Error('AI service unavailable');
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || 'I apologize, but I encountered an error processing your request.';

      return NextResponse.json({
        response: aiResponse,
        confidence: 0.95,
        intent: extractIntent(message),
        entities: [],
        conversationId: `conv_${Date.now()}`,
        sessionId: context?.sessionId || `session_${Date.now()}`,
        escalated: false,
        suggestedActions: generateSuggestions(message, context),
        relatedFAQs: []
      });
    } else {
      // Use Anthropic Claude
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307', // Fast and cost-effective
          max_tokens: 500,
          messages: [
            { role: 'user', content: `${SYSTEM_KNOWLEDGE}\n\n${userContext}\n\nUser Question: ${message}` }
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Anthropic API error:', error);
        throw new Error('AI service unavailable');
      }

      const data = await response.json();
      const aiResponse = data.content[0]?.text || 'I apologize, but I encountered an error processing your request.';

      return NextResponse.json({
        response: aiResponse,
        confidence: 0.95,
        intent: extractIntent(message),
        entities: [],
        conversationId: `conv_${Date.now()}`,
        sessionId: context?.sessionId || `session_${Date.now()}`,
        escalated: false,
        suggestedActions: generateSuggestions(message, context),
        relatedFAQs: []
      });
    }
  } catch (error: any) {
    console.error('AI Chatbot error:', error);
    
    // Return fallback response
    return NextResponse.json({
      response: generateFallbackResponse(body.message || '', body.context || {}),
      confidence: 0.6,
      intent: 'general',
      entities: [],
      conversationId: `conv_${Date.now()}`,
      sessionId: body.context?.sessionId || `session_${Date.now()}`,
      escalated: false,
      suggestedActions: [],
      relatedFAQs: []
    });
  }
}

// Fallback response generator when AI is not available
function generateFallbackResponse(message: string, context: any): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('grade') || lowerMessage.includes('gpa') || lowerMessage.includes('score')) {
    return `To check your grades, please navigate to the "Grades" section in your student portal. You can access it from the sidebar menu. Your grades will show your performance for each subject, including your GPA. If you need help accessing your grades, let me know!`;
  }
  
  if (lowerMessage.includes('enroll') || lowerMessage.includes('subject') || lowerMessage.includes('course')) {
    return `For enrollment, go to the "Enrollment" section in your student portal. There you can view available subjects, check prerequisites, and enroll in courses for the current semester. Make sure you meet the prerequisites before enrolling.`;
  }
  
  if (lowerMessage.includes('payment') || lowerMessage.includes('fee') || lowerMessage.includes('tuition')) {
    return `You can view and make payments in the "Payments" section. The system supports various payment methods. Check your payment history and outstanding balances there.`;
  }
  
  if (lowerMessage.includes('material') || lowerMessage.includes('download') || lowerMessage.includes('file')) {
    return `Learning materials are available in the "Learning Materials" section. You can access documents, videos, and other resources for your enrolled subjects there.`;
  }
  
  if (lowerMessage.includes('announcement') || lowerMessage.includes('news') || lowerMessage.includes('update')) {
    return `Check the "Announcements" section for the latest campus news, important updates, and notifications. This is where you'll find information about events, deadlines, and other important information.`;
  }
  
  return `I'm here to help you with the PCC Student Portal! You can ask me about grades, enrollment, payments, learning materials, announcements, or any other features of the system. What would you like to know?`;
}

// Extract intent from message
function extractIntent(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('grade') || lowerMessage.includes('gpa')) return 'grades';
  if (lowerMessage.includes('enroll') || lowerMessage.includes('subject')) return 'enrollment';
  if (lowerMessage.includes('payment') || lowerMessage.includes('fee')) return 'payment';
  if (lowerMessage.includes('material') || lowerMessage.includes('download')) return 'materials';
  if (lowerMessage.includes('announcement') || lowerMessage.includes('news')) return 'announcements';
  if (lowerMessage.includes('help') || lowerMessage.includes('how')) return 'help';
  
  return 'general';
}

// Generate suggested actions based on message
function generateSuggestions(message: string, context: any): Array<{ text: string; action: 'navigate' | 'contact'; target: string }> {
  const lowerMessage = message.toLowerCase();
  const suggestions: Array<{ text: string; action: 'navigate' | 'contact'; target: string }> = [];
  
  if (lowerMessage.includes('grade')) {
    suggestions.push({ text: 'View My Grades', action: 'navigate', target: '/student/grades' });
  }
  
  if (lowerMessage.includes('enroll')) {
    suggestions.push({ text: 'Enroll in Subjects', action: 'navigate', target: '/student/enrollment' });
  }
  
  if (lowerMessage.includes('payment')) {
    suggestions.push({ text: 'Make Payment', action: 'navigate', target: '/student/payments' });
  }
  
  if (lowerMessage.includes('material')) {
    suggestions.push({ text: 'View Materials', action: 'navigate', target: '/student/materials' });
  }
  
  return suggestions;
}

