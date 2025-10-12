'use client';

import React, { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { useMotionContext } from '@/components/motion/MotionProvider';

/**
 * PremiumCard component props
 */
export interface PremiumCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  className?: string;
  hoverScale?: number;
  disableHover?: boolean;
}

/**
 * PremiumCard - Premium card component with hover morph animations
 * 
 * Features:
 * - Hover scale transformation
 * - Border-radius morphing on hover
 * - Animated box-shadow for elevation effect
 * - No layout shifts during animation
 * - Respects reduced motion preferences
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */
export function PremiumCard({ 
  children, 
  className = '', 
  hoverScale = 1.03,
  disableHover = false,
  ...motionProps
}: PremiumCardProps) {
  const { prefersReducedMotion } = useMotionContext();
  
  // Animation variants for hover states
  // Requirements: 3.1 (scale), 3.2 (border-radius), 3.3 (shadow)
  const cardVariants = {
    rest: { 
      scale: 1, 
      borderRadius: '1rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    hover: { 
      scale: hoverScale,
      borderRadius: '1.5rem',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
    },
  };
  
  // Fallback for reduced motion - use subtle opacity change instead
  const reducedMotionVariants = {
    rest: { 
      opacity: 1,
      borderRadius: '1rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    hover: { 
      opacity: 0.9,
      borderRadius: '1rem',
      boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
    },
  };
  
  // If reduced motion is preferred, render with minimal animation
  // Requirement: 3.6 (reduced motion support)
  if (prefersReducedMotion) {
    return (
      <motion.div
        variants={reducedMotionVariants}
        initial="rest"
        whileHover={disableHover ? undefined : "hover"}
        transition={{ duration: 0.15 }}
        className={className}
        {...motionProps}
      >
        {children}
      </motion.div>
    );
  }
  
  // Full animation experience
  // Requirement: 3.4 (200-300ms duration), 3.5 (no layout shifts)
  return (
    <motion.div
      variants={cardVariants}
      initial="rest"
      whileHover={disableHover ? undefined : "hover"}
      transition={{ 
        duration: 0.25, 
        ease: 'easeOut',
        // Use transform and box-shadow only to avoid layout shifts
        // Requirement: 3.5
      }}
      style={{
        // Ensure transform origin is center to prevent layout shifts
        transformOrigin: 'center',
        // Use will-change for performance optimization
        willChange: 'transform, box-shadow, border-radius',
      }}
      className={className}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}

export default PremiumCard;
