const express = require('express');
const router = express.Router();
const AlumniService = require('../services/AlumniService');
const JobService = require('../services/JobService');
const JobWorkflowService = require('../services/JobWorkflowService');
const MentorshipService = require('../services/MentorshipService');
const MentorshipMatchingService = require('../services/MentorshipMatchingService');
const CareerProgressionService = require('../services/CareerProgressionService');
const AlumniEventService = require('../services/AlumniEventService');
const { requireAuth } = require('../middleware/sessionAuth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/alumni/');
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

const alumniService = new AlumniService();
const jobService = new JobService();
const jobWorkflowService = new JobWorkflowService();
const mentorshipService = new MentorshipService();
const mentorshipMatchingService = new MentorshipMatchingService();
const careerProgressionService = new CareerProgressionService();
const alumniEventService = new AlumniEventService();

// Alumni Profile Routes
router.post('/profile', requireAuth, upload.fields([
  { name: 'documents', maxCount: 5 }
]), async (req, res) => {
  try {
    const profileData = req.body;
    
    // Handle uploaded documents
    if (req.files && req.files.documents) {
      profileData.verificationDocuments = req.files.documents.map(file => ({
        type: file.fieldname === 'diploma' ? 'diploma' : 'other',
        filename: file.filename,
        uploadedAt: new Date()
      }));
    }

    const result = await alumniService.createOrUpdateProfile(req.user.id, profileData);
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/profile/:userId?', requireAuth, async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const result = await alumniService.getProfile(userId, req.user.id);
    res.json(result);
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

router.get('/search', requireAuth, async (req, res) => {
  try {
    const filters = {
      graduationYear: req.query.graduationYear,
      degree: req.query.degree,
      industry: req.query.industry,
      location: req.query.location,
      skills: req.query.skills ? req.query.skills.split(',') : undefined,
      company: req.query.company,
      mentorshipAvailable: req.query.mentorshipAvailable === 'true',
      searchTerm: req.query.q
    };

    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20
    };

    const result = await alumniService.searchAlumni(filters, pagination);
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/mentors', requireAuth, async (req, res) => {
  try {
    const result = await alumniService.getAvailableMentors(
      req.query.expertise,
      req.query.menteeLevel
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/mentorship-availability', requireAuth, async (req, res) => {
  try {
    const result = await alumniService.updateMentorshipAvailability(
      req.user.id,
      req.body
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/analytics', requireAuth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const result = await alumniService.getAlumniAnalytics(filters);
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/networking-suggestions', requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const result = await alumniService.getNetworkingSuggestions(req.user.id, limit);
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Job Board Routes
router.post('/jobs', requireAuth, async (req, res) => {
  try {
    const result = await jobService.createJobPosting(req.user.id, req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/jobs', requireAuth, async (req, res) => {
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

router.get('/jobs/:jobId', requireAuth, async (req, res) => {
  try {
    const result = await jobService.getJobPosting(req.params.jobId, req.user.id);
    res.json(result);
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

router.put('/jobs/:jobId', requireAuth, async (req, res) => {
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

router.delete('/jobs/:jobId', requireAuth, async (req, res) => {
  try {
    const result = await jobService.deleteJobPosting(req.params.jobId, req.user.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Enhanced Job Workflow Routes
router.put('/jobs/:jobId/submit-approval', requireAuth, async (req, res) => {
  try {
    const result = await jobWorkflowService.submitForApproval(req.params.jobId, req.user.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/jobs/:jobId/candidate-matches', requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const result = await jobWorkflowService.autoMatchCandidates(req.params.jobId, limit);
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

// Job Application Routes
router.post('/jobs/:jobId/apply', requireAuth, upload.fields([
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

router.get('/jobs/:jobId/applications', requireAuth, async (req, res) => {
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

router.get('/applications', requireAuth, async (req, res) => {
  try {
    const filters = {
      status: req.query.status
    };

    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20
    };

    const result = await jobService.getApplicationsByApplicant(
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

// Mentorship Routes
router.post('/mentorship/request', requireAuth, async (req, res) => {
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

router.get('/mentorship/requests', requireAuth, async (req, res) => {
  try {
    const result = await mentorshipService.getPendingRequests(req.user.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/mentorship/:mentorshipId/respond', requireAuth, async (req, res) => {
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

router.get('/mentorship', requireAuth, async (req, res) => {
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

router.get('/mentorship/:mentorshipId', requireAuth, async (req, res) => {
  try {
    const result = await mentorshipService.getMentorship(req.params.mentorshipId, req.user.id);
    res.json(result);
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

router.post('/mentorship/:mentorshipId/sessions', requireAuth, async (req, res) => {
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

router.put('/mentorship/:mentorshipId/sessions/:sessionId/complete', requireAuth, async (req, res) => {
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

router.post('/mentorship/:mentorshipId/progress', requireAuth, async (req, res) => {
  try {
    const result = await mentorshipService.addProgress(
      req.params.mentorshipId,
      req.user.id,
      req.body
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/mentorship/:mentorshipId/goals/:goalId', requireAuth, async (req, res) => {
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

router.post('/mentorship/:mentorshipId/feedback', requireAuth, async (req, res) => {
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

router.put('/mentorship/:mentorshipId/complete', requireAuth, async (req, res) => {
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

router.get('/mentorship/matches', requireAuth, async (req, res) => {
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

router.get('/mentorship/stats', requireAuth, async (req, res) => {
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

// Enhanced Mentorship Matching Routes
router.get('/mentorship/advanced-matches', requireAuth, async (req, res) => {
  try {
    const preferences = {
      expertise: req.query.expertise,
      menteeLevel: req.query.menteeLevel,
      industry: req.query.industry
    };

    const result = await mentorshipMatchingService.findAdvancedMatches(req.user.id, preferences);
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/mentorship/matching-report', requireAuth, async (req, res) => {
  try {
    const result = await mentorshipMatchingService.createMatchingReport(req.user.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Career Progression Routes
router.post('/career/track', requireAuth, async (req, res) => {
  try {
    const result = await careerProgressionService.trackCareerProgression(
      req.user.id,
      req.body
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/career/analytics/:userId?', requireAuth, async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const result = await careerProgressionService.getCareerProgressionAnalytics(userId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/career/trends', requireAuth, async (req, res) => {
  try {
    // Check if user is admin for comprehensive trends
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const filters = {
      graduationYear: req.query.graduationYear ? parseInt(req.query.graduationYear) : undefined,
      degree: req.query.degree,
      industry: req.query.industry
    };

    const result = await careerProgressionService.getCareerProgressionTrends(filters);
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/career/report/:userId?', requireAuth, async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    
    // Check authorization
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const result = await careerProgressionService.generateCareerProgressionReport(userId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/career/compare', requireAuth, async (req, res) => {
  try {
    const result = await careerProgressionService.compareWithPeers(req.user.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Alumni Event Routes
router.post('/events', requireAuth, async (req, res) => {
  try {
    const result = await alumniEventService.createAlumniEvent(req.user.id, req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/events', requireAuth, async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      graduationYear: req.query.graduationYear ? parseInt(req.query.graduationYear) : undefined,
      industry: req.query.industry,
      networkingOpportunities: req.query.networkingOpportunities === 'true',
      mentorshipOpportunities: req.query.mentorshipOpportunities === 'true',
      careerFocus: req.query.careerFocus === 'true',
      dateRange: req.query.startDate && req.query.endDate ? {
        start: req.query.startDate,
        end: req.query.endDate
      } : undefined
    };

    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20
    };

    const result = await alumniEventService.getAlumniEvents(filters, pagination);
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/events/:eventId/register', requireAuth, async (req, res) => {
  try {
    const result = await alumniEventService.registerAlumniForEvent(
      req.params.eventId,
      req.user.id,
      req.body
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/events/:eventId/networking', requireAuth, async (req, res) => {
  try {
    const result = await alumniEventService.getEventNetworkingOpportunities(
      req.params.eventId,
      req.user.id
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/events/analytics/:eventId?', requireAuth, async (req, res) => {
  try {
    // Check if user is admin for comprehensive analytics
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const filters = {
      dateRange: req.query.startDate && req.query.endDate ? {
        start: req.query.startDate,
        end: req.query.endDate
      } : undefined
    };

    const result = await alumniEventService.getAlumniEventAnalytics(
      req.params.eventId || null,
      filters
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
