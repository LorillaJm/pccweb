#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Frontend Event Components...\n');

const componentFiles = [
  'src/components/events/EventList.tsx',
  'src/components/events/EventRegistration.tsx', 
  'src/components/events/DigitalTicket.tsx',
  'src/components/events/QRScanner.tsx'
];

const uiComponentFiles = [
  'src/components/ui/card.tsx',
  'src/components/ui/button.tsx',
  'src/components/ui/badge.tsx',
  'src/components/ui/input.tsx',
  'src/components/ui/label.tsx',
  'src/components/ui/textarea.tsx',
  'src/components/ui/select.tsx',
  'src/components/ui/separator.tsx',
  'src/components/ui/alert.tsx'
];

let passed = 0;
let failed = 0;

function testFileExists(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${filePath} - EXISTS`);
      return true;
    } else {
      console.log(`❌ ${filePath} - MISSING`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${filePath} - ERROR: ${error.message}`);
    return false;
  }
}

function testFileContent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Basic checks
    if (content.includes('export default') || content.includes('export {')) {
      console.log(`✅ ${filePath} - HAS EXPORTS`);
      return true;
    } else {
      console.log(`❌ ${filePath} - NO EXPORTS`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${filePath} - READ ERROR: ${error.message}`);
    return false;
  }
}

console.log('📝 Testing Event Components...\n');

componentFiles.forEach(file => {
  console.log(`Testing: ${file}`);
  if (testFileExists(file) && testFileContent(file)) {
    passed++;
  } else {
    failed++;
  }
  console.log('');
});

console.log('📝 Testing UI Components...\n');

uiComponentFiles.forEach(file => {
  console.log(`Testing: ${file}`);
  if (testFileExists(file) && testFileContent(file)) {
    passed++;
  } else {
    failed++;
  }
  console.log('');
});

// Test utils file
console.log('📝 Testing Utils...\n');
console.log('Testing: src/lib/utils.ts');
if (testFileExists('src/lib/utils.ts') && testFileContent('src/lib/utils.ts')) {
  passed++;
} else {
  failed++;
}

console.log('\n' + '='.repeat(50));
console.log('📊 FRONTEND COMPONENT TEST SUMMARY');
console.log('='.repeat(50));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Total:  ${passed + failed}`);

if (failed === 0) {
  console.log('\n🎉 All frontend components are ready!');
  process.exit(0);
} else {
  console.log('\n⚠️  Some components have issues. Please check the output above.');
  process.exit(1);
}