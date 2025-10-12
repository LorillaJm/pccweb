const express = require('express');
const router = express.Router();
const MentorshipService = require('../services/MentorshipService');
const { requireAuth } = require('../middleware/sessionAuth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/mentorship/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

const mentorshipService = new MentorshipService();

// Mentorship Request Routes
router.post('/request', requireAuth, async (req, res) => {
  try {
    const result = await mentorshipService.requestMentorship(
      req.user.id,
      req.body.mentorId,
      req.body
    );
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/requests', requireAuth, async (req, res) => {
  try {
    const result = await mentorshipService.getPendingRequests(req.user.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:mentorshipId/respond', requireAuth, async (req, res) => {
  try {
    const result = await mentorshipService.respondToMentorshipRequest(
      req.params.mentorshipId,
      req.user.id,
      req.body.response,
      req.body.responseMessage
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Mentorship Management Routes
router.get('/', requireAuth, async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      program: req.query.program
    };

    const result = await mentorshipService.getUserMentorships(req.user.id, filters);
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/:mentorshipId', requireAuth, async (req, res) => {
  try {
    const result = await mentorshipService.getMentorship(req.params.mentorshipId, req.user.id);
    res.json(result);
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

// Session Management Routes
router.post('/:mentorshipId/sessions', requireAuth, async (req, res) => {
  try {
    const result = await mentorshipService.scheduleSession(
      req.params.mentorshipId,
      req.user.id,
      req.body
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:mentorshipId/sessions/:sessionId/complete', requireAuth, async (req, res) => {
  try {
    const result = await mentorshipService.completeSession(
      req.params.mentorshipId,
      req.params.sessionId,
      req.user.id,
      req.body
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Progress Tracking Routes
router.post('/:mentorshipId/progress', requireAuth, upload.array('attachments', 5), async (req, res) => {
  try {
    const progressData = {
      milestone: req.body.milestone,
      description: req.body.description,
      attachments: []
    };

    // Handle file attachments
    if (req.files && req.files.length > 0) {
      progressData.attachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        uploadedAt: new Date()
      }));
    }

    const result = await mentorshipService.addProgress(
      req.params.mentorshipId,
      req.user.id,
      progressData
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:mentorshipId/goals/:goalId', requireAuth, async (req, res) => {
  try {
    const result = await mentorshipService.updateGoalStatus(
      req.params.mentorshipId,
      req.params.goalId,
      req.user.id,
      req.body.status,
      req.body.notes
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Feedback and Completion Routes
router.post('/:mentorshipId/feedback', requireAuth, async (req, res) => {
  try {
    const result = await mentorshipService.submitFeedback(
      req.params.mentorshipId,
      req.user.id,
      req.body
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:mentorshipId/complete', requireAuth, async (req, res) => {
  try {
    const result = await mentorshipService.completeMentorship(
      req.params.mentorshipId,
      req.user.id
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Matching and Analytics Routes
router.get('/matches', requireAuth, async (req, res) => {
  try {
    const preferences = {
      expertise: req.query.expertise,
      menteeLevel: req.query.menteeLevel
    };

    const result = await mentorshipService.findMentorshipMatches(req.user.id, preferences);
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/stats', requireAuth, async (req, res) => {
  try {
    const result = await mentorshipService.getMentorshipStats(
      req.query.userId || req.user.id,
      req.query.role
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
