const Internship = require('../models/Internship');
const InternshipApplication = require('../models/InternshipApplication');
const Company = require('../models/Company');
const User = require('../models/User');
const NotificationService = require('./NotificationService');

class InternshipService {
  /**
   * Create a new internship opportunity
   * @param {Object} internshipData - Internship details
   * @param {String} createdBy - User ID of creator
   * @returns {Promise<Object>} Created internship
   */
  async createInternship(internshipData, createdBy) {
    try {
      // Validate company exists and is verified
      const company = await Company.findById(internshipData.companyId);
      if (!company) {
        throw new Error('Company not found');
      }
      if (company.verificationStatus !== 'verified') {
        throw new Error('Company must be verified to post internships');
      }
      if (!company.isActive) {
        throw new Error('Company account is inactive');
      }

      // Create internship with creator info
      const internship = new Internship({
        ...internshipData,
        createdBy,
        lastModifiedBy: createdBy
      });

      await internship.save();

      // Update company metrics
      await Company.findByIdAndUpdate(
        internshipData.companyId,
        { $inc: { totalInternships: 1 } }
      );

      return internship.populate('companyId', 'name industry verificationStatus');
    } catch (error) {
      throw new Error(`Failed to create internship: ${error.message}`);
    }
  }

  /**
   * Get internship opportunities with filtering and pagination
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<Object>} Paginated internships
   */
  async getInternships(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search = ''
      } = options;

      // Build query
      let query = { status: 'published' };

      // Apply filters
      if (filters.companyId) {
        query.companyId = filters.companyId;
      }
      if (filters.workArrangement) {
        query.workArrangement = filters.workArrangement;
      }
      if (filters.targetPrograms && filters.targetPrograms.length > 0) {
        query.targetPrograms = { $in: filters.targetPrograms };
      }
      if (filters.yearLevel) {
        query.$or = [
          { yearLevelRequirement: { $exists: false } },
          { yearLevelRequirement: { $lte: filters.yearLevel } }
        ];
      }
      if (filters.minStipend) {
        query.stipend = { $gte: filters.minStipend };
      }
      if (filters.maxDuration) {
        query.duration = { $lte: filters.maxDuration };
      }
      if (filters.location) {
        query.location = { $regex: filters.location, $options: 'i' };
      }

      // Add search functionality
      if (search) {
        query.$text = { $search: search };
      }

      // Only show internships with open applications
      const now = new Date();
      query.applicationDeadline = { $gt: now };
      query.$expr = { $gt: ['$slots', '$filledSlots'] };

      // Execute query with pagination
      const skip = (page - 1) * limit;
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const [internships, total] = await Promise.all([
        Internship.find(query)
          .populate('companyId', 'name industry verificationStatus partnershipLevel')
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean(),
        Internship.countDocuments(query)
      ]);

