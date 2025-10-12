'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useMotionContext } from '@/components/motion/MotionProvider';

/**
 * HeroMorph component props
 */
interface HeroMorphProps {
  /**
   * Gradient colors for the morphing blob
   */
  colors?: string[];
  /**
   * Animation speed multiplier (default: 1)
   */
  speed?: number;
  /**
   * Parallax intensity (0-1, default: 0.5)
   */
  parallaxIntensity?: number;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * HeroMorph component - Animated morphing blob with parallax
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 * 
 * Features:
 * - SVG morphing blob animation
 * - Animated gradients
 * - Parallax scrolling effect
 * - GPU-accelerated animations
 * - Respects reduced motion preferences
 */
export default function HeroMorph({
  colors = ['#FF5A5F', '#00D4FF'],
  speed = 1,
  parallaxIntensity = 0.5,
  className = '',
}: HeroMorphProps) {
  const { prefersReducedMotion } = useMotionContext();
  const { scrollY } = useScroll();

  // Parallax transform - moves blob slower than scroll
  // Requirements: 1.2
  const y = useTransform(
    scrollY,
    [0, 500],
    [0, 150 * parallaxIntensity]
  );

  // Blob path morphing keyframes
  // Requirements: 1.1
  const blobPaths = [
    'M500,300 Q700,400 600,600 T400,500 Q300,400 500,300',
    'M500,350 Q650,450 550,650 T450,550 Q350,450 500,350',
    'M500,320 Q680,380 580,620 T420,520 Q320,420 500,320',
    'M500,300 Q700,400 600,600 T400,500 Q300,400 500,300',
  ];

  // Static fallback for reduced motion
  if (prefersReducedMotion) {
    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        <svg
          viewBox="0 0 1000 1000"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient
              id="blobGradient-static"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={colors[0]} stopOpacity="0.3" />
              <stop offset="100%" stopColor={colors[1]} stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <path
            d={blobPaths[0]}
            fill="url(#blobGradient-static)"
            opacity="0.3"
          />
        </svg>
      </div>
    );
  }

  return (
    <motion.div
      style={{ y }}
      className={`absolute inset-0 overflow-hidden ${className}`}
    >
      <svg
        viewBox="0 0 1000 1000"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Animated gradient */}
          {/* Requirements: 1.4 */}
          <linearGradient
            id="blobGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <motion.stop
              offset="0%"
              stopColor={colors[0]}
              animate={{
                stopColor: [colors[0], colors[1], colors[0]],
              }}
              transition={{
                duration: 8 / speed,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.stop
              offset="100%"
              stopColor={colors[1]}
              animate={{
                stopColor: [colors[1], colors[0], colors[1]],
              }}
              transition={{
                duration: 8 / speed,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </linearGradient>

          {/* Blur filter for softer edges */}
          <filter id="blobBlur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="20" />
          </filter>
        </defs>

        {/* Morphing blob path */}
        {/* Requirements: 1.1, 1.3 (GPU-accelerated) */}
        <motion.path
          d={blobPaths[0]}
          fill="url(#blobGradient)"
          filter="url(#blobBlur)"
          opacity="0.3"
          animate={{
            d: blobPaths,
          }}
          transition={{
            duration: 12 / speed,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            // GPU acceleration
            willChange: 'transform',
          }}
        />

        {/* Secondary blob for depth */}
        <motion.path
          d={blobPaths[1]}
          fill="url(#blobGradient)"
          filter="url(#blobBlur)"
          opacity="0.2"
          animate={{
            d: [...blobPaths.slice(1), blobPaths[0]],
          }}
          transition={{
            duration: 15 / speed,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            willChange: 'transform',
          }}
        />
      </svg>
    </motion.div>
  );
}

// Named export for consistency
export { HeroMorph };