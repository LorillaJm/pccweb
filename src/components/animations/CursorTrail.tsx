'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface CursorTrailProps {
  enabled?: boolean;
  trailLength?: number;
  size?: number;
  color?: string;
  opacity?: number;
  className?: string;
}

interface TrailPoint {
  x: number;
  y: number;
  id: number;
}

export default function CursorTrail({
  enabled = true,
  trailLength = 8,
  size = 4,
  color = '#3B82F6',
  opacity = 0.6,
  className = ''
}: CursorTrailProps) {
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const idCounter = useRef(0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring animation for smooth following
  const springX = useSpring(mouseX, { damping: 25, stiffness: 200 });
  const springY = useSpring(mouseY, { damping: 25, stiffness: 200 });

  useEffect(() => {
    // Don't show cursor trail if reduced motion is preferred or disabled
    if (prefersReducedMotion || !enabled) {
      return;
    }

    let animationFrame: number;

    const updateTrail = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      // Add new point to trail
      const newPoint: TrailPoint = {
        x: e.clientX,
        y: e.clientY,
        id: idCounter.current++
      };

      setTrail(prevTrail => {
        const newTrail = [newPoint, ...prevTrail];
        return newTrail.slice(0, trailLength);
      });
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => {
      setIsVisible(false);
      setTrail([]);
    };

    // Add event listeners
    document.addEventListener('mousemove', updateTrail);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', updateTrail);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [enabled, prefersReducedMotion, trailLength, mouseX, mouseY]);

  // Don't render if reduced motion is preferred or disabled
  if (prefersReducedMotion || !enabled || !isVisible) {
    return null;
  }

  return (
    <div className={`fixed inset-0 pointer-events-none z-50 ${className}`}>
      {trail.map((point, index) => {
        const scale = 1 - (index / trailLength) * 0.8;
        const pointOpacity = (opacity * (1 - index / trailLength));
        
        return (
          <motion.div
            key={point.id}
            className="absolute rounded-full"
            style={{
              left: point.x - size / 2,
              top: point.y - size / 2,
              width: size * scale,
              height: size * scale,
              backgroundColor: color,
              opacity: pointOpacity,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: scale,
              opacity: pointOpacity,
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              duration: 0.2,
              ease: 'easeOut'
            }}
          />
        );
      })}
    </div>
  );
}

// Enhanced cursor trail with gradient effect
export function GradientCursorTrail({
  enabled = true,
  trailLength = 12,
  size = 6,
  colors = ['#3B82F6', '#8B5CF6', '#EC4899'],
  className = ''
}: {
  enabled?: boolean;
  trailLength?: number;
  size?: number;
  colors?: string[];
  className?: string;
}) {
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const idCounter = useRef(0);

  useEffect(() => {
    if (prefersReducedMotion || !enabled) {
      return;
    }

    const updateTrail = (e: MouseEvent) => {
      const newPoint: TrailPoint = {
        x: e.clientX,
        y: e.clientY,
        id: idCounter.current++
      };

      setTrail(prevTrail => {
        const newTrail = [newPoint, ...prevTrail];
        return newTrail.slice(0, trailLength);
      });
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => {
      setIsVisible(false);
      setTrail([]);
    };

    document.addEventListener('mousemove', updateTrail);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', updateTrail);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [enabled, prefersReducedMotion, trailLength]);

  if (prefersReducedMotion || !enabled || !isVisible) {
    return null;
  }

  return (
    <div className={`fixed inset-0 pointer-events-none z-50 ${className}`}>
      {trail.map((point, index) => {
        const scale = 1 - (index / trailLength) * 0.7;
        const opacity = 0.8 * (1 - index / trailLength);
        const colorIndex = Math.floor((index / trailLength) * colors.length);
        const color = colors[Math.min(colorIndex, colors.length - 1)];
        
        return (
          <motion.div
            key={point.id}
            className="absolute rounded-full blur-sm"
            style={{
              left: point.x - (size * scale) / 2,
              top: point.y - (size * scale) / 2,
              width: size * scale,
              height: size * scale,
              background: `radial-gradient(circle, ${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: scale,
              opacity: opacity,
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: 'easeOut'
            }}
          />
        );
      })}
    </div>
  );
}

// Hook for managing cursor trail state
export function useCursorTrail(initialEnabled = false) {
  const [enabled, setEnabled] = useState(initialEnabled);

  const toggle = () => setEnabled(prev => !prev);
  const enable = () => setEnabled(true);
  const disable = () => setEnabled(false);

  return {
    enabled,
    toggle,
    enable,
    disable,
    CursorTrail: (props: Omit<CursorTrailProps, 'enabled'>) => (
      <CursorTrail {...props} enabled={enabled} />
    ),
  };
}

// Simple dot cursor trail
export function DotCursorTrail({ enabled = true }: { enabled?: boolean }) {
  return (
    <CursorTrail
      enabled={enabled}
      trailLength={6}
      size={3}
      color="#3B82F6"
      opacity={0.7}
    />
  );
}

// Colorful cursor trail
export function ColorfulCursorTrail({ enabled = true }: { enabled?: boolean }) {
  return (
    <GradientCursorTrail
      enabled={enabled}
      trailLength={10}
      size={8}
      colors={['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B']}
    />
  );
}