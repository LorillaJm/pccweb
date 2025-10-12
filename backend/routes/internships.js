const express = require('express');
const router = express.Router();
const InternshipService = require('../services/InternshipService');
const CompanyService = require('../services/CompanyService');
const InternshipWorkflowService = require('../services/InternshipWorkflowService');
const { requireAuth, requireRole } = require('../middleware/sessionAuth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/internships/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and documents are allowed.'));
    }
  }
});

// GET /api/internships - Get all internships with filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search = '',
      companyId,
      workArrangement,
      targetPrograms,
      yearLevel,
      minStipend,
      maxDuration,
      location
    } = req.query;

    const filters = {};
    if (companyId) filters.companyId = companyId;
    if (workArrangement) filters.workArrangement = workArrangement;
    if (targetPrograms) filters.targetPrograms = Array.isArray(targetPrograms) ? targetPrograms : [targetPrograms];
    if (yearLevel) filters.yearLevel = parseInt(yearLevel);
    if (minStipend) filters.minStipend = parseFloat(minStipend);
    if (maxDuration) filters.maxDuration = parseInt(maxDuration);
    if (location) filters.location = location;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder,
      search
    };

    const result = await InternshipService.getInternships(filters, options);
    res.json(result);
  } catch (error) {
    console.error('Error getting internships:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/internships/:id - Get internship by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // Optional for view tracking

    const internship = await InternshipService.getInternshipById(id, userId);
    res.json(internship);
  } catch (error) {
    console.error('Error getting internship:', error);
    res.status(404).json({ error: error.message });
  }
});

