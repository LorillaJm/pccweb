/**
 * SkipLink Component
 * 
 * Provides a skip to main content link for keyboard users
 * Requirements: 6.5
 */

'use client';

import React from 'react';

export interface SkipLinkProps {
  href?: string;
  children?: React.ReactNode;
}

/**
 * SkipLink - Accessible skip to main content link
 * 
 * Features:
 * - Hidden until focused
 * - High contrast focus indicator
 * - Keyboard accessible
 * 
 * Requirements: 6.5
 */
export function SkipLink({ 
  href = '#main-content', 
  children = 'Skip to main content' 
}: SkipLinkProps) {
  return (
    <a 
      href={href} 
      className="skip-link"
      aria-label="Skip to main content"
    >
      {children}
    </a>
  );
}

export default SkipLink;
