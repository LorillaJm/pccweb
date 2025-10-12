const express = require('express');
const router = express.Router();
const JobWorkflowService = require('../services/JobWorkflowService');
const JobService = require('../services/JobService');
const { requireAuth, requireAdmin } = require('../middleware/sessionAuth');

const jobWorkflowService = new JobWorkflowService();
const jobService = new JobService();

// Get pending job approvals
router.get('/jobs/pending', requireAdmin, async (req, res) => {
  try {
    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20
    };

    const result = await jobWorkflowService.getPendingApprovals(pagination);
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Review job posting (approve/reject)
router.put('/jobs/:jobId/review', requireAdmin, async (req, res) => {
  try {
    const { decision, feedback } = req.body;

    if (!decision || !['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid decision (approved/rejected) is required' 
      });
    }

    const result = await jobWorkflowService.reviewJobPosting(
      req.params.jobId,
      req.user.id,
      decision,
      feedback || ''
    );

    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get job analytics for admin
router.get('/jobs/analytics', requireAdmin, async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      posterId: req.query.posterId
    };

    const result = await jobService.getJobAnalytics(filters);
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
