'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface LoadingMaskProps {
  isLoading: boolean;
  onComplete?: () => void;
  children?: React.ReactNode;
}

export default function LoadingMask({ isLoading, onComplete, children }: LoadingMaskProps) {
  const [showMask, setShowMask] = useState(isLoading);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isLoading && showMask) {
      const timer = setTimeout(() => {
        setShowMask(false);
        onComplete?.();
      }, prefersReducedMotion ? 100 : 800);
      
      return () => clearTimeout(timer);
    } else if (isLoading) {
      setShowMask(true);
    }
  }, [isLoading, showMask, onComplete, prefersReducedMotion]);

  // If reduced motion is preferred, show minimal loading
  if (prefersReducedMotion) {
    return (
      <AnimatePresence mode="wait">
        {showMask && (
          <motion.div
            className="fixed inset-0 z-50 bg-white flex items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {showMask && (
          <motion.div
            className="fixed inset-0 z-50 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ 
              opacity: 0,
              scale: 1.1,
              filter: 'blur(10px)'
            }}
            transition={{ 
              duration: 0.8,
              ease: [0.4, 0, 0.2, 1]
            }}
          >
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
              <motion.div
                className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-400/20 rounded-full blur-xl"
                animate={{
                  scale: [1, 1.2, 1],
                  x: [0, 20, 0],
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <motion.div
                className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-purple-400/20 rounded-full blur-xl"
                animate={{
                  scale: [1, 1.3, 1],
                  x: [0, -15, 0],
                  y: [0, 15, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-indigo-400/20 rounded-full blur-xl"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            </div>

            {/* Loading Content */}
            <div className="relative z-10 text-center">
              {/* Animated Logo/Icon */}
              <motion.div
                className="mb-8"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  duration: 0.8,
                  ease: [0.4, 0, 0.2, 1]
                }}
              >
                <motion.div
                  className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  <motion.div
                    className="w-8 h-8 bg-white rounded-lg"
                    animate={{
                      scale: [1, 0.8, 1],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                </motion.div>
              </motion.div>

              {/* Loading Text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  PCC Portal
                </h2>
                <motion.p
                  className="text-gray-600"
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  Loading your experience...
                </motion.p>
              </motion.div>

              {/* Loading Progress Bar */}
              <motion.div
                className="mt-8 w-64 h-1 bg-gray-200 rounded-full overflow-hidden mx-auto"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{
                    duration: 2,
                    ease: 'easeInOut',
                    repeat: Infinity,
                  }}
                />
              </motion.div>

              {/* Floating Dots */}
              <div className="mt-6 flex justify-center space-x-2">
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    className="w-2 h-2 bg-blue-600 rounded-full"
                    animate={{
                      y: [0, -8, 0],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: index * 0.2,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Morphing Exit Animation */}
            <motion.div
              className="absolute inset-0 bg-white"
              initial={{ scale: 0, borderRadius: '50%' }}
              exit={{ 
                scale: 3,
                borderRadius: '0%',
                opacity: 0
              }}
              transition={{ 
                duration: 0.8,
                ease: [0.4, 0, 0.2, 1]
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Content */}
      {!showMask && children}
    </>
  );
}

// Hook for managing loading state
export function useLoadingMask(initialLoading = true) {
  const [isLoading, setIsLoading] = useState(initialLoading);

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  return {
    isLoading,
    startLoading,
    stopLoading,
    LoadingMask: ({ children, onComplete }: { children?: React.ReactNode; onComplete?: () => void }) => (
      <LoadingMask isLoading={isLoading} onComplete={onComplete}>
        {children}
      </LoadingMask>
    ),
  };
}

// Simple loading spinner component
export function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} border-2 border-blue-600 border-t-transparent rounded-full animate-spin ${className}`} />
  );
}