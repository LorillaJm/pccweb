'use client';

import React, { useState, ReactNode, ButtonHTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { useMotionContext } from '@/components/motion/MotionProvider';

/**
 * Ripple effect interface
 */
interface Ripple {
  x: number;
  y: number;
  id: number;
}

/**
 * PremiumButton component props
 */
export interface PremiumButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disableRipple?: boolean;
}

/**
 * PremiumButton - Premium button component with ripple effect and animations
 * 
 * Features:
 * - Ripple effect on click
 * - Hover and tap scale animations
 * - Keyboard focus state with high-contrast ring
 * - Respects reduced motion preferences
 * 
 * Requirements: 2.1, 2.2, 2.3, 6.2, 6.3
 */
export function PremiumButton({ 
  children, 
  className = '',
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  disableRipple = false,
  ...buttonProps
}: PremiumButtonProps) {
  const { prefersReducedMotion } = useMotionContext();
  const [ripples, setRipples] = useState<Ripple[]>([]);
  
  // Handle click with ripple effect
  // Requirement: 2.1 (ripple effect)
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disableRipple && !prefersReducedMotion) {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newRipple: Ripple = { x, y, id: Date.now() };
      setRipples(prev => [...prev, newRipple]);
      
      // Remove ripple after animation completes
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 600);
    }
    
    onClick?.(e);
  };
  
  // Size variants
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  // Variant styles
  const variantClasses = {
    primary: 'bg-accent text-white hover:bg-accent/90',
    secondary: 'bg-secondary text-primary hover:bg-secondary/90',
    outline: 'border-2 border-accent text-accent hover:bg-accent hover:text-white',
  };
  
  // Base button classes
  const baseClasses = `
    relative overflow-hidden
    font-medium uppercase tracking-wider
    rounded-lg
    transition-colors duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-4 focus:ring-accent/50
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `.trim().replace(/\s+/g, ' ');
  
  // Animation variants
  // Requirements: 2.2 (hover/tap animations), 2.3 (keyboard focus)
  const buttonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };
  
  const reducedMotionVariants = {
    rest: { scale: 1 },
    hover: { scale: 1 },
    tap: { scale: 1 },
  };
  
  return (
    <motion.button
      variants={prefersReducedMotion ? reducedMotionVariants : buttonVariants}
      initial="rest"
      whileHover={disabled ? undefined : "hover"}
      whileTap={disabled ? undefined : "tap"}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      onClick={handleClick}
      disabled={disabled}
      className={baseClasses}
      style={{
        // High-contrast focus ring for accessibility
        // Requirement: 6.2, 6.3 (keyboard focus with high contrast)
      }}
      {...buttonProps}
    >
      {/* Button content */}
      <span className="relative z-10">
        {children}
      </span>
      
      {/* Ripple effects */}
      {/* Requirement: 2.1 (ripple effect on click) */}
      {!prefersReducedMotion && ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
          }}
          initial={{
            width: 0,
            height: 0,
            x: 0,
            y: 0,
            opacity: 0.5,
          }}
          animate={{
            width: 300,
            height: 300,
            x: -150,
            y: -150,
            opacity: 0,
          }}
          transition={{ 
            duration: 0.6,
            ease: 'easeOut',
          }}
        />
      ))}
    </motion.button>
  );
}

export default PremiumButton;
