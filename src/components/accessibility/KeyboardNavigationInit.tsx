/**
 * KeyboardNavigationInit Component
 * 
 * Initializes keyboard navigation detection on mount
 * Requirements: 6.5
 */

'use client';

import { useEffect } from 'react';
import { initKeyboardNavigation } from '@/utils/keyboardNavigation';

/**
 * KeyboardNavigationInit - Initializes keyboard navigation detection
 * 
 * This component should be placed in the root layout to enable
 * keyboard navigation detection across the entire application.
 * 
 * Requirements: 6.5
 */
export function KeyboardNavigationInit() {
  useEffect(() => {
    initKeyboardNavigation();
  }, []);

  return null;
}

export default KeyboardNavigationInit;
