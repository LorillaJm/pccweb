const db = require('../config/database');

async function createTables() {
  try {
    console.log('🔄 Running database migrations...');

    // Users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(20) UNIQUE,
        employee_id VARCHAR(20) UNIQUE,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'faculty', 'admin')),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        middle_name VARCHAR(100),
        phone VARCHAR(20),
        address TEXT,
        date_of_birth DATE,
        gender VARCHAR(10),
        profile_picture VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        email_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Student profiles table
    await db.query(`
      CREATE TABLE IF NOT EXISTS student_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        program VARCHAR(100),
        year_level INTEGER,
        semester INTEGER,
        enrollment_date DATE,
        graduation_date DATE,
        gpa DECIMAL(3,2),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated', 'dropped')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Faculty profiles table
    await db.query(`
      CREATE TABLE IF NOT EXISTS faculty_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        department VARCHAR(100),
        position VARCHAR(100),
        hire_date DATE,
        education TEXT,
        specialization TEXT,
        office_location VARCHAR(100),
        office_hours TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Announcements table
    await db.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author_id INTEGER REFERENCES users(id),
        category VARCHAR(50),
        priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
        target_audience VARCHAR(20) DEFAULT 'all' CHECK (target_audience IN ('all', 'students', 'faculty')),
        is_published BOOLEAN DEFAULT false,
        published_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Subjects table
    await db.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id SERIAL PRIMARY KEY,
        subject_code VARCHAR(20) UNIQUE NOT NULL,
        subject_name VARCHAR(255) NOT NULL,
        description TEXT,
        units INTEGER NOT NULL,
        semester INTEGER,
        year_level INTEGER,
        department VARCHAR(100),
        prerequisites TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Class sections table
    await db.query(`
      CREATE TABLE IF NOT EXISTS class_sections (
        id SERIAL PRIMARY KEY,
        subject_id INTEGER REFERENCES subjects(id),
        faculty_id INTEGER REFERENCES users(id),
        section_name VARCHAR(50) NOT NULL,
        schedule TEXT,
        room VARCHAR(50),
        max_students INTEGER DEFAULT 40,
        enrolled_students INTEGER DEFAULT 0,
        academic_year VARCHAR(10),
        semester INTEGER,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Student enrollments table
    await db.query(`
      CREATE TABLE IF NOT EXISTS student_enrollments (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES users(id),
        section_id INTEGER REFERENCES class_sections(id),
        enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'dropped', 'completed')),
        grade DECIMAL(3,2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, section_id)
      )
    `);

    // Class materials table
    await db.query(`
      CREATE TABLE IF NOT EXISTS class_materials (
        id SERIAL PRIMARY KEY,
        section_id INTEGER REFERENCES class_sections(id),
        faculty_id INTEGER REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        material_type VARCHAR(50) CHECK (material_type IN ('document', 'video', 'link', 'assignment')),
        file_path VARCHAR(255),
        file_name VARCHAR(255),
        file_size INTEGER,
        external_url TEXT,
        due_date TIMESTAMP WITH TIME ZONE,
        is_published BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Refresh tokens table (for JWT)
    await db.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await db.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_users_student_id ON users(student_id)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_announcements_published ON announcements(is_published, created_at)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_class_materials_section ON class_materials(section_id)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_student_enrollments_student ON student_enrollments(student_id)');

    console.log('✅ Database migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  }
}

// Run migrations if called directly
if (require.main === module) {
  createTables()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Failed to run migrations:', error);
      process.exit(1);
    });
}

module.exports = createTables;