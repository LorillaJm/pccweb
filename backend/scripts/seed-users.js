require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://lavillajero944_db_user:116161080022@pccportal.y1jmpl6.mongodb.net/?retryWrites=true&w=majority&appName=pccportal';
    await mongoose.connect(mongoURI);
    console.log('🍃 MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    // Clear existing users (optional - comment out if you want to keep existing users)
    // await User.deleteMany({});
    // console.log('🗑️ Cleared existing users');

    const demoUsers = [
      {
        email: 'anna.garcia@student.pcc.edu.ph',
        password: 'password123',
        firstName: 'Anna',
        lastName: 'Garcia',
        role: 'student',
        studentId: 'STU-2024-001',
        program: 'Computer Science',
        yearLevel: 3,
        section: 'A',
        authProvider: 'local',
        isActive: true,
        emailVerified: true
      },
      {
        email: 'maria.santos@passicitycollege.edu.ph',
        password: 'password123',
        firstName: 'Maria',
        lastName: 'Santos',
        role: 'faculty',
        employeeId: 'FAC-2024-001',
        department: 'Computer Science',
        position: 'Professor',
        authProvider: 'local',
        isActive: true,
        emailVerified: true
      },
      {
        email: 'admin@passicitycollege.edu.ph',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        employeeId: 'ADM-2024-001',
        department: 'Administration',
        position: 'System Administrator',
        authProvider: 'local',
        isActive: true,
        emailVerified: true
      },
      {
        email: 'superadmin@passicitycollege.edu.ph',
        password: 'password123',
        firstName: 'Super',
        lastName: 'Admin',
        role: 'super_admin',
        employeeId: 'SUP-2024-001',
        department: 'Administration',
        position: 'Super Administrator',
        authProvider: 'local',
        isActive: true,
        emailVerified: true
      }
    ];

    for (const userData of demoUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`✅ Created user: ${userData.email} (${userData.role})`);
      } else {
        console.log(`⚠️ User already exists: ${userData.email}`);
      }
    }

    console.log('🎉 Demo users seeded successfully!');
    console.log('\n📝 Demo Accounts:');
    console.log('Student: anna.garcia@student.pcc.edu.ph / password123');
    console.log('Faculty: maria.santos@passicitycollege.edu.ph / password123');
    console.log('Admin: admin@passicitycollege.edu.ph / password123');
    console.log('Super Admin: superadmin@passicitycollege.edu.ph / password123');

  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

const run = async () => {
  await connectDB();
  await seedUsers();
};

run();
