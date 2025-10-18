/**
 * Keyboard Navigation Detection Utility
 * 
 * Detects when user is navigating with keyboard and adds appropriate class to body
 * Requirements: 6.5
 */

let isKeyboardNavigating = false;

/**
 * Initialize keyboard navigation detection
 */
export function initKeyboardNavigation(): void {
  if (typeof window === 'undefined') return;

  // Detect keyboard navigation
  window.addEventListener('keydown', (e) => {
    // Tab key indicates keyboard navigation
    if (e.key === 'Tab') {
      if (!isKeyboardNavigating) {
        isKeyboardNavigating = true;
        document.body.classList.add('keyboard-navigation');
      }
    }
  });

  // Detect mouse usage
  window.addEventListener('mousedown', () => {
    if (isKeyboardNavigating) {
      isKeyboardNavigating = false;
      document.body.classList.remove('keyboard-navigation');
    }
  });

  // Detect touch usage
  window.addEventListener('touchstart', () => {
    if (isKeyboardNavigating) {
      isKeyboardNavigating = false;
      document.body.classList.remove('keyboard-navigation');
    }
  });
}

/**
 * Check if user is currently navigating with keyboard
 */
export function isUsingKeyboard(): boolean {
  return isKeyboardNavigating;
}

/**
 * Force keyboard navigation mode (useful for testing)
 */
export function setKeyboardNavigationMode(enabled: boolean): void {
  isKeyboardNavigating = enabled;
  if (enabled) {
    document.body.classList.add('keyboard-navigation');
  } else {
    document.body.classList.remove('keyboard-navigation');
  }
}
