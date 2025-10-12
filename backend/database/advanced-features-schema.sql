-- Phase 5: Advanced Features Database Schema
-- International-level modern features for PCC Portal

-- ==================== AI CHATBOT SYSTEM ====================

-- Chatbot conversations and FAQ management
CREATE TABLE IF NOT EXISTS chatbot_faqs (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'general', -- academic, enrollment, payment, technical, etc.
    keywords TEXT[], -- Array of keywords for matching
    priority INTEGER DEFAULT 1, -- Higher priority answers shown first
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat conversations history
CREATE TABLE IF NOT EXISTS chatbot_conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    session_id VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    intent VARCHAR(100), -- Detected intent (greeting, question, complaint, etc.)
    confidence_score DECIMAL(3,2), -- AI confidence in response
    was_helpful BOOLEAN, -- User feedback
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== EVENT TICKETING SYSTEM ====================

-- Events management
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) DEFAULT 'general', -- conference, seminar, sports, cultural, etc.
    venue VARCHAR(255),
    event_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    registration_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    registration_end TIMESTAMP,
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    ticket_price DECIMAL(10,2) DEFAULT 0,
    is_free BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT false,
    image_url TEXT,
    organizer_id INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event tickets with QR codes
CREATE TABLE IF NOT EXISTS event_tickets (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    ticket_code VARCHAR(255) UNIQUE NOT NULL, -- QR code data
    qr_code_url TEXT, -- Generated QR code image URL
    status VARCHAR(20) DEFAULT 'active', -- active, used, cancelled
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    check_in_date TIMESTAMP,
    checked_in_by INTEGER REFERENCES users(id),
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, refunded
    payment_reference VARCHAR(100),
    special_requirements TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(event_id, user_id)
);

-- ==================== DIGITAL ID SYSTEM ====================

