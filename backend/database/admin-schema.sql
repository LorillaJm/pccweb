-- Admin Portal Database Schema Updates
-- Run this to add new columns and tables for enhanced admin functionality

-- Add new columns to announcements table for enhanced CMS
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS content_type VARCHAR(20) DEFAULT 'announcement';
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS event_date TIMESTAMP;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS event_location TEXT;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create programs table for academic management
CREATE TABLE IF NOT EXISTS programs (
    id SERIAL PRIMARY KEY,
    program_code VARCHAR(10) UNIQUE NOT NULL,
    program_name VARCHAR(255) NOT NULL,
    description TEXT,
    department VARCHAR(100),
    duration_years INTEGER DEFAULT 4,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    department_code VARCHAR(10) UNIQUE NOT NULL,
    department_name VARCHAR(255) NOT NULL,
    description TEXT,
    head_faculty_id INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create academic_years table
CREATE TABLE IF NOT EXISTS academic_years (
    id SERIAL PRIMARY KEY,
    year_code VARCHAR(20) UNIQUE NOT NULL, -- e.g., "2024-2025"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create enrollment_periods table
CREATE TABLE IF NOT EXISTS enrollment_periods (
    id SERIAL PRIMARY KEY,
    academic_year_id INTEGER REFERENCES academic_years(id),
    semester INTEGER NOT NULL, -- 1, 2, or 3 (summer)
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add department reference to subjects
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS department_id INTEGER REFERENCES departments(id);

-- Add program reference to student_profiles
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS program_id INTEGER REFERENCES programs(id);

-- Create admin_logs table for audit trail
CREATE TABLE IF NOT EXISTS admin_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50), -- 'user', 'subject', 'enrollment', etc.
    target_id INTEGER,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_by INTEGER REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('enrollment_enabled', 'true', 'Enable/disable student enrollment'),
('max_units_per_semester', '24', 'Maximum units a student can enroll per semester'),
('late_enrollment_fee', '500', 'Late enrollment fee amount'),
('college_name', 'Philippine Christian College', 'Official college name'),
('college_address', 'Manila, Philippines', 'College address'),
('academic_year_current', '2024-2025', 'Current academic year')
ON CONFLICT (setting_key) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_announcements_content_type ON announcements(content_type);
CREATE INDEX IF NOT EXISTS idx_announcements_featured ON announcements(featured);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_student_enrollments_status ON student_enrollments(status);

-- Update user roles to include super_admin (if needed)
-- Note: This is handled in the application logic, but you can add a constraint if desired
-- ALTER TABLE users ADD CONSTRAINT check_user_role CHECK (role IN ('student', 'faculty', 'admin', 'super_admin'));

-- Create view for enrollment statistics
CREATE OR REPLACE VIEW enrollment_stats AS
SELECT 
    cs.id as section_id,
    cs.section_name,
    s.subject_code,
    s.subject_name,
    cs.max_students,
    cs.enrolled_students,
    (cs.max_students - cs.enrolled_students) as available_slots,
    ROUND((cs.enrolled_students::decimal / cs.max_students) * 100, 2) as enrollment_percentage,
    cs.academic_year,
    cs.semester
FROM class_sections cs
JOIN subjects s ON cs.subject_id = s.id
WHERE cs.is_active = true;

-- Create view for user statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    role,
    COUNT(*) as total_count,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_count,
    COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_count,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_this_month
FROM users
GROUP BY role;
