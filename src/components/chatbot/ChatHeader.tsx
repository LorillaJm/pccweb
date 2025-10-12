'use client';

import React, { useState } from 'react';

interface ChatHeaderProps {
  onClose: () => void;
  onEndConversation: (satisfaction?: number) => void;
  isConnected: boolean;
  userName?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onClose,
  onEndConversation,
  isConnected,
  userName
}) => {
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [satisfaction, setSatisfaction] = useState<number | null>(null);

  const handleEndConversation = () => {
    onEndConversation(satisfaction || undefined);
    setShowEndDialog(false);
    setSatisfaction(null);
  };

  const handleSatisfactionClick = (rating: number) => {
    setSatisfaction(rating);
  };

  return (
    <>
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Bot Avatar */}
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
              <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V9a1 1 0 00-1-1h-1v4.396a1 1 0 01-1.376.939L11 12.618V15a1 1 0 01-1 1H4a1 1 0 01-1-1v-3.382l-1.624.717A1 1 0 010 11.396V7a1 1 0 011-1h1V5a1 1 0 011-1h8a1 1 0 011 1v1z" />
            </svg>
          </div>

          {/* Title and Status */}
          <div>
            <h3 className="font-semibold text-sm">PCC Assistant</h3>
            <div className="flex items-center space-x-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-400' : 'bg-red-400'
              }`}></div>
              <span className="opacity-90">
                {isConnected ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-2">
          {/* End Conversation Button */}
          <button
            onClick={() => setShowEndDialog(true)}
            className="p-1 hover:bg-blue-500 rounded transition-colors"
            title="End conversation"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>

          {/* Minimize Button */}
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-500 rounded transition-colors"
            title="Minimize chat"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* End Conversation Dialog */}
      {showEndDialog && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 rounded-lg">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h4 className="font-semibold text-lg mb-2">End Conversation</h4>
            <p className="text-gray-600 text-sm mb-4">
              How would you rate your experience with the assistant?
            </p>

            {/* Rating Stars */}
            <div className="flex justify-center space-x-1 mb-4">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleSatisfactionClick(rating)}
                  className={`p-1 transition-colors ${
                    satisfaction && satisfaction >= rating
                      ? 'text-yellow-400'
                      : 'text-gray-300 hover:text-yellow-300'
                  }`}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>

            {/* Satisfaction Text */}
            {satisfaction && (
              <p className="text-center text-sm text-gray-600 mb-4">
                {satisfaction === 5 && "Excellent! 🎉"}
                {satisfaction === 4 && "Great! 😊"}
                {satisfaction === 3 && "Good 👍"}
                {satisfaction === 2 && "Okay 😐"}
                {satisfaction === 1 && "Needs improvement 😔"}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowEndDialog(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEndConversation}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                End Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};