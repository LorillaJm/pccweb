import { Variants, Transition } from 'framer-motion';

/**
 * Easing curves for consistent animations
 * Using cubic-bezier values for smooth, premium feel
 */
export const easing = {
  smooth: [0.22, 1, 0.36, 1] as const,
  bounce: [0.68, -0.55, 0.265, 1.55] as const,
  sharp: [0.4, 0, 0.2, 1] as const,
  easeOut: [0, 0, 0.2, 1] as const,
  easeIn: [0.4, 0, 1, 1] as const,
  easeInOut: [0.4, 0, 0.6, 1] as const,
} as const;

/**
 * Duration presets for consistent timing
 */
export const duration = {
  instant: 0.1,
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8,
} as const;

/**
 * Page transition variants
 * Used for smooth page navigation with fade and slide
 */
export const pageTransitionVariants: Variants = {
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

export const pageTransition: Transition = {
  duration: duration.normal,
  ease: easing.smooth,
};

/**
 * Card hover variants
 * Includes scale, border-radius morph, and shadow elevation
 */
export const cardHoverVariants: Variants = {
  rest: {
    scale: 1,
    borderRadius: '1rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  hover: {
    scale: 1.03,
    borderRadius: '1.5rem',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
  },
};

export const cardTransition: Transition = {
  duration: 0.25,
  ease: easing.easeOut,
};

/**
 * Button interaction variants
 * Includes hover scale and tap feedback
 */
export const buttonVariants: Variants = {
  rest: {
    scale: 1,
  },
  hover: {
    scale: 1.05,
  },
  tap: {
    scale: 0.95,
  },
};

export const buttonTransition: Transition = {
  duration: duration.fast,
  ease: easing.sharp,
};

/**
 * Fade in variants
 * Simple opacity animation for content reveal
 */
export const fadeInVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
  },
};

export const fadeTransition: Transition = {
  duration: duration.normal,
  ease: easing.smooth,
};

/**
 * Slide up variants
 * Content slides up while fading in
 */
export const slideUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export const slideUpTransition: Transition = {
  duration: duration.slow,
  ease: easing.smooth,
};

/**
 * Stagger children animation
 * Used for animating lists of items with delay
 */
export const staggerContainerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

/**
 * Loading mask variants
 * Full-screen loading with morph exit
 */
export const loadingMaskVariants: Variants = {
  initial: {
    opacity: 1,
    scale: 1,
    borderRadius: '0%',
  },
  exit: {
    opacity: 0,
    scale: 0,
    borderRadius: '100%',
  },
};

export const loadingMaskTransition: Transition = {
  duration: duration.slower,
  ease: easing.smooth,
};

/**
 * Hero morph animation config
 * For morphing blob background
 */
export const heroMorphTransition = (speed: number = 1): Transition => ({
  duration: 8 / speed,
  repeat: Infinity,
  ease: 'easeInOut',
});

/**
 * Input focus variants
 * Smooth focus state for form inputs
 */
export const inputFocusVariants: Variants = {
  blur: {
    scale: 1,
    borderColor: 'rgba(154, 164, 178, 0.3)',
  },
  focus: {
    scale: 1.02,
    borderColor: 'rgba(0, 212, 255, 1)',
  },
};

export const inputTransition: Transition = {
  duration: duration.fast,
  ease: easing.easeOut,
};

/**
 * SVG line draw animation config
 * For stroke-dasharray animation
 */
export const svgLineDrawTransition: Transition = {
  duration: duration.slower,
  ease: easing.smooth,
};

/**
 * Utility function to create custom spring transition
 */
export const createSpringTransition = (
  stiffness: number = 300,
  damping: number = 30
): Transition => ({
  type: 'spring',
  stiffness,
  damping,
});

/**
 * Utility function to create custom tween transition
 */
export const createTweenTransition = (
  duration: number,
  ease: readonly number[] | string = easing.smooth
): Transition => ({
  type: 'tween',
  duration,
  ease,
});

/**
 * GPU-accelerated properties
 * Only these properties should be animated for best performance
 */
export const gpuAcceleratedProps = [
  'transform',
  'opacity',
  'filter',
] as const;

/**
 * Animation configuration presets
 * Combines variants and transitions for common patterns
 */
export const animationPresets = {
  pageTransition: {
    variants: pageTransitionVariants,
    transition: pageTransition,
  },
  cardHover: {
    variants: cardHoverVariants,
    transition: cardTransition,
  },
  button: {
    variants: buttonVariants,
    transition: buttonTransition,
  },
  fadeIn: {
    variants: fadeInVariants,
    transition: fadeTransition,
  },
  slideUp: {
    variants: slideUpVariants,
    transition: slideUpTransition,
  },
  stagger: {
    container: staggerContainerVariants,
    item: staggerItemVariants,
  },
  loadingMask: {
    variants: loadingMaskVariants,
    transition: loadingMaskTransition,
  },
  inputFocus: {
    variants: inputFocusVariants,
    transition: inputTransition,
  },
} as const;
