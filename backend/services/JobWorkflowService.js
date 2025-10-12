const JobPosting = require('../models/JobPosting');
const JobApplication = require('../models/JobApplication');
const User = require('../models/User');
const AlumniProfile = require('../models/AlumniProfile');
const notificationService = require('./NotificationService');
const mongoose = require('mongoose');

class JobWorkflowService {
  constructor() {
    this.notificationService = notificationService;
  }

  /**
   * Submit job posting for approval
   * @param {string} jobId - Job posting ID
   * @param {string} submitterId - User ID submitting for approval
   * @returns {Promise<Object>} Approval submission result
   */
  async submitForApproval(jobId, submitterId) {
    try {
      const jobPosting = await JobPosting.findById(jobId);
      if (!jobPosting) {
        throw new Error('Job posting not found');
      }

      if (jobPosting.posterId.toString() !== submitterId) {
        throw new Error('Unauthorized to submit this job posting for approval');
      }

      if (jobPosting.status !== 'draft') {
        throw new Error('Only draft job postings can be submitted for approval');
      }

      jobPosting.status = 'pending_approval';
      jobPosting.submittedForApprovalAt = new Date();
      await jobPosting.save();

      // Notify administrators
      const admins = await User.find({ role: 'admin', isActive: true });
      const notifications = admins.map(admin => 
        this.notificationService.sendToUser(admin._id, {
          title: 'Job Posting Pending Approval',
          message: `${jobPosting.title} at ${jobPosting.company} requires approval`,
          type: 'info',
          category: 'academic',
          actionUrl: `/admin/jobs/${jobPosting._id}/review`,
          data: { jobId: jobPosting._id }
        })
      );

      await Promise.all(notifications);

      return {
        success: true,
        data: jobPosting,
        message: 'Job posting submitted for approval successfully'
      };
    } catch (error) {
      throw new Error(`Failed to submit job posting for approval: ${error.message}`);
    }
  }

