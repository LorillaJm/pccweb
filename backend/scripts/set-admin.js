#!/usr/bin/env node

/**
 * Set User as Admin
 * 
 * This script sets a specific email address as an admin user.
 * If the user doesn't exist, it creates a new admin account.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const ADMIN_EMAIL = 'michaluglay@gmail.com';
const ADMIN_PASSWORD = 'Admin123!@#'; // Change this to a secure password

async function setAdmin() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI;
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    // Check if user already exists
    let user = await User.findOne({ email: ADMIN_EMAIL });

    if (user) {
      console.log(`📧 User found: ${ADMIN_EMAIL}`);
      console.log(`   Current role: ${user.role}`);
      
      // Update to admin
      user.role = 'admin';
      user.isActive = true;
      user.emailVerified = true;
      
      await user.save();
      
      console.log(`\n✅ User updated to admin successfully!`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
    } else {
      console.log(`📧 User not found: ${ADMIN_EMAIL}`);
      console.log(`   Creating new admin user...\n`);
      
      // Create new admin user
      user = new User({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        firstName: 'Michal',
        lastName: 'Uglay',
        role: 'admin',
        isActive: true,
        emailVerified: true,
        authProvider: 'local'
      });

      await user.save();
      
      console.log(`✅ Admin user created successfully!`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
      console.log(`   Role: ${user.role}`);
      console.log(`\n⚠️  IMPORTANT: Change the password after first login!`);
    }

    console.log(`\n✨ Done! ${ADMIN_EMAIL} is now an admin.`);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error setting admin user:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

setAdmin();
