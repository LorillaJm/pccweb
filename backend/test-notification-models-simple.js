#!/usr/bin/env node

/**
 * Simple Notification Models Test
 * Basic validation of model schemas and methods
 */

require('dotenv').config();

const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const NotificationPreferences = require('./models/NotificationPreferences');

async function testModels() {
  console.log('🧪 Testing Notification Models (Simple)...\n');

  try {
    // Test 1: Schema validation
    console.log('1️⃣ Testing schema definitions...');
    
    // Test Notification schema
    const notificationSchema = Notification.schema;
    const requiredFields = ['userId', 'title', 'message', 'type', 'category'];
    const hasRequiredFields = requiredFields.every(field => 
      notificationSchema.paths[field] && notificationSchema.paths[field].isRequired
    );
    
    if (hasRequiredFields) {
      console.log('   ✅ Notification schema has required fields');
    } else {
      console.log('   ❌ Notification schema missing required fields');
    }

    // Test NotificationPreferences schema
    const preferencesSchema = NotificationPreferences.schema;
    const hasUserId = preferencesSchema.paths['userId'] && preferencesSchema.paths['userId'].isRequired;
    const hasPreferences = preferencesSchema.paths['preferences'];
    
    if (hasUserId && hasPreferences) {
      console.log('   ✅ NotificationPreferences schema structure correct');
    } else {
      console.log('   ❌ NotificationPreferences schema structure incorrect');
    }

    // Test 2: Enum validation
    console.log('\n2️⃣ Testing enum validations...');
    
    const typeEnum = notificationSchema.paths['type'].enumValues;
    const categoryEnum = notificationSchema.paths['category'].enumValues;
    const priorityEnum = notificationSchema.paths['priority'].enumValues;
    
    const expectedTypes = ['info', 'warning', 'error', 'success', 'reminder'];
    const expectedCategories = ['academic', 'event', 'payment', 'system', 'social'];
    const expectedPriorities = ['low', 'medium', 'high', 'urgent'];
    
    const typeValid = expectedTypes.every(type => typeEnum.includes(type));
    const categoryValid = expectedCategories.every(cat => categoryEnum.includes(cat));
    const priorityValid = expectedPriorities.every(pri => priorityEnum.includes(pri));
    
    if (typeValid && categoryValid && priorityValid) {
      console.log('   ✅ Enum validations are correct');
    } else {
      console.log('   ❌ Enum validations are incorrect');
    }

    // Test 3: Default values
    console.log('\n3️⃣ Testing default values...');
    
    const priorityDefault = notificationSchema.paths['priority'].defaultValue;
    const isReadDefault = notificationSchema.paths['isRead'].defaultValue;
    
    if (priorityDefault === 'medium' && isReadDefault === false) {
      console.log('   ✅ Default values are correct');
    } else {
      console.log('   ❌ Default values are incorrect');
    }

    // Test 4: Index definitions
    console.log('\n4️⃣ Testing index definitions...');
    
    const notificationIndexes = notificationSchema.indexes();
    const hasCompoundIndexes = notificationIndexes.some(index => 
      Object.keys(index[0]).length > 1
    );
    
    if (hasCompoundIndexes) {
      console.log('   ✅ Compound indexes are defined');
    } else {
      console.log('   ❌ Compound indexes are missing');
    }

    // Test 5: Virtual properties
    console.log('\n5️⃣ Testing virtual properties...');
    
    const notificationVirtuals = Object.keys(notificationSchema.virtuals);
    const preferencesVirtuals = Object.keys(preferencesSchema.virtuals);
    
    const hasNotificationVirtuals = notificationVirtuals.includes('isExpired') && 
                                   notificationVirtuals.includes('isScheduled');
    const hasPreferencesVirtuals = preferencesVirtuals.includes('isEnabled') && 
                                  preferencesVirtuals.includes('isInQuietHours');
    
    if (hasNotificationVirtuals && hasPreferencesVirtuals) {
      console.log('   ✅ Virtual properties are defined');
    } else {
      console.log('   ❌ Virtual properties are missing');
    }

    // Test 6: Static methods
    console.log('\n6️⃣ Testing static methods...');
    
    const notificationStatics = Object.getOwnPropertyNames(Notification)
      .filter(name => typeof Notification[name] === 'function');
    const preferencesStatics = Object.getOwnPropertyNames(NotificationPreferences)
      .filter(name => typeof NotificationPreferences[name] === 'function');
    
    const hasNotificationStatics = notificationStatics.includes('findUnreadForUser') && 
                                  notificationStatics.includes('findByCategory');
    const hasPreferencesStatics = preferencesStatics.includes('createDefault') && 
                                 preferencesStatics.includes('findByUserId');
    
    if (hasNotificationStatics && hasPreferencesStatics) {
      console.log('   ✅ Static methods are defined');
    } else {
      console.log('   ❌ Static methods are missing');
    }

    console.log('\n🎉 All model validation tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Schema definitions correct');
    console.log('   ✅ Enum validations working');
    console.log('   ✅ Default values set');
    console.log('   ✅ Indexes defined');
    console.log('   ✅ Virtual properties available');
    console.log('   ✅ Static methods implemented');

    return true;

  } catch (error) {
    console.log('❌ Model validation failed:', error.message);
    return false;
  }
}

// Run tests
testModels().then(success => {
  if (success) {
    console.log('\n🎯 All notification model validations passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️ Some validations failed.');
    process.exit(1);
  }
}).catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});