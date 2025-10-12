const express = require('express');
const router = express.Router();
const db = require('../config/database-adapter');
const { authenticateToken, requireStudent, requireFaculty, requireAdmin, requireStudentOrFaculty } = require('../middleware/auth');
const QRCode = require('qrcode');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/documents');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, and image files are allowed'));
    }
  }
});

// ==================== AI CHATBOT SYSTEM ====================

// Get FAQ categories
router.get('/chatbot/categories', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT DISTINCT category, COUNT(*) as faq_count
      FROM chatbot_faqs 
      WHERE is_active = true 
      GROUP BY category 
      ORDER BY category
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching FAQ categories:', error);
    res.status(500).json({ error: 'Failed to fetch FAQ categories' });
  }
});

// Search FAQs and get chatbot response
router.post('/chatbot/ask', authenticateToken, async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user.id;

    // Simple keyword matching for FAQ search
    const searchTerms = message.toLowerCase().split(' ').filter(term => term.length > 2);
    
    let bestMatch = null;
    let maxScore = 0;

    if (searchTerms.length > 0) {
      // Search for matching FAQs
      const faqResult = await db.query(`
        SELECT *, 
        CASE 
          WHEN keywords && $1 THEN priority + 2
          WHEN LOWER(question) LIKE ANY($2) THEN priority + 1
          WHEN LOWER(answer) LIKE ANY($2) THEN priority
          ELSE 0
        END as relevance_score
        FROM chatbot_faqs 
        WHERE is_active = true 
        AND (
          keywords && $1 
          OR LOWER(question) LIKE ANY($2)
          OR LOWER(answer) LIKE ANY($2)
        )
        ORDER BY relevance_score DESC, priority DESC
        LIMIT 1
      `, [
        searchTerms,
        searchTerms.map(term => `%${term}%`)
      ]);

      if (faqResult.rows.length > 0) {
        bestMatch = faqResult.rows[0];
        maxScore = bestMatch.relevance_score;
      }
    }

    let response;
    let intent = 'unknown';
    let confidence = 0;

    if (bestMatch && maxScore > 0) {
      response = bestMatch.answer;
      intent = bestMatch.category;
      confidence = Math.min(maxScore / 10, 1); // Normalize to 0-1
    } else {
      // Default responses for common intents
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('good')) {
        response = "Hello! I'm the PCC Assistant. I can help you with questions about enrollment, payments, grades, and more. What would you like to know?";
        intent = 'greeting';
        confidence = 0.9;
      } else if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
        response = "You're welcome! Is there anything else I can help you with?";
        intent = 'gratitude';
        confidence = 0.9;
      } else {
        response = "I'm sorry, I don't have specific information about that. You can contact the registrar's office at registrar@pcc.edu.ph or visit the admin office for more help. You can also try asking about enrollment, payments, grades, or learning materials.";
        intent = 'unknown';
        confidence = 0.1;
      }
    }

    // Save conversation
    await db.query(`
      INSERT INTO chatbot_conversations (user_id, session_id, message, response, intent, confidence_score)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [userId, sessionId, message, response, intent, confidence]);

    res.json({
      response,
      intent,
      confidence,
      suggestions: bestMatch ? [] : [
        "How do I enroll in subjects?",
        "What payment methods are available?",
        "How do I check my grades?",
        "Where can I download materials?"
      ]
    });

  } catch (error) {
    console.error('Error processing chatbot request:', error);
    res.status(500).json({ error: 'Failed to process your request' });
  }
});

// Get chat history
router.get('/chatbot/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50 } = req.query;

    const result = await db.query(`
      SELECT message, response, intent, confidence_score, created_at
      FROM chatbot_conversations 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `, [userId, limit]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Feedback on chatbot response
router.post('/chatbot/feedback', authenticateToken, async (req, res) => {
  try {
    const { sessionId, messageIndex, wasHelpful } = req.body;
    const userId = req.user.id;

    await db.query(`
      UPDATE chatbot_conversations 
      SET was_helpful = $1 
      WHERE user_id = $2 AND session_id = $3 
      ORDER BY created_at DESC 
      OFFSET $4 LIMIT 1
    `, [wasHelpful, userId, sessionId, messageIndex || 0]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

// ==================== EVENT TICKETING SYSTEM ====================

// Get all events
router.get('/events', async (req, res) => {
  try {
    const { type, upcoming = 'true' } = req.query;
    
    let query = `
      SELECT e.*, u.first_name || ' ' || u.last_name as organizer_name,
      (e.max_attendees - e.current_attendees) as available_slots
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      WHERE e.is_active = true
    `;
    
    const params = [];
    
    if (upcoming === 'true') {
      query += ` AND e.event_date >= CURRENT_TIMESTAMP`;
    }
    
    if (type) {
      params.push(type);
      query += ` AND e.event_type = $${params.length}`;
    }
    
    query += ` ORDER BY e.event_date ASC`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get event details
router.get('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(`
      SELECT e.*, u.first_name || ' ' || u.last_name as organizer_name,
      (e.max_attendees - e.current_attendees) as available_slots
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      WHERE e.id = $1 AND e.is_active = true
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching event details:', error);
    res.status(500).json({ error: 'Failed to fetch event details' });
  }
});

