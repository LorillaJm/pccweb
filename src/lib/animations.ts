/**
 * Professional Animation System
 * Centralized animation configurations for consistent micro-interactions
 */

import { Variants, Transition } from 'framer-motion';

// ============================================================================
// TIMING & EASING
// ============================================================================

export const timing = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  verySlow: 0.8,
} as const;

export const easing = {
  smooth: [0.4, 0, 0.2, 1],
  snappy: [0.25, 0.1, 0.25, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  elastic: [0.175, 0.885, 0.32, 1.275],
} as const;

// ============================================================================
// HOVER ANIMATIONS
// ============================================================================

export const hoverScale = {
  subtle: 1.02,
  normal: 1.05,
  prominent: 1.08,
} as const;

export const hoverLift = {
  subtle: -2,
  normal: -4,
  prominent: -8,
} as const;

// ============================================================================
// CARD ANIMATIONS
// ============================================================================

export const cardVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  hover: {
    y: hoverLift.normal,
    scale: hoverScale.subtle,
    transition: {
      duration: timing.fast,
      ease: easing.smooth,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: timing.instant,
    },
  },
};

export const cardHoverTransition: Transition = {
  duration: timing.fast,
  ease: easing.smooth,
};

// ============================================================================
// BUTTON ANIMATIONS
// ============================================================================

export const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: hoverScale.subtle,
    transition: {
      duration: timing.fast,
      ease: easing.snappy,
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: timing.instant,
    },
  },
};

// ============================================================================
// ICON ANIMATIONS
// ============================================================================

export const iconRotateVariants: Variants = {
  initial: { rotate: 0 },
  hover: {
    rotate: 360,
    transition: {
      duration: timing.slow,
      ease: easing.smooth,
    },
  },
};

export const iconBounceVariants: Variants = {
  initial: { y: 0 },
  hover: {
    y: [0, -4, 0],
    transition: {
      duration: timing.normal,
      ease: easing.bounce,
      repeat: Infinity,
      repeatDelay: 0.5,
    },
  },
};

export const iconPulseVariants: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: [1, 1.1, 1],
    transition: {
      duration: timing.normal,
      ease: easing.smooth,
      repeat: Infinity,
    },
  },
};

// ============================================================================
// LIST ITEM ANIMATIONS
// ============================================================================

export const listItemVariants: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  hover: {
    x: 4,
    scale: hoverScale.subtle,
    transition: {
      duration: timing.fast,
      ease: easing.smooth,
    },
  },
};

// ============================================================================
// STAGGER ANIMATIONS
// ============================================================================

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: timing.normal,
      ease: easing.smooth,
    },
  },
};

// ============================================================================
// FADE ANIMATIONS
// ============================================================================

export const fadeInVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: timing.normal,
      ease: easing.smooth,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: timing.fast,
      ease: easing.smooth,
    },
  },
};

export const fadeInUpVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: timing.normal,
      ease: easing.smooth,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: timing.fast,
      ease: easing.smooth,
    },
  },
};

// ============================================================================
// SLIDE ANIMATIONS
// ============================================================================

export const slideInFromLeft: Variants = {
  initial: { x: -100, opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: timing.normal,
      ease: easing.smooth,
    },
  },
};

export const slideInFromRight: Variants = {
  initial: { x: 100, opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: timing.normal,
      ease: easing.smooth,
    },
  },
};

// ============================================================================
// SCALE ANIMATIONS
// ============================================================================

export const scaleInVariants: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: timing.normal,
      ease: easing.elastic,
    },
  },
};

// ============================================================================
// SHIMMER EFFECT
// ============================================================================

export const shimmerVariants: Variants = {
  initial: { backgroundPosition: '-200% 0' },
  animate: {
    backgroundPosition: '200% 0',
    transition: {
      duration: 2,
      ease: 'linear',
      repeat: Infinity,
    },
  },
};

// ============================================================================
// GLOW EFFECT
// ============================================================================

export const glowVariants: Variants = {
  initial: { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)' },
  hover: {
    boxShadow: '0 0 20px 2px rgba(59, 130, 246, 0.3)',
    transition: {
      duration: timing.normal,
      ease: easing.smooth,
    },
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a delayed animation variant
 */
export const withDelay = (variants: Variants, delay: number): Variants => {
  return Object.entries(variants).reduce((acc, [key, value]) => {
    if (typeof value === 'object' && 'transition' in value) {
      acc[key] = {
        ...value,
        transition: {
          ...(value.transition as any),
          delay,
        },
      };
    } else {
      acc[key] = value;
    }
    return acc;
  }, {} as Variants);
};

/**
 * Create a stagger delay based on index
 */
export const getStaggerDelay = (index: number, baseDelay = 0.05): number => {
  return index * baseDelay;
};
