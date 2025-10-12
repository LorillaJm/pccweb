'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Performance mode types
 */
export type PerformanceMode = 'high' | 'medium' | 'low';

/**
 * Motion context value interface
 */
export interface MotionContextValue {
  prefersReducedMotion: boolean;
  enableAnimations: boolean;
  performanceMode: PerformanceMode;
  setPerformanceMode: (mode: PerformanceMode) => void;
}

/**
 * Motion context for managing animation preferences and performance
 * Requirements: 6.1, 6.4, 7.1, 7.2
 */
const MotionContext = createContext<MotionContextValue | undefined>(undefined);

interface MotionProviderProps {
  children: ReactNode;
}

export function MotionProvider({ children }: MotionProviderProps) {
  const prefersReducedMotion = useReducedMotion();
  const [performanceMode, setPerformanceMode] = useState<PerformanceMode>('high');

  // Monitor FPS and adjust performance mode automatically
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      const elapsed = currentTime - lastTime;

      // Measure FPS every second
      if (elapsed >= 1000) {
        const fps = Math.round((frameCount * 1000) / elapsed);

        // Automatically adjust performance mode based on FPS
        // Requirements: 7.1 (60 FPS desktop), 7.2 (50-60 FPS mobile)
        if (fps >= 55) {
          setPerformanceMode('high');
        } else if (fps >= 45) {
          setPerformanceMode('medium');
        } else {
          setPerformanceMode('low');
        }

        frameCount = 0;
        lastTime = currentTime;
      }

      animationFrameId = requestAnimationFrame(measureFPS);
    };

    // Start monitoring after a short delay to avoid initial load impact
    const timeoutId = setTimeout(() => {
      animationFrameId = requestAnimationFrame(measureFPS);
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  const value: MotionContextValue = {
    prefersReducedMotion,
    enableAnimations: !prefersReducedMotion,
    performanceMode,
    setPerformanceMode,
  };

  return (
    <MotionContext.Provider value={value}>
      {children}
    </MotionContext.Provider>
  );
}

/**
 * Hook to access motion context
 * Throws error if used outside MotionProvider
 */
export function useMotionContext(): MotionContextValue {
  const context = useContext(MotionContext);
  
  if (context === undefined) {
    throw new Error('useMotionContext must be used within a MotionProvider');
  }
  
  return context;
}