// Register for event
router.post('/events/:id/register', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { specialRequirements } = req.body;

    // Check if event exists and has available slots
    const eventResult = await db.query(`
      SELECT * FROM events 
      WHERE id = $1 AND is_active = true 
      AND event_date > CURRENT_TIMESTAMP
      AND (registration_end IS NULL OR registration_end > CURRENT_TIMESTAMP)
    `, [id]);

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found or registration closed' });
    }

    const event = eventResult.rows[0];

    if (event.current_attendees >= event.max_attendees) {
      return res.status(400).json({ error: 'Event is fully booked' });
    }

    // Check if already registered
    const existingTicket = await db.query(`
      SELECT id FROM event_tickets 
      WHERE event_id = $1 AND user_id = $2
    `, [id, userId]);

    if (existingTicket.rows.length > 0) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }

    // Generate unique ticket code
    const ticketCode = crypto.randomBytes(16).toString('hex').toUpperCase();
    
    // Generate QR code
    const qrData = JSON.stringify({
      eventId: id,
      userId: userId,
      ticketCode: ticketCode,
      timestamp: Date.now()
    });
    
    const qrCodeUrl = await QRCode.toDataURL(qrData);

    // Create ticket
    const ticketResult = await db.query(`
      INSERT INTO event_tickets (event_id, user_id, ticket_code, qr_code_url, special_requirements)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [id, userId, ticketCode, qrCodeUrl, specialRequirements]);

    // Update event attendee count
    await db.query(`
      UPDATE events 
      SET current_attendees = current_attendees + 1 
      WHERE id = $1
    `, [id]);

    res.json({
      ticket: ticketResult.rows[0],
      message: 'Successfully registered for event!'
    });

  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ error: 'Failed to register for event' });
  }
});

// Get user's event tickets
router.get('/events/my-tickets', async (req, res) => {
  try {
    // Check if user is authenticated via session
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const userId = req.user._id || req.user.id;
    
    const result = await db.query(`
      SELECT et.*, e.title, e.event_date, e.venue, e.event_type
      FROM event_tickets et
      JOIN events e ON et.event_id = e.id
      WHERE et.user_id = $1
      ORDER BY e.event_date DESC
    `, [userId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// ==================== DIGITAL ID SYSTEM ====================

// Get user's digital ID
router.get('/digital-id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    let result = await db.query(`
      SELECT di.*, u.first_name, u.last_name, u.email, u.role,
      sp.student_id, sp.program, sp.year_level,
      fp.employee_id, fp.department
      FROM digital_ids di
      JOIN users u ON di.user_id = u.id
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      LEFT JOIN faculty_profiles fp ON u.id = fp.user_id
      WHERE di.user_id = $1 AND di.is_active = true
    `, [userId]);

    if (result.rows.length === 0) {
      // Generate digital ID if doesn't exist
      const userResult = await db.query(`
        SELECT u.*, sp.student_id, fp.employee_id
        FROM users u
        LEFT JOIN student_profiles sp ON u.id = sp.user_id
        LEFT JOIN faculty_profiles fp ON u.id = fp.user_id
        WHERE u.id = $1
      `, [userId]);

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = userResult.rows[0];
      const idNumber = user.student_id || user.employee_id || `ID${userId.toString().padStart(6, '0')}`;
      
      // Create encrypted QR data
      const qrData = JSON.stringify({
        userId: userId,
        idNumber: idNumber,
        name: `${user.first_name} ${user.last_name}`,
        role: user.role,
        issued: new Date().toISOString()
      });

      const qrCodeUrl = await QRCode.toDataURL(qrData);
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year validity

      const insertResult = await db.query(`
        INSERT INTO digital_ids (user_id, id_number, qr_code_data, qr_code_url, expiry_date)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [userId, idNumber, qrData, qrCodeUrl, expiryDate]);

      // Fetch the complete digital ID info
      result = await db.query(`
        SELECT di.*, u.first_name, u.last_name, u.email, u.role,
        sp.student_id, sp.program, sp.year_level,
        fp.employee_id, fp.department
        FROM digital_ids di
        JOIN users u ON di.user_id = u.id
        LEFT JOIN student_profiles sp ON u.id = sp.user_id
        LEFT JOIN faculty_profiles fp ON u.id = fp.user_id
        WHERE di.id = $1
      `, [insertResult.rows[0].id]);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching digital ID:', error);
    res.status(500).json({ error: 'Failed to fetch digital ID' });
  }
});

