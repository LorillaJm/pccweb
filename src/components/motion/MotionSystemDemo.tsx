'use client';

import React from 'react';
import { useMotionContext } from './MotionProvider';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { MotionWrapper } from './MotionWrapper';

/**
 * Demo component showing how to use the motion system
 * This is for demonstration purposes only
 */
export function MotionSystemDemo() {
  const { prefersReducedMotion, enableAnimations, performanceMode } = useMotionContext();
  const reducedMotion = useReducedMotion();

  return (
    <div className="p-8 space-y-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <h2 className="text-2xl font-bold">Motion System Status</h2>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Reduced Motion:</span>
          <span className={reducedMotion ? 'text-orange-600' : 'text-green-600'}>
            {reducedMotion ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-semibold">Animations:</span>
          <span className={enableAnimations ? 'text-green-600' : 'text-orange-600'}>
            {enableAnimations ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-semibold">Performance Mode:</span>
          <span className={
            performanceMode === 'high' ? 'text-green-600' :
            performanceMode === 'medium' ? 'text-yellow-600' :
            'text-red-600'
          }>
            {performanceMode.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">MotionWrapper Example</h3>
        <MotionWrapper
          fallback={
            <div className="p-4 bg-gray-200 dark:bg-gray-800 rounded">
              Static fallback content (no animation)
            </div>
          }
        >
          <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded animate-pulse">
            Animated content (with animation)
          </div>
        </MotionWrapper>
      </div>

      <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
        <p className="text-sm">
          <strong>Tip:</strong> Enable "Reduce motion" in your system settings to see the fallback content.
        </p>
      </div>
    </div>
  );
}
