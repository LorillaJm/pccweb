require('dotenv').config();
const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const ClassSection = require('../models/ClassSection');
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

const seedSubjects = async () => {
  try {
    // Get faculty and student users
    const faculty = await User.findOne({ role: 'faculty' });
    const student = await User.findOne({ role: 'student' });

    if (!faculty || !student) {
      console.log('⚠️ Please run seed-users.js first to create demo users');
      return;
    }

    // Sample subjects
    const subjects = [
      {
        subjectCode: 'CS101',
        subjectName: 'Introduction to Computer Science',
        description: 'Basic concepts of computer science and programming',
        units: 3,
        prerequisites: [],
        department: 'Computer Science',
        yearLevel: 1,
        semester: 1,
        program: 'Computer Science'
      },
      {
        subjectCode: 'CS102',
        subjectName: 'Programming Fundamentals',
        description: 'Introduction to programming using Python',
        units: 3,
        prerequisites: ['CS101'],
        department: 'Computer Science',
        yearLevel: 1,
        semester: 2,
        program: 'Computer Science'
      },
      {
        subjectCode: 'MATH101',
        subjectName: 'College Algebra',
        description: 'Fundamental concepts of algebra',
        units: 3,
        prerequisites: [],
        department: 'Mathematics',
        yearLevel: 1,
        semester: 1,
        program: 'Computer Science'
      },
      {
        subjectCode: 'ENG101',
        subjectName: 'English Communication',
        description: 'Basic English communication skills',
        units: 3,
        prerequisites: [],
        department: 'English',
        yearLevel: 1,
        semester: 1,
        program: 'Computer Science'
      }
    ];

    // Create subjects
    const createdSubjects = [];
    for (const subjectData of subjects) {
      const existingSubject = await Subject.findOne({ subjectCode: subjectData.subjectCode });
      
      if (!existingSubject) {
        const subject = new Subject(subjectData);
        await subject.save();
        createdSubjects.push(subject);
        console.log(`✅ Created subject: ${subjectData.subjectCode} - ${subjectData.subjectName}`);
      } else {
        createdSubjects.push(existingSubject);
        console.log(`⚠️ Subject already exists: ${subjectData.subjectCode}`);
      }
    }

    // Create class sections
    const classSections = [
      {
        subjectId: createdSubjects[0]._id, // CS101
        sectionName: 'CS101-A',
        facultyId: faculty._id,
        schedule: 'MWF 8:00-9:00 AM',
        room: 'Room 101',
        maxStudents: 40,
        academicYear: '2024-2025',
        semester: 1
      },
      {
        subjectId: createdSubjects[1]._id, // CS102
        sectionName: 'CS102-A',
        facultyId: faculty._id,
        schedule: 'TTH 10:00-11:30 AM',
        room: 'Room 102',
        maxStudents: 35,
        academicYear: '2024-2025',
        semester: 2
      },
      {
        subjectId: createdSubjects[2]._id, // MATH101
        sectionName: 'MATH101-A',
        facultyId: faculty._id,
        schedule: 'MWF 9:00-10:00 AM',
        room: 'Room 201',
        maxStudents: 45,
        academicYear: '2024-2025',
        semester: 1
      }
    ];

    for (const sectionData of classSections) {
      const existingSection = await ClassSection.findOne({ 
        sectionName: sectionData.sectionName,
        academicYear: sectionData.academicYear 
      });
      
      if (!existingSection) {
        const section = new ClassSection(sectionData);
        
        // Enroll the demo student
        section.enrollments.push({
          studentId: student._id,
          enrolledAt: new Date(),
          status: 'enrolled'
        });
        section.enrolledStudents = 1;
        
        await section.save();
        console.log(`✅ Created class section: ${sectionData.sectionName} with student enrolled`);
      } else {
        console.log(`⚠️ Class section already exists: ${sectionData.sectionName}`);
      }
    }

    console.log('🎉 Subjects and class sections seeded successfully!');
    console.log(`📚 Student ${student.email} is now enrolled in 3 subjects`);

  } catch (error) {
    console.error('❌ Error seeding subjects:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

const run = async () => {
  await connectDB();
  await seedSubjects();
};

run();
