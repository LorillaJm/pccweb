'use client';

import { useScroll, useTransform, MotionValue } from 'framer-motion';
import { useRef, RefObject } from 'react';

/**
 * Options for useParallax hook
 */
interface UseParallaxOptions {
  /**
   * Parallax intensity (0-1, default: 0.5)
   * Higher values create more dramatic parallax effect
   */
  intensity?: number;
  /**
   * Scroll range to apply parallax effect [start, end]
   * Default: [0, 500]
   */
  scrollRange?: [number, number];
  /**
   * Output range for the transform [start, end]
   * If not provided, calculated from intensity and scrollRange
   */
  outputRange?: [number, number];
  /**
   * Reference to a specific element to track scroll
   * If not provided, uses window scroll
   */
  targetRef?: RefObject<HTMLElement>;
}

/**
 * Return type for useParallax hook
 */
interface UseParallaxReturn {
  /**
   * Motion value for Y-axis parallax transform
   */
  y: MotionValue<number>;
  /**
   * Reference to attach to the element (if targetRef not provided)
   */
  ref: RefObject<HTMLDivElement>;
}

/**
 * Hook for creating parallax scroll effects
 * Requirements: 1.2
 * 
 * Features:
 * - Uses Framer Motion's useScroll and useTransform
 * - Customizable intensity parameter
 * - Supports both window and element-based scrolling
 * - Returns motion value for smooth GPU-accelerated transforms
 * 
 * @example
 * ```tsx
 * const { y, ref } = useParallax({ intensity: 0.5 });
 * 
 * return (
 *   <motion.div ref={ref} style={{ y }}>
 *     Parallax content
 *   </motion.div>
 * );
 * ```
 */
export function useParallax(options: UseParallaxOptions = {}): UseParallaxReturn {
  const {
    intensity = 0.5,
    scrollRange = [0, 500],
    outputRange,
    targetRef,
  } = options;

  const internalRef = useRef<HTMLDivElement>(null);
  const ref = targetRef || internalRef;

  // Get scroll progress
  const { scrollY, scrollYProgress } = useScroll(
    targetRef
      ? {
          target: targetRef,
          offset: ['start end', 'end start'],
        }
      : undefined
  );

  // Calculate output range based on intensity if not provided
  const calculatedOutputRange: [number, number] = outputRange || [
    0,
    (scrollRange[1] - scrollRange[0]) * intensity,
  ];

  // Transform scroll position to parallax offset
  const y = useTransform(
    targetRef ? scrollYProgress : scrollY,
    targetRef ? [0, 1] : scrollRange,
    calculatedOutputRange
  );

  return { y, ref: ref as RefObject<HTMLDivElement> };
}

/**
 * Hook for creating horizontal parallax scroll effects
 * 
 * @example
 * ```tsx
 * const { x } = useParallaxX({ intensity: 0.3 });
 * 
 * return (
 *   <motion.div style={{ x }}>
 *     Horizontal parallax content
 *   </motion.div>
 * );
 * ```
 */
export function useParallaxX(options: UseParallaxOptions = {}): { x: MotionValue<number> } {
  const {
    intensity = 0.5,
    scrollRange = [0, 500],
    outputRange,
    targetRef,
  } = options;

  // Get scroll progress
  const { scrollY, scrollYProgress } = useScroll(
    targetRef
      ? {
          target: targetRef,
          offset: ['start end', 'end start'],
        }
      : undefined
  );

  // Calculate output range based on intensity if not provided
  const calculatedOutputRange: [number, number] = outputRange || [
    0,
    (scrollRange[1] - scrollRange[0]) * intensity,
  ];

  // Transform scroll position to parallax offset
  const x = useTransform(
    targetRef ? scrollYProgress : scrollY,
    targetRef ? [0, 1] : scrollRange,
    calculatedOutputRange
  );

  return { x };
}
