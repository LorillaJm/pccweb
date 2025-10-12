'use client';

import React, { forwardRef, KeyboardEvent, ChangeEvent } from 'react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
}

export const ChatInput = forwardRef<HTMLInputElement, ChatInputProps>(({
  value,
  onChange,
  onSendMessage,
  isLoading = false,
  placeholder = "Type your message...",
  maxLength = 500,
  disabled = false
}, ref) => {
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleSend = () => {
    if (value.trim() && !isLoading && !disabled) {
      onSendMessage(value.trim());
    }
  };

  const canSend = value.trim().length > 0 && !isLoading && !disabled;

  return (
    <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
      <div className="flex items-end space-x-2">
        {/* Input Field */}
        <div className="flex-1 relative">
          <input
            ref={ref}
            type="text"
            value={value}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={disabled || isLoading}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
              disabled || isLoading 
                ? 'bg-gray-100 cursor-not-allowed' 
                : 'bg-white'
            }`}
            aria-label="Type your message"
          />
          
          {/* Character Counter */}
          {value.length > maxLength * 0.8 && (
            <div className="absolute -top-6 right-0 text-xs text-gray-500">
              {value.length}/{maxLength}
            </div>
          )}
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={`p-2 rounded-lg transition-all duration-200 ${
            canSend
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          aria-label="Send message"
        >
          {isLoading ? (
            <svg
              className="w-5 h-5 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Quick Actions */}
      <div className="mt-2 flex flex-wrap gap-1">
        <button
          onClick={() => onSendMessage("I need help")}
          disabled={isLoading || disabled}
          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          I need help
        </button>
        <button
          onClick={() => onSendMessage("Contact support")}
          disabled={isLoading || disabled}
          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Contact support
        </button>
        <button
          onClick={() => onSendMessage("Thank you")}
          disabled={isLoading || disabled}
          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Thank you
        </button>
      </div>
    </div>
  );
});