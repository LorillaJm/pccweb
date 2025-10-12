'use client';

import React, { ReactNode } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useMotionContext } from '@/components/motion/MotionProvider';

/**
 * PageTransition component props
 */
interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  /**
   * Unique key for the page to trigger transitions
   */
  pageKey?: string;
  /**
   * Custom animation variants (optional)
   */
  variants?: Variants;
}

/**
 * Default page transition variants
 * Requirements: 4.1, 4.2, 4.3
 */
const defaultPageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -20,
  },
};

/**
 * Reduced motion variants (instant transitions)
 * Requirements: 4.6
 */
const reducedMotionVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
};

/**
 * PageTransition wrapper component
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
 * 
 * Features:
 * - Fade and slide transitions using Framer Motion
 * - Support for shared element morphing via layoutId
 * - Respects reduced motion preferences
 * - Smooth page navigation animations
 * - Customizable animation variants
 */
export default function PageTransition({
  children,
  className = '',
  pageKey,
  variants,
}: PageTransitionProps) {
  const { prefersReducedMotion } = useMotionContext();

  // Use reduced motion variants if user prefers reduced motion
  const animationVariants = prefersReducedMotion
    ? reducedMotionVariants
    : variants || defaultPageVariants;

  // Transition configuration optimized for performance
  // Requirements: 4.4, 4.5 (60 FPS desktop, 50-60 FPS mobile)
  const transitionConfig = {
    duration: prefersReducedMotion ? 0.15 : 0.3,
    ease: [0.22, 1, 0.36, 1], // Custom easing curve for smooth motion
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pageKey}
        variants={animationVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={transitionConfig}
        className={className}
        style={{
          // Use GPU-accelerated properties only
          // Requirements: 4.4, 4.5
          willChange: prefersReducedMotion ? 'auto' : 'transform, opacity',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Shared element wrapper for morphing transitions
 * Requirements: 4.2
 * 
 * Usage:
 * Wrap elements with the same layoutId on different pages
 * to create smooth morphing transitions between them
 */
interface SharedElementProps {
  children: ReactNode;
  layoutId: string;
  className?: string;
}

export function SharedElement({
  children,
  layoutId,
  className = '',
}: SharedElementProps) {
  const { prefersReducedMotion } = useMotionContext();

  // Skip shared element morphing if reduced motion is preferred
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      layoutId={layoutId}
      className={className}
      transition={{
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
// Named export for consistency
export { PageTransition };