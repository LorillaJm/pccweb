/**
 * Browser Console Test Script for Reduced Motion Verification
 * 
 * Usage:
 * 1. Open browser console (F12)
 * 2. Copy and paste this entire script
 * 3. Run: testReducedMotion()
 */

function testReducedMotion() {
  console.log('🎭 Testing Reduced Motion Implementation...\n');
  
  // Test 1: Check if matchMedia is available
  const hasMatchMedia = typeof window.matchMedia === 'function';
  console.log(`✓ matchMedia API: ${hasMatchMedia ? 'Available' : 'Not Available'}`);
  
  // Test 2: Check current preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  console.log(`✓ Current Preference: ${prefersReducedMotion ? 'REDUCE' : 'NO PREFERENCE'}`);
  
  // Test 3: Count Framer Motion elements
  const framerElements = document.querySelectorAll('[data-framer-motion]');
  console.log(`✓ Framer Motion Elements: ${framerElements.length}`);
  
  // Test 4: Check for CSS animations
  let animationCount = 0;
  document.querySelectorAll('*').forEach(el => {
    const styles = window.getComputedStyle(el);
    if (styles.animation && styles.animation !== 'none') {
      animationCount++;
    }
  });
  console.log(`✓ Elements with CSS Animations: ${animationCount}`);
  
  // Test 5: Summary
  console.log('\n📊 Summary:');
  console.log(`- Reduced Motion: ${prefersReducedMotion ? 'ENABLED ⚠️' : 'DISABLED ✓'}`);
  console.log(`- Animations Found: ${animationCount > 0 ? 'YES' : 'NO'}`);
  
  if (prefersReducedMotion && animationCount > 0) {
    console.warn('⚠️ WARNING: Animations detected with reduced motion enabled!');
  } else {
    console.log('✅ All tests passed!');
  }
}

// Auto-run
testReducedMotion();