-- Digital student/faculty IDs with QR codes
CREATE TABLE IF NOT EXISTS digital_ids (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    id_number VARCHAR(50) UNIQUE NOT NULL,
    qr_code_data TEXT NOT NULL, -- Encrypted user data for QR
    qr_code_url TEXT, -- Generated QR code image URL
    issue_date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE,
    is_active BOOLEAN DEFAULT true,
    last_scanned TIMESTAMP,
    scan_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Access logs for library/lab entry
CREATE TABLE IF NOT EXISTS access_logs (
    id SERIAL PRIMARY KEY,
    digital_id_id INTEGER REFERENCES digital_ids(id),
    user_id INTEGER REFERENCES users(id),
    location VARCHAR(100) NOT NULL, -- library, computer_lab, science_lab, etc.
    access_type VARCHAR(20) DEFAULT 'entry', -- entry, exit
    access_granted BOOLEAN DEFAULT true,
    scanner_device VARCHAR(100),
    ip_address INET,
    access_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- ==================== OJT & INTERNSHIP PORTAL ====================

-- Companies/Organizations offering internships
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    description TEXT,
    website VARCHAR(255),
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    logo_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Internship/OJT positions
CREATE TABLE IF NOT EXISTS internship_positions (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    requirements TEXT,
    skills_required TEXT[],
    duration_months INTEGER,
    stipend DECIMAL(10,2),
    location VARCHAR(255),
    position_type VARCHAR(50) DEFAULT 'internship', -- internship, ojt, part_time, full_time
    slots_available INTEGER DEFAULT 1,
    slots_filled INTEGER DEFAULT 0,
    application_deadline DATE,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student applications for internships
CREATE TABLE IF NOT EXISTS internship_applications (
    id SERIAL PRIMARY KEY,
    position_id INTEGER REFERENCES internship_positions(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    cover_letter TEXT,
    resume_url TEXT,
    portfolio_url TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, reviewing, accepted, rejected, withdrawn
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_date TIMESTAMP,
    reviewed_by INTEGER REFERENCES users(id),
    feedback TEXT,
    interview_date TIMESTAMP,
    interview_notes TEXT,
    start_date DATE,
    end_date DATE,
    completion_status VARCHAR(20), -- ongoing, completed, terminated
    evaluation_score INTEGER, -- 1-5 rating
    supervisor_feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(position_id, student_id)
);

-- ==================== ALUMNI PORTAL ====================

-- Alumni profiles (extends users table)
CREATE TABLE IF NOT EXISTS alumni_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    graduation_year INTEGER,
    degree_program VARCHAR(255),
    current_company VARCHAR(255),
    current_position VARCHAR(255),
    industry VARCHAR(100),
    years_experience INTEGER,
    linkedin_url VARCHAR(255),
    website_url VARCHAR(255),
    bio TEXT,
    achievements TEXT,
    is_mentor_available BOOLEAN DEFAULT false,
    is_job_poster BOOLEAN DEFAULT false,
    networking_interests TEXT[],
    location VARCHAR(255),
    is_profile_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job postings by alumni/companies
CREATE TABLE IF NOT EXISTS job_postings (
    id SERIAL PRIMARY KEY,
    posted_by INTEGER REFERENCES users(id),
    company_name VARCHAR(255) NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    job_description TEXT,
    requirements TEXT,
    skills_required TEXT[],
    experience_level VARCHAR(50), -- entry, mid, senior, executive
    employment_type VARCHAR(50) DEFAULT 'full_time', -- full_time, part_time, contract, remote
    salary_range VARCHAR(100),
    location VARCHAR(255),
    application_deadline DATE,
    external_url VARCHAR(500), -- Link to external job posting
    contact_email VARCHAR(255),
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0,
    application_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alumni networking connections
CREATE TABLE IF NOT EXISTS alumni_connections (
    id SERIAL PRIMARY KEY,
    requester_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    recipient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, declined, blocked
    message TEXT,
    connection_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(requester_id, recipient_id)
);

-- Alumni mentorship programs
CREATE TABLE IF NOT EXISTS mentorship_programs (
    id SERIAL PRIMARY KEY,
    mentor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    mentee_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    program_type VARCHAR(50) DEFAULT 'career', -- career, academic, entrepreneurship
    status VARCHAR(20) DEFAULT 'active', -- active, completed, paused, cancelled
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    meeting_frequency VARCHAR(50), -- weekly, biweekly, monthly
    goals TEXT,
    progress_notes TEXT,
    mentor_rating INTEGER, -- 1-5 rating by mentee
    mentee_rating INTEGER, -- 1-5 rating by mentor
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(mentor_id, mentee_id)
);

-- ==================== SYSTEM ENHANCEMENTS ====================

-- Notifications system for all features
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info', -- info, success, warning, error, event, internship, etc.
    related_id INTEGER, -- ID of related record (event, application, etc.)
    related_type VARCHAR(50), -- event, internship, job, etc.
    is_read BOOLEAN DEFAULT false,
    action_url TEXT, -- URL to take action
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System analytics and metrics
CREATE TABLE IF NOT EXISTS system_analytics (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,2),
    metric_type VARCHAR(50) DEFAULT 'counter', -- counter, gauge, histogram
    category VARCHAR(100), -- user_activity, system_performance, feature_usage
    tags JSONB, -- Additional metadata
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== INDEXES FOR PERFORMANCE ====================

-- Chatbot indexes
CREATE INDEX IF NOT EXISTS idx_chatbot_faqs_category ON chatbot_faqs(category);
CREATE INDEX IF NOT EXISTS idx_chatbot_faqs_keywords ON chatbot_faqs USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_user ON chatbot_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_session ON chatbot_conversations(session_id);

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_event_tickets_user ON event_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_event_tickets_code ON event_tickets(ticket_code);

-- Digital ID indexes
CREATE INDEX IF NOT EXISTS idx_digital_ids_user ON digital_ids(user_id);
CREATE INDEX IF NOT EXISTS idx_digital_ids_number ON digital_ids(id_number);
CREATE INDEX IF NOT EXISTS idx_access_logs_user ON access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_time ON access_logs(access_time);

-- Internship indexes
CREATE INDEX IF NOT EXISTS idx_internship_positions_company ON internship_positions(company_id);
CREATE INDEX IF NOT EXISTS idx_internship_applications_student ON internship_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_internship_applications_position ON internship_applications(position_id);

-- Alumni indexes
CREATE INDEX IF NOT EXISTS idx_alumni_profiles_user ON alumni_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_alumni_profiles_year ON alumni_profiles(graduation_year);
CREATE INDEX IF NOT EXISTS idx_job_postings_posted_by ON job_postings(posted_by);
CREATE INDEX IF NOT EXISTS idx_alumni_connections_requester ON alumni_connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_alumni_connections_recipient ON alumni_connections(recipient_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

-- ==================== SAMPLE DATA ====================

-- Sample FAQ data
INSERT INTO chatbot_faqs (question, answer, category, keywords, priority) VALUES
('How do I enroll in subjects?', 'You can enroll in subjects by going to the Student Portal > Enrollment section. Browse available subjects and click "Enroll" for your desired courses.', 'enrollment', ARRAY['enroll', 'subjects', 'courses', 'registration'], 5),
('What are the payment methods available?', 'We accept GCash, PayMaya, bank transfers, and over-the-counter payments at the cashier''s office. You can view your payment options in the Student Portal > Payments section.', 'payment', ARRAY['payment', 'gcash', 'paymaya', 'bank', 'cashier'], 5),
('How do I check my grades?', 'Your grades are available in the Student Portal > Grades section. You can view grades by semester and track your GPA.', 'academic', ARRAY['grades', 'gpa', 'academic', 'performance'], 5),
('Where can I download learning materials?', 'Learning materials are available in the Student Portal > Materials section. You can filter by subject and download handouts, assignments, and references.', 'academic', ARRAY['materials', 'download', 'handouts', 'assignments'], 4),
('How do I contact technical support?', 'For technical issues, you can email support@pcc.edu.ph or visit the IT office during office hours (8AM-5PM).', 'technical', ARRAY['support', 'technical', 'help', 'contact'], 3)
ON CONFLICT DO NOTHING;

-- Sample events
INSERT INTO events (title, description, event_type, venue, event_date, max_attendees, organizer_id) VALUES
('Orientation Day 2024', 'Welcome orientation for new students', 'orientation', 'Main Auditorium', '2024-08-15 09:00:00', 500, 1),
('Career Fair 2024', 'Annual career fair with industry partners', 'career', 'Gymnasium', '2024-10-20 10:00:00', 1000, 1),
('Tech Summit 2024', 'Technology conference for IT students', 'conference', 'Conference Hall', '2024-11-15 08:00:00', 200, 1)
ON CONFLICT DO NOTHING;

-- Sample companies
INSERT INTO companies (company_name, industry, description, contact_email, is_verified) VALUES
('TechCorp Philippines', 'Information Technology', 'Leading software development company', 'hr@techcorp.ph', true),
('Global Marketing Solutions', 'Marketing & Advertising', 'Digital marketing agency', 'careers@gms.ph', true),
('Philippine Bank Corp', 'Banking & Finance', 'Major commercial bank', 'internships@pbc.ph', true)
ON CONFLICT DO NOTHING;

-- Sample internship positions
INSERT INTO internship_positions (company_id, title, description, duration_months, stipend, location, position_type, slots_available) VALUES
(1, 'Software Development Intern', 'Learn web development with React and Node.js', 6, 15000, 'Makati City', 'internship', 5),
(2, 'Digital Marketing Intern', 'Social media management and content creation', 4, 12000, 'BGC, Taguig', 'internship', 3),
(3, 'Banking Operations Intern', 'Learn banking operations and customer service', 6, 18000, 'Ortigas Center', 'internship', 2)
ON CONFLICT DO NOTHING;
