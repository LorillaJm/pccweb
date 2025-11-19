'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
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
  const abortControllerRef = useRef<AbortController | null>(null);

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

    // Prevent multiple simultaneous requests
    if (isLoading) {
      console.warn('Request already in progress, ignoring duplicate send');
      return null;
    }

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Set timeout (30 seconds)
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, 30000);

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
      
      // Get JWT token from localStorage if available (for OAuth)
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      
      const response = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        credentials: 'include',
        signal: abortController.signal,
        body: JSON.stringify({
          message: content,
          context,
        }),
      });

      clearTimeout(timeoutId);

      // Check if request was aborted
      if (abortController.signal.aborted) {
        return null;
      }

      console.log('Chatbot API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Chatbot API error response:', errorText);
        
        // Provide user-friendly error message for authentication issues
        if (response.status === 401) {
          throw new Error('Please log in to use the chatbot');
        }
        
        if (response.status === 408 || response.status === 504) {
          throw new Error('Request timed out. Please try again.');
        }
        
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
      clearTimeout(timeoutId);
      
      // Don't show error if request was aborted (user cancelled or timeout)
      if (abortController.signal.aborted) {
        // Check if it was a timeout
        if (err instanceof Error && err.name === 'AbortError') {
          const errorMessage = 'Request timed out. The server is taking too long to respond. Please try again.';
          setError(errorMessage);
          addMessage({
            content: errorMessage,
            sender: 'bot',
            timestamp: new Date(),
            confidence: 0.1,
          });
        }
        return null;
      }

      console.error('Error sending message:', err);
      
      // Handle different error types
      let errorMessage = 'Failed to send message';
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = 'Request was cancelled or timed out. Please try again.';
        } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = err.message;
        }
      }
      
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
      abortControllerRef.current = null;
    }
  }, [user, addMessage, isLoading]);

  // End conversation
  const endConversation = useCallback(async (satisfaction?: number): Promise<void> => {
    if (!conversationId) return;

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 10000); // 10 second timeout

    try {
      // Get JWT token from localStorage if available (for OAuth)
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      
      await fetch('/api/chatbot/end-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        credentials: 'include',
        signal: abortController.signal,
        body: JSON.stringify({
          conversationId,
          satisfaction,
        }),
      });

      clearTimeout(timeoutId);

      // Clear conversation state
      setConversationId(null);
      setMessages([]);
      setError(null);

    } catch (err) {
      clearTimeout(timeoutId);
      console.error('Error ending conversation:', err);
      // Don't show error for timeout on end conversation
      if (!abortController.signal.aborted) {
        setError('Failed to end conversation properly');
      }
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

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 10000); // 10 second timeout

    try {
      // Get JWT token from localStorage if available (for OAuth)
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      
      const response = await fetch('/api/chatbot/history', {
        method: 'GET',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        credentials: 'include',
        signal: abortController.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // If unauthorized (not logged in), silently fail - this is expected for guest users
        if (response.status === 401) {
          console.log('User not authenticated - conversation history unavailable');
          return;
        }
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
      clearTimeout(timeoutId);
      // Don't show error for history loading failure or aborted requests
      if (!abortController.signal.aborted) {
        console.error('Error loading conversation history:', err);
      }
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