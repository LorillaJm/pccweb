'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatHeader } from './ChatHeader';
import { useChatbot } from '../../hooks/useChatbot';
import { useAuth } from '../../contexts/AuthContext';

interface ChatWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

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

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  isOpen,
  onToggle,
  className = ''
}) => {
  const { user } = useAuth();
  const {
    messages,
    isLoading,
    isTyping,
    sendMessage,
    endConversation,
    error,
    clearError
  } = useChatbot();

  const [inputValue, setInputValue] = useState('');
  const [suggestedActions, setSuggestedActions] = useState<SuggestedAction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle sending messages
  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    setInputValue('');
    setShowSuggestions(false);
    
    try {
      const response = await sendMessage(message);
      
      // Update suggested actions if provided
      if (response?.suggestedActions) {
        setSuggestedActions(response.suggestedActions);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Handle suggested action clicks
  const handleActionClick = (action: SuggestedAction) => {
    if (action.action === 'navigate') {
      window.location.href = action.target;
    } else if (action.action === 'contact') {
      // Handle contact actions (could open email, phone, etc.)
      handleSendMessage(`I need help with ${action.target}`);
    }
  };

  // Handle conversation end
  const handleEndConversation = async (satisfaction?: number) => {
    try {
      await endConversation(satisfaction);
      setSuggestedActions([]);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error ending conversation:', error);
    }
  };

  // Quick start suggestions
  const quickStartSuggestions = [
    { text: 'How do I enroll?', category: 'enrollment' },
    { text: 'Check my grades', category: 'academics' },
    { text: 'Payment information', category: 'payments' },
    { text: 'Library hours', category: 'facilities' },
    { text: 'Reset password', category: 'technical' }
  ];

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className={`fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 z-50 ${className}`}
        aria-label="Open chat"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 w-96 h-[32rem] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50 ${className}`}>
      {/* Chat Header */}
      <ChatHeader
        onClose={onToggle}
        onEndConversation={handleEndConversation}
        isConnected={!error}
        userName={user?.firstName}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {/* Welcome Message */}
        {messages.length === 0 && (
          <div className="text-center text-gray-600 py-8">
            <div className="mb-4">
              <svg
                className="w-12 h-12 mx-auto text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">
              Hi {user?.firstName || 'there'}! 👋
            </h3>
            <p className="text-sm mb-4">
              I'm here to help you with questions about PCC Portal. What can I assist you with today?
            </p>
            
            {/* Quick Start Suggestions */}
            {showSuggestions && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Quick Start
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {quickStartSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(suggestion.text)}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                    >
                      {suggestion.text}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            isBot={message.sender === 'bot'}
            isHuman={message.sender === 'human'}
          />
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm">Assistant is typing...</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-red-700">{error}</span>
              </div>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Suggested Actions */}
        {suggestedActions.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm font-medium text-blue-800 mb-2">Suggested Actions:</p>
            <div className="space-y-1">
              {suggestedActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleActionClick(action)}
                  className="block w-full text-left px-3 py-2 text-sm text-blue-700 hover:bg-blue-100 rounded transition-colors"
                >
                  {action.text}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <ChatInput
        ref={inputRef}
        value={inputValue}
        onChange={setInputValue}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        placeholder="Type your message..."
      />
    </div>
  );
};