// Scan QR code for access
router.post('/digital-id/scan', requireAdmin, async (req, res) => {
  try {
    const { qrData, location, scannerDevice } = req.body;
    
    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid QR code format' });
    }

    const { userId, idNumber } = parsedData;

    // Verify digital ID
    const idResult = await db.query(`
      SELECT di.*, u.first_name, u.last_name, u.role
      FROM digital_ids di
      JOIN users u ON di.user_id = u.id
      WHERE di.user_id = $1 AND di.id_number = $2 AND di.is_active = true
      AND di.expiry_date > CURRENT_DATE
    `, [userId, idNumber]);

    if (idResult.rows.length === 0) {
      // Log failed access attempt
      await db.query(`
        INSERT INTO access_logs (user_id, location, access_granted, scanner_device, ip_address, notes)
        VALUES ($1, $2, false, $3, $4, 'Invalid or expired digital ID')
      `, [userId, location, scannerDevice, req.ip]);

      return res.status(403).json({ error: 'Invalid or expired digital ID' });
    }

    const digitalId = idResult.rows[0];

    // Update scan count and last scanned
    await db.query(`
      UPDATE digital_ids 
      SET scan_count = scan_count + 1, last_scanned = CURRENT_TIMESTAMP 
      WHERE id = $1
    `, [digitalId.id]);

    // Log successful access
    await db.query(`
      INSERT INTO access_logs (digital_id_id, user_id, location, access_granted, scanner_device, ip_address)
      VALUES ($1, $2, $3, true, $4, $5)
    `, [digitalId.id, userId, location, scannerDevice, req.ip]);

    res.json({
      success: true,
      user: {
        name: `${digitalId.first_name} ${digitalId.last_name}`,
        role: digitalId.role,
        idNumber: digitalId.id_number
      },
      message: 'Access granted'
    });

  } catch (error) {
    console.error('Error scanning QR code:', error);
    res.status(500).json({ error: 'Failed to process QR scan' });
  }
});

// Get access history
router.get('/digital-id/access-history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50 } = req.query;

    const result = await db.query(`
      SELECT location, access_type, access_granted, access_time, notes
      FROM access_logs 
      WHERE user_id = $1 
      ORDER BY access_time DESC 
      LIMIT $2
    `, [userId, limit]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching access history:', error);
    res.status(500).json({ error: 'Failed to fetch access history' });
  }
});

// ==================== OJT & INTERNSHIP PORTAL ====================

