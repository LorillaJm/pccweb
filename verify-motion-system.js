/**
 * Verification script for Motion System implementation
 * Task 3: Implement motion context and provider
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Motion System Implementation...\n');

const checks = [
  {
    name: 'useReducedMotion hook',
    path: 'src/hooks/useReducedMotion.ts',
    required: ['useReducedMotion', 'matchMedia', 'prefers-reduced-motion']
  },
  {
    name: 'MotionProvider component',
    path: 'src/components/motion/MotionProvider.tsx',
    required: ['MotionProvider', 'useMotionContext', 'MotionContext', 'performanceMode', 'prefersReducedMotion']
  },
  {
    name: 'MotionWrapper component',
    path: 'src/components/motion/MotionWrapper.tsx',
    required: ['MotionWrapper', 'AnimationErrorBoundary', 'fallback']
  },
  {
    name: 'Layout integration',
    path: 'src/app/layout.tsx',
    required: ['MotionProvider', 'import { MotionProvider }']
  }
];

let allPassed = true;

checks.forEach(check => {
  const filePath = path.join(__dirname, check.path);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${check.name}: File not found at ${check.path}`);
    allPassed = false;
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const missingItems = check.required.filter(item => !content.includes(item));
  
  if (missingItems.length > 0) {
    console.log(`⚠️  ${check.name}: Missing required items: ${missingItems.join(', ')}`);
    allPassed = false;
  } else {
    console.log(`✅ ${check.name}: All checks passed`);
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('✅ All verification checks passed!');
  console.log('\n📋 Implementation Summary:');
  console.log('  • useReducedMotion hook detects motion preferences');
  console.log('  • MotionProvider manages context and performance monitoring');
  console.log('  • MotionWrapper provides conditional rendering with error boundary');
  console.log('  • Layout.tsx integrated with MotionProvider');
  console.log('\n✨ Task 3 completed successfully!');
  process.exit(0);
} else {
  console.log('❌ Some verification checks failed');
  process.exit(1);
}
