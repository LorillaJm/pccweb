'use client';

import React, { useRef, useEffect } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface SVGLineDrawProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  className?: string;
  triggerOnce?: boolean;
  threshold?: number;
}

export default function SVGLineDraw({
  children,
  duration = 2,
  delay = 0,
  className = '',
  triggerOnce = true,
  threshold = 0.3
}: SVGLineDrawProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: triggerOnce, amount: threshold });
  const controls = useAnimation();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      controls.set({ pathLength: 1, opacity: 1 });
      return;
    }

    if (isInView) {
      controls.start({
        pathLength: 1,
        opacity: 1,
        transition: {
          pathLength: {
            duration,
            delay,
            ease: "easeInOut"
          },
          opacity: {
            duration: 0.3,
            delay
          }
        }
      });
    } else {
      controls.set({
        pathLength: 0,
        opacity: 0
      });
    }
  }, [isInView, controls, duration, delay, prefersReducedMotion]);

  // If reduced motion is preferred, render static version
  if (prefersReducedMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={className}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === 'svg') {
          return React.cloneElement(child, {
            ...child.props,
            children: React.Children.map(child.props.children, (svgChild) => {
              if (React.isValidElement(svgChild) && (svgChild.type === 'path' || svgChild.type === 'line' || svgChild.type === 'polyline' || svgChild.type === 'polygon' || svgChild.type === 'circle' || svgChild.type === 'ellipse' || svgChild.type === 'rect')) {
                return (
                  <motion.path
                    {...svgChild.props}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={controls}
                    style={{
                      ...svgChild.props.style,
                      pathLength: 0
                    }}
                  />
                );
              }
              return svgChild;
            })
          });
        }
        return child;
      })}
    </div>
  );
}

// Utility component for common icon animations
export function AnimatedIcon({
  icon: Icon,
  size = 24,
  className = '',
  duration = 2,
  delay = 0,
  color = 'currentColor',
  strokeWidth = 2,
  ...props
}: {
  icon: React.ComponentType<any>;
  size?: number;
  className?: string;
  duration?: number;
  delay?: number;
  color?: string;
  strokeWidth?: number;
  [key: string]: any;
}) {
  return (
    <SVGLineDraw
      duration={duration}
      delay={delay}
      className={className}
      {...props}
    >
      <Icon
        size={size}
        color={color}
        strokeWidth={strokeWidth}
        style={{ width: size, height: size }}
      />
    </SVGLineDraw>
  );
}

// Predefined animated icons for common use cases
export function AnimatedCheckIcon(props: Omit<Parameters<typeof AnimatedIcon>[0], 'icon'>) {
  return (
    <SVGLineDraw {...props}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6L9 17l-5-5" />
      </svg>
    </SVGLineDraw>
  );
}

export function AnimatedArrowIcon(props: Omit<Parameters<typeof AnimatedIcon>[0], 'icon'>) {
  return (
    <SVGLineDraw {...props}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14" />
        <path d="M12 5l7 7-7 7" />
      </svg>
    </SVGLineDraw>
  );
}

export function AnimatedStarIcon(props: Omit<Parameters<typeof AnimatedIcon>[0], 'icon'>) {
  return (
    <SVGLineDraw {...props}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    </SVGLineDraw>
  );
}