// Get all companies
router.get('/companies', async (req, res) => {
  try {
    const { industry, verified } = req.query;
    
    let query = `
      SELECT c.*, COUNT(ip.id) as active_positions
      FROM companies c
      LEFT JOIN internship_positions ip ON c.id = ip.company_id AND ip.is_active = true
      WHERE c.is_active = true
    `;
    
    const params = [];
    
    if (industry) {
      params.push(industry);
      query += ` AND c.industry = $${params.length}`;
    }
    
    if (verified === 'true') {
      query += ` AND c.is_verified = true`;
    }
    
    query += ` GROUP BY c.id ORDER BY c.is_verified DESC, c.company_name ASC`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// Get internship positions
router.get('/internships', async (req, res) => {
  try {
    const { company_id, position_type, location } = req.query;
    
    let query = `
      SELECT ip.*, c.company_name, c.industry, c.logo_url,
      (ip.slots_available - ip.slots_filled) as available_slots
      FROM internship_positions ip
      JOIN companies c ON ip.company_id = c.id
      WHERE ip.is_active = true AND c.is_active = true
      AND (ip.application_deadline IS NULL OR ip.application_deadline >= CURRENT_DATE)
    `;
    
    const params = [];
    
    if (company_id) {
      params.push(company_id);
      query += ` AND ip.company_id = $${params.length}`;
    }
    
    if (position_type) {
      params.push(position_type);
      query += ` AND ip.position_type = $${params.length}`;
    }
    
    if (location) {
      params.push(`%${location}%`);
      query += ` AND ip.location ILIKE $${params.length}`;
    }
    
    query += ` ORDER BY ip.created_at DESC`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching internships:', error);
    res.status(500).json({ error: 'Failed to fetch internships' });
  }
});

// Get internship details
router.get('/internships/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(`
      SELECT ip.*, c.company_name, c.industry, c.description as company_description,
      c.website, c.contact_person, c.contact_email, c.logo_url,
      (ip.slots_available - ip.slots_filled) as available_slots
      FROM internship_positions ip
      JOIN companies c ON ip.company_id = c.id
      WHERE ip.id = $1 AND ip.is_active = true
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Internship position not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching internship details:', error);
    res.status(500).json({ error: 'Failed to fetch internship details' });
  }
});

// Apply for internship
router.post('/internships/:id/apply', authenticateToken, requireStudent, upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'portfolio', maxCount: 1 }
]), async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;
    const { coverLetter } = req.body;

    // Check if position exists and is available
    const positionResult = await db.query(`
      SELECT * FROM internship_positions 
      WHERE id = $1 AND is_active = true 
      AND (application_deadline IS NULL OR application_deadline >= CURRENT_DATE)
      AND slots_filled < slots_available
    `, [id]);

    if (positionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Position not available for application' });
    }

    // Check if already applied
    const existingApplication = await db.query(`
      SELECT id FROM internship_applications 
      WHERE position_id = $1 AND student_id = $2
    `, [id, studentId]);

    if (existingApplication.rows.length > 0) {
      return res.status(400).json({ error: 'Already applied for this position' });
    }

    // Handle file uploads
    const resumeUrl = req.files.resume ? req.files.resume[0].path : null;
    const portfolioUrl = req.files.portfolio ? req.files.portfolio[0].path : null;

    // Create application
    const applicationResult = await db.query(`
      INSERT INTO internship_applications (position_id, student_id, cover_letter, resume_url, portfolio_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [id, studentId, coverLetter, resumeUrl, portfolioUrl]);

    res.json({
      application: applicationResult.rows[0],
      message: 'Application submitted successfully!'
    });

  } catch (error) {
    console.error('Error applying for internship:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// Get student's applications
router.get('/internships/my-applications', authenticateToken, requireStudent, async (req, res) => {
  try {
    const studentId = req.user.id;
    
    const result = await db.query(`
      SELECT ia.*, ip.title, ip.position_type, c.company_name, c.logo_url
      FROM internship_applications ia
      JOIN internship_positions ip ON ia.position_id = ip.id
      JOIN companies c ON ip.company_id = c.id
      WHERE ia.student_id = $1
      ORDER BY ia.application_date DESC
    `, [studentId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// ==================== ALUMNI PORTAL ====================

// Get alumni directory
router.get('/alumni', async (req, res) => {
  try {
    const { graduation_year, industry, location, search } = req.query;
    
    let query = `
      SELECT ap.*, u.first_name, u.last_name, u.email
      FROM alumni_profiles ap
      JOIN users u ON ap.user_id = u.id
      WHERE ap.is_profile_public = true AND u.is_active = true
    `;
    
    const params = [];
    
    if (graduation_year) {
      params.push(graduation_year);
      query += ` AND ap.graduation_year = $${params.length}`;
    }
    
    if (industry) {
      params.push(industry);
      query += ` AND ap.industry = $${params.length}`;
    }
    
    if (location) {
      params.push(`%${location}%`);
      query += ` AND ap.location ILIKE $${params.length}`;
    }
    
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (u.first_name ILIKE $${params.length} OR u.last_name ILIKE $${params.length} OR ap.current_company ILIKE $${params.length})`;
    }
    
    query += ` ORDER BY ap.graduation_year DESC, u.last_name ASC`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching alumni:', error);
    res.status(500).json({ error: 'Failed to fetch alumni directory' });
  }
});

// Get job postings
router.get('/jobs', async (req, res) => {
  try {
    const { experience_level, employment_type, location, search } = req.query;
    
    let query = `
      SELECT jp.*, u.first_name || ' ' || u.last_name as posted_by_name
      FROM job_postings jp
      JOIN users u ON jp.posted_by = u.id
      WHERE jp.is_active = true
      AND (jp.application_deadline IS NULL OR jp.application_deadline >= CURRENT_DATE)
    `;
    
    const params = [];
    
    if (experience_level) {
      params.push(experience_level);
      query += ` AND jp.experience_level = $${params.length}`;
    }
    
    if (employment_type) {
      params.push(employment_type);
      query += ` AND jp.employment_type = $${params.length}`;
    }
    
    if (location) {
      params.push(`%${location}%`);
      query += ` AND jp.location ILIKE $${params.length}`;
    }
    
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (jp.job_title ILIKE $${params.length} OR jp.company_name ILIKE $${params.length} OR jp.job_description ILIKE $${params.length})`;
    }
    
    query += ` ORDER BY jp.is_featured DESC, jp.created_at DESC`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching job postings:', error);
    res.status(500).json({ error: 'Failed to fetch job postings' });
  }
});

// Create job posting (Alumni only)
router.post('/jobs', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      company_name, job_title, job_description, requirements,
      skills_required, experience_level, employment_type,
      salary_range, location, application_deadline, external_url, contact_email
    } = req.body;

    // Check if user is alumni or admin
    const userCheck = await db.query(`
      SELECT u.role, ap.id as alumni_profile_id
      FROM users u
      LEFT JOIN alumni_profiles ap ON u.id = ap.user_id
      WHERE u.id = $1 AND (u.role IN ('admin', 'super_admin') OR ap.id IS NOT NULL)
    `, [userId]);

    if (userCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Only alumni and admins can post jobs' });
    }

    const result = await db.query(`
      INSERT INTO job_postings (
        posted_by, company_name, job_title, job_description, requirements,
        skills_required, experience_level, employment_type, salary_range,
        location, application_deadline, external_url, contact_email
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      userId, company_name, job_title, job_description, requirements,
      skills_required, experience_level, employment_type, salary_range,
      location, application_deadline, external_url, contact_email
    ]);

    res.json({
      job: result.rows[0],
      message: 'Job posting created successfully!'
    });

  } catch (error) {
    console.error('Error creating job posting:', error);
    res.status(500).json({ error: 'Failed to create job posting' });
  }
});

// Get mentorship opportunities
router.get('/mentorship', authenticateToken, async (req, res) => {
  try {
    const { program_type } = req.query;
    
    let query = `
      SELECT ap.*, u.first_name, u.last_name, u.email
      FROM alumni_profiles ap
      JOIN users u ON ap.user_id = u.id
      WHERE ap.is_mentor_available = true AND u.is_active = true
    `;
    
    const params = [];
    
    if (program_type) {
      // This would need additional logic to filter by program type
      // For now, we'll return all available mentors
    }
    
    query += ` ORDER BY ap.years_experience DESC`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({ error: 'Failed to fetch mentorship opportunities' });
  }
});

// ==================== NOTIFICATIONS SYSTEM ====================

// Get user notifications
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { unread_only = 'false', limit = 50 } = req.query;
    
    let query = `
      SELECT * FROM notifications 
      WHERE user_id = $1 
      AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
    `;
    
    const params = [userId];
    
    if (unread_only === 'true') {
      query += ` AND is_read = false`;
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await db.query(`
      UPDATE notifications 
      SET is_read = true 
      WHERE id = $1 AND user_id = $2
    `, [id, userId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Mark all notifications as read
router.put('/notifications/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await db.query(`
      UPDATE notifications 
      SET is_read = true 
      WHERE user_id = $1 AND is_read = false
    `, [userId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

module.exports = router;
