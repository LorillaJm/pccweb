-- Phase 4: Student Services Database Schema
-- Run this to add tables for grades, enrollment, payments, and learning materials

-- Create grades table for student grade management
CREATE TABLE IF NOT EXISTS grades (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    class_section_id INTEGER REFERENCES class_sections(id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    faculty_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    academic_year VARCHAR(20) NOT NULL,
    semester INTEGER NOT NULL,
    
    -- Grade components
    prelim_grade DECIMAL(5,2),
    midterm_grade DECIMAL(5,2),
    finals_grade DECIMAL(5,2),
    final_grade DECIMAL(5,2),
    letter_grade VARCHAR(5), -- A, B+, B, C+, C, D, F, INC, W
    grade_points DECIMAL(3,2), -- 4.0 scale
    
    -- Status and metadata
    status VARCHAR(20) DEFAULT 'ongoing', -- ongoing, completed, dropped, incomplete
    remarks TEXT,
    date_submitted TIMESTAMP,
    submitted_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(student_id, class_section_id, academic_year, semester)
);

-- Create student_enrollments table (enhanced from existing)
CREATE TABLE IF NOT EXISTS student_class_enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    class_section_id INTEGER REFERENCES class_sections(id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    academic_year VARCHAR(20) NOT NULL,
    semester INTEGER NOT NULL,
    
    -- Enrollment details
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, enrolled, dropped, completed
    units INTEGER NOT NULL,
    
    -- Approval workflow
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    dropped_date TIMESTAMP,
    drop_reason TEXT,
    
    -- Prerequisites check
    prerequisites_met BOOLEAN DEFAULT false,
    prerequisites_checked_by INTEGER REFERENCES users(id),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(student_id, class_section_id, academic_year, semester)
);

-- Create payments table for tuition and fee tracking
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    academic_year VARCHAR(20) NOT NULL,
    semester INTEGER NOT NULL,
    
    -- Payment details
    payment_type VARCHAR(50) NOT NULL, -- tuition, miscellaneous, laboratory, library, etc.
    description TEXT,
    amount_due DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    balance DECIMAL(10,2) GENERATED ALWAYS AS (amount_due - amount_paid) STORED,
    
    -- Payment status
    status VARCHAR(20) DEFAULT 'pending', -- pending, partial, paid, overdue
    due_date DATE,
    
    -- Payment tracking
    last_payment_date TIMESTAMP,
    payment_method VARCHAR(50), -- cash, check, bank_transfer, online, etc.
    reference_number VARCHAR(100),
    
    -- Metadata
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payment_transactions table for payment history
CREATE TABLE IF NOT EXISTS payment_transactions (
    id SERIAL PRIMARY KEY,
    payment_id INTEGER REFERENCES payments(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    
    -- Transaction details
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    reference_number VARCHAR(100),
    
    -- Receipt and verification
    receipt_number VARCHAR(100),
    verified_by INTEGER REFERENCES users(id),
    verified_at TIMESTAMP,
    
    -- Transaction metadata
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create learning_materials table for file management
CREATE TABLE IF NOT EXISTS learning_materials (
    id SERIAL PRIMARY KEY,
    class_section_id INTEGER REFERENCES class_sections(id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    -- File details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT, -- in bytes
    file_type VARCHAR(100), -- pdf, docx, pptx, etc.
    mime_type VARCHAR(100),
    
    -- Access control
    material_type VARCHAR(50) DEFAULT 'handout', -- handout, assignment, exam, reference, etc.
    is_public BOOLEAN DEFAULT false, -- visible to all students in class
    download_count INTEGER DEFAULT 0,
    
    -- Metadata
    academic_year VARCHAR(20),
    semester INTEGER,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create material_downloads table for tracking downloads
CREATE TABLE IF NOT EXISTS material_downloads (
    id SERIAL PRIMARY KEY,
    material_id INTEGER REFERENCES learning_materials(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    download_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- Create student_schedules view for easy schedule viewing
CREATE OR REPLACE VIEW student_schedules AS
SELECT 
    sce.student_id,
    sce.id as enrollment_id,
    s.subject_code,
    s.subject_name,
    s.units,
    cs.section_name,
    cs.schedule,
    cs.room,
    u.first_name || ' ' || u.last_name as faculty_name,
    sce.academic_year,
    sce.semester,
    sce.status as enrollment_status
FROM student_class_enrollments sce
JOIN class_sections cs ON sce.class_section_id = cs.id
JOIN subjects s ON sce.subject_id = s.id
LEFT JOIN users u ON cs.faculty_id = u.id
WHERE sce.status IN ('approved', 'enrolled')
ORDER BY sce.student_id, s.subject_code;

-- Create student_grades_summary view
CREATE OR REPLACE VIEW student_grades_summary AS
SELECT 
    g.student_id,
    g.academic_year,
    g.semester,
    COUNT(*) as total_subjects,
    AVG(g.grade_points) as gpa,
    SUM(s.units) as total_units,
    COUNT(CASE WHEN g.letter_grade IN ('A', 'B+', 'B', 'C+', 'C') THEN 1 END) as passed_subjects,
    COUNT(CASE WHEN g.letter_grade IN ('D', 'F') THEN 1 END) as failed_subjects,
    COUNT(CASE WHEN g.letter_grade = 'INC' THEN 1 END) as incomplete_subjects
FROM grades g
JOIN subjects s ON g.subject_id = s.id
WHERE g.status = 'completed'
GROUP BY g.student_id, g.academic_year, g.semester;

-- Create payment_summary view
CREATE OR REPLACE VIEW payment_summary AS
SELECT 
    p.student_id,
    p.academic_year,
    p.semester,
    SUM(p.amount_due) as total_due,
    SUM(p.amount_paid) as total_paid,
    SUM(p.balance) as total_balance,
    COUNT(*) as total_payments,
    COUNT(CASE WHEN p.status = 'paid' THEN 1 END) as paid_count,
    COUNT(CASE WHEN p.status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN p.status = 'overdue' THEN 1 END) as overdue_count
FROM payments p
GROUP BY p.student_id, p.academic_year, p.semester;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_academic_year_semester ON grades(academic_year, semester);
CREATE INDEX IF NOT EXISTS idx_grades_status ON grades(status);

CREATE INDEX IF NOT EXISTS idx_student_enrollments_student_id ON student_class_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_enrollments_status ON student_class_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_student_enrollments_academic_year ON student_class_enrollments(academic_year, semester);

CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_id ON payment_transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_student_id ON payment_transactions(student_id);

CREATE INDEX IF NOT EXISTS idx_learning_materials_class_section ON learning_materials(class_section_id);
CREATE INDEX IF NOT EXISTS idx_learning_materials_subject ON learning_materials(subject_id);
CREATE INDEX IF NOT EXISTS idx_learning_materials_type ON learning_materials(material_type);

CREATE INDEX IF NOT EXISTS idx_material_downloads_material_id ON material_downloads(material_id);
CREATE INDEX IF NOT EXISTS idx_material_downloads_student_id ON material_downloads(student_id);

-- Insert sample data for testing
-- Sample academic year
INSERT INTO academic_years (year_code, start_date, end_date, is_current, is_active) VALUES
('2024-2025', '2024-08-01', '2025-07-31', true, true)
ON CONFLICT (year_code) DO NOTHING;

-- Sample enrollment period
INSERT INTO enrollment_periods (academic_year_id, semester, start_date, end_date, is_active) VALUES
((SELECT id FROM academic_years WHERE year_code = '2024-2025'), 1, '2024-07-01 00:00:00', '2024-08-15 23:59:59', true)
ON CONFLICT DO NOTHING;

-- Sample payment types for students
INSERT INTO payments (student_id, academic_year, semester, payment_type, description, amount_due, due_date, created_by)
SELECT 
    u.id,
    '2024-2025',
    1,
    'tuition',
    'Tuition Fee - First Semester',
    25000.00,
    '2024-08-30',
    1
FROM users u 
WHERE u.role = 'student' AND u.is_active = true
ON CONFLICT DO NOTHING;

-- Add miscellaneous fees
INSERT INTO payments (student_id, academic_year, semester, payment_type, description, amount_due, due_date, created_by)
SELECT 
    u.id,
    '2024-2025',
    1,
    'miscellaneous',
    'Miscellaneous Fees - First Semester',
    5000.00,
    '2024-08-30',
    1
FROM users u 
WHERE u.role = 'student' AND u.is_active = true
ON CONFLICT DO NOTHING;