// POST /api/internships - Create new internship (Company/Admin only)
router.post('/', requireAuth, requireRole(['admin', 'company']), async (req, res) => {
  try {
    const internshipData = req.body;
    const createdBy = req.user.id;

    const internship = await InternshipService.createInternship(internshipData, createdBy);
    res.status(201).json(internship);
  } catch (error) {
    console.error('Error creating internship:', error);
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/internships/:id - Update internship
router.put('/:id', requireAuth, requireRole(['admin', 'company']), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedBy = req.user.id;

    const internship = await InternshipService.updateInternship(id, updateData, updatedBy);
    res.json(internship);
  } catch (error) {
    console.error('Error updating internship:', error);
    res.status(400).json({ error: error.message });
  }
});

// POST /api/internships/:id/publish - Publish internship
router.post('/:id/publish', requireAuth, requireRole(['admin', 'company']), async (req, res) => {
  try {
    const { id } = req.params;
    const publishedBy = req.user.id;

    const internship = await InternshipService.publishInternship(id, publishedBy);
    res.json(internship);
  } catch (error) {
    console.error('Error publishing internship:', error);
    res.status(400).json({ error: error.message });
  }
});

// POST /api/internships/:id/close - Close internship
router.post('/:id/close', requireAuth, requireRole(['admin', 'company']), async (req, res) => {
  try {
    const { id } = req.params;
    const closedBy = req.user.id;

    const internship = await InternshipService.closeInternship(id, closedBy);
    res.json(internship);
  } catch (error) {
    console.error('Error closing internship:', error);
    res.status(400).json({ error: error.message });
  }
});

// POST /api/internships/:id/apply - Submit application (Student only)
router.post('/:id/apply', 
  requireAuth, 
  requireRole(['student']), 
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'portfolio', maxCount: 1 },
    { name: 'additionalDocuments', maxCount: 5 }
  ]), 
  async (req, res) => {
    try {
      const { id } = req.params;
      const studentId = req.user.id;
      
      const applicationData = {
        ...req.body,
        resume: req.files.resume ? req.files.resume[0].path : undefined,
        portfolio: req.files.portfolio ? req.files.portfolio[0].path : undefined,
        additionalDocuments: req.files.additionalDocuments ? 
          req.files.additionalDocuments.map(file => ({
            name: file.originalname,
            filename: file.filename,
            originalName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype
          })) : []
      };

      // Parse studentInfo if it's a string
      if (typeof applicationData.studentInfo === 'string') {
        applicationData.studentInfo = JSON.parse(applicationData.studentInfo);
      }

      const application = await InternshipService.submitApplication(id, studentId, applicationData);
      res.status(201).json(application);
    } catch (error) {
      console.error('Error submitting application:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

// GET /api/internships/:id/applications - Get applications for internship (Company/Admin only)
router.get('/:id/applications', requireAuth, requireRole(['admin', 'company']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    const filters = {};
    if (status) filters.status = status;

    const applications = await InternshipService.getInternshipApplications(id, filters);
    res.json(applications);
  } catch (error) {
    console.error('Error getting applications:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/internships/applications/my - Get student's applications
router.get('/applications/my', requireAuth, requireRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.id;
    const applications = await InternshipService.getStudentApplications(studentId);
    res.json(applications);
  } catch (error) {
    console.error('Error getting student applications:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/internships/applications/:applicationId/status - Update application status
router.put('/applications/:applicationId/status', 
  requireAuth, 
  requireRole(['admin', 'company']), 
  async (req, res) => {
    try {
      const { applicationId } = req.params;
      const { status, notes } = req.body;
      const reviewerId = req.user.id;

      const application = await InternshipService.updateApplicationStatus(
        applicationId, 
        status, 
        reviewerId, 
        { notes }
      );
      res.json(application);
    } catch (error) {
      console.error('Error updating application status:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

// POST /api/internships/applications/:applicationId/interview - Schedule interview
router.post('/applications/:applicationId/interview', 
  requireAuth, 
  requireRole(['admin', 'company']), 
  async (req, res) => {
    try {
      const { applicationId } = req.params;
      const interviewDetails = req.body;

      const application = await InternshipService.scheduleInterview(applicationId, interviewDetails);
      res.json(application);
    } catch (error) {
      console.error('Error scheduling interview:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

// POST /api/internships/applications/:applicationId/progress - Track progress
router.post('/applications/:applicationId/progress', 
  requireAuth, 
  requireRole(['admin', 'company', 'faculty']), 
  async (req, res) => {
    try {
      const { applicationId } = req.params;
      const progressData = req.body;
      const updatedBy = req.user.id;

      const application = await InternshipService.trackProgress(applicationId, progressData, updatedBy);
      res.json(application);
    } catch (error) {
      console.error('Error tracking progress:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

// POST /api/internships/applications/:applicationId/evaluation - Submit evaluation
router.post('/applications/:applicationId/evaluation', 
  requireAuth, 
  async (req, res) => {
    try {
      const { applicationId } = req.params;
      const evaluationData = req.body;
      const evaluatorId = req.user.id;

      const application = await InternshipService.submitEvaluation(applicationId, evaluationData, evaluatorId);
      res.json(application);
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

// POST /api/internships/applications/:applicationId/complete - Complete internship
router.post('/applications/:applicationId/complete', 
  requireAuth, 
  requireRole(['admin', 'company', 'faculty']), 
  async (req, res) => {
    try {
      const { applicationId } = req.params;
      const completionData = req.body;

      const application = await InternshipService.completeInternship(applicationId, completionData);
      res.json(application);
    } catch (error) {
      console.error('Error completing internship:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

// GET /api/internships/analytics - Get internship analytics (Admin only)
router.get('/analytics/overview', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { companyId, startDate, endDate } = req.query;
    
    const filters = {};
    if (companyId) filters.companyId = companyId;
    if (startDate && endDate) {
      filters.startDate = startDate;
      filters.endDate = endDate;
    }

    const analytics = await InternshipService.getAnalytics(filters);
    res.json(analytics);
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/internships/expiring - Get expiring internships (Admin only)
router.get('/expiring/list', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const expiring = await InternshipService.getExpiringInternships(parseInt(days));
    res.json(expiring);
  } catch (error) {
    console.error('Error getting expiring internships:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/internships/auto-close - Auto-close expired internships (Admin only)
router.post('/auto-close/expired', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const closedCount = await InternshipService.autoCloseExpiredInternships();
    res.json({ message: `${closedCount} internships were automatically closed` });
  } catch (error) {
    console.error('Error auto-closing internships:', error);
    res.status(500).json({ error: error.message });
  }
});

// Workflow Management Routes

// POST /api/internships/applications/:applicationId/workflow/process - Process application submission
router.post('/applications/:applicationId/workflow/process', 
  requireAuth, 
  requireRole(['admin', 'company']), 
  async (req, res) => {
    try {
      const { applicationId } = req.params;
      const workflow = await InternshipWorkflowService.processApplicationSubmission(applicationId);
      res.json(workflow);
    } catch (error) {
      console.error('Error processing application workflow:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

// POST /api/internships/applications/:applicationId/workflow/review - Manage application review
router.post('/applications/:applicationId/workflow/review', 
  requireAuth, 
  requireRole(['admin', 'company']), 
  async (req, res) => {
    try {
      const { applicationId } = req.params;
      const { action, data } = req.body;
      
      const result = await InternshipWorkflowService.manageApplicationReview(
        applicationId, 
        action, 
        { ...data, reviewerId: req.user.id }
      );
      res.json(result);
    } catch (error) {
      console.error('Error managing application review:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

// POST /api/internships/applications/:applicationId/workflow/progress - Track internship progress
router.post('/applications/:applicationId/workflow/progress', 
  requireAuth, 
  requireRole(['admin', 'company', 'faculty', 'student']), 
  async (req, res) => {
    try {
      const { applicationId } = req.params;
      const progressData = req.body;
      const updatedBy = req.user.id;

      const result = await InternshipWorkflowService.trackInternshipProgress(
        applicationId, 
        progressData, 
        updatedBy
      );
      res.json(result);
    } catch (error) {
      console.error('Error tracking internship progress:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

// GET /api/internships/applications/:applicationId/workflow/status - Get workflow status
router.get('/applications/:applicationId/workflow/status', 
  requireAuth, 
  async (req, res) => {
    try {
      const { applicationId } = req.params;
      const workflow = await InternshipWorkflowService.getApplicationWorkflowStatus(applicationId);
      res.json(workflow);
    } catch (error) {
      console.error('Error getting workflow status:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// POST /api/internships/workflow/reminders/send - Manually trigger reminders (Admin only)
router.post('/workflow/reminders/send', 
  requireAuth, 
  requireRole(['admin']), 
  async (req, res) => {
    try {
      const { type } = req.body;
      
      if (type === 'daily') {
        await InternshipWorkflowService.sendDailyReminders();
      } else if (type === 'weekly') {
        await InternshipWorkflowService.sendWeeklyProgressReminders();
      } else {
        throw new Error('Invalid reminder type');
      }
      
      res.json({ message: `${type} reminders sent successfully` });
    } catch (error) {
      console.error('Error sending reminders:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /api/internships/workflow/milestones/:duration - Get milestones for duration
router.get('/workflow/milestones/:duration', 
  requireAuth, 
  async (req, res) => {
    try {
      const { duration } = req.params;
      const milestones = InternshipWorkflowService.getInternshipMilestones(parseInt(duration));
      res.json(milestones);
    } catch (error) {
      console.error('Error getting milestones:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Enhanced Application Tracking Routes
const ApplicationTrackingService = require('../services/ApplicationTrackingService');

// POST /api/internships/:id/apply-enhanced - Enhanced application submission with workflow
router.post('/:id/apply-enhanced', 
  requireAuth, 
  requireRole(['student']), 
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'portfolio', maxCount: 1 },
    { name: 'additionalDocuments', maxCount: 5 }
  ]), 
  async (req, res) => {
    try {
      const { id } = req.params;
      const studentId = req.user.id;
      
      const applicationData = {
        ...req.body,
        resume: req.files.resume ? req.files.resume[0].path : undefined,
        portfolio: req.files.portfolio ? req.files.portfolio[0].path : undefined,
        additionalDocuments: req.files.additionalDocuments ? 
          req.files.additionalDocuments.map(file => ({
            name: file.originalname,
            filename: file.filename,
            originalName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype
          })) : []
      };

      // Parse studentInfo if it's a string
      if (typeof applicationData.studentInfo === 'string') {
        applicationData.studentInfo = JSON.parse(applicationData.studentInfo);
      }

      const result = await ApplicationTrackingService.submitApplicationWithWorkflow(
        id, 
        studentId, 
        applicationData
      );
      
      res.status(201).json(result);
    } catch (error) {
      console.error('Error submitting enhanced application:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

// GET /api/internships/company/:companyId/review-dashboard - Enhanced company review dashboard
router.get('/company/:companyId/review-dashboard', 
  requireAuth, 
  requireRole(['admin', 'company']), 
  async (req, res) => {
    try {
      const { companyId } = req.params;
      const { 
        status, 
        page = 1, 
        limit = 20, 
        sortBy = 'submittedAt', 
        sortOrder = 'desc',
        priority,
        dateFrom, 
        dateTo,
        internshipId
      } = req.query;

      const filters = {
        status,
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder,
        priority,
        dateFrom,
        dateTo,
        internshipId
      };

      const dashboard = await ApplicationTrackingService.getCompanyReviewDashboard(
        companyId, 
        filters
      );
      
      res.json(dashboard);
    } catch (error) {
      console.error('Error getting enhanced review dashboard:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// POST /api/internships/applications/:applicationId/track-progress-enhanced - Enhanced progress tracking
router.post('/applications/:applicationId/track-progress-enhanced', 
  requireAuth, 
  requireRole(['admin', 'company', 'faculty', 'student']), 
  upload.array('attachments', 5),
  async (req, res) => {
    try {
      const { applicationId } = req.params;
      const updatedBy = req.user.id;
      
      const progressData = {
        ...req.body,
        attachments: req.files ? req.files.map(file => ({
          filename: file.filename,
          originalName: file.originalname,
          uploadedAt: new Date()
        })) : []
      };

      const result = await ApplicationTrackingService.trackProgressWithMilestones(
        applicationId, 
        progressData, 
        updatedBy
      );
      
      res.json(result);
    } catch (error) {
      console.error('Error tracking enhanced progress:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

// POST /api/internships/reminders/send - Send automated reminders
router.post('/reminders/send', 
  requireAuth, 
  requireRole(['admin']), 
  async (req, res) => {
    try {
      const { type = 'all' } = req.body;
      
      const results = await ApplicationTrackingService.sendAutomatedReminders(type);
      
      res.json({
        message: `${type} reminders processed successfully`,
        results
      });
    } catch (error) {
      console.error('Error sending automated reminders:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /api/internships/applications/:applicationId/workflow-status - Get enhanced workflow status
router.get('/applications/:applicationId/workflow-status', 
  requireAuth, 
  async (req, res) => {
    try {
      const { applicationId } = req.params;
      
      const workflowStatus = await InternshipWorkflowService.getApplicationWorkflowStatus(applicationId);
      
      res.json(workflowStatus);
    } catch (error) {
      console.error('Error getting workflow status:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// POST /api/internships/applications/:applicationId/start-tracking - Start internship tracking
router.post('/applications/:applicationId/start-tracking', 
  requireAuth, 
  requireRole(['admin', 'company', 'faculty']), 
  async (req, res) => {
    try {
      const { applicationId } = req.params;
      
      const result = await InternshipWorkflowService.startInternshipTracking(applicationId);
      
      res.json(result);
    } catch (error) {
      console.error('Error starting internship tracking:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

// POST /api/internships/applications/:applicationId/complete-enhanced - Complete internship with evaluation
router.post('/applications/:applicationId/complete-enhanced', 
  requireAuth, 
  requireRole(['admin', 'company', 'faculty']), 
  async (req, res) => {
    try {
      const { applicationId } = req.params;
      const completionData = {
        ...req.body,
        completedBy: req.user.id
      };
      
      const result = await InternshipWorkflowService.completeInternshipWithEvaluation(
        applicationId, 
        completionData
      );
      
      res.json(result);
    } catch (error) {
      console.error('Error completing internship:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

// GET /api/internships/analytics/tracking - Get application tracking analytics
router.get('/analytics/tracking', 
  requireAuth, 
  requireRole(['admin']), 
  async (req, res) => {
    try {
      const { companyId, startDate, endDate, type = 'overview' } = req.query;
      
      let analytics;
      
      switch (type) {
        case 'workflow':
          analytics = await this.getWorkflowAnalytics({ companyId, startDate, endDate });
          break;
        case 'progress':
          analytics = await this.getProgressAnalytics({ companyId, startDate, endDate });
          break;
        case 'reminders':
          analytics = await this.getReminderAnalytics({ companyId, startDate, endDate });
          break;
        default:
          analytics = await InternshipService.getAnalytics({ companyId, startDate, endDate });
      }
      
      res.json(analytics);
    } catch (error) {
      console.error('Error getting tracking analytics:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// api/internships/applications/bulk-update - Bulk update application statuses
router.post('/applications/bulk-update', 
  requireAuth, 
  requireRole(['admin', 'company']), 
  async (req, res) => {
    try {
      const { applicationIds, status, notes } = req.body;
      const reviewerId = req.user.id;

      if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
        return res.status(400).json({ error: 'Application IDs array is required' });
      }

      const results = await InternshipService.bulkUpdateApplicationStatus(
        applicationIds, 
        status, 
        reviewerId, 
        { notes }
      );

      res.json(results);
    } catch (error) {
      console.error('Error bulk updating applications:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

// GET /api/internships/dashboard/company/:companyId - Company application dashboard
router.get('/dashboard/company/:companyId', 
  requireAuth, 
  requireRole(['admin', 'company']), 
  async (req, res) => {
    try {
      const { companyId } = req.params;
      const { status, page = 1, limit = 20, dateFrom, dateTo } = req.query;

      const filters = {
        status,
        page: parseInt(page),
        limit: parseInt(limit),
        dateFrom,
        dateTo
      };

      const dashboard = await CompanyService.getApplicationManagementDashboard(companyId, filters);
      res.json(dashboard);
    } catch (error) {
      console.error('Error getting company dashboard:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// POST /api/internships/applications/batch-process - Batch process applications
router.post('/applications/batch-process', 
  requireAuth, 
  requireRole(['admin', 'company']), 
  async (req, res) => {
    try {
      const { companyId, applicationIds, action, actionData } = req.body;
      const processedBy = req.user.id;

      const results = await CompanyService.batchProcessApplications(
        companyId, 
        applicationIds, 
        action, 
        processedBy, 
        actionData
      );

      res.json(results);
    } catch (error) {
      console.error('Error batch processing applications:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

// GET /api/internships/recommendations/candidates/:internshipId - Get candidate recommendations
router.get('/recommendations/candidates/:internshipId', 
  requireAuth, 
  requireRole(['admin', 'company']), 
  async (req, res) => {
    try {
      const { internshipId } = req.params;
      const { limit = 10 } = req.query;

      const CandidateMatchingService = require('../services/CandidateMatchingService');
      const recommendations = await CandidateMatchingService.matchCandidatesForInternship(
        internshipId, 
        { limit: parseInt(limit) }
      );

      res.json(recommendations);
    } catch (error) {
      console.error('Error getting candidate recommendations:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /api/internships/recommendations/student/:studentId - Get internship recommendations for student
router.get('/recommendations/student/:studentId', 
  requireAuth, 
  requireRole(['admin', 'student']), 
  async (req, res) => {
    try {
      const { studentId } = req.params;
      const { limit = 10, preferredLocation, workArrangement, minStipend, maxDuration } = req.query;

      // Ensure student can only access their own recommendations
      if (req.user.role === 'student' && req.user.id !== studentId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const preferences = {
        limit: parseInt(limit),
        preferredLocation,
        workArrangement,
        minStipend: minStipend ? parseFloat(minStipend) : undefined,
        maxDuration: maxDuration ? parseInt(maxDuration) : undefined
      };

      const CandidateMatchingService = require('../services/CandidateMatchingService');
      const recommendations = await CandidateMatchingService.findInternshipsForStudent(studentId, preferences);

      res.json(recommendations);
    } catch (error) {
      console.error('Error getting internship recommendations:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /api/internships/analytics/matching/:internshipId - Get matching analytics for internship
router.get('/analytics/matching/:internshipId', 
  requireAuth, 
  requireRole(['admin', 'company']), 
  async (req, res) => {
    try {
      const { internshipId } = req.params;

      const CandidateMatchingService = require('../services/CandidateMatchingService');
      const report = await CandidateMatchingService.generateMatchingReport(internshipId);

      res.json(report);
    } catch (error) {
      console.error('Error getting matching analytics:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// POST /api/internships/workflow/send-reminders - Send specific reminder types
router.post('/workflow/send-reminders', 
  requireAuth, 
  requireRole(['admin']), 
  async (req, res) => {
    try {
      const { type } = req.body;
      
      switch (type) {
        case 'daily':
          await InternshipWorkflowService.sendDailyReminders();
          break;
        case 'weekly':
          await InternshipWorkflowService.sendWeeklyProgressReminders();
          break;
        case 'milestone':
          await InternshipWorkflowService.sendMilestoneReminders();
          break;
        case 'evaluation':
          await InternshipWorkflowService.sendEvaluationReminders();
          break;
        default:
          throw new Error('Invalid reminder type');
      }
      
      res.json({ message: `${type} reminders sent successfully` });
    } catch (error) {
      console.error('Error sending reminders:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
