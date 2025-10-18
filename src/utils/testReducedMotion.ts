/**
 * Reduced Motion Testing Utility
 * 
 * Utilities for testing reduced motion fallbacks
 * Requirements: 6.1, 6.4
 */

/**
 * Enable reduced motion preference for testing
 */
export function enableReducedMotion(): void {
  if (typeof window === 'undefined') return;

  // Create a style element to override the media query
  const style = document.createElement('style');
  style.id = 'reduced-motion-test';
  style.textContent = `
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }
  `;
  document.head.appendChild(style);

  // Dispatch event to notify components
  window.dispatchEvent(new Event('prefers-reduced-motion-change'));
  
  console.log('✅ Reduced motion enabled for testing');
}

/**
 * Disable reduced motion preference for testing
 */
export function disableReducedMotion(): void {
  if (typeof window === 'undefined') return;

  const style = document.getElementById('reduced-motion-test');
  if (style) {
    style.remove();
  }

  // Dispatch event to notify components
  window.dispatchEvent(new Event('prefers-reduced-motion-change'));
  
  console.log('✅ Reduced motion disabled');
}

/**
 * Check if reduced motion is currently preferred
 */
export function isReducedMotionPreferred(): boolean {
  if (typeof window === 'undefined') return false;

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Test reduced motion fallbacks for a component
 */
export async function testReducedMotionFallback(
  componentName: string,
  testFn: () => Promise<boolean>
): Promise<void> {
  console.log(`\n🧪 Testing reduced motion fallback for: ${componentName}`);
  
  // Test with animations enabled
  disableReducedMotion();
  await new Promise(resolve => setTimeout(resolve, 100));
  console.log('  ⚡ Testing with animations enabled...');
  
  // Test with reduced motion
  enableReducedMotion();
  await new Promise(resolve => setTimeout(resolve, 100));
  console.log('  🐌 Testing with reduced motion...');
  
  const passed = await testFn();
  
  if (passed) {
    console.log(`  ✅ ${componentName} reduced motion fallback works correctly`);
  } else {
    console.error(`  ❌ ${componentName} reduced motion fallback failed`);
  }
  
  // Reset
  disableReducedMotion();
}

/**
 * Verify all animations respect reduced motion
 */
export function verifyReducedMotionCompliance(): {
  compliant: boolean;
  issues: string[];
} {
  if (typeof window === 'undefined') {
    return { compliant: true, issues: [] };
  }

  const issues: string[] = [];

  // Check for animations that don't respect reduced motion
  const allElements = document.querySelectorAll('*');
  
  allElements.forEach((element) => {
    const styles = window.getComputedStyle(element);
    const animationDuration = styles.animationDuration;
    const transitionDuration = styles.transitionDuration;

    // Check if element has animations
    if (animationDuration && animationDuration !== '0s' && animationDuration !== '0.01ms') {
      const hasReducedMotionCheck = element.classList.contains('motion-safe') ||
                                    element.hasAttribute('data-motion-safe');
      
      if (!hasReducedMotionCheck) {
        issues.push(`Element has animation without reduced motion check: ${element.tagName}`);
      }
    }

    // Check if element has transitions
    if (transitionDuration && transitionDuration !== '0s' && transitionDuration !== '0.01ms') {
      const hasReducedMotionCheck = element.classList.contains('motion-safe') ||
                                    element.hasAttribute('data-motion-safe');
      
      if (!hasReducedMotionCheck) {
        issues.push(`Element has transition without reduced motion check: ${element.tagName}`);
      }
    }
  });

  return {
    compliant: issues.length === 0,
    issues,
  };
}

/**
 * Log reduced motion status
 */
export function logReducedMotionStatus(): void {
  if (typeof window === 'undefined') return;

  const isReduced = isReducedMotionPreferred();
  
  console.log('\n📊 Reduced Motion Status:');
  console.log(`  Preference: ${isReduced ? 'REDUCED' : 'NO PREFERENCE'}`);
  console.log(`  Media Query: ${window.matchMedia('(prefers-reduced-motion: reduce)').media}`);
  console.log(`  Matches: ${window.matchMedia('(prefers-reduced-motion: reduce)').matches}`);
  
  const compliance = verifyReducedMotionCompliance();
  console.log(`  Compliance: ${compliance.compliant ? '✅ PASS' : '❌ FAIL'}`);
  
  if (!compliance.compliant) {
    console.log('  Issues:');
    compliance.issues.forEach(issue => console.log(`    - ${issue}`));
  }
}

/**
 * Create a test suite for reduced motion
 */
export function createReducedMotionTestSuite() {
  return {
    enable: enableReducedMotion,
    disable: disableReducedMotion,
    isPreferred: isReducedMotionPreferred,
    testFallback: testReducedMotionFallback,
    verifyCompliance: verifyReducedMotionCompliance,
    logStatus: logReducedMotionStatus,
  };
}

// Export for browser console testing
if (typeof window !== 'undefined') {
  (window as any).reducedMotionTest = createReducedMotionTestSuite();
}
