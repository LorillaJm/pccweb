const JobPosting = require('../models/JobPosting');
const JobApplication = require('../models/JobApplication');
const User = require('../models/User');
const AlumniProfile = require('../models/AlumniProfile');
const notificationService = require('./NotificationService');
const mongoose = require('mongoose');

class JobService {
  constructor() {
    this.notificationService = notificationService;
  }

  /**
   * Create a new job posting
   * @param {string} posterId - ID of the user posting the job
   * @param {Object} jobData - Job posting data
   * @returns {Promise<Object>} Created job posting
   */
  async createJobPosting(posterId, jobData) {
    try {
      // Verify poster exists and has appropriate permissions
      const poster = await User.findById(posterId);
      if (!poster) {
        throw new Error('Poster not found');
      }

      // Determine poster type
      let posterType = 'admin';
      if (poster.role === 'student' || poster.role === 'alumni') {
        posterType = poster.isAlumni ? 'alumni' : 'student';
      } else if (poster.role === 'company') {
        posterType = 'company';
      }

      // Validate required fields
      const requiredFields = ['title', 'company', 'description', 'location', 'workType', 'contactEmail'];
      for (const field of requiredFields) {
        if (!jobData[field]) {
          throw new Error(`${field} is required`);
        }
      }

      // Create job posting
      const jobPosting = new JobPosting({
        posterId,
        posterType,
        ...jobData,
        status: jobData.status || 'draft'
      });

      await jobPosting.save();
      await jobPosting.populate('posterId', 'firstName lastName email');

      return {
        success: true,
        data: jobPosting,
        message: 'Job posting created successfully'
      };
    } catch (error) {
      throw new Error(`Failed to create job posting: ${error.message}`);
    }
  }

  /**
   * Update job posting
   * @param {string} jobId - Job posting ID
   * @param {string} userId - User ID making the update
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated job posting
   */
  async updateJobPosting(jobId, userId, updateData) {
    try {
      const jobPosting = await JobPosting.findById(jobId);
      if (!jobPosting) {
        throw new Error('Job posting not found');
      }

      // Check permissions
      if (jobPosting.posterId.toString() !== userId) {
        const user = await User.findById(userId);
        if (!user || user.role !== 'admin') {
          throw new Error('Unauthorized to update this job posting');
        }
      }

      // Update fields
      Object.assign(jobPosting, updateData);
      jobPosting.lastModified = new Date();

      await jobPosting.save();
      await jobPosting.populate('posterId', 'firstName lastName email');

      return {
        success: true,
        data: jobPosting,
        message: 'Job posting updated successfully'
      };
    } catch (error) {
      throw new Error(`Failed to update job posting: ${error.message}`);
    }
  }

  /**
   * Get job posting by ID
   * @param {string} jobId - Job posting ID
   * @param {string} viewerId - ID of user viewing the job (for analytics)
   * @returns {Promise<Object>} Job posting
   */
  async getJobPosting(jobId, viewerId = null) {
    try {
      const jobPosting = await JobPosting.findById(jobId)
        .populate('posterId', 'firstName lastName email');

      if (!jobPosting) {
        throw new Error('Job posting not found');
      }

      // Increment view count if viewed by someone other than the poster
      if (viewerId && viewerId !== jobPosting.posterId.toString()) {
        await jobPosting.incrementViewCount();
      }

      return {
        success: true,
        data: jobPosting
      };
    } catch (error) {
      throw new Error(`Failed to get job posting: ${error.message}`);
    }
  }

  /**
   * Search and filter job postings
   * @param {Object} filters - Search filters
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Search results
   */
  async searchJobs(filters = {}, pagination = { page: 1, limit: 20 }) {
    try {
      let jobs;
      let total;

      if (filters.searchTerm) {
        // Text search
        jobs = await JobPosting.searchJobs(filters.searchTerm, this._buildFilterQuery(filters))
          .skip((pagination.page - 1) * pagination.limit)
          .limit(pagination.limit);
        
        total = await JobPosting.countDocuments({
          $text: { $search: filters.searchTerm },
          ...this._buildFilterQuery(filters)
        });
      } else {
        // Regular filtering
        const query = this._buildFilterQuery(filters);
        
        [jobs, total] = await Promise.all([
          JobPosting.find(query)
            .populate('posterId', 'firstName lastName email')
            .sort({ priority: -1, createdAt: -1 })
            .skip((pagination.page - 1) * pagination.limit)
            .limit(pagination.limit),
          JobPosting.countDocuments(query)
        ]);
      }

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
      throw new Error(`Failed to search jobs: ${error.message}`);
    }
  }

  /**
   * Get active job postings
   * @param {Object} filters - Additional filters
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Active jobs
   */
  async getActiveJobs(filters = {}, pagination = { page: 1, limit: 20 }) {
    try {
      const jobs = await JobPosting.findActiveJobs(filters)
        .skip((pagination.page - 1) * pagination.limit)
        .limit(pagination.limit);

      const total = await JobPosting.countDocuments({
        status: 'active',
        $or: [
          { applicationDeadline: { $exists: false } },
          { applicationDeadline: { $gte: new Date() } }
        ],
        ...this._buildFilterQuery(filters)
      });

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
      throw new Error(`Failed to get active jobs: ${error.message}`);
    }
  }

  /**
   * Get jobs for a specific user based on their profile
   * @param {string} userId - User ID
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Personalized job recommendations
   */
  async getJobsForUser(userId, pagination = { page: 1, limit: 20 }) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      let userProfile = { role: user.role };

      // Get additional profile data if user is alumni
      if (user.isAlumni) {
        const alumniProfile = await AlumniProfile.findOne({ userId });
        if (alumniProfile) {
          userProfile = {
            ...userProfile,
            graduationYear: alumniProfile.graduationYear,
            program: alumniProfile.degree,
            skills: alumniProfile.skills,
            industry: alumniProfile.industry
          };
        }
      }

      const jobs = await JobPosting.findJobsForUser(userId, userProfile)
        .skip((pagination.page - 1) * pagination.limit)
        .limit(pagination.limit);

      // Calculate relevance scores for personalized recommendations
      const jobsWithScores = jobs.map(job => {
        let relevanceScore = 0;
        
        // Skill matching
        if (userProfile.skills && job.skills) {
          const matchingSkills = job.skills.filter(skill => 
            userProfile.skills.some(userSkill => 
              userSkill.toLowerCase().includes(skill.toLowerCase()) ||
              skill.toLowerCase().includes(userSkill.toLowerCase())
            )
          );
          relevanceScore += matchingSkills.length * 10;
        }

        // Industry matching
        if (userProfile.industry && job.companyInfo?.industry) {
          if (userProfile.industry.toLowerCase() === job.companyInfo.industry.toLowerCase()) {
            relevanceScore += 20;
          }
        }

        // Experience level matching (for alumni)
        if (userProfile.role === 'alumni' && job.experienceLevel) {
          const experienceLevels = ['entry', 'junior', 'mid', 'senior', 'executive'];
          const userLevel = this._estimateExperienceLevel(userProfile.graduationYear);
          const jobLevelIndex = experienceLevels.indexOf(job.experienceLevel);
          const userLevelIndex = experienceLevels.indexOf(userLevel);
          
          if (Math.abs(jobLevelIndex - userLevelIndex) <= 1) {
            relevanceScore += 15;
          }
        }

        return {
          ...job.toJSON(),
          relevanceScore
        };
      });

      // Sort by relevance score
      jobsWithScores.sort((a, b) => b.relevanceScore - a.relevanceScore);

      const total = await JobPosting.countDocuments({
        status: 'active',
        $or: [
          { applicationDeadline: { $exists: false } },
          { applicationDeadline: { $gte: new Date() } }
        ],
        targetAudience: { $in: [user.isAlumni ? 'alumni' : 'students', 'both'] }
      });

      return {
        success: true,
        data: {
          jobs: jobsWithScores,
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total,
            pages: Math.ceil(total / pagination.limit)
          }
        }
      };
    } catch (error) {
      throw new Error(`Failed to get jobs for user: ${error.message}`);
    }
  }

  /**
   * Get jobs posted by a specific user
   * @param {string} posterId - Poster user ID
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} User's job postings
   */
  async getJobsByPoster(posterId, pagination = { page: 1, limit: 20 }) {
    try {
      const [jobs, total] = await Promise.all([
        JobPosting.find({ posterId })
          .populate('posterId', 'firstName lastName email')
          .sort({ createdAt: -1 })
          .skip((pagination.page - 1) * pagination.limit)
          .limit(pagination.limit),
        JobPosting.countDocuments({ posterId })
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
      throw new Error(`Failed to get jobs by poster: ${error.message}`);
    }
  }

  /**
   * Delete job posting
   * @param {string} jobId - Job posting ID
   * @param {string} userId - User ID requesting deletion
   * @returns {Promise<Object>} Deletion result
   */
  async deleteJobPosting(jobId, userId) {
    try {
      const jobPosting = await JobPosting.findById(jobId);
      if (!jobPosting) {
        throw new Error('Job posting not found');
      }

      // Check permissions
      if (jobPosting.posterId.toString() !== userId) {
        const user = await User.findById(userId);
        if (!user || user.role !== 'admin') {
          throw new Error('Unauthorized to delete this job posting');
        }
      }

      await JobPosting.findByIdAndDelete(jobId);

      return {
        success: true,
        message: 'Job posting deleted successfully'
      };
    } catch (error) {
      throw new Error(`Failed to delete job posting: ${error.message}`);
    }
  }

  /**
   * Get job posting analytics
   * @param {Object} filters - Analytics filters
   * @returns {Promise<Object>} Analytics data
   */
  async getJobAnalytics(filters = {}) {
    try {
      const matchStage = {};

      // Apply date filters
      if (filters.startDate || filters.endDate) {
        matchStage.createdAt = {};
        if (filters.startDate) matchStage.createdAt.$gte = new Date(filters.startDate);
        if (filters.endDate) matchStage.createdAt.$lte = new Date(filters.endDate);
      }

      // Apply poster filter
      if (filters.posterId) {
        matchStage.posterId = mongoose.Types.ObjectId(filters.posterId);
      }

      const analytics = await JobPosting.aggregate([
        { $match: matchStage },
        {
          $facet: {
            // Overall statistics
            overallStats: [
              {
                $group: {
                  _id: null,
                  totalJobs: { $sum: 1 },
                  activeJobs: {
                    $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                  },
                  totalApplications: { $sum: '$applicationCount' },
                  totalViews: { $sum: '$viewCount' },
                  averageApplicationsPerJob: { $avg: '$applicationCount' },
                  averageViewsPerJob: { $avg: '$viewCount' }
                }
              }
            ],

            // Status distribution
            statusStats: [
              {
                $group: {
                  _id: '$status',
                  count: { $sum: 1 },
                  totalApplications: { $sum: '$applicationCount' },
                  totalViews: { $sum: '$viewCount' }
                }
              }
            ],

            // Work type distribution
            workTypeStats: [
              {
                $group: {
                  _id: '$workType',
                  count: { $sum: 1 },
                  totalApplications: { $sum: '$applicationCount' }
                }
              }
            ],

            // Location distribution
            locationStats: [
              {
                $group: {
                  _id: '$location',
                  count: { $sum: 1 }
                }
              },
              { $sort: { count: -1 } },
              { $limit: 10 }
            ],

            // Skills demand
            skillsStats: [
              { $unwind: '$skills' },
              {
                $group: {
                  _id: '$skills',
                  count: { $sum: 1 },
                  totalApplications: { $sum: '$applicationCount' }
                }
              },
              { $sort: { count: -1 } },
              { $limit: 20 }
            ],

            // Poster type distribution
            posterTypeStats: [
              {
                $group: {
                  _id: '$posterType',
                  count: { $sum: 1 },
                  totalApplications: { $sum: '$applicationCount' }
                }
              }
            ],

            // Monthly trends
            monthlyTrends: [
              {
                $group: {
                  _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                  },
                  jobsPosted: { $sum: 1 },
                  totalApplications: { $sum: '$applicationCount' }
                }
              },
              { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]
          }
        }
      ]);

      // Get top performing jobs
      const topJobs = await JobPosting.find(matchStage)
        .sort({ applicationCount: -1, viewCount: -1 })
        .limit(10)
        .populate('posterId', 'firstName lastName email')
        .select('title company applicationCount viewCount createdAt status');

      return {
        success: true,
        data: {
          overview: analytics[0].overallStats[0] || {},
          statusDistribution: analytics[0].statusStats,
          workTypeDistribution: analytics[0].workTypeStats,
          topLocations: analytics[0].locationStats,
          topSkills: analytics[0].skillsStats,
          posterTypeDistribution: analytics[0].posterTypeStats,
          monthlyTrends: analytics[0].monthlyTrends,
          topPerformingJobs: topJobs
        }
      };
    } catch (error) {
      throw new Error(`Failed to get job analytics: ${error.message}`);
    }
  }

  /**
   * Submit job application
   * @param {string} jobId - Job posting ID
   * @param {string} applicantId - Applicant user ID
   * @param {Object} applicationData - Application data
   * @returns {Promise<Object>} Created application
   */
  async submitJobApplication(jobId, applicantId, applicationData) {
    try {
      const jobPosting = await JobPosting.findById(jobId).populate('posterId', 'firstName lastName email');
      if (!jobPosting) {
        throw new Error('Job posting not found');
      }

      if (!jobPosting.canAcceptApplications) {
        throw new Error('Job posting is not accepting applications');
      }

      // Check if user already applied
      const existingApplication = await JobApplication.findOne({ jobId, applicantId });
      if (existingApplication) {
        throw new Error('You have already applied for this job');
      }

      // Create application
      const application = new JobApplication({
        jobId,
        applicantId,
        coverLetter: applicationData.coverLetter,
        resume: applicationData.resume,
        additionalDocuments: applicationData.additionalDocuments || [],
        applicationAnswers: applicationData.applicationAnswers || []
      });

      await application.save();
      await application.populate('applicantId', 'firstName lastName email profilePicture');

      // Increment job application count
      await jobPosting.incrementApplicationCount();

      // Send notification to job poster
      await this.notificationService.sendToUser(jobPosting.posterId._id, {
        title: 'New Job Application',
        message: `${application.applicantId.firstName} ${application.applicantId.lastName} applied for ${jobPosting.title}`,
        type: 'info',
        category: 'academic',
        actionUrl: `/alumni/jobs/${jobId}/applications/${application._id}`,
        data: { jobId, applicationId: application._id }
      });

      // Send confirmation to applicant
      await this.notificationService.sendToUser(applicantId, {
        title: 'Application Submitted',
        message: `Your application for ${jobPosting.title} has been submitted successfully`,
        type: 'success',
        category: 'academic',
        actionUrl: `/alumni/jobs/applications/${application._id}`,
        data: { applicationId: application._id }
      });

      return {
        success: true,
        data: application,
        message: 'Job application submitted successfully'
      };
    } catch (error) {
      throw new Error(`Failed to submit job application: ${error.message}`);
    }
  }

  /**
   * Get job applications for a job posting
   * @param {string} jobId - Job posting ID
   * @param {string} posterId - Job poster ID (for authorization)
   * @param {Object} filters - Filter options
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Job applications
   */
  async getJobApplications(jobId, posterId, filters = {}, pagination = { page: 1, limit: 20 }) {
    try {
      // Verify job posting exists and user is authorized
      const jobPosting = await JobPosting.findById(jobId);
      if (!jobPosting) {
        throw new Error('Job posting not found');
      }

      if (jobPosting.posterId.toString() !== posterId) {
        const user = await User.findById(posterId);
        if (!user || user.role !== 'admin') {
          throw new Error('Unauthorized to view applications for this job');
        }
      }

      const applications = await JobApplication.findByJob(jobId, filters)
        .skip((pagination.page - 1) * pagination.limit)
        .limit(pagination.limit);

      const total = await JobApplication.countDocuments({ 
        jobId, 
        isActive: true,
        ...(filters.status && { status: filters.status })
      });

      return {
        success: true,
        data: {
          applications,
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total,
            pages: Math.ceil(total / pagination.limit)
          }
        }
      };
    } catch (error) {
      throw new Error(`Failed to get job applications: ${error.message}`);
    }
  }

  /**
   * Get applications by applicant
   * @param {string} applicantId - Applicant user ID
   * @param {Object} filters - Filter options
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} User's applications
   */
  async getApplicationsByApplicant(applicantId, filters = {}, pagination = { page: 1, limit: 20 }) {
    try {
      const applications = await JobApplication.findByApplicant(applicantId, filters)
        .skip((pagination.page - 1) * pagination.limit)
        .limit(pagination.limit);

      const total = await JobApplication.countDocuments({ 
        applicantId, 
        isActive: true,
        ...(filters.status && { status: filters.status })
      });

      return {
        success: true,
        data: {
          applications,
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total,
            pages: Math.ceil(total / pagination.limit)
          }
        }
      };
    } catch (error) {
      throw new Error(`Failed to get applications by applicant: ${error.message}`);
    }
  }

  /**
   * Update application status
   * @param {string} applicationId - Application ID
   * @param {string} userId - User ID updating the status
   * @param {string} newStatus - New application status
   * @param {string} feedback - Feedback message
   * @returns {Promise<Object>} Updated application
   */
  async updateApplicationStatus(applicationId, userId, newStatus, feedback = '') {
    try {
      const application = await JobApplication.findById(applicationId)
        .populate('jobId', 'title company posterId')
        .populate('applicantId', 'firstName lastName email');

      if (!application) {
        throw new Error('Application not found');
      }

      // Check authorization
      if (application.jobId.posterId.toString() !== userId) {
        const user = await User.findById(userId);
        if (!user || user.role !== 'admin') {
          throw new Error('Unauthorized to update this application');
        }
      }

      await application.updateStatus(newStatus, userId, feedback);

      if (feedback) {
        application.feedback = feedback;
        await application.save();
      }

      // Send notification to applicant
      const statusMessages = {
        'under_review': 'Your application is now under review',
        'shortlisted': 'Congratulations! You have been shortlisted',
        'interview_scheduled': 'An interview has been scheduled for your application',
        'accepted': 'Congratulations! Your application has been accepted',
        'rejected': 'Your application was not selected this time'
      };

      const notificationType = newStatus === 'accepted' ? 'success' : 
                              newStatus === 'rejected' ? 'info' : 'info';

      await this.notificationService.sendToUser(application.applicantId._id, {
        title: 'Application Status Update',
        message: statusMessages[newStatus] || 'Your application status has been updated',
        type: notificationType,
        category: 'academic',
        actionUrl: `/alumni/jobs/applications/${application._id}`,
        data: { applicationId: application._id, status: newStatus }
      });

      return {
        success: true,
        data: application,
        message: 'Application status updated successfully'
      };
    } catch (error) {
      throw new Error(`Failed to update application status: ${error.message}`);
    }
  }

  /**
   * Schedule interview for application
   * @param {string} applicationId - Application ID
   * @param {string} userId - User ID scheduling the interview
   * @param {Object} interviewData - Interview details
   * @returns {Promise<Object>} Updated application
   */
  async scheduleInterview(applicationId, userId, interviewData) {
    try {
      const application = await JobApplication.findById(applicationId)
        .populate('jobId', 'title company posterId')
        .populate('applicantId', 'firstName lastName email');

      if (!application) {
        throw new Error('Application not found');
      }

      // Check authorization
      if (application.jobId.posterId.toString() !== userId) {
        const user = await User.findById(userId);
        if (!user || user.role !== 'admin') {
          throw new Error('Unauthorized to schedule interview for this application');
        }
      }

      await application.scheduleInterview(interviewData);

      // Send notification to applicant
      await this.notificationService.sendToUser(application.applicantId._id, {
        title: 'Interview Scheduled',
        message: `An interview has been scheduled for your application to ${application.jobId.title}`,
        type: 'info',
        category: 'academic',
        actionUrl: `/alumni/jobs/applications/${application._id}`,
        data: { 
          applicationId: application._id,
          interviewDate: interviewData.date,
          interviewTime: interviewData.time
        }
      });

      return {
        success: true,
        data: application,
        message: 'Interview scheduled successfully'
      };
    } catch (error) {
      throw new Error(`Failed to schedule interview: ${error.message}`);
    }
  }

  /**
   * Withdraw job application
   * @param {string} applicationId - Application ID
   * @param {string} applicantId - Applicant user ID
   * @param {string} reason - Withdrawal reason
   * @returns {Promise<Object>} Updated application
   */
  async withdrawApplication(applicationId, applicantId, reason = '') {
    try {
      const application = await JobApplication.findById(applicationId)
        .populate('jobId', 'title company posterId');

      if (!application) {
        throw new Error('Application not found');
      }

      if (application.applicantId.toString() !== applicantId) {
        throw new Error('Unauthorized to withdraw this application');
      }

      if (application.status === 'withdrawn') {
        throw new Error('Application is already withdrawn');
      }

      await application.withdraw(reason);

      // Send notification to job poster
      await this.notificationService.sendToUser(application.jobId.posterId, {
        title: 'Application Withdrawn',
        message: `An applicant has withdrawn their application for ${application.jobId.title}`,
        type: 'info',
        category: 'academic',
        actionUrl: `/alumni/jobs/${application.jobId._id}/applications`,
        data: { jobId: application.jobId._id, applicationId: application._id }
      });

      return {
        success: true,
        data: application,
        message: 'Application withdrawn successfully'
      };
    } catch (error) {
      throw new Error(`Failed to withdraw application: ${error.message}`);
    }
  }

  /**
   * Track job application (external tracking)
   * @param {string} jobId - Job posting ID
   * @param {string} applicantId - Applicant user ID
   * @param {Object} applicationData - Application tracking data
   * @returns {Promise<Object>} Tracking result
   */
  async trackJobApplication(jobId, applicantId, applicationData = {}) {
    try {
      const jobPosting = await JobPosting.findById(jobId);
      if (!jobPosting) {
        throw new Error('Job posting not found');
      }

      if (!jobPosting.canAcceptApplications) {
        throw new Error('Job posting is not accepting applications');
      }

      // Increment application count
      await jobPosting.incrementApplicationCount();

      return {
        success: true,
        data: {
          jobId,
          applicantId,
          applicationDate: new Date(),
          ...applicationData
        },
        message: 'Job application tracked successfully'
      };
    } catch (error) {
      throw new Error(`Failed to track job application: ${error.message}`);
    }
  }

  /**
   * Build filter query for job search
   * @private
   * @param {Object} filters - Search filters
   * @returns {Object} MongoDB query object
   */
  _buildFilterQuery(filters) {
    const query = {};

    if (filters.status) {
      query.status = filters.status;
    } else {
      // Default to active jobs only
      query.status = 'active';
      query.$or = [
        { applicationDeadline: { $exists: false } },
        { applicationDeadline: { $gte: new Date() } }
      ];
    }

    if (filters.workType) {
      query.workType = filters.workType;
    }

    if (filters.workArrangement) {
      query.workArrangement = filters.workArrangement;
    }

    if (filters.experienceLevel) {
      query.experienceLevel = filters.experienceLevel;
    }

    if (filters.location) {
      query.location = new RegExp(filters.location, 'i');
    }

    if (filters.targetAudience) {
      query.targetAudience = { $in: [filters.targetAudience, 'both'] };
    }

    if (filters.skills && filters.skills.length > 0) {
      query.skills = { $in: filters.skills };
    }

    if (filters.salaryMin || filters.salaryMax) {
      query.$and = query.$and || [];
      if (filters.salaryMin) {
        query.$and.push({
          $or: [
            { 'salaryRange.min': { $gte: filters.salaryMin } },
            { 'salaryRange.max': { $gte: filters.salaryMin } }
          ]
        });
      }
      if (filters.salaryMax) {
        query.$and.push({
          $or: [
            { 'salaryRange.max': { $lte: filters.salaryMax } },
            { 'salaryRange.min': { $lte: filters.salaryMax } }
          ]
        });
      }
    }

    if (filters.company) {
      query.company = new RegExp(filters.company, 'i');
    }

    if (filters.posterId) {
      query.posterId = filters.posterId;
    }

    if (filters.posterType) {
      query.posterType = filters.posterType;
    }

    return query;
  }

  /**
   * Estimate experience level based on graduation year
   * @private
   * @param {number} graduationYear - Graduation year
   * @returns {string} Estimated experience level
   */
  _estimateExperienceLevel(graduationYear) {
    if (!graduationYear) return 'entry';
    
    const currentYear = new Date().getFullYear();
    const yearsExperience = currentYear - graduationYear;

    if (yearsExperience <= 1) return 'entry';
    if (yearsExperience <= 3) return 'junior';
    if (yearsExperience <= 7) return 'mid';
    if (yearsExperience <= 12) return 'senior';
    return 'executive';
  }
}

module.exports = JobService;