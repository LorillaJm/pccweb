'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot' | 'human';
  timestamp: Date;
  confidence?: number;
  intent?: string;
  entities?: Array<{ type: string; value: string }>;
}

interface ChatMessageProps {
  message: Message;
  isBot: boolean;
  isHuman?: boolean;
  showTimestamp?: boolean;
  showConfidence?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isBot,
  isHuman = false,
  showTimestamp = true,
  showConfidence = false
}) => {
  const formatTimestamp = (timestamp: Date) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'just now';
    }
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'text-gray-500';
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceText = (confidence?: number) => {
    if (!confidence) return 'Unknown';
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  if (isBot || isHuman) {
    return (
      <div className="flex items-start space-x-3">
        {/* Bot/Human Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isHuman ? 'bg-green-500' : 'bg-blue-500'
        }`}>
          {isHuman ? (
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
              <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V9a1 1 0 00-1-1h-1v4.396a1 1 0 01-1.376.939L11 12.618V15a1 1 0 01-1 1H4a1 1 0 01-1-1v-3.382l-1.624.717A1 1 0 010 11.396V7a1 1 0 011-1h1V5a1 1 0 011-1h8a1 1 0 011 1v1z" />
            </svg>
          )}
        </div>

        {/* Message Content */}
        <div className="flex-1 max-w-xs lg:max-w-md">
          <div className={`rounded-lg px-4 py-2 ${
            isHuman 
              ? 'bg-green-100 text-green-900' 
              : 'bg-gray-100 text-gray-900'
          }`}>
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            
            {/* Confidence Indicator (for bot messages) */}
            {isBot && showConfidence && message.confidence !== undefined && (
              <div className="mt-2 flex items-center space-x-2 text-xs">
                <span className="text-gray-500">Confidence:</span>
                <span className={getConfidenceColor(message.confidence)}>
                  {getConfidenceText(message.confidence)} ({Math.round(message.confidence * 100)}%)
                </span>
              </div>
            )}

            {/* Intent and Entities (for debugging) */}
            {isBot && process.env.NODE_ENV === 'development' && (
              <div className="mt-2 text-xs text-gray-500">
                {message.intent && (
                  <div>Intent: {message.intent}</div>
                )}
                {message.entities && message.entities.length > 0 && (
                  <div>
                    Entities: {message.entities.map(e => `${e.type}:${e.value}`).join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Timestamp */}
          {showTimestamp && (
            <div className="mt-1 text-xs text-gray-500 flex items-center space-x-2">
              <span>{isHuman ? 'Human Assistant' : 'AI Assistant'}</span>
              <span>•</span>
              <span>{formatTimestamp(message.timestamp)}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // User message
  return (
    <div className="flex items-start justify-end space-x-3">
      {/* Message Content */}
      <div className="flex-1 max-w-xs lg:max-w-md">
        <div className="bg-blue-600 text-white rounded-lg px-4 py-2 ml-auto">
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Timestamp */}
        {showTimestamp && (
          <div className="mt-1 text-xs text-gray-500 text-right">
            <span>You • {formatTimestamp(message.timestamp)}</span>
          </div>
        )}
      </div>

      {/* User Avatar */}
      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
};