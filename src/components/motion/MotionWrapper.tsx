'use client';

import React, { Component, ReactNode } from 'react';
import { useMotionContext } from './MotionProvider';

/**
 * Error Boundary for graceful degradation of animations
 */
class AnimationErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Animation error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

/**
 * Props for MotionWrapper component
 */
interface MotionWrapperProps {
  children: ReactNode;
  fallback: ReactNode;
  respectPerformance?: boolean;
}

/**
 * Wrapper component for conditional animation rendering
 * Renders fallback when reduced motion is enabled or performance is low
 * Requirements: 6.1, 6.4
 */
function MotionWrapperInner({ 
  children, 
  fallback, 
  respectPerformance = false 
}: MotionWrapperProps) {
  const { prefersReducedMotion, performanceMode } = useMotionContext();

  // Render fallback if user prefers reduced motion
  if (prefersReducedMotion) {
    return <>{fallback}</>;
  }

  // Optionally render fallback if performance is low
  if (respectPerformance && performanceMode === 'low') {
    return <>{fallback}</>;
  }

  // Render animated children with error boundary
  return (
    <AnimationErrorBoundary fallback={fallback}>
      {children}
    </AnimationErrorBoundary>
  );
}

/**
 * MotionWrapper component with error boundary
 * Conditionally renders animations based on user preferences and performance
 */
export function MotionWrapper(props: MotionWrapperProps) {
  return <MotionWrapperInner {...props} />;
}
