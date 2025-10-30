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

const testAPI = async () => {
  try {
    // Get a student
    const student = await User.findOne({ email: 'dev080022jm@gmail.com' });
    
    if (!student) {
      console.log('❌ Student not found!');
      return;
    }

    console.log(`\n👤 Testing for student: ${student.email}`);
    console.log(`   Student ID: ${student._id}\n`);

    // Simulate the API call
    const enrolledSections = await ClassSection.find({
      'enrollments.studentId': student._id,
      'enrollments.status': 'enrolled',
      isActive: true
    })
      .populate('subjectId', 'subjectCode subjectName description units')
      .populate('facultyId', 'firstName lastName email')
      .sort({ 'subjectId.subjectCode': 1 });

    console.log(`📊 Found ${enrolledSections.length} enrolled sections\n`);

    if (enrolledSections.length === 0) {
      console.log('❌ No enrollments found!');
      console.log('\n🔍 Checking why...\n');
      
      // Check if sections exist
      const allSections = await ClassSection.find({});
      console.log(`Total sections in DB: ${allSections.length}`);
      
      // Check if student has any enrollments
      const sectionsWithStudent = await ClassSection.find({
        'enrollments.studentId': student._id
      });
      console.log(`Sections with this student: ${sectionsWithStudent.length}`);
      
      if (sectionsWithStudent.length > 0) {
        console.log('\nEnrollment details:');
        sectionsWithStudent.forEach(s => {
          const enrollment = s.enrollments.find(e => e.studentId.toString() === student._id.toString());
          console.log(`  - ${s.sectionName}: status = ${enrollment.status}, isActive = ${s.isActive}`);
        });
      }
    } else {
      console.log('✅ Enrollments found!\n');
      
      enrolledSections.forEach((section, index) => {
        console.log(`${index + 1}. ${section.subjectId.subjectCode} - ${section.subjectId.subjectName}`);
        console.log(`   Section: ${section.sectionName}`);
        console.log(`   Faculty: ${section.facultyId ? `${section.facultyId.firstName} ${section.facultyId.lastName}` : 'TBA'}`);
        console.log(`   Schedule: ${section.schedule}`);
        console.log(`   Room: ${section.room}`);
        console.log(`   Units: ${section.subjectId.units}`);
        console.log('');
      });

      // Show what the API would return
      const enrolledSubjects = enrolledSections.map(section => ({
        sectionId: section._id,
        sectionName: section.sectionName,
        schedule: section.schedule,
        room: section.room,
        maxStudents: section.maxStudents,
        enrolledStudents: section.enrolledStudents,
        academicYear: section.academicYear,
        semester: section.semester,
        subjectCode: section.subjectId.subjectCode,
        subjectName: section.subjectId.subjectName,
        description: section.subjectId.description,
        units: section.subjectId.units,
        facultyName: section.facultyId ? `${section.facultyId.firstName} ${section.facultyId.lastName}` : 'TBA',
        isEnrolled: true,
        materialCount: 0
      }));

      console.log('📦 API Response would be:');
      console.log(JSON.stringify({
        success: true,
        data: {
          enrolledSubjects
        }
      }, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error);
    console.error(error.stack);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

const run = async () => {
  await connectDB();
  await testAPI();
};

run();