  /**
   * Get pending job approvals
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Pending job postings
   */
  async getPendingApprovals(pagination = { page: 1, limit: 20 }) {
    try {
      const [jobs, total] = await Promise.all([
        JobPosting.find({ status: 'pending_approval' })
          .populate('posterId', 'firstName lastName email')
          .sort({ submittedForApprovalAt: -1 })
          .skip((pagination.page - 1) * pagination.limit)
          .limit(pagination.limit),
        JobPosting.countDocuments({ status: 'pending_approval' })
      ]);

      return {
        success: true,
        data: {
          jobs,
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total,
            pages: Math.ceil(total / pagination.limit)
          }
        }
      };
    } catch (error) {
      throw new Error(`Failed to get pending approvals: ${error.message}`);
    }
  }

  /**
   * Review job posting (approve or reject)
   * @param {string} jobId - Job posting ID
   * @param {string} reviewerId - Admin user ID
   * @param {string} decision - 'approved' or 'rejected'
   * @param {string} feedback - Optional feedback message
   * @returns {Promise<Object>} Review result
   */
  async reviewJobPosting(jobId, reviewerId, decision, feedback = '') {
    try {
      const jobPosting = await JobPosting.findById(jobId).populate('posterId', 'firstName lastName email');
      if (!jobPosting) {
        throw new Error('Job posting not found');
      }

      if (jobPosting.status !== 'pending_approval') {
        throw new Error('Job posting is not pending approval');
      }

      // Update job status based on decision
      jobPosting.status = decision === 'approved' ? 'active' : 'rejected';
      jobPosting.reviewedBy = reviewerId;
      jobPosting.reviewedAt = new Date();
      
      if (feedback) {
        jobPosting.reviewFeedback = feedback;
      }

      await jobPosting.save();

      // Notify job poster
      const notificationTitle = decision === 'approved' 
        ? 'Job Posting Approved' 
        : 'Job Posting Rejected';
      
      const notificationMessage = decision === 'approved'
        ? `Your job posting "${jobPosting.title}" has been approved and is now active`
        : `Your job posting "${jobPosting.title}" was not approved${feedback ? ': ' + feedback : ''}`;

      await this.notificationService.sendToUser(jobPosting.posterId._id, {
        title: notificationTitle,
        message: notificationMessage,
        type: decision === 'approved' ? 'success' : 'info',
        category: 'academic',
        actionUrl: `/alumni/jobs/${jobPosting._id}`,
        data: { jobId: jobPosting._id, decision }
      });

      return {
        success: true,
        data: jobPosting,
        message: `Job posting ${decision} successfully`
      };
    } catch (error) {
      throw new Error(`Failed to review job posting: ${error.message}`);
    }
  }

  /**
   * Auto-match candidates to job postings
   * @param {string} jobId - Job posting ID
   * @param {number} limit - Number of matches to return
   * @returns {Promise<Object>} Candidate matches
   */
  async autoMatchCandidates(jobId, limit = 10) {
    try {
      const jobPosting = await JobPosting.findById(jobId);
      if (!jobPosting) {
        throw new Error('Job posting not found');
      }

      // Find potential candidates based on job requirements
      const query = {
        isActive: true,
        verificationStatus: 'verified'
      };

      // Filter by target audience
      if (jobPosting.targetAudience === 'alumni') {
        // Only alumni
      } else if (jobPosting.targetAudience === 'students') {
        query.graduationYear = { $gte: new Date().getFullYear() }; // Current/future graduates
      }

      const candidates = await AlumniProfile.find(query)
        .populate('userId', 'firstName lastName email profilePicture')
        .limit(limit * 3); // Get more candidates for better scoring

      // Score candidates based on job requirements
      const scoredCandidates = candidates.map(candidate => {
        let score = 0;
        const matchReasons = [];

        // Skills matching
        if (jobPosting.skills && candidate.skills) {
          const matchingSkills = jobPosting.skills.filter(skill => 
            candidate.skills.some(candidateSkill => 
              candidateSkill.toLowerCase().includes(skill.toLowerCase()) ||
              skill.toLowerCase().includes(candidateSkill.toLowerCase())
            )
          );
          
          if (matchingSkills.length > 0) {
            score += matchingSkills.length * 15;
            matchReasons.push(`${matchingSkills.length} matching skills`);
          }
        }

        // Industry matching
        if (jobPosting.companyInfo?.industry && candidate.industry) {
          if (candidate.industry.toLowerCase().includes(jobPosting.companyInfo.industry.toLowerCase())) {
            score += 20;
            matchReasons.push('Industry match');
          }
        }

        // Experience level matching
        if (jobPosting.experienceLevel) {
          const candidateExperience = this.estimateExperienceLevel(candidate);
          const experienceLevels = ['entry', 'junior', 'mid', 'senior', 'executive'];
          const jobLevelIndex = experienceLevels.indexOf(jobPosting.experienceLevel);
          const candidateLevelIndex = experienceLevels.indexOf(candidateExperience);
          
          if (Math.abs(jobLevelIndex - candidateLevelIndex) <= 1) {
            score += 25;
            matchReasons.push('Experience level match');
          }
        }

        return {
          candidate,
          score,
          matchReasons,
          estimatedExperience: this.estimateExperienceLevel(candidate)
        };
      });

      // Sort by score and return top matches
      scoredCandidates.sort((a, b) => b.score - a.score);
      const topMatches = scoredCandidates.slice(0, limit);

      return {
        success: true,
        data: {
          jobPosting,
          matches: topMatches,
          totalCandidates: candidates.length
        }
      };
    } catch (error) {
      throw new Error(`Failed to auto-match candidates: ${error.message}`);
    }
  }

  /**
   * Estimate experience level based on career history
   * @private
   * @param {Object} candidate - Alumni profile
   * @returns {string} Experience level
   */
  estimateExperienceLevel(candidate) {
    const currentYear = new Date().getFullYear();
    const yearsExperience = currentYear - candidate.graduationYear;
    
    if (yearsExperience <= 1) return 'entry';
    if (yearsExperience <= 3) return 'junior';
    if (yearsExperience <= 7) return 'mid';
    if (yearsExperience <= 12) return 'senior';
    return 'executive';
  }
}

module.exports = JobWorkflowService;