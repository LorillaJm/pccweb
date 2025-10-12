#!/usr/bin/env node

/**
 * Mongoose Index Test Script
 * 
 * This script tests for duplicate index warnings in Mongoose models.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');

// Capture console warnings
const originalWarn = console.warn;
const warnings = [];

console.warn = function(...args) {
  const message = args.join(' ');
  if (message.includes('Duplicate schema index')) {
    warnings.push(message);
  }
  originalWarn.apply(console, args);
};

async function testMongooseIndexes() {
  console.log('🔍 Testing Mongoose Models for Duplicate Index Warnings\n');
  console.log('='.repeat(60));
  
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Load all models to trigger index creation
    console.log('📋 Loading models...');
    
    const models = [
      'Subject',
      'EventRegistration', 
      'ClassSection',
      'ClassMaterial',
      'User',
      'Event',
      'EventTicket',
      'Notification',
      'NotificationPreferences',
      'ChatConversation',
      'FAQ'
    ];
    
    for (const modelName of models) {
      try {
        require(`./models/${modelName}`);
        console.log(`  ✓ ${modelName}`);
      } catch (error) {
        console.log(`  ⚠ ${modelName} - ${error.message}`);
      }
    }
    
    console.log('\n📊 Index Analysis:');
    console.log('='.repeat(30));
    
    if (warnings.length === 0) {
      console.log('✅ No duplicate index warnings found!');
      console.log('   All models are properly configured.');
    } else {
      console.log(`❌ Found ${warnings.length} duplicate index warning(s):`);
      warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning}`);
      });
    }
    
    // Show index information for problematic models
    console.log('\n🔧 Index Information:');
    console.log('='.repeat(30));
    
    const problematicModels = ['Subject', 'EventRegistration', 'ClassSection', 'ClassMaterial'];
    
    for (const modelName of problematicModels) {
      try {
        const Model = mongoose.model(modelName);
        const indexes = Model.schema.indexes();
        
        console.log(`\n${modelName} Indexes:`);
        if (indexes.length === 0) {
          console.log('  No explicit indexes defined');
        } else {
          indexes.forEach((index, i) => {
            const fields = Object.keys(index[0]).join(', ');
            const options = index[1] ? JSON.stringify(index[1]) : '{}';
            console.log(`  ${i + 1}. Fields: {${fields}} Options: ${options}`);
          });
        }
      } catch (error) {
        console.log(`  Error getting indexes for ${modelName}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  } finally {
    // Restore original console.warn
    console.warn = originalWarn;
    
    // Close connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n📡 Disconnected from MongoDB');
    }
  }
}

async function main() {
  console.log('🔧 PCC Portal - Mongoose Index Test\n');
  
  await testMongooseIndexes();
  
  console.log('\n' + '='.repeat(60));
  console.log('Test completed!');
  
  if (warnings.length === 0) {
    console.log('\n🎉 All index warnings have been fixed!');
    console.log('   Your server should start without Mongoose warnings.');
  } else {
    console.log('\n💡 Next Steps:');
    console.log('   1. Review the duplicate index warnings above');
    console.log('   2. Remove either the field-level index: true OR the schema.index() call');
    console.log('   3. Keep the schema.index() calls for better control');
    console.log('   4. Run this test again to verify fixes');
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Test interrupted by user');
  mongoose.connection.close().then(() => process.exit(0));
});

process.on('unhandledRejection', (error) => {
  console.error('\n❌ Unhandled error:', error.message);
  mongoose.connection.close().then(() => process.exit(1));
});

// Run the test
main().catch(error => {
  console.error('\n❌ Test failed:', error.message);
  mongoose.connection.close().then(() => process.exit(1));
});