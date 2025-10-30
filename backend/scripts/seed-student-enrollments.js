require('dotenv').config();
const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const ClassSection = require('../models/ClassSection');
const User = require('../models/User');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://lavillajero944_db_user:116161080022@pccportal.y1jmpl6.mongodb.net/?retryWrites=true&w=majority&appName=pccportal';
    await mongoose.connect(mongoURI);
    console.log('🍃 MongoDB Connected for seeding enrollments');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const seedEnrollments = async () => {
  try {
    // Get all faculty users
    const faculty = await User.find({ role: 'faculty' });
    
    if (faculty.length === 0) {
      console.log('⚠️ No faculty found. Creating a demo faculty...');
      const demoFaculty = new User({
        email: 'faculty@pcc.edu',
        password: 'password123',
        role: 'faculty',
        firstName: 'John',
        lastName: 'Professor',
        isActive: true
      });
      await demoFaculty.save();
      faculty.push(demoFaculty);
      console.log('✅ Created demo faculty');
    }

    const facultyUser = faculty[0];

    // Enhanced subjects list with more variety
    const subjectsData = [
      {
        subjectCode: 'CS101',
        subjectName: 'Introduction to Computer Science',
        description: 'Basic concepts of computer science, algorithms, and problem-solving techniques',
        units: 3,
        prerequisites: [],
        department: 'CS',
        yearLevel: 1,
        semester: 1,
        program: 'Computer Science'
      },
      {
        subjectCode: 'CS102',
        subjectName: 'Programming Fundamentals',
        description: 'Introduction to programming using Python, data structures, and algorithms',
        units: 3,
        prerequisites: ['CS101'],
        department: 'CS',
        yearLevel: 1,
        semester: 2,
        program: 'Computer Science'
      },
      {
        subjectCode: 'CS201',
        subjectName: 'Data Structures and Algorithms',
        description: 'Advanced data structures, algorithm design, and complexity analysis',
        units: 3,
        prerequisites: ['CS102'],
        department: 'CS',
        yearLevel: 2,
        semester: 1,
        program: 'Computer Science'
      },
      {
        subjectCode: 'CS202',
        subjectName: 'Web Development',
        description: 'Modern web development with HTML, CSS, JavaScript, and frameworks',
        units: 3,
        prerequisites: ['CS102'],
        department: 'CS',
        yearLevel: 2,
        semester: 2,
        program: 'Computer Science'
      },
      {
        subjectCode: 'CS301',
        subjectName: 'Database Systems',
        description: 'Database design, SQL, NoSQL, and database management systems',
        units: 3,
        prerequisites: ['CS201'],
        department: 'CS',
        yearLevel: 3,
        semester: 1,
        program: 'Computer Science'
      },
      {
        subjectCode: 'MATH101',
        subjectName: 'College Algebra',
        description: 'Fundamental concepts of algebra, functions, and equations',
        units: 3,
        prerequisites: [],
        department: 'MA',
        yearLevel: 1,
        semester: 1,
        program: 'Computer Science'
      },
      {
        subjectCode: 'MATH201',
        subjectName: 'Calculus I',
        description: 'Limits, derivatives, and applications of differential calculus',
        units: 4,
        prerequisites: ['MATH101'],
        department: 'MA',
        yearLevel: 2,
        semester: 1,
        program: 'Computer Science'
      },
      {
        subjectCode: 'ENG101',
        subjectName: 'English Communication',
        description: 'Basic English communication skills, writing, and presentation',
        units: 3,
        prerequisites: [],
        department: 'EN',
        yearLevel: 1,
        semester: 1,
        program: 'Computer Science'
      },
      {
        subjectCode: 'PHYS101',
        subjectName: 'Physics for Engineers',
        description: 'Mechanics, thermodynamics, and waves for engineering students',
        units: 4,
        prerequisites: ['MATH101'],
        department: 'PH',
        yearLevel: 1,
        semester: 2,
        program: 'Computer Science'
      },
      {
        subjectCode: 'IT101',
        subjectName: 'Information Technology Fundamentals',
        description: 'Introduction to IT concepts, hardware, software, and networking',
        units: 3,
        prerequisites: [],
        department: 'IT',
        yearLevel: 1,
        semester: 1,
        program: 'Information Technology'
      }
    ];

    // Create or update subjects
    console.log('\n📚 Creating/Updating Subjects...');
    const createdSubjects = [];
    for (const subjectData of subjectsData) {
      let subject = await Subject.findOne({ subjectCode: subjectData.subjectCode });
      
      if (!subject) {
        subject = new Subject(subjectData);
        await subject.save();
        console.log(`✅ Created subject: ${subjectData.subjectCode} - ${subjectData.subjectName}`);
      } else {
        console.log(`⚠️ Subject exists: ${subjectData.subjectCode}`);
      }
      createdSubjects.push(subject);
    }

    // Create class sections with different schedules
    console.log('\n🏫 Creating Class Sections...');
    const schedules = [
      'MWF 8:00-9:00 AM',
      'MWF 9:00-10:00 AM',
      'MWF 10:00-11:00 AM',
      'TTH 8:00-9:30 AM',
      'TTH 10:00-11:30 AM',
      'TTH 1:00-2:30 PM',
      'MWF 1:00-2:00 PM',
      'MWF 2:00-3:00 PM',
      'TTH 3:00-4:30 PM',
      'MWF 3:00-4:00 PM'
    ];

    const rooms = [
      'Room 101', 'Room 102', 'Room 103', 'Room 201', 'Room 202',
      'Lab 301', 'Lab 302', 'Room 401', 'Room 402', 'Auditorium'
    ];

    const classSections = [];
    for (let i = 0; i < createdSubjects.length; i++) {
      const subject = createdSubjects[i];
      const sectionName = `${subject.subjectCode}-A`;
      
      let section = await ClassSection.findOne({ 
        sectionName,
        academicYear: '2024-2025' 
      });
      
      if (!section) {
        section = new ClassSection({
          subjectId: subject._id,
          sectionName,
          facultyId: facultyUser._id,
          schedule: schedules[i % schedules.length],
          room: rooms[i % rooms.length],
          maxStudents: 40,
          academicYear: '2024-2025',
          semester: subject.semester || 1,
          enrolledStudents: 0,
          enrollments: []
        });
        await section.save();
        console.log(`✅ Created section: ${sectionName}`);
      } else {
        console.log(`⚠️ Section exists: ${sectionName}`);
      }
      classSections.push(section);
    }

    // Get all student users
    console.log('\n👥 Finding Student Users...');
    const students = await User.find({ role: 'student' });
    
    if (students.length === 0) {
      console.log('⚠️ No students found. Please create student users first.');
      return;
    }

    console.log(`📊 Found ${students.length} student(s)`);

    // Enroll each student in at least 3 subjects
    console.log('\n📝 Enrolling Students...');
    let totalEnrollments = 0;

    for (const student of students) {
      console.log(`\n👤 Processing student: ${student.email}`);
      
      // Clear existing enrollments for this student
      for (const section of classSections) {
        const existingEnrollment = section.enrollments.find(
          e => e.studentId.toString() === student._id.toString()
        );
        if (existingEnrollment) {
          section.enrollments = section.enrollments.filter(
            e => e.studentId.toString() !== student._id.toString()
          );
          section.enrolledStudents = Math.max(0, section.enrolledStudents - 1);
        }
      }

      // Enroll in first 5 subjects (or all if less than 5)
      const sectionsToEnroll = classSections.slice(0, Math.min(5, classSections.length));
      
      for (const section of sectionsToEnroll) {
        // Add enrollment
        section.enrollments.push({
          studentId: student._id,
          enrolledAt: new Date(),
          status: 'enrolled'
        });
        section.enrolledStudents += 1;
        await section.save();
        
        totalEnrollments++;
        
        // Get subject details for logging
        const subject = await Subject.findById(section.subjectId);
        console.log(`   ✅ Enrolled in: ${subject.subjectCode} - ${subject.subjectName}`);
      }
      
      console.log(`   📊 Total enrollments for ${student.email}: ${sectionsToEnroll.length}`);
    }

    console.log('\n🎉 Enrollment seeding completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Students processed: ${students.length}`);
    console.log(`   - Total enrollments created: ${totalEnrollments}`);
    console.log(`   - Subjects available: ${createdSubjects.length}`);
    console.log(`   - Class sections created: ${classSections.length}`);
    console.log(`\n✨ Each student is now enrolled in at least 3 subjects!`);

  } catch (error) {
    console.error('❌ Error seeding enrollments:', error);
    console.error(error.stack);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

const run = async () => {
  await connectDB();
  await seedEnrollments();
};

run();
