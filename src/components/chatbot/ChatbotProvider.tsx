'use client';

import React, { useState, useEffect } from 'react';
import { ChatWidget } from './ChatWidget';
import { useAuth } from '../../contexts/AuthContext';

interface ChatbotProviderProps {
  children: React.ReactNode;
  enabled?: boolean;
  autoOpen?: boolean;
  position?: 'bottom-right' | 'bottom-left';
}

export const ChatbotProvider: React.FC<ChatbotProviderProps> = ({
  children,
  enabled = true,
  autoOpen = false,
  position = 'bottom-right'
}) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Auto-open logic
  useEffect(() => {
    if (autoOpen && user && !hasInteracted) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000); // Open after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [autoOpen, user, hasInteracted]);

  // Track user interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      setHasInteracted(true);
    };

    // Listen for various user interactions
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('scroll', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('scroll', handleUserInteraction);
    };
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setHasInteracted(true);
  };

  // Don't render if not enabled or user not logged in
  if (!enabled || !user) {
    return <>{children}</>;
  }

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6'
  };

  return (
    <>
      {children}
      <div className={`fixed ${positionClasses[position]} z-50`}>
        <ChatWidget
          isOpen={isOpen}
          onToggle={handleToggle}
        />
      </div>
    </>
  );
};