const express = require('express');
const router = express.Router();
const JobService = require('../services/JobService');
const { requireAuth } = require('../middleware/sessionAuth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/jobs/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
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

const jobService = new JobService();

// Job Posting Routes
router.post('/', requireAuth, async (req, res) => {
  try {
    const result = await jobService.createJobPosting(req.user.id, req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const filters = {
      workType: req.query.workType,
      location: req.query.location,
      workArrangement: req.query.workArrangement,
      experienceLevel: req.query.experienceLevel,
      targetAudience: req.query.targetAudience,
      skills: req.query.skills ? req.query.skills.split(',') : undefined,
      salaryMin: req.query.salaryMin ? parseInt(req.query.salaryMin) : undefined,
      salaryMax: req.query.salaryMax ? parseInt(req.query.salaryMax) : undefined,
      searchTerm: req.query.q
    };

    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20
    };

    let result;
    if (req.query.personalized === 'true') {
      result = await jobService.getJobsForUser(req.user.id, pagination);
    } else if (req.query.q) {
      result = await jobService.searchJobs(filters, pagination);
    } else {
      result = await jobService.getActiveJobs(filters, pagination);
    }

    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/my-jobs', requireAuth, async (req, res) => {
  try {
    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20
    };

    const result = await jobService.getJobsByPoster(req.user.id, pagination);
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/analytics', requireAuth, async (req, res) => {
  try {
    // Check if user is admin or job poster
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    // If not admin, only show their own job analytics
    if (req.user.role !== 'admin') {
      filters.posterId = req.user.id;
    }

    const result = await jobService.getJobAnalytics(filters);
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/:jobId', requireAuth, async (req, res) => {
  try {
    const result = await jobService.getJobPosting(req.params.jobId, req.user.id);
    res.json(result);
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

router.put('/:jobId', requireAuth, async (req, res) => {
  try {
    const result = await jobService.updateJobPosting(
      req.params.jobId,
      req.user.id,
      req.body
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:jobId', requireAuth, async (req, res) => {
  try {
    const result = await jobService.deleteJobPosting(req.params.jobId, req.user.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Job Application Routes
router.post('/:jobId/apply', requireAuth, upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'additionalDocuments', maxCount: 5 }
]), async (req, res) => {
  try {
    const applicationData = {
      coverLetter: req.body.coverLetter,
      applicationAnswers: req.body.applicationAnswers ? JSON.parse(req.body.applicationAnswers) : []
    };

    // Handle resume upload
    if (req.files && req.files.resume && req.files.resume[0]) {
      applicationData.resume = req.files.resume[0].filename;
    }

    // Handle additional documents
    if (req.files && req.files.additionalDocuments) {
      applicationData.additionalDocuments = req.files.additionalDocuments.map(file => ({
        name: file.originalname,
        filename: file.filename,
        uploadedAt: new Date()
      }));
    }

    const result = await jobService.submitJobApplication(
      req.params.jobId,
      req.user.id,
      applicationData
    );
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/:jobId/applications', requireAuth, async (req, res) => {
  try {
    const filters = {
      status: req.query.status
    };

    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20
    };

    const result = await jobService.getJobApplications(
      req.params.jobId,
      req.user.id,
      filters,
      pagination
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/applications/:applicationId/status', requireAuth, async (req, res) => {
  try {
    const result = await jobService.updateApplicationStatus(
      req.params.applicationId,
      req.user.id,
      req.body.status,
      req.body.feedback
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/applications/:applicationId/interview', requireAuth, async (req, res) => {
  try {
    const result = await jobService.scheduleInterview(
      req.params.applicationId,
      req.user.id,
      req.body
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/applications/:applicationId/withdraw', requireAuth, async (req, res) => {
  try {
    const result = await jobService.withdrawApplication(
      req.params.applicationId,
      req.user.id,
      req.body.reason
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// External application tracking (for jobs with external application URLs)
router.post('/:jobId/track-application', requireAuth, async (req, res) => {
  try {
    const result = await jobService.trackJobApplication(
      req.params.jobId,
      req.user.id,
      req.body
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
