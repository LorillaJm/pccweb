'use client';

import { useEffect, useState, useRef, RefObject } from 'react';

/**
 * Options for useInView hook
 */
interface UseInViewOptions {
  /**
   * Threshold at which to trigger (0-1)
   * 0 = as soon as any pixel is visible
   * 1 = when entire element is visible
   * Can also be an array for multiple thresholds
   * Default: 0.1
   */
  threshold?: number | number[];
  /**
   * Margin around the root element
   * Can be used to trigger earlier/later
   * Example: '-50px' triggers 50px before entering viewport
   * Default: '0px'
   */
  margin?: string;
  /**
   * Whether to trigger only once
   * If true, element stays "in view" after first trigger
   * Default: true
   */
  once?: boolean;
  /**
   * Root element for intersection
   * Default: null (viewport)
   */
  root?: Element | null;
  /**
   * Initial state before observation starts
   * Default: false
   */
  initialInView?: boolean;
}

/**
 * Return type for useInView hook
 */
interface UseInViewReturn {
  /**
   * Reference to attach to the element to observe
   */
  ref: RefObject<HTMLElement>;
  /**
   * Whether the element is currently in view
   */
  inView: boolean;
  /**
   * The intersection observer entry (for advanced use cases)
   */
  entry?: IntersectionObserverEntry;
}

/**
 * Hook to detect when an element enters the viewport
 * Requirements: 7.4, 9.4
 * 
 * Features:
 * - Uses Intersection Observer API
 * - Triggers animations when elements enter viewport
 * - Configurable threshold and margin
 * - Option to trigger once or continuously
 * - Returns ref and inView state
 * 
 * @example
 * ```tsx
 * const { ref, inView } = useInView({ threshold: 0.5, once: true });
 * 
 * return (
 *   <motion.div
 *     ref={ref}
 *     initial={{ opacity: 0, y: 50 }}
 *     animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
 *   >
 *     Content
 *   </motion.div>
 * );
 * ```
 */
export function useInView(options: UseInViewOptions = {}): UseInViewReturn {
  const {
    threshold = 0.1,
    margin = '0px',
    once = true,
    root = null,
    initialInView = false,
  } = options;

  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(initialInView);
  const [entry, setEntry] = useState<IntersectionObserverEntry>();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // If already in view and once is true, don't observe
    if (once && inView) return;

    // Check if IntersectionObserver is supported
    if (typeof IntersectionObserver === 'undefined') {
      // Fallback: assume element is in view
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);
        const isIntersecting = entry.isIntersecting;

        // Update state
        if (once) {
          // Once mode: only set to true, never back to false
          if (isIntersecting) {
            setInView(true);
          }
        } else {
          // Continuous mode: update based on intersection
          setInView(isIntersecting);
        }
      },
      {
        threshold,
        rootMargin: margin,
        root,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, margin, once, root, inView]);

  return { ref, inView, entry };
}

/**
 * Hook to detect when multiple elements enter the viewport
 * Useful for staggered animations
 * 
 * @example
 * ```tsx
 * const { refs, inViewStates } = useInViewMultiple(3);
 * 
 * return (
 *   <>
 *     {items.map((item, i) => (
 *       <motion.div
 *         key={i}
 *         ref={refs[i]}
 *         animate={inViewStates[i] ? { opacity: 1 } : { opacity: 0 }}
 *       >
 *         {item}
 *       </motion.div>
 *     ))}
 *   </>
 * );
 * ```
 */
export function useInViewMultiple(
  count: number,
  options: UseInViewOptions = {}
): {
  refs: RefObject<HTMLElement>[];
  inViewStates: boolean[];
} {
  const [inViewStates, setInViewStates] = useState<boolean[]>(
    Array(count).fill(options.initialInView || false)
  );
  const refs = useRef<RefObject<HTMLElement>[]>(
    Array(count)
      .fill(null)
      .map(() => ({ current: null }))
  ).current;

  useEffect(() => {
    const { threshold = 0.1, margin = '0px', once = true, root = null } = options;

    // Check if IntersectionObserver is supported
    if (typeof IntersectionObserver === 'undefined') {
      setInViewStates(Array(count).fill(true));
      return;
    }

    const observers: IntersectionObserver[] = [];

    refs.forEach((ref, index) => {
      if (!ref.current) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          const isIntersecting = entry.isIntersecting;

          setInViewStates((prev) => {
            const newStates = [...prev];
            if (once) {
              if (isIntersecting) {
                newStates[index] = true;
              }
            } else {
              newStates[index] = isIntersecting;
            }
            return newStates;
          });
        },
        {
          threshold,
          rootMargin: margin,
          root,
        }
      );

      observer.observe(ref.current);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [count, options, refs]);

  return { refs, inViewStates };
}
