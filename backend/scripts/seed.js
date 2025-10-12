const bcrypt = require('bcryptjs');
const db = require('../config/database');

async function seedData() {
  try {
    console.log('🌱 Seeding database with initial data...');

    // Hash password for demo users
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create admin user
    const adminResult = await db.query(`
      INSERT INTO users (
        employee_id, email, password_hash, role, first_name, last_name, 
        phone, is_active, email_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, [
      'EMP001', 'admin@passicitycollege.edu.ph', hashedPassword, 'admin',
      'System', 'Administrator', '(033) 396-1234', true, true
    ]);

    // Create sample faculty users
    const faculty1Result = await db.query(`
      INSERT INTO users (
        employee_id, email, password_hash, role, first_name, last_name, middle_name,
        phone, address, is_active, email_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, [
      'FAC001', 'maria.santos@passicitycollege.edu.ph', hashedPassword, 'faculty',
      'Maria', 'Santos', 'Cruz', '(033) 396-2345', 'Passi City, Iloilo', true, true
    ]);

    const faculty2Result = await db.query(`
      INSERT INTO users (
        employee_id, email, password_hash, role, first_name, last_name, middle_name,
        phone, address, is_active, email_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, [
      'FAC002', 'juan.delacruz@passicitycollege.edu.ph', hashedPassword, 'faculty',
      'Juan', 'Dela Cruz', 'Reyes', '(033) 396-3456', 'Passi City, Iloilo', true, true
    ]);

    // Create sample student users
    const student1Result = await db.query(`
      INSERT INTO users (
        student_id, email, password_hash, role, first_name, last_name, middle_name,
        phone, address, date_of_birth, gender, is_active, email_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, [
      '2024-001', 'anna.garcia@student.pcc.edu.ph', hashedPassword, 'student',
      'Anna', 'Garcia', 'Lopez', '0917-123-4567', 'Passi City, Iloilo',
      '2003-05-15', 'Female', true, true
    ]);

    const student2Result = await db.query(`
      INSERT INTO users (
        student_id, email, password_hash, role, first_name, last_name, middle_name,
        phone, address, date_of_birth, gender, is_active, email_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, [
      '2024-002', 'carlos.rodriguez@student.pcc.edu.ph', hashedPassword, 'student',
      'Carlos', 'Rodriguez', 'Mendoza', '0917-234-5678', 'Passi City, Iloilo',
      '2002-08-22', 'Male', true, true
    ]);

    // Create faculty profiles
    if (faculty1Result.rows.length > 0) {
      await db.query(`
        INSERT INTO faculty_profiles (
          user_id, department, position, hire_date, education, 
          specialization, office_location, office_hours
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (user_id) DO NOTHING
      `, [
        faculty1Result.rows[0].id, 'Computer Science', 'Associate Professor',
        '2015-06-01', 'Ph.D. in Computer Science, University of the Philippines',
        'Software Engineering, Web Development', 'CS Building Room 201',
        'MWF 2:00-4:00 PM, TTh 10:00-12:00 PM'
      ]);
    }

    if (faculty2Result.rows.length > 0) {
      await db.query(`
        INSERT INTO faculty_profiles (
          user_id, department, position, hire_date, education,
          specialization, office_location, office_hours
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (user_id) DO NOTHING
      `, [
        faculty2Result.rows[0].id, 'Business Administration', 'Professor',
        '2010-08-15', 'Ph.D. in Business Administration, Ateneo de Manila University',
        'Management, Organizational Behavior', 'BA Building Room 105',
        'MWF 9:00-11:00 AM, TTh 1:00-3:00 PM'
      ]);
    }

    // Create student profiles
    if (student1Result.rows.length > 0) {
      await db.query(`
        INSERT INTO student_profiles (
          user_id, program, year_level, semester, enrollment_date, status, gpa
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (user_id) DO NOTHING
      `, [
        student1Result.rows[0].id, 'Bachelor of Science in Information Technology',
        2, 1, '2023-08-15', 'active', 3.75
      ]);
    }

    if (student2Result.rows.length > 0) {
      await db.query(`
        INSERT INTO student_profiles (
          user_id, program, year_level, semester, enrollment_date, status, gpa
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (user_id) DO NOTHING
      `, [
        student2Result.rows[0].id, 'Bachelor of Science in Business Administration',
        2, 1, '2023-08-15', 'active', 3.50
      ]);
    }

    // Create sample subjects
    const subject1Result = await db.query(`
      INSERT INTO subjects (
        subject_code, subject_name, description, units, semester, year_level, department
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (subject_code) DO NOTHING
      RETURNING id
    `, [
      'CS201', 'Data Structures and Algorithms',
      'Introduction to fundamental data structures and algorithms used in computer programming.',
      3, 1, 2, 'Computer Science'
    ]);

    const subject2Result = await db.query(`
      INSERT INTO subjects (
        subject_code, subject_name, description, units, semester, year_level, department
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (subject_code) DO NOTHING
      RETURNING id
    `, [
      'BA201', 'Principles of Management',
      'Fundamentals of management including planning, organizing, leading, and controlling.',
      3, 1, 2, 'Business Administration'
    ]);

    const subject3Result = await db.query(`
      INSERT INTO subjects (
        subject_code, subject_name, description, units, semester, year_level, department
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (subject_code) DO NOTHING
      RETURNING id
    `, [
      'GE101', 'Mathematics in the Modern World',
      'Mathematical concepts and applications in real-world situations.',
      3, 1, 1, 'General Education'
    ]);

    // Create class sections
    if (subject1Result.rows.length > 0 && faculty1Result.rows.length > 0) {
      const section1Result = await db.query(`
        INSERT INTO class_sections (
          subject_id, faculty_id, section_name, schedule, room, 
          max_students, enrolled_students, academic_year, semester
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `, [
        subject1Result.rows[0].id, faculty1Result.rows[0].id, 'CS201-A',
        'MWF 8:00-9:00 AM', 'CS Lab 1', 35, 2, '2024-2025', 1
      ]);

      // Enroll students in sections
      if (section1Result.rows.length > 0) {
        if (student1Result.rows.length > 0) {
          await db.query(`
            INSERT INTO student_enrollments (student_id, section_id, status)
            VALUES ($1, $2, $3)
            ON CONFLICT (student_id, section_id) DO NOTHING
          `, [student1Result.rows[0].id, section1Result.rows[0].id, 'enrolled']);
        }
      }
    }

    if (subject2Result.rows.length > 0 && faculty2Result.rows.length > 0) {
      const section2Result = await db.query(`
        INSERT INTO class_sections (
          subject_id, faculty_id, section_name, schedule, room,
          max_students, enrolled_students, academic_year, semester
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `, [
        subject2Result.rows[0].id, faculty2Result.rows[0].id, 'BA201-A',
        'TTh 10:00-11:30 AM', 'BA Room 203', 40, 1, '2024-2025', 1
      ]);

      if (section2Result.rows.length > 0) {
        if (student2Result.rows.length > 0) {
          await db.query(`
            INSERT INTO student_enrollments (student_id, section_id, status)
            VALUES ($1, $2, $3)
            ON CONFLICT (student_id, section_id) DO NOTHING
          `, [student2Result.rows[0].id, section2Result.rows[0].id, 'enrolled']);
        }
      }
    }

    // Create sample announcements
    if (adminResult.rows.length > 0) {
      await db.query(`
        INSERT INTO announcements (
          title, content, author_id, category, priority, target_audience, 
          is_published, published_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      `, [
        'Welcome to the Spring 2025 Semester!',
        'We are excited to welcome all students back for the Spring 2025 semester. Classes will begin on January 8, 2025. Please check your schedules and prepare for an amazing semester ahead!',
        adminResult.rows[0].id, 'Academic', 'high', 'all', true
      ]);

      await db.query(`
        INSERT INTO announcements (
          title, content, author_id, category, priority, target_audience,
          is_published, published_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      `, [
        'Faculty Development Workshop',
        'All faculty members are invited to attend the Faculty Development Workshop on January 5, 2025, from 9:00 AM to 4:00 PM at the Main Conference Hall.',
        adminResult.rows[0].id, 'Faculty', 'normal', 'faculty', true
      ]);
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('');
    console.log('📋 Demo Accounts Created:');
    console.log('   Admin: admin@passicitycollege.edu.ph / password123');
    console.log('   Faculty: maria.santos@passicitycollege.edu.ph / password123');
    console.log('   Faculty: juan.delacruz@passicitycollege.edu.ph / password123');
    console.log('   Student: anna.garcia@student.pcc.edu.ph / password123');
    console.log('   Student: carlos.rodriguez@student.pcc.edu.ph / password123');

  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Failed to seed database:', error);
      process.exit(1);
    });
}

module.exports = seedData;