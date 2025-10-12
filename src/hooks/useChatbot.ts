'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot' | 'human';
  timestamp: Date;
  confidence?: number;
  intent?: string;
  entities?: Array<{ type: string; value: string }>;
}

interface SuggestedAction {
  text: string;
  action: 'navigate' | 'contact';
  target: string;
}

interface ChatbotResponse {
  response: string;
  confidence: number;
  intent: string;
  entities: Array<{ type: string; value: string }>;
  conversationId: string;
  sessionId: string;
  escalated: boolean;
  suggestedActions: SuggestedAction[];
  relatedFAQs: Array<{
    _id: string;
    question: string;
    answer: string;
    category: string;
  }>;
}

interface UseChatbotReturn {
  messages: Message[];
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
  conversationId: string | null;
  sendMessage: (message: string) => Promise<ChatbotResponse | null>;
  endConversation: (satisfaction?: number) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
  getConversationHistory: () => Promise<void>;
}

export const useChatbot = (): UseChatbotReturn => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Generate unique message ID
  const generateMessageId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Add message to the conversation
  const addMessage = useCallback((message: Omit<Message, 'id'>) => {
    const newMessage: Message = {
      ...message,
      id: generateMessageId(),
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  // Send message to chatbot API
  const sendMessage = useCallback(async (content: string): Promise<ChatbotResponse | null> => {
    if (!user) {
      setError('Please log in to use the chatbot');
      return null;
    }

    try {
      setError(null);
      setIsLoading(true);

      // Add user message immediately
      addMessage({
        content,
        sender: 'user',
        timestamp: new Date(),
      });

      // Show typing indicator
      setIsTyping(true);

      // Get current page context
      const context = {
        userRole: user.role,
        currentPage: window.location.pathname,
        language: 'en',
        userAgent: navigator.userAgent,
        deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop',
      };

      // Call chatbot API
      console.log('Sending message to chatbot API:', { message: content, context });
      
      const response = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message: content,
          context,
        }),
      });

      console.log('Chatbot API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Chatbot API error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data: ChatbotResponse = await response.json();

      // Update conversation ID
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      // Add bot response
      addMessage({
        content: data.response,
        sender: data.escalated ? 'human' : 'bot',
        timestamp: new Date(),
        confidence: data.confidence,
        intent: data.intent,
        entities: data.entities,
      });

      return data;

    } catch (err) {
      console.error('Error sending message:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      
      // Add error message to chat
      addMessage({
        content: 'Sorry, I encountered an error. Please try again or contact support if the problem persists.',
        sender: 'bot',
        timestamp: new Date(),
        confidence: 0.1,
      });

      return null;
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [user, addMessage]);

  // End conversation
  const endConversation = useCallback(async (satisfaction?: number): Promise<void> => {
    if (!conversationId) return;

    try {
      await fetch('/api/chatbot/end-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          conversationId,
          satisfaction,
        }),
      });

      // Clear conversation state
      setConversationId(null);
      setMessages([]);
      setError(null);

    } catch (err) {
      console.error('Error ending conversation:', err);
      setError('Failed to end conversation properly');
    }
  }, [conversationId]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setError(null);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get conversation history
  const getConversationHistory = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      const response = await fetch('/api/chatbot/history', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Load the most recent active conversation if exists
      if (data.conversations && data.conversations.length > 0) {
        const recentConversation = data.conversations[0];
        if (recentConversation.status === 'active') {
          setConversationId(recentConversation._id);
          
          // Convert conversation messages to our format
          const convertedMessages: Message[] = recentConversation.messages.map((msg: any) => ({
            id: msg.messageId || generateMessageId(),
            content: msg.content,
            sender: msg.sender,
            timestamp: new Date(msg.timestamp),
            confidence: msg.confidence,
            intent: msg.intent,
            entities: msg.entities,
          }));
          
          setMessages(convertedMessages);
        }
      }

    } catch (err) {
      console.error('Error loading conversation history:', err);
      // Don't show error for history loading failure
    }
  }, [user]);

  // Load conversation history on mount
  useEffect(() => {
    if (user) {
      getConversationHistory();
    }
  }, [user, getConversationHistory]);

  return {
    messages,
    isLoading,
    isTyping,
    error,
    conversationId,
    sendMessage,
    endConversation,
    clearMessages,
    clearError,
    getConversationHistory,
  };
};