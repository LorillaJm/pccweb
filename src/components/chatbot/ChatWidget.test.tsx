/**
 * Manual Test Component for ChatWidget
 * This file can be used to manually test the ChatWidget component
 * To use: Import and render this component in a test page
 */

'use client';

import React, { useState } from 'react';
import { ChatWidget } from './ChatWidget';
import { AuthContext } from '../../contexts/AuthContext';

// Mock user for testing
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'student' as const,
  isActive: true
};

// Mock auth context
const mockAuthContext = {
  user: mockUser,
  login: async () => ({ success: true }),
  logout: async () => {},
  register: async () => ({ success: true }),
  isLoading: false,
  error: null,
  clearError: () => {}
};

interface ChatWidgetTestProps {
  testScenario?: 'default' | 'no-user' | 'error' | 'loading';
}

export const ChatWidgetTest: React.FC<ChatWidgetTestProps> = ({ 
  testScenario = 'default' 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Modify auth context based on test scenario
  const getAuthContext = () => {
    switch (testScenario) {
      case 'no-user':
        return { ...mockAuthContext, user: null };
      case 'error':
        return { ...mockAuthContext, error: 'Test error message' };
      case 'loading':
        return { ...mockAuthContext, isLoading: true };
      default:
        return mockAuthContext;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">ChatWidget Test</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Scenario: {testScenario}</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Test Instructions:</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
                <li>Click the chat button to open the widget</li>
                <li>Try sending different types of messages</li>
                <li>Test the quick start suggestions</li>
                <li>Try ending the conversation with ratings</li>
                <li>Check responsive behavior on different screen sizes</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium">Expected Behavior:</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
                {testScenario === 'default' && (
                  <>
                    <li>Chat widget should appear in bottom-right corner</li>
                    <li>Welcome message should show with quick start options</li>
                    <li>Messages should be sent and responses received</li>
                    <li>Typing indicators should work</li>
                  </>
                )}
                {testScenario === 'no-user' && (
                  <>
                    <li>Chat widget should not appear (user not logged in)</li>
                  </>
                )}
                {testScenario === 'error' && (
                  <>
                    <li>Error message should be displayed in chat</li>
                    <li>User should be able to clear the error</li>
                  </>
                )}
                {testScenario === 'loading' && (
                  <>
                    <li>Loading states should be visible</li>
                    <li>Buttons should be disabled during loading</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {isOpen ? 'Close' : 'Open'} Chat Widget
            </button>
          </div>

          <div className="text-sm text-gray-600">
            <p><strong>Current State:</strong> {isOpen ? 'Open' : 'Closed'}</p>
            <p><strong>User:</strong> {getAuthContext().user ? 'Logged in' : 'Not logged in'}</p>
            <p><strong>Loading:</strong> {getAuthContext().isLoading ? 'Yes' : 'No'}</p>
            <p><strong>Error:</strong> {getAuthContext().error || 'None'}</p>
          </div>
        </div>
      </div>

      {/* Chat Widget */}
      <AuthContext.Provider value={getAuthContext()}>
        <ChatWidget
          isOpen={isOpen}
          onToggle={() => setIsOpen(!isOpen)}
        />
      </AuthContext.Provider>
    </div>
  );
};

// Test scenarios component
export const ChatWidgetTestSuite: React.FC = () => {
  const [currentScenario, setCurrentScenario] = useState<'default' | 'no-user' | 'error' | 'loading'>('default');

  const scenarios = [
    { key: 'default' as const, label: 'Default (Logged in user)' },
    { key: 'no-user' as const, label: 'No User (Not logged in)' },
    { key: 'error' as const, label: 'Error State' },
    { key: 'loading' as const, label: 'Loading State' }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Scenario Selector */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-8 py-4">
          <h1 className="text-2xl font-bold mb-4">ChatWidget Test Suite</h1>
          <div className="flex space-x-2">
            {scenarios.map((scenario) => (
              <button
                key={scenario.key}
                onClick={() => setCurrentScenario(scenario.key)}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  currentScenario === scenario.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {scenario.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Test Component */}
      <ChatWidgetTest testScenario={currentScenario} />
    </div>
  );
};