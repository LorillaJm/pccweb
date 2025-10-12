const express = require('express');
const router = express.Router();
const db = require('../config/database-adapter');
const { authenticateToken, requireStudent, requireFaculty, requireStudentOrFaculty } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/materials');
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
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|ppt|pptx|xls|xlsx|txt|jpg|jpeg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only documents and images are allowed'));
    }
  }
});

// ==================== GRADES SYSTEM ====================

// Get student grades
router.get('/grades', authenticateToken, requireStudent, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { academic_year, semester } = req.query;

    let query = `
      SELECT 
        g.*,
        s.subject_code,
        s.subject_name,
        s.units,
        cs.section_name,
        u.first_name || ' ' || u.last_name as faculty_name
      FROM grades g
      JOIN subjects s ON g.subject_id = s.id
      JOIN class_sections cs ON g.class_section_id = cs.id
      LEFT JOIN users u ON g.faculty_id = u.id
      WHERE g.student_id = $1
    `;
    
    const params = [studentId];
    
    if (academic_year) {
      query += ` AND g.academic_year = $${params.length + 1}`;
      params.push(academic_year);
    }
    
    if (semester) {
      query += ` AND g.semester = $${params.length + 1}`;
      params.push(semester);
    }
    
    query += ` ORDER BY g.academic_year DESC, g.semester DESC, s.subject_code`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching grades:', error);
    res.status(500).json({ error: 'Failed to fetch grades' });
  }
});

// Get grade summary/GPA
router.get('/grades/summary', authenticateToken, requireStudent, async (req, res) => {
  try {
    const studentId = req.user.id;
    
    const result = await db.query(`
      SELECT * FROM student_grades_summary 
      WHERE student_id = $1 
      ORDER BY academic_year DESC, semester DESC
    `, [studentId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching grade summary:', error);
    res.status(500).json({ error: 'Failed to fetch grade summary' });
  }
});

// Faculty: Submit/Update grades
router.post('/grades', authenticateToken, requireFaculty, async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { 
      student_id, 
      class_section_id, 
      subject_id, 
      academic_year, 
      semester,
      prelim_grade,
      midterm_grade,
      finals_grade,
      final_grade,
      letter_grade,
      grade_points,
      status,
      remarks
    } = req.body;

    const result = await db.query(`
      INSERT INTO grades (
        student_id, class_section_id, subject_id, faculty_id,
        academic_year, semester, prelim_grade, midterm_grade,
        finals_grade, final_grade, letter_grade, grade_points,
        status, remarks, date_submitted, submitted_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP, $15)
      ON CONFLICT (student_id, class_section_id, academic_year, semester)
      DO UPDATE SET
        prelim_grade = EXCLUDED.prelim_grade,
        midterm_grade = EXCLUDED.midterm_grade,
        finals_grade = EXCLUDED.finals_grade,
        final_grade = EXCLUDED.final_grade,
        letter_grade = EXCLUDED.letter_grade,
        grade_points = EXCLUDED.grade_points,
        status = EXCLUDED.status,
        remarks = EXCLUDED.remarks,
        date_submitted = CURRENT_TIMESTAMP,
        submitted_by = EXCLUDED.submitted_by,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [
      student_id, class_section_id, subject_id, facultyId,
      academic_year, semester, prelim_grade, midterm_grade,
      finals_grade, final_grade, letter_grade, grade_points,
      status, remarks, facultyId
    ]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error submitting grades:', error);
    res.status(500).json({ error: 'Failed to submit grades' });
  }
});

// ==================== ENROLLMENT SYSTEM ====================

// Get available subjects for enrollment
router.get('/enrollment/available-subjects', authenticateToken, requireStudent, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { academic_year = '2024-2025', semester = 1 } = req.query;

    const result = await db.query(`
      SELECT 
        cs.*,
        s.subject_code,
        s.subject_name,
        s.units,
        s.description,
        u.first_name || ' ' || u.last_name as faculty_name,
        (cs.max_students - cs.enrolled_students) as available_slots,
        CASE 
          WHEN sce.id IS NOT NULL THEN true 
          ELSE false 
        END as is_enrolled
      FROM class_sections cs
      JOIN subjects s ON cs.subject_id = s.id
      LEFT JOIN users u ON cs.faculty_id = u.id
      LEFT JOIN student_class_enrollments sce ON cs.id = sce.class_section_id 
        AND sce.student_id = $1 
        AND sce.academic_year = $2 
        AND sce.semester = $3
      WHERE cs.is_active = true 
        AND cs.academic_year = $2 
        AND cs.semester = $3
        AND (cs.max_students - cs.enrolled_students) > 0
      ORDER BY s.subject_code
    `, [studentId, academic_year, semester]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching available subjects:', error);
    res.status(500).json({ error: 'Failed to fetch available subjects' });
  }
});

// Get student's current enrollments
router.get('/enrollment/my-enrollments', authenticateToken, requireStudent, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { academic_year, semester } = req.query;

    let query = `
      SELECT * FROM student_schedules 
      WHERE student_id = $1
    `;
    
    const params = [studentId];
    
    if (academic_year) {
      query += ` AND academic_year = $${params.length + 1}`;
      params.push(academic_year);
    }
    
    if (semester) {
      query += ` AND semester = $${params.length + 1}`;
      params.push(semester);
    }
    
    query += ` ORDER BY academic_year DESC, semester DESC, subject_code`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
});

// Enroll in a subject
router.post('/enrollment/enroll', authenticateToken, requireStudent, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { class_section_id, academic_year = '2024-2025', semester = 1 } = req.body;

    // Get subject info
    const subjectResult = await db.query(`
      SELECT cs.subject_id, s.units, cs.max_students, cs.enrolled_students
      FROM class_sections cs
      JOIN subjects s ON cs.subject_id = s.id
      WHERE cs.id = $1
    `, [class_section_id]);

    if (subjectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Class section not found' });
    }

    const { subject_id, units, max_students, enrolled_students } = subjectResult.rows[0];

    // Check if slots available
    if (enrolled_students >= max_students) {
      return res.status(400).json({ error: 'No available slots in this section' });
    }

    // Check if already enrolled
    const existingEnrollment = await db.query(`
      SELECT id FROM student_class_enrollments 
      WHERE student_id = $1 AND class_section_id = $2 AND academic_year = $3 AND semester = $4
    `, [studentId, class_section_id, academic_year, semester]);

    if (existingEnrollment.rows.length > 0) {
      return res.status(400).json({ error: 'Already enrolled in this section' });
    }

    // Enroll student
    const result = await db.query(`
      INSERT INTO student_class_enrollments (
        student_id, class_section_id, subject_id, academic_year, semester, units, status
      ) VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING *
    `, [studentId, class_section_id, subject_id, academic_year, semester, units]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error enrolling in subject:', error);
    res.status(500).json({ error: 'Failed to enroll in subject' });
  }
});

// Drop enrollment
router.delete('/enrollment/:enrollment_id', authenticateToken, requireStudent, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { enrollment_id } = req.params;
    const { drop_reason } = req.body;

    const result = await db.query(`
      UPDATE student_class_enrollments 
      SET status = 'dropped', dropped_date = CURRENT_TIMESTAMP, drop_reason = $1
      WHERE id = $2 AND student_id = $3 AND status IN ('pending', 'approved', 'enrolled')
      RETURNING *
    `, [drop_reason, enrollment_id, studentId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Enrollment not found or cannot be dropped' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error dropping enrollment:', error);
    res.status(500).json({ error: 'Failed to drop enrollment' });
  }
});

// ==================== PAYMENT TRACKING ====================

// Get student payments
router.get('/payments', authenticateToken, requireStudent, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { academic_year, semester } = req.query;

    let query = `
      SELECT * FROM payments 
      WHERE student_id = $1
    `;
    
    const params = [studentId];
    
    if (academic_year) {
      query += ` AND academic_year = $${params.length + 1}`;
      params.push(academic_year);
    }
    
    if (semester) {
      query += ` AND semester = $${params.length + 1}`;
      params.push(semester);
    }
    
    query += ` ORDER BY academic_year DESC, semester DESC, payment_type`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Get payment summary
router.get('/payments/summary', authenticateToken, requireStudent, async (req, res) => {
  try {
    const studentId = req.user.id;
    
    const result = await db.query(`
      SELECT * FROM payment_summary 
      WHERE student_id = $1 
      ORDER BY academic_year DESC, semester DESC
    `, [studentId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching payment summary:', error);
    res.status(500).json({ error: 'Failed to fetch payment summary' });
  }
});

// Get payment transactions/history
router.get('/payments/:payment_id/transactions', authenticateToken, requireStudent, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { payment_id } = req.params;

    const result = await db.query(`
      SELECT 
        pt.*,
        u.first_name || ' ' || u.last_name as verified_by_name
      FROM payment_transactions pt
      LEFT JOIN users u ON pt.verified_by = u.id
      WHERE pt.payment_id = $1 AND pt.student_id = $2
      ORDER BY pt.transaction_date DESC
    `, [payment_id, studentId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching payment transactions:', error);
    res.status(500).json({ error: 'Failed to fetch payment transactions' });
  }
});

// ==================== LEARNING MATERIALS ====================

// Get learning materials for student's enrolled subjects
router.get('/materials', authenticateToken, requireStudent, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { academic_year = '2024-2025', semester = 1, subject_id, material_type } = req.query;

    let query = `
      SELECT DISTINCT
        lm.*,
        s.subject_code,
        s.subject_name,
        cs.section_name,
        u.first_name || ' ' || u.last_name as uploaded_by_name
      FROM learning_materials lm
      JOIN class_sections cs ON lm.class_section_id = cs.id
      JOIN subjects s ON lm.subject_id = s.id
      JOIN student_class_enrollments sce ON cs.id = sce.class_section_id
      LEFT JOIN users u ON lm.uploaded_by = u.id
      WHERE sce.student_id = $1 
        AND sce.status IN ('approved', 'enrolled')
        AND lm.is_active = true
        AND (lm.is_public = true OR lm.uploaded_by = $1)
    `;
    
    const params = [studentId];
    
    if (academic_year) {
      query += ` AND lm.academic_year = $${params.length + 1}`;
      params.push(academic_year);
    }
    
    if (semester) {
      query += ` AND lm.semester = $${params.length + 1}`;
      params.push(semester);
    }
    
    if (subject_id) {
      query += ` AND lm.subject_id = $${params.length + 1}`;
      params.push(subject_id);
    }
    
    if (material_type) {
      query += ` AND lm.material_type = $${params.length + 1}`;
      params.push(material_type);
    }
    
    query += ` ORDER BY lm.upload_date DESC`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
});

// Download learning material
router.get('/materials/:material_id/download', authenticateToken, requireStudentOrFaculty, async (req, res) => {
  try {
    const userId = req.user.id;
    const { material_id } = req.params;

    // Get material info and check access
    const materialResult = await db.query(`
      SELECT lm.*, cs.faculty_id
      FROM learning_materials lm
      JOIN class_sections cs ON lm.class_section_id = cs.id
      WHERE lm.id = $1 AND lm.is_active = true
    `, [material_id]);

    if (materialResult.rows.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }

    const material = materialResult.rows[0];

    // Check if user has access (enrolled student or faculty)
    if (req.user.role === 'student') {
      const accessCheck = await db.query(`
        SELECT 1 FROM student_class_enrollments sce
        WHERE sce.student_id = $1 
          AND sce.class_section_id = $2
          AND sce.status IN ('approved', 'enrolled')
      `, [userId, material.class_section_id]);

      if (accessCheck.rows.length === 0 && !material.is_public) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (req.user.role === 'faculty') {
      if (material.faculty_id !== userId && material.uploaded_by !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Log download
    if (req.user.role === 'student') {
      await db.query(`
        INSERT INTO material_downloads (material_id, student_id, ip_address, user_agent)
        VALUES ($1, $2, $3, $4)
      `, [material_id, userId, req.ip, req.get('User-Agent')]);

      // Update download count
      await db.query(`
        UPDATE learning_materials 
        SET download_count = download_count + 1 
        WHERE id = $1
      `, [material_id]);
    }

    // Send file
    const filePath = path.resolve(material.file_path);
    res.download(filePath, material.file_name);
  } catch (error) {
    console.error('Error downloading material:', error);
    res.status(500).json({ error: 'Failed to download material' });
  }
});

// Faculty: Upload learning material
router.post('/materials', authenticateToken, requireFaculty, upload.single('file'), async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { 
      class_section_id, 
      title, 
      description, 
      material_type = 'handout',
      is_public = false,
      academic_year = '2024-2025',
      semester = 1
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Verify faculty teaches this class
    const classCheck = await db.query(`
      SELECT cs.subject_id FROM class_sections cs
      WHERE cs.id = $1 AND cs.faculty_id = $2
    `, [class_section_id, facultyId]);

    if (classCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You do not teach this class' });
    }

    const subject_id = classCheck.rows[0].subject_id;

    const result = await db.query(`
      INSERT INTO learning_materials (
        class_section_id, subject_id, uploaded_by, title, description,
        file_name, file_path, file_size, file_type, mime_type,
        material_type, is_public, academic_year, semester
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      class_section_id, subject_id, facultyId, title, description,
      req.file.originalname, req.file.path, req.file.size, 
      path.extname(req.file.originalname).toLowerCase().slice(1),
      req.file.mimetype, material_type, is_public === 'true', 
      academic_year, semester
    ]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error uploading material:', error);
    res.status(500).json({ error: 'Failed to upload material' });
  }
});

module.exports = router;
