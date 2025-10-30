require('dotenv').config();
const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const ClassSection = require('../models/ClassSection');
const User = require('../models/User');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://lavillajero944_db_user:116161080022@pccportal.y1jmpl6.mongodb.net/?retryWrites=true&w=majority&appName=pccportal';
    await mongoose.connect(mongoURI);
    console.log('🍃 MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const checkEnrollments = async () => {
  try {
    // Get all sections
    const sections = await ClassSection.find({}).populate('subjectId');
    console.log(`\n📊 Total sections: ${sections.length}\n`);

    // Check each section
    for (const section of sections) {
      console.log(`📚 ${section.sectionName} (${section.subjectId?.subjectCode})`);
      console.log(`   Enrolled count: ${section.enrolledStudents}`);
      console.log(`   Enrollments array: ${section.enrollments.length}`);
      console.log(`   Active enrollments: ${section.enrollments.filter(e => e.status === 'enrolled').length}`);
    }

    // Get all students
    const students = await User.find({ role: 'student' });
    console.log(`\n👥 Total students: ${students.length}\n`);

    // Check enrollments for each student
    for (const student of students) {
      const enrolledSections = await ClassSection.find({
        'enrollments.studentId': student._id,
        'enrollments.status': 'enrolled'
      }).populate('subjectId');

      console.log(`👤 ${student.email}`);
      console.log(`   Enrolled in: ${enrolledSections.length} subjects`);
      if (enrolledSections.length > 0) {
        enrolledSections.forEach(s => {
          console.log(`      - ${s.subjectId?.subjectCode}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

const run = async () => {
  await connectDB();
  await checkEnrollments();
};

run();
