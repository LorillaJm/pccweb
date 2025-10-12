const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const db = require('../config/database-adapter');
const { verifyToken, requireFaculty, requireStudent, requireAnyRole } = require('../middleware/auth');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  },
  fileFilter: function (req, file, cb) {
    // Allow common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|ppt|pptx|xls|xlsx|txt|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, documents, and archives are allowed.'));
    }
  }
});

// Get materials for a section
router.get('/section/:sectionId', verifyToken, requireAnyRole, async (req, res, next) => {
  try {
    const { sectionId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if user has access to this section
    let hasAccess = false;

    if (userRole === 'faculty') {
      // Faculty can access sections they teach
      const facultyCheck = await db.query(
        'SELECT id FROM class_sections WHERE id = $1 AND faculty_id = $2',
        [sectionId, userId]
      );
      hasAccess = facultyCheck.rows.length > 0;
    } else if (userRole === 'student') {
      // Students can access sections they're enrolled in
      const studentCheck = await db.query(
        'SELECT se.id FROM student_enrollments se WHERE se.section_id = $1 AND se.student_id = $2 AND se.status = $3',
        [sectionId, userId, 'enrolled']
      );
      hasAccess = studentCheck.rows.length > 0;
    }

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this section'
      });
    }

    // Get materials
    let query = `
      SELECT 
        cm.*,
        u.first_name || ' ' || u.last_name as author_name
      FROM class_materials cm
      LEFT JOIN users u ON cm.faculty_id = u.id
      WHERE cm.section_id = $1
    `;

    // Students can only see published materials
    if (userRole === 'student') {
      query += ' AND cm.is_published = true';
    }

    query += ' ORDER BY cm.created_at DESC';

    const materialsResult = await db.query(query, [sectionId]);

    res.json({
      success: true,
      data: {
        materials: materialsResult.rows
      }
    });

  } catch (error) {
    next(error);
  }
});

// Upload/Create new material (faculty only)
router.post('/section/:sectionId', verifyToken, requireFaculty, upload.single('file'), [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('description').optional().trim(),
  body('materialType').isIn(['document', 'video', 'link', 'assignment']).withMessage('Invalid material type'),
  body('externalUrl').optional().isURL().withMessage('Invalid URL'),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
  body('isPublished').optional().isBoolean()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Clean up uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { sectionId } = req.params;
    const facultyId = req.user.id;

    // Verify faculty owns this section
    const sectionCheck = await db.query(
      'SELECT id FROM class_sections WHERE id = $1 AND faculty_id = $2',
      [sectionId, facultyId]
    );

    if (sectionCheck.rows.length === 0) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({
        success: false,
        message: 'Access denied to this section'
      });
    }

    const {
      title,
      description,
      materialType,
      externalUrl,
      dueDate,
      isPublished = false
    } = req.body;

    let filePath = null;
    let fileName = null;
    let fileSize = null;

    if (req.file) {
      filePath = req.file.path;
      fileName = req.file.originalname;
      fileSize = req.file.size;
    }

    const result = await db.query(`
      INSERT INTO class_materials (
        section_id, faculty_id, title, description, material_type,
        file_path, file_name, file_size, external_url, due_date, is_published
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      sectionId, facultyId, title, description, materialType,
      filePath, fileName, fileSize, externalUrl, dueDate, isPublished
    ]);

    res.status(201).json({
      success: true,
      message: 'Material uploaded successfully',
      data: {
        material: result.rows[0]
      }
    });

  } catch (error) {
    // Clean up uploaded file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
});

// Update material (faculty only)
router.put('/:materialId', verifyToken, requireFaculty, [
  body('title').optional().trim().isLength({ min: 1 }),
  body('description').optional().trim(),
  body('externalUrl').optional().isURL(),
  body('dueDate').optional().isISO8601(),
  body('isPublished').optional().isBoolean()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { materialId } = req.params;
    const facultyId = req.user.id;

    // Check if material exists and faculty owns it
    const materialCheck = await db.query(
      'SELECT * FROM class_materials WHERE id = $1 AND faculty_id = $2',
      [materialId, facultyId]
    );

    if (materialCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Material not found or access denied'
      });
    }

    const {
      title,
      description,
      externalUrl,
      dueDate,
      isPublished
    } = req.body;

    const updateResult = await db.query(`
      UPDATE class_materials 
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          external_url = COALESCE($3, external_url),
          due_date = COALESCE($4, due_date),
          is_published = COALESCE($5, is_published),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `, [title, description, externalUrl, dueDate, isPublished, materialId]);

    res.json({
      success: true,
      message: 'Material updated successfully',
      data: {
        material: updateResult.rows[0]
      }
    });

  } catch (error) {
    next(error);
  }
});

// Delete material (faculty only)
router.delete('/:materialId', verifyToken, requireFaculty, async (req, res, next) => {
  try {
    const { materialId } = req.params;
    const facultyId = req.user.id;

    // Check if material exists and faculty owns it
    const materialCheck = await db.query(
      'SELECT * FROM class_materials WHERE id = $1 AND faculty_id = $2',
      [materialId, facultyId]
    );

    if (materialCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Material not found or access denied'
      });
    }

    const material = materialCheck.rows[0];

    // Delete the file if it exists
    if (material.file_path && fs.existsSync(material.file_path)) {
      fs.unlinkSync(material.file_path);
    }

    // Delete from database
    await db.query('DELETE FROM class_materials WHERE id = $1', [materialId]);

    res.json({
      success: true,
      message: 'Material deleted successfully'
    });

  } catch (error) {
    next(error);
  }
});

// Download file
router.get('/download/:materialId', verifyToken, requireAnyRole, async (req, res, next) => {
  try {
    const { materialId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get material info
    const materialResult = await db.query(
      'SELECT * FROM class_materials WHERE id = $1',
      [materialId]
    );

    if (materialResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    const material = materialResult.rows[0];

    // Check access permissions
    let hasAccess = false;

    if (userRole === 'faculty') {
      // Faculty can download materials from their sections
      const facultyCheck = await db.query(
        'SELECT cs.id FROM class_sections cs WHERE cs.id = $1 AND cs.faculty_id = $2',
        [material.section_id, userId]
      );
      hasAccess = facultyCheck.rows.length > 0;
    } else if (userRole === 'student') {
      // Students can download published materials from enrolled sections
      const studentCheck = await db.query(`
        SELECT se.id FROM student_enrollments se 
        WHERE se.section_id = $1 AND se.student_id = $2 AND se.status = 'enrolled'
      `, [material.section_id, userId]);
      hasAccess = studentCheck.rows.length > 0 && material.is_published;
    }

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to download this material'
      });
    }

    // Check if file exists
    if (!material.file_path || !fs.existsSync(material.file_path)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Set appropriate headers and send file
    res.setHeader('Content-Disposition', `attachment; filename="${material.file_name}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    const fileStream = fs.createReadStream(material.file_path);
    fileStream.pipe(res);

  } catch (error) {
    next(error);
  }
});

module.exports = router;