      return {
        internships,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get internships: ${error.message}`);
    }
  }

  /**
   * Get internship by ID with detailed information
   * @param {String} internshipId - Internship ID
   * @param {String} userId - User ID for view tracking
   * @returns {Promise<Object>} Internship details
   */
  async getInternshipById(internshipId, userId = null) {
    try {
      const internship = await Internship.findById(internshipId)
        .populate('companyId', 'name description industry website address contactPerson verificationStatus partnershipLevel')
        .populate('createdBy', 'firstName lastName');

      if (!internship) {
        throw new Error('Internship not found');
      }

      // Track view if user provided
      if (userId) {
        internship.incrementView();
        await internship.save();
      }

      return internship;
    } catch (error) {
      throw new Error(`Failed to get internship: ${error.message}`);
    }
  }

  /**
   * Update internship details
   * @param {String} internshipId - Internship ID
   * @param {Object} updateData - Update data
   * @param {String} updatedBy - User ID of updater
   * @returns {Promise<Object>} Updated internship
   */
  async updateInternship(internshipId, updateData, updatedBy) {
    try {
      const internship = await Internship.findById(internshipId);
      if (!internship) {
        throw new Error('Internship not found');
      }

      // Check if user has permission to update
      const company = await Company.findById(internship.companyId);
      if (!company) {
        throw new Error('Associated company not found');
      }

      // Update internship
      Object.assign(internship, updateData);
      internship.lastModifiedBy = updatedBy;
      await internship.save();

      return internship.populate('companyId', 'name industry verificationStatus');
    } catch (error) {
      throw new Error(`Failed to update internship: ${error.message}`);
    }
  }

  /**
   * Publish a draft internship
   * @param {String} internshipId - Internship ID
   * @param {String} publishedBy - User ID of publisher
   * @returns {Promise<Object>} Published internship
   */
  async publishInternship(internshipId, publishedBy) {
    try {
      const internship = await Internship.findById(internshipId);
      if (!internship) {
        throw new Error('Internship not found');
      }

      await internship.publish();
      internship.lastModifiedBy = publishedBy;
      await internship.save();

      // Update company active internships count
      await Company.findByIdAndUpdate(
        internship.companyId,
        { $inc: { activeInternships: 1 } }
      );

      return internship.populate('companyId', 'name industry');
    } catch (error) {
      throw new Error(`Failed to publish internship: ${error.message}`);
    }
  }

  /**
   * Close an internship (stop accepting applications)
   * @param {String} internshipId - Internship ID
   * @param {String} closedBy - User ID of closer
   * @returns {Promise<Object>} Closed internship
   */
  async closeInternship(internshipId, closedBy) {
    try {
      const internship = await Internship.findById(internshipId);
      if (!internship) {
        throw new Error('Internship not found');
      }

      await internship.close();
      internship.lastModifiedBy = closedBy;
      await internship.save();

      // Update company active internships count
      await Company.findByIdAndUpdate(
        internship.companyId,
        { $inc: { activeInternships: -1 } }
      );

      // Notify pending applicants
      const pendingApplications = await InternshipApplication.find({
        internshipId,
        status: { $in: ['submitted', 'under_review'] }
      }).populate('studentId', 'email firstName lastName');

      for (const application of pendingApplications) {
        await NotificationService.sendNotification(
          application.studentId._id,
          {
            title: 'Internship Application Closed',
            message: `The internship "${internship.title}" has closed applications.`,
            type: 'info',
            category: 'internship'
          }
        );
      }

      return internship;
    } catch (error) {
      throw new Error(`Failed to close internship: ${error.message}`);
    }
  }

  /**
   * Submit internship application
   * @param {String} internshipId - Internship ID
   * @param {String} studentId - Student ID
   * @param {Object} applicationData - Application details
   * @returns {Promise<Object>} Created application
   */
  async submitApplication(internshipId, studentId, applicationData) {
    try {
      // Validate internship exists and is open
      const internship = await Internship.findById(internshipId);
      if (!internship) {
        throw new Error('Internship not found');
      }
      if (!internship.isApplicationOpen) {
        throw new Error('Applications are closed for this internship');
      }

      // Check if student already applied
      const existingApplication = await InternshipApplication.findOne({
        internshipId,
        studentId
      });
      if (existingApplication) {
        throw new Error('You have already applied for this internship');
      }

      // Get student information
      const student = await User.findById(studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      // Create application
      const application = new InternshipApplication({
        internshipId,
        studentId,
        ...applicationData,
        studentInfo: {
          currentYear: student.yearLevel || applicationData.studentInfo?.currentYear,
          program: student.program || applicationData.studentInfo?.program,
          gpa: applicationData.studentInfo?.gpa,
          expectedGraduation: applicationData.studentInfo?.expectedGraduation,
          skills: applicationData.studentInfo?.skills || [],
          previousExperience: applicationData.studentInfo?.previousExperience
        }
      });

      await application.save();

      // Update internship application count
      internship.incrementApplication();
      await internship.save();

      // Notify company of new application
      const company = await Company.findById(internship.companyId);
      if (company && company.contactPerson.email) {
        await NotificationService.sendNotification(
          null, // No user ID for company notifications
          {
            title: 'New Internship Application',
            message: `${student.firstName} ${student.lastName} has applied for "${internship.title}".`,
            type: 'info',
            category: 'internship'
          },
          { email: company.contactPerson.email }
        );
      }

      return application.populate([
        { path: 'internshipId', select: 'title companyId' },
        { path: 'studentId', select: 'firstName lastName email' }
      ]);
    } catch (error) {
      throw new Error(`Failed to submit application: ${error.message}`);
    }
  }

  /**
   * Get applications for a specific internship
   * @param {String} internshipId - Internship ID
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Applications
   */
  async getInternshipApplications(internshipId, filters = {}) {
    try {
      let query = { internshipId };

      if (filters.status) {
        query.status = filters.status;
      }

      const applications = await InternshipApplication.find(query)
        .populate('studentId', 'firstName lastName email studentId program yearLevel')
        .sort({ submittedAt: -1 });

      return applications;
    } catch (error) {
      throw new Error(`Failed to get applications: ${error.message}`);
    }
  }

  /**
   * Get applications for a specific student
   * @param {String} studentId - Student ID
   * @returns {Promise<Array>} Student applications
   */
  async getStudentApplications(studentId) {
    try {
      const applications = await InternshipApplication.findByStudent(studentId);
      return applications;
    } catch (error) {
      throw new Error(`Failed to get student applications: ${error.message}`);
    }
  }

  /**
   * Update application status
   * @param {String} applicationId - Application ID
   * @param {String} newStatus - New status
   * @param {String} reviewerId - Reviewer ID
   * @param {Object} additionalData - Additional data (notes, feedback, etc.)
   * @returns {Promise<Object>} Updated application
   */
  async updateApplicationStatus(applicationId, newStatus, reviewerId, additionalData = {}) {
    try {
      const application = await InternshipApplication.findById(applicationId)
        .populate('internshipId', 'title companyId startDate')
        .populate('studentId', 'firstName lastName email');

      if (!application) {
        throw new Error('Application not found');
      }

      const oldStatus = application.status;

      // Update application status
      await application.updateStatus(newStatus, reviewerId, additionalData.notes);

      // Handle status-specific actions
      if (newStatus === 'accepted') {
        // Update internship accepted count
        const internship = await Internship.findById(application.internshipId._id);
        internship.incrementAccepted();
        await internship.save();

        // Start internship tracking
        application.internshipStatus = 'not_started';
        await application.save();
      }

      // Send comprehensive notification to student
      const statusNotifications = {
        'under_review': {
          title: 'Application Under Review',
          message: `Your application for "${application.internshipId.title}" is now being reviewed by the company.`,
          type: 'info',
          actionUrl: `/portal/student/internships/applications/${applicationId}`
        },
        'shortlisted': {
          title: 'Application Shortlisted',
          message: `Great news! You have been shortlisted for "${application.internshipId.title}". The company will contact you soon.`,
          type: 'success',
          actionUrl: `/portal/student/internships/applications/${applicationId}`
        },
        'interview_scheduled': {
          title: 'Interview Scheduled',
          message: `An interview has been scheduled for your application to "${application.internshipId.title}". Check your application for details.`,
          type: 'info',
          priority: 'high',
          actionUrl: `/portal/student/internships/applications/${applicationId}`
        },
        'accepted': {
          title: 'Application Accepted!',
          message: `Congratulations! Your application for "${application.internshipId.title}" has been accepted. Your internship starts on ${new Date(application.internshipId.startDate).toLocaleDateString()}.`,
          type: 'success',
          priority: 'high',
          actionUrl: `/portal/student/internships/applications/${applicationId}`
        },
        'rejected': {
          title: 'Application Update',
          message: `Thank you for your interest in "${application.internshipId.title}". Unfortunately, your application was not selected at this time.`,
          type: 'warning',
          actionUrl: `/portal/student/internships`
        },
        'interview_completed': {
          title: 'Interview Completed',
          message: `Your interview for "${application.internshipId.title}" has been marked as completed. You will be notified of the final decision soon.`,
          type: 'info',
          actionUrl: `/portal/student/internships/applications/${applicationId}`
        }
      };

      if (statusNotifications[newStatus]) {
        const notification = statusNotifications[newStatus];
        await NotificationService.sendToUser(
          application.studentId._id,
          {
            ...notification,
            category: 'internship',
            data: {
              applicationId: application._id,
              internshipId: application.internshipId._id,
              oldStatus,
              newStatus,
              feedback: additionalData.feedback
            }
          },
          ['web', 'email', 'push']
        );
      }

      return application;
    } catch (error) {
      throw new Error(`Failed to update application status: ${error.message}`);
    }
  }

  /**
   * Schedule interview for application
   * @param {String} applicationId - Application ID
   * @param {Object} interviewDetails - Interview scheduling details
   * @returns {Promise<Object>} Updated application
   */
  async scheduleInterview(applicationId, interviewDetails) {
    try {
      const application = await InternshipApplication.findById(applicationId)
        .populate('studentId', 'firstName lastName email')
        .populate('internshipId', 'title companyId');

      if (!application) {
        throw new Error('Application not found');
      }

      await application.scheduleInterview(interviewDetails);

      // Get company information
      const company = await Company.findById(application.internshipId.companyId);

      // Format interview details for notification
      const interviewDate = new Date(interviewDetails.date);
      const dateStr = interviewDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const timeStr = interviewDetails.time || 'TBD';
      const typeStr = interviewDetails.type === 'video_call' ? 'Video Call' : 
                      interviewDetails.type === 'phone' ? 'Phone Interview' : 
                      'In-Person Interview';

      // Send detailed notification to student
      await NotificationService.sendToUser(
        application.studentId._id,
        {
          title: 'Interview Scheduled',
          message: `Your interview for "${application.internshipId.title}" at ${company?.name || 'the company'} has been scheduled for ${dateStr} at ${timeStr}. Type: ${typeStr}.`,
          type: 'info',
          category: 'internship',
          priority: 'high',
          actionUrl: `/portal/student/internships/applications/${applicationId}`,
          data: {
            applicationId: application._id,
            internshipId: application.internshipId._id,
            interviewDate: interviewDetails.date,
            interviewTime: interviewDetails.time,
            interviewType: interviewDetails.type,
            location: interviewDetails.location,
            meetingLink: interviewDetails.meetingLink,
            interviewerName: interviewDetails.interviewerName
          }
        },
        ['web', 'email', 'sms', 'push']
      );

      // Schedule reminder notification 24 hours before interview
      const reminderTime = new Date(interviewDetails.date);
      reminderTime.setHours(reminderTime.getHours() - 24);
      
      if (reminderTime > new Date()) {
        await NotificationService.scheduleNotification(
          application.studentId._id,
          {
            title: 'Interview Reminder',
            message: `Reminder: Your interview for "${application.internshipId.title}" is tomorrow at ${timeStr}. ${interviewDetails.type === 'video_call' ? 'Make sure to test your equipment.' : 'Please arrive 10 minutes early.'}`,
            type: 'reminder',
            category: 'internship',
            priority: 'high',
            actionUrl: `/portal/student/internships/applications/${applicationId}`,
            data: {
              applicationId: application._id,
              interviewDate: interviewDetails.date,
              interviewTime: interviewDetails.time,
              meetingLink: interviewDetails.meetingLink
            }
          },
          reminderTime,
          ['web', 'email', 'push']
        );
      }

      return application;
    } catch (error) {
      throw new Error(`Failed to schedule interview: ${error.message}`);
    }
  }

  /**
   * Track internship progress
   * @param {String} applicationId - Application ID
   * @param {Object} progressData - Progress tracking data
   * @param {String} updatedBy - User ID of updater
   * @returns {Promise<Object>} Updated application
   */
  async trackProgress(applicationId, progressData, updatedBy) {
    try {
      const application = await InternshipApplication.findById(applicationId)
        .populate('studentId', 'firstName lastName email')
        .populate('internshipId', 'title companyId');

      if (!application) {
        throw new Error('Application not found');
      }

      // Add progress entry
      application.progressTracking.push({
        ...progressData,
        updatedBy
      });

      // Update last progress report date
      application.lastProgressReport = new Date();

      await application.save();

      // Send progress update notification to student
      await NotificationService.sendToUser(
        application.studentId._id,
        {
          title: 'Internship Progress Updated',
          message: `Your progress for "${application.internshipId.title}" has been updated. Milestone: ${progressData.milestone}`,
          type: 'info',
          category: 'internship',
          actionUrl: `/portal/student/internships/applications/${applicationId}`,
          data: {
            applicationId: application._id,
            milestone: progressData.milestone,
            completionPercentage: progressData.completionPercentage,
            supervisorNotes: progressData.supervisorNotes
          }
        },
        ['web', 'push']
      );

      return application.populate([
        { path: 'studentId', select: 'firstName lastName email' },
        { path: 'internshipId', select: 'title companyId' }
      ]);
    } catch (error) {
      throw new Error(`Failed to track progress: ${error.message}`);
    }
  }

  /**
   * Submit evaluation for internship
   * @param {String} applicationId - Application ID
   * @param {Object} evaluationData - Evaluation data
   * @param {String} evaluatorId - Evaluator ID
   * @returns {Promise<Object>} Updated application
   */
  async submitEvaluation(applicationId, evaluationData, evaluatorId) {
    try {
      const application = await InternshipApplication.findById(applicationId)
        .populate('studentId', 'firstName lastName email')
        .populate('internshipId', 'title');

      if (!application) {
        throw new Error('Application not found');
      }

      // Calculate overall rating
      const ratings = evaluationData.ratings;
      const overallRating = (
        ratings.technicalSkills +
        ratings.communication +
        ratings.teamwork +
        ratings.initiative +
        ratings.reliability +
        ratings.overallPerformance
      ) / 6;

      // Add evaluation
      application.evaluations.push({
        ...evaluationData,
        evaluatorId,
        overallRating: Math.round(overallRating * 10) / 10
      });

      await application.save();

      // Send evaluation notification to student
      const evaluatorType = evaluationData.evaluatorType === 'company' ? 'Company' : 
                           evaluationData.evaluatorType === 'school' ? 'School' : 'Peer';
      const period = evaluationData.period.charAt(0).toUpperCase() + evaluationData.period.slice(1);

      await NotificationService.sendToUser(
        application.studentId._id,
        {
          title: 'Internship Evaluation Received',
          message: `You have received a ${period} evaluation from ${evaluatorType} for your internship at "${application.internshipId.title}". Overall rating: ${overallRating.toFixed(1)}/5.0`,
          type: 'info',
          category: 'internship',
          actionUrl: `/portal/student/internships/applications/${applicationId}`,
          data: {
            applicationId: application._id,
            evaluatorType: evaluationData.evaluatorType,
            period: evaluationData.period,
            overallRating: overallRating
          }
        },
        ['web', 'email', 'push']
      );

      return application;
    } catch (error) {
      throw new Error(`Failed to submit evaluation: ${error.message}`);
    }
  }

  /**
   * Complete internship
   * @param {String} applicationId - Application ID
   * @param {Object} completionData - Completion data
   * @returns {Promise<Object>} Updated application
   */
  async completeInternship(applicationId, completionData) {
    try {
      const application = await InternshipApplication.findById(applicationId)
        .populate('studentId', 'firstName lastName email')
        .populate('internshipId', 'title companyId duration');

      if (!application) {
        throw new Error('Application not found');
      }

      // Update internship status
      application.internshipStatus = 'completed';
      application.completedAt = new Date();
      if (completionData.finalRating) {
        application.finalRating = completionData.finalRating;
      }

      await application.save();

      // Update company metrics
      await Company.findByIdAndUpdate(
        application.internshipId.companyId,
        { $inc: { completedInternships: 1 } }
      );

      // Send comprehensive completion notification
      const durationWeeks = application.internshipId.duration;
      const durationDisplay = durationWeeks < 4 ? `${durationWeeks} weeks` : 
                             `${Math.floor(durationWeeks / 4)} months`;

      await NotificationService.sendToUser(
        application.studentId._id,
        {
          title: 'Internship Completed!',
          message: `Congratulations! You have successfully completed your ${durationDisplay} internship at "${application.internshipId.title}". ${completionData.finalRating ? `Final rating: ${completionData.finalRating}/5.0` : ''}`,
          type: 'success',
          category: 'internship',
          priority: 'high',
          actionUrl: `/portal/student/internships/applications/${applicationId}`,
          data: {
            applicationId: application._id,
            internshipId: application.internshipId._id,
            completedAt: application.completedAt,
            finalRating: completionData.finalRating,
            duration: durationWeeks
          }
        },
        ['web', 'email', 'push']
      );

      return application;
    } catch (error) {
      throw new Error(`Failed to complete internship: ${error.message}`);
    }
  }

  /**
   * Get candidate recommendations for an internship
   * @param {String} internshipId - Internship ID
   * @param {Object} matchingCriteria - Matching criteria
   * @returns {Promise<Array>} Recommended candidates
   */
  async getCandidateRecommendations(internshipId, matchingCriteria = {}) {
    try {
      const CandidateMatchingService = require('./CandidateMatchingService');
      return await CandidateMatchingService.matchCandidatesForInternship(internshipId, matchingCriteria);
    } catch (error) {
      throw new Error(`Failed to get candidate recommendations: ${error.message}`);
    }
  }

  /**
   * Get internship recommendations for a student
   * @param {String} studentId - Student ID
   * @param {Object} preferences - Student preferences
   * @returns {Promise<Array>} Recommended internships
   */
  async getInternshipRecommendations(studentId, preferences = {}) {
    try {
      const CandidateMatchingService = require('./CandidateMatchingService');
      return await CandidateMatchingService.findInternshipsForStudent(studentId, preferences);
    } catch (error) {
      throw new Error(`Failed to get internship recommendations: ${error.message}`);
    }
  }

  /**
   * Get application workflow status and next steps
   * @param {String} applicationId - Application ID
   * @returns {Promise<Object>} Workflow information
   */
  async getApplicationWorkflow(applicationId) {
    try {
      const CandidateMatchingService = require('./CandidateMatchingService');
      const application = await InternshipApplication.findById(applicationId)
        .populate('internshipId', 'title startDate endDate')
        .populate('studentId', 'firstName lastName email');

      if (!application) {
        throw new Error('Application not found');
      }

      const recommendations = await CandidateMatchingService.getApplicationWorkflowRecommendations(applicationId);
      
      return {
        application: {
          id: application._id,
          status: application.status,
          statusDisplay: application.statusDisplay,
          submittedAt: application.submittedAt,
          internship: application.internshipId,
          student: application.studentId
        },
        workflow: recommendations,
        timeline: this.getApplicationTimeline(application)
      };
    } catch (error) {
      throw new Error(`Failed to get application workflow: ${error.message}`);
    }
  }

  /**
   * Get application timeline with status history
   * @param {Object} application - Application object
   * @returns {Array} Timeline events
   */
  getApplicationTimeline(application) {
    const timeline = [];

    timeline.push({
      status: 'submitted',
      date: application.submittedAt,
      title: 'Application Submitted',
      description: 'Your application has been successfully submitted',
      completed: true
    });

    if (application.reviewedAt) {
      timeline.push({
        status: 'under_review',
        date: application.reviewedAt,
        title: 'Under Review',
        description: 'Application is being reviewed by the company',
        completed: true
      });
    }

    if (application.interviewScheduledAt) {
      timeline.push({
        status: 'interview_scheduled',
        date: application.interviewScheduledAt,
        title: 'Interview Scheduled',
        description: 'Interview has been scheduled',
        completed: true
      });
    }

    if (application.interviewCompletedAt) {
      timeline.push({
        status: 'interview_completed',
        date: application.interviewCompletedAt,
        title: 'Interview Completed',
        description: 'Interview process completed',
        completed: true
      });
    }

    if (application.finalDecisionAt) {
      timeline.push({
        status: application.status,
        date: application.finalDecisionAt,
        title: application.status === 'accepted' ? 'Application Accepted' : 'Application Decision',
        description: application.status === 'accepted' ? 
          'Congratulations! Your application has been accepted' : 
          'Final decision has been made on your application',
        completed: true
      });
    }

    return timeline;
  }

  /**
   * Bulk update application statuses
   * @param {Array} applicationIds - Array of application IDs
   * @param {String} newStatus - New status to set
   * @param {String} reviewerId - Reviewer ID
   * @param {Object} additionalData - Additional data
   * @returns {Promise<Object>} Update results
   */
  async bulkUpdateApplicationStatus(applicationIds, newStatus, reviewerId, additionalData = {}) {
    try {
      const results = {
        successful: [],
        failed: []
      };

      for (const applicationId of applicationIds) {
        try {
          const updatedApplication = await this.updateApplicationStatus(
            applicationId, 
            newStatus, 
            reviewerId, 
            additionalData
          );
          results.successful.push({
            applicationId,
            application: updatedApplication
          });
        } catch (error) {
          results.failed.push({
            applicationId,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to bulk update applications: ${error.message}`);
    }
  }

  /**
   * Get internship analytics and statistics
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Object>} Analytics data
   */
  async getAnalytics(filters = {}) {
    try {
      const matchStage = {};
      
      if (filters.companyId) {
        matchStage.companyId = filters.companyId;
      }
      if (filters.startDate && filters.endDate) {
        matchStage.createdAt = {
          $gte: new Date(filters.startDate),
          $lte: new Date(filters.endDate)
        };
      }

      const [
        totalInternships,
        activeInternships,
        totalApplications,
        acceptedApplications,
        completedInternships
      ] = await Promise.all([
        Internship.countDocuments(matchStage),
        Internship.countDocuments({ ...matchStage, status: 'published' }),
        InternshipApplication.countDocuments(filters.companyId ? {
          internshipId: { $in: await Internship.find(matchStage).distinct('_id') }
        } : {}),
        InternshipApplication.countDocuments({
          status: 'accepted',
          ...(filters.companyId ? {
            internshipId: { $in: await Internship.find(matchStage).distinct('_id') }
          } : {})
        }),
        InternshipApplication.countDocuments({
          internshipStatus: 'completed',
          ...(filters.companyId ? {
            internshipId: { $in: await Internship.find(matchStage).distinct('_id') }
          } : {})
        })
      ]);

      // Calculate rates
      const applicationRate = totalInternships > 0 ? (totalApplications / totalInternships) : 0;
      const acceptanceRate = totalApplications > 0 ? (acceptedApplications / totalApplications) : 0;
      const completionRate = acceptedApplications > 0 ? (completedInternships / acceptedApplications) : 0;

      return {
        totals: {
          internships: totalInternships,
          activeInternships,
          applications: totalApplications,
          acceptedApplications,
          completedInternships
        },
        rates: {
          applicationRate: Math.round(applicationRate * 100) / 100,
          acceptanceRate: Math.round(acceptanceRate * 100) / 100,
          completionRate: Math.round(completionRate * 100) / 100
        }
      };
    } catch (error) {
      throw new Error(`Failed to get analytics: ${error.message}`);
    }
  }

  /**
   * Get expiring internships for reminder notifications
   * @param {Number} days - Days before expiration
   * @returns {Promise<Array>} Expiring internships
   */
  async getExpiringInternships(days = 7) {
    try {
      return await Internship.findExpiringSoon(days);
    } catch (error) {
      throw new Error(`Failed to get expiring internships: ${error.message}`);
    }
  }

  /**
   * Auto-close expired internships
   * @returns {Promise<Number>} Number of closed internships
   */
  async autoCloseExpiredInternships() {
    try {
      const expiredInternships = await Internship.find({
        status: 'published',
        applicationDeadline: { $lt: new Date() }
      });

      let closedCount = 0;
      for (const internship of expiredInternships) {
        await internship.close();
        closedCount++;
      }

      return closedCount;
    } catch (error) {
      throw new Error(`Failed to auto-close expired internships: ${error.message}`);
    }
  }

  /**
   * Send application deadline reminders
   * @param {Number} daysBeforeDeadline - Days before deadline to send reminder
   * @returns {Promise<Object>} Reminder results
   */
  async sendDeadlineReminders(daysBeforeDeadline = 3) {
    try {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + daysBeforeDeadline);
      
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Find internships with deadlines approaching
      const expiringInternships = await Internship.find({
        status: 'published',
        applicationDeadline: {
          $gte: targetDate,
          $lte: endOfDay
        }
      }).populate('companyId', 'name');

      let remindersSent = 0;

      for (const internship of expiringInternships) {
        // Find students who viewed but haven't applied
        const applications = await InternshipApplication.find({
          internshipId: internship._id
        }).distinct('studentId');

        // For now, we'll send to all active students
        // In a real system, you'd track views and target those users
        const deadlineDate = new Date(internship.applicationDeadline);
        const dateStr = deadlineDate.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });

        // Send to students who haven't applied (this is a simplified version)
        // In production, you'd want to track interested students
        const message = daysBeforeDeadline === 1 ? 
          `Last chance! The application deadline for "${internship.title}" at ${internship.companyId.name} is tomorrow (${dateStr}).` :
          `Reminder: The application deadline for "${internship.title}" at ${internship.companyId.name} is in ${daysBeforeDeadline} days (${dateStr}).`;

        // For demonstration, we'll just log this
        // In production, you'd send to targeted users
        console.log(`Deadline reminder for internship ${internship._id}: ${message}`);
        remindersSent++;
      }

      return {
        success: true,
        internshipsProcessed: expiringInternships.length,
        remindersSent
      };
    } catch (error) {
      throw new Error(`Failed to send deadline reminders: ${error.message}`);
    }
  }

  /**
   * Send progress report reminders to students
   * @param {Number} daysSinceLastReport - Days since last progress report
   * @returns {Promise<Object>} Reminder results
   */
  async sendProgressReportReminders(daysSinceLastReport = 14) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysSinceLastReport);

      // Find active internships that need progress reports
      const applications = await InternshipApplication.find({
        internshipStatus: 'in_progress',
        $or: [
          { lastProgressReport: { $lt: cutoffDate } },
          { lastProgressReport: { $exists: false } }
        ]
      })
        .populate('studentId', 'firstName lastName email')
        .populate('internshipId', 'title companyId');

      let remindersSent = 0;

      for (const application of applications) {
        const daysSince = application.lastProgressReport ? 
          Math.floor((Date.now() - application.lastProgressReport.getTime()) / (1000 * 60 * 60 * 24)) :
          'never';

        await NotificationService.sendToUser(
          application.studentId._id,
          {
            title: 'Progress Report Reminder',
            message: `Please submit a progress report for your internship at "${application.internshipId.title}". ${daysSince === 'never' ? 'No reports submitted yet.' : `Last report was ${daysSince} days ago.`}`,
            type: 'reminder',
            category: 'internship',
            priority: 'medium',
            actionUrl: `/portal/student/internships/applications/${application._id}`,
            data: {
              applicationId: application._id,
              internshipId: application.internshipId._id,
              daysSinceLastReport: daysSince
            }
          },
          ['web', 'email', 'push']
        );

        remindersSent++;
      }

      return {
        success: true,
        applicationsProcessed: applications.length,
        remindersSent
      };
    } catch (error) {
      throw new Error(`Failed to send progress report reminders: ${error.message}`);
    }
  }

  /**
   * Send evaluation reminders to companies and supervisors
   * @returns {Promise<Object>} Reminder results
   */
  async sendEvaluationReminders() {
    try {
      // Find internships nearing completion that need evaluations
      const now = new Date();
      const twoWeeksFromNow = new Date();
      twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

      const applications = await InternshipApplication.find({
        internshipStatus: 'in_progress',
        'evaluations.0': { $exists: false } // No evaluations yet
      })
        .populate('studentId', 'firstName lastName email')
        .populate('internshipId', 'title companyId endDate');

      let remindersSent = 0;

      for (const application of applications) {
        const endDate = new Date(application.internshipId.endDate);
        
        // Send reminder if internship ends within 2 weeks
        if (endDate <= twoWeeksFromNow && endDate >= now) {
          const daysUntilEnd = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          // Get company contact
          const company = await Company.findById(application.internshipId.companyId);
          
          if (company && company.contactPerson.email) {
            // In a real system, you'd send to the company supervisor
            // For now, we'll send to the student as a notification
            await NotificationService.sendToUser(
              application.studentId._id,
              {
                title: 'Evaluation Reminder',
                message: `Your internship at "${application.internshipId.title}" ends in ${daysUntilEnd} days. Please remind your supervisor to submit an evaluation.`,
                type: 'reminder',
                category: 'internship',
                priority: 'medium',
                actionUrl: `/portal/student/internships/applications/${application._id}`,
                data: {
                  applicationId: application._id,
                  daysUntilEnd
                }
              },
              ['web', 'push']
            );

            remindersSent++;
          }
        }
      }

      return {
        success: true,
        applicationsProcessed: applications.length,
        remindersSent
      };
    } catch (error) {
      throw new Error(`Failed to send evaluation reminders: ${error.message}`);
    }
  }

  /**
   * Send internship start reminders
   * @param {Number} daysBeforeStart - Days before start date to send reminder
   * @returns {Promise<Object>} Reminder results
   */
  async sendStartReminders(daysBeforeStart = 3) {
    try {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + daysBeforeStart);
      
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Find accepted applications with upcoming start dates
      const applications = await InternshipApplication.find({
        status: 'accepted',
        internshipStatus: 'not_started'
      })
        .populate('studentId', 'firstName lastName email')
        .populate('internshipId', 'title companyId startDate location workArrangement');

      let remindersSent = 0;

      for (const application of applications) {
        const startDate = new Date(application.internshipId.startDate);
        
        // Check if start date matches our target
        if (startDate >= targetDate && startDate <= endOfDay) {
          const company = await Company.findById(application.internshipId.companyId);
          const dateStr = startDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          });

          const message = daysBeforeStart === 1 ?
            `Your internship at "${application.internshipId.title}" starts tomorrow (${dateStr})! ${application.internshipId.workArrangement === 'remote' ? 'Check your email for remote access details.' : `Location: ${application.internshipId.location}`}` :
            `Reminder: Your internship at "${application.internshipId.title}" starts in ${daysBeforeStart} days (${dateStr}). ${application.internshipId.workArrangement === 'remote' ? 'You will receive remote access details soon.' : 'Please plan your commute accordingly.'}`;

          await NotificationService.sendToUser(
            application.studentId._id,
            {
              title: 'Internship Starting Soon',
              message,
              type: 'reminder',
              category: 'internship',
              priority: 'high',
              actionUrl: `/portal/student/internships/applications/${application._id}`,
              data: {
                applicationId: application._id,
                internshipId: application.internshipId._id,
                startDate: application.internshipId.startDate,
                location: application.internshipId.location,
                workArrangement: application.internshipId.workArrangement,
                companyName: company?.name
              }
            },
            ['web', 'email', 'sms', 'push']
          );

          remindersSent++;
        }
      }

      return {
        success: true,
        applicationsProcessed: applications.length,
        remindersSent
      };
    } catch (error) {
      throw new Error(`Failed to send start reminders: ${error.message}`);
    }
  }
}

module.exports = new InternshipService();