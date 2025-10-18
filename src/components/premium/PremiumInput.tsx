'use client';

import React, { useState, useId, InputHTMLAttributes, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMotionContext } from '@/components/motion/MotionProvider';

/**
 * Validation state type
 */
export type ValidationState = 'idle' | 'success' | 'error' | 'warning';

/**
 * PremiumInput component props
 */
export interface PremiumInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  errorText?: string;
  successText?: string;
  validationState?: ValidationState;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * PremiumInput - Premium input component with floating label and validation animations
 * 
 * Features:
 * - Smooth focus state animations
 * - Label float animation on focus
 * - Validation state animations
 * - Respects reduced motion preferences
 * 
 * Requirements: 2.4, 6.2, 6.3
 */
export const PremiumInput = forwardRef<HTMLInputElement, PremiumInputProps>(
  function PremiumInput(
    { 
      label,
      helperText,
      errorText,
      successText,
      validationState = 'idle',
      size = 'md',
      className = '',
      disabled = false,
      value,
      ...inputProps
    },
    ref
  ) {
    const { prefersReducedMotion } = useMotionContext();
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!value);
    const inputId = useId();
    
    // Check if label should float
    const shouldFloat = isFocused || hasValue;
    
    // Handle focus
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      inputProps.onFocus?.(e);
    };
    
    // Handle blur
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(!!e.target.value);
      inputProps.onBlur?.(e);
    };
    
    // Handle change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      inputProps.onChange?.(e);
    };
    
    // Size variants
    const sizeClasses = {
      sm: 'h-10 text-sm',
      md: 'h-12 text-base',
      lg: 'h-14 text-lg',
    };
    
    // Validation colors
    const validationColors = {
      idle: 'border-gray-300 focus:border-accent',
      success: 'border-green-500 focus:border-green-600',
      error: 'border-red-500 focus:border-red-600',
      warning: 'border-yellow-500 focus:border-yellow-600',
    };
    
    // Focus ring colors
    const focusRingColors = {
      idle: 'focus:ring-accent/50',
      success: 'focus:ring-green-500/50',
      error: 'focus:ring-red-500/50',
      warning: 'focus:ring-yellow-500/50',
    };
    
    // Label animation variants
    // Requirement: 2.4 (label float animation on focus)
    const labelVariants = {
      float: {
        y: -28,
        scale: 0.85,
        color: isFocused 
          ? validationState === 'error' ? '#ef4444' 
          : validationState === 'success' ? '#22c55e'
          : validationState === 'warning' ? '#eab308'
          : '#FF5A5F'
          : '#9AA4B2',
      },
      rest: {
        y: 0,
        scale: 1,
        color: '#9AA4B2',
      },
    };
    
    const reducedMotionLabelVariants = {
      float: {
        y: -28,
        scale: 0.85,
      },
      rest: {
        y: 0,
        scale: 1,
      },
    };
    
    // Border animation variants
    // Requirement: 2.4 (smooth focus state animations)
    const borderVariants = {
      focused: {
        scaleX: 1,
        opacity: 1,
      },
      blurred: {
        scaleX: 0,
        opacity: 0,
      },
    };
    
    // Get validation message
    const validationMessage = 
      validationState === 'error' ? errorText :
      validationState === 'success' ? successText :
      helperText;
    
    // Validation icon
    const ValidationIcon = () => {
      if (validationState === 'success') {
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      }
      if (validationState === 'error') {
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      }
      if (validationState === 'warning') {
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      }
      return null;
    };
    
    return (
      <div className={`relative ${className}`}>
        {/* Input container */}
        <div className="relative">
          {/* Floating label */}
          {/* Requirement: 2.4 (label float animation) */}
          {label && (
            <motion.label
              htmlFor={inputId}
              variants={prefersReducedMotion ? reducedMotionLabelVariants : labelVariants}
              initial="rest"
              animate={shouldFloat ? "float" : "rest"}
              transition={{ 
                duration: prefersReducedMotion ? 0 : 0.2, 
                ease: 'easeOut' 
              }}
              className="absolute left-4 pointer-events-none origin-left font-medium"
              style={{
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              {label}
            </motion.label>
          )}
          
          {/* Input field */}
          <input
            ref={ref}
            id={inputId}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            disabled={disabled}
            className={`
              w-full px-4 rounded-lg
              border-2 transition-colors
              bg-surface text-textLight
              focus-ring premium-input
              disabled:opacity-50 disabled:cursor-not-allowed
              ${sizeClasses[size]}
              ${validationColors[validationState]}
              ${label && shouldFloat ? 'pt-6 pb-2' : ''}
            `.trim().replace(/\s+/g, ' ')}
            {...inputProps}
          />
          
          {/* Animated bottom border */}
          {/* Requirement: 2.4 (smooth focus state animations) */}
          {!prefersReducedMotion && (
            <motion.div
              variants={borderVariants}
              initial="blurred"
              animate={isFocused ? "focused" : "blurred"}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`
                absolute bottom-0 left-0 right-0 h-0.5
                ${validationState === 'error' ? 'bg-red-500' :
                  validationState === 'success' ? 'bg-green-500' :
                  validationState === 'warning' ? 'bg-yellow-500' :
                  'bg-accent'}
              `}
              style={{ transformOrigin: 'center' }}
            />
          )}
          
          {/* Validation icon */}
          {/* Requirement: 2.4 (validation state animations) */}
          {validationState !== 'idle' && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={validationState}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                >
                  <ValidationIcon />
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
        
        {/* Helper/Error/Success text */}
        {/* Requirement: 2.4 (validation state animations) */}
        <AnimatePresence mode="wait">
          {validationMessage && (
            <motion.p
              key={validationState}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
              className={`
                mt-2 text-sm
                ${validationState === 'error' ? 'text-red-500' :
                  validationState === 'success' ? 'text-green-500' :
                  validationState === 'warning' ? 'text-yellow-500' :
                  'text-textMuted'}
              `}
            >
              {validationMessage}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

export default PremiumInput;
