const InternshipApplication = require('../models/InternshipApplication');
const Internship = require('../models/Internship');
const User = require('../models/User');
const Company = require('../models/Company');
const NotificationService = require('./NotificationService');

class ApplicationTrackingService {
  /**
   * Enhanced application submission with workflow automation
   * @param {String} internshipId - Internship ID
   * @param {String} studentId - Student ID
   * @param {Object} applicationData - Application data
   * @returns {Promise<Object>} Enhanced application result
   */
  async submitApplicationWithWorkflow(internshipId, studentId, applicationData) {
    try {
      // Validate internship and student
      const [internship, student] = await Promise.all([
        Internship.findById(internshipId).populate('companyId'),
        User.findById(studentId)
      ]);

      if (!internship) {
        throw new Error('Internship not found');
      }

      if (!student) {
        throw new Error('Student not found');
      }

      if (!internship.isApplicationOpen) {
        throw new Error('Applications are closed for this internship');
      }

      // Check for existing application
      const existingApplication = await InternshipApplication.findOne({
        internshipId,
        studentId
      });

      if (existingApplication) {
        throw new Error('You have already applied for this internship');
      }

      // Create application with enhanced tracking
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
        },
        applicationSource: 'portal'
      });

      await application.save();

      // Update internship application count
      await Internship.findByIdAndUpdate(
        internshipId,
        { $inc: { applicationCount: 1 } }
      );

      // Start workflow automation
      const workflowResult = await this.initiateApplicationWorkflow(application._id);

      return {
        application: await application.populate([
          { path: 'internshipId', select: 'title companyId startDate endDate' },
          { path: 'studentId', select: 'firstName lastName email' }
        ]),
        workflow: workflowResult
      };
    } catch (error) {
      throw new Error(`Failed to submit application: ${error.message}`);
    }
  }

  /**
   * Initiate automated application workflow
   * @param {String} applicationId - Application ID
   * @returns {Promise<Object>} Workflow initiation result
   */
  async initiateApplicationWorkflow(applicationId) {
    try {
      const application = await InternshipApplication.findById(applicationId)
        .populate('studentId', 'firstName lastName email')
        .populate({
          path: 'internshipId',
          populate: {
            path: 'companyId',
            select: 'name contactPerson'
          }
        });

      const workflow = {
        applicationId,
        status: 'initiated',
        automatedActions: [],
        scheduledReminders: []
      };

      // Send immediate confirmation to student
      await NotificationService.sendNotification(
        application.studentId._id,
        {
          title: 'Application Submitted Successfully',
          message: `Your application for "${application.internshipId.title}" has been submitted and is under review.`,
          type: 'success',
          category: 'internship',
          actionUrl: `/internships/applications/${applicationId}`
        }
      );
      workflow.automatedActions.push('student_confirmation_sent');

      // Notify company immediately
      if (application.internshipId.companyId.contactPerson?.email) {
        await NotificationService.sendNotification(
          null,
          {
            title: 'New Internship Application',
            message: `${application.studentId.firstName} ${application.studentId.lastName} has applied for "${application.internshipId.title}".`,
            type: 'info',
            category: 'internship',
            actionUrl: `/company/applications/${applicationId}`
          },
          { email: application.internshipId.companyId.contactPerson.email }
        );
        workflow.automatedActions.push('company_notification_sent');
      }

      // Schedule follow-up reminders
      await this.scheduleApplicationReminders(applicationId);
      workflow.scheduledReminders.push('3_day_review_reminder', '7_day_review_reminder');

      // Auto-assign to review queue
      await this.addToReviewQueue(applicationId);
      workflow.automatedActions.push('added_to_review_queue');

      return workflow;
    } catch (error) {
      throw new Error(`Failed to initiate workflow: ${error.message}`);
    }
  }

  /**
   * Enhanced company application review with automated workflows
   * @param {String} companyId - Company ID
   * @param {Object} filters - Filter options
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Enhanced review dashboard
   */
  async getCompanyReviewDashboard(companyId, filters = {}, options = {}) {
    try {
      const company = await Company.findById(companyId);
      if (!company) {
        throw new Error('Company not found');
      }

      // Get company internships
      const internshipIds = await Internship.find({ companyId }).distinct('_id');

      // Build application query
      let applicationQuery = { internshipId: { $in: internshipIds } };
      
      if (filters.status) {
        applicationQuery.status = filters.status;
      }
      if (filters.internshipId) {
        applicationQuery.internshipId = filters.internshipId;
      }
      if (filters.priority) {
        applicationQuery.priority = filters.priority;
      }
      if (filters.dateFrom) {
        applicationQuery.submittedAt = { $gte: new Date(filters.dateFrom) };
      }
      if (filters.dateTo) {
        applicationQuery.submittedAt = { 
          ...applicationQuery.submittedAt,
          $lte: new Date(filters.dateTo) 
        };
      }

      // Pagination
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;

      // Get applications with enhanced data
      const [applications, totalApplications] = await Promise.all([
        InternshipApplication.find(applicationQuery)
          .populate('studentId', 'firstName lastName email program yearLevel gpa')
          .populate('internshipId', 'title startDate endDate duration')
          .sort(this.buildSortQuery(filters.sortBy, filters.sortOrder))
          .skip(skip)
          .limit(limit),
        InternshipApplication.countDocuments(applicationQuery)
      ]);

      // Enhance applications with workflow data
      const enhancedApplications = await Promise.all(
        applications.map(app => this.enhanceApplicationWithWorkflowData(app))
      );

      // Get review statistics
      const reviewStats = await this.getReviewStatistics(internshipIds);

      // Get priority applications (urgent review needed)
      const priorityApplications = await this.getPriorityApplications(internshipIds);

      // Get review recommendations
      const recommendations = await this.getReviewRecommendations(companyId);

      return {
        applications: enhancedApplications,
        pagination: {
          page,
          limit,
          total: totalApplications,
          pages: Math.ceil(totalApplications / limit)
        },
        statistics: reviewStats,
        priorityApplications,
        recommendations,
        filters: filters
      };
    } catch (error) {
      throw new Error(`Failed to get review dashboard: ${error.message}`);
    }
  }

  /**
   * Enhanced progress tracking with milestone automation
   * @param {String} applicationId - Application ID
   * @param {Object} progressData - Progress data
   * @param {String} updatedBy - User ID of updater
   * @returns {Promise<Object>} Enhanced progress result
   */
  async trackProgressWithMilestones(applicationId, progressData, updatedBy) {
    try {
      const application = await InternshipApplication.findById(applicationId)
        .populate('studentId', 'firstName lastName email')
        .populate('internshipId', 'title duration companyId');

      if (!application) {
        throw new Error('Application not found');
      }

      if (application.internshipStatus !== 'in_progress') {
        throw new Error('Internship must be in progress to track progress');
      }

      // Create progress entry with enhanced data
      const progressEntry = {
        date: new Date(),
        milestone: progressData.milestone,
        description: progressData.description,
        completionPercentage: progressData.completionPercentage || 0,
        supervisorNotes: progressData.supervisorNotes,
        studentReflection: progressData.studentReflection,
        attachments: progressData.attachments || [],
        updatedBy
      };

      application.progressTracking.push(progressEntry);
      application.lastProgressReport = new Date();

      // Calculate overall progress
      const overallProgress = this.calculateOverallProgress(application);

      // Check for milestone achievements
      const milestoneAchievements = await this.checkMilestoneAchievements(
        application, 
        progressData.completionPercentage
      );

      // Auto-generate next milestone suggestions
      const nextMilestones = await this.generateNextMilestoneSuggestions(application);

      // Send automated notifications
      const notifications = await this.sendProgressNotifications(
        application, 
        progressEntry, 
        milestoneAchievements
      );

      await application.save();

      return {
        applicationId,
        progressEntry,
        overallProgress,
        milestoneAchievements,
        nextMilestones,
        notifications,
        totalProgressReports: application.progressTracking.length
      };
    } catch (error) {
      throw new Error(`Failed to track progress: ${error.message}`);
    }
  }

  /**
   * Automated reminder system
   * @param {String} type - Reminder type
   * @returns {Promise<Object>} Reminder results
   */
  async sendAutomatedReminders(type = 'all') {
    try {
      const results = {
        type,
        sent: 0,
        failed: 0,
        details: []
      };

      switch (type) {
        case 'application_review':
          await this.sendApplicationReviewReminders(results);
          break;
        case 'progress_reports':
          await this.sendProgressReportReminders(results);
          break;
        case 'milestone_deadlines':
          await this.sendMilestoneDeadlineReminders(results);
          break;
        case 'evaluation_due':
          await this.sendEvaluationDueReminders(results);
          break;
        case 'all':
          await this.sendApplicationReviewReminders(results);
          await this.sendProgressReportReminders(results);
          await this.sendMilestoneDeadlineReminders(results);
          await this.sendEvaluationDueReminders(results);
          break;
        default:
          throw new Error(`Unknown reminder type: ${type}`);
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to send automated reminders: ${error.message}`);
    }
  }

  /**
   * Enhance application with workflow data
   * @param {Object} application - Application object
   * @returns {Promise<Object>} Enhanced application
   */
  async enhanceApplicationWithWorkflowData(application) {
    const enhanced = application.toObject();

    // Add workflow status
    enhanced.workflowStatus = this.getWorkflowStatus(application);

    // Add priority level
    enhanced.priorityLevel = this.calculatePriorityLevel(application);

    // Add time metrics
    enhanced.timeMetrics = this.calculateTimeMetrics(application);

    // Add next actions
    enhanced.nextActions = this.getNextActions(application);

    // Add compatibility score (if student data available)
    if (application.studentId) {
      enhanced.compatibilityScore = await this.calculateCompatibilityScore(
        application.internshipId, 
        application.studentId
      );
    }

    return enhanced;
  }

  /**
   * Get workflow status for application
   * @param {Object} application - Application object
   * @returns {Object} Workflow status
   */
  getWorkflowStatus(application) {
    const now = new Date();
    const submittedDaysAgo = Math.floor((now - application.submittedAt) / (1000 * 60 * 60 * 24));

    let status = 'on_track';
    let message = 'Application is progressing normally';

    if (application.status === 'submitted' && submittedDaysAgo > 5) {
      status = 'delayed';
      message = 'Application review is overdue';
    } else if (application.status === 'under_review' && submittedDaysAgo > 10) {
      status = 'critical';
      message = 'Application has been under review for too long';
    } else if (application.status === 'interview_scheduled') {
      const interviewDate = new Date(application.interviewSchedule?.date);
      if (interviewDate < now) {
        status = 'action_required';
        message = 'Interview date has passed - status update needed';
      }
    }

    return { status, message, daysInCurrentStatus: submittedDaysAgo };
  }

  /**
   * Calculate priority level for application
   * @param {Object} application - Application object
   * @returns {String} Priority level
   */
  calculatePriorityLevel(application) {
    let score = 0;

    // Time-based priority
    const daysOld = Math.floor((Date.now() - application.submittedAt) / (1000 * 60 * 60 * 24));
    if (daysOld > 7) score += 3;
    else if (daysOld > 3) score += 2;
    else score += 1;

    // Status-based priority
    if (application.status === 'submitted') score += 2;
    if (application.status === 'interview_scheduled') score += 3;

    // Student quality indicators
    if (application.studentInfo?.gpa >= 3.5) score += 1;
    if (application.studentInfo?.skills?.length > 5) score += 1;

    if (score >= 6) return 'high';
    if (score >= 4) return 'medium';
    return 'low';
  }

  /**
   * Calculate time metrics for application
   * @param {Object} application - Application object
   * @returns {Object} Time metrics
   */
  calculateTimeMetrics(application) {
    const now = new Date();
    const submitted = application.submittedAt;

    const metrics = {
      totalDays: Math.floor((now - submitted) / (1000 * 60 * 60 * 24)),
      daysInCurrentStatus: Math.floor((now - (application.reviewedAt || submitted)) / (1000 * 60 * 60 * 24))
    };

    if (application.reviewedAt) {
      metrics.timeToReview = Math.floor((application.reviewedAt - submitted) / (1000 * 60 * 60 * 24));
    }

    if (application.finalDecisionAt) {
      metrics.timeToDecision = Math.floor((application.finalDecisionAt - submitted) / (1000 * 60 * 60 * 24));
    }

    return metrics;
  }

  /**
   * Get next actions for application
   * @param {Object} application - Application object
   * @returns {Array} Next actions
   */
  getNextActions(application) {
    const actions = [];

    switch (application.status) {
      case 'submitted':
        actions.push({
          action: 'start_review',
          description: 'Begin application review',
          priority: 'high',
          responsible: 'company'
        });
        break;

      case 'under_review':
        actions.push({
          action: 'make_decision',
          description: 'Make shortlist/rejection decision',
          priority: 'medium',
          responsible: 'company'
        });
        break;

      case 'shortlisted':
        actions.push({
          action: 'schedule_interview',
          description: 'Schedule interview with candidate',
          priority: 'high',
          responsible: 'company'
        });
        break;

      case 'interview_scheduled':
        actions.push({
          action: 'conduct_interview',
          description: 'Conduct scheduled interview',
          priority: 'high',
          responsible: 'company'
        });
        break;

      case 'interview_completed':
        actions.push({
          action: 'final_decision',
          description: 'Make final acceptance/rejection decision',
          priority: 'high',
          responsible: 'company'
        });
        break;

      case 'accepted':
        if (application.internshipStatus === 'not_started') {
          actions.push({
            action: 'prepare_onboarding',
            description: 'Prepare for internship onboarding',
            priority: 'medium',
            responsible: 'company'
          });
        } else if (application.internshipStatus === 'in_progress') {
          actions.push({
            action: 'monitor_progress',
            description: 'Monitor internship progress',
            priority: 'low',
            responsible: 'company'
          });
        }
        break;
    }

    return actions;
  }

  /**
   * Calculate compatibility score between internship and student
   * @param {String} internshipId - Internship ID
   * @param {String} studentId - Student ID
   * @returns {Promise<Number>} Compatibility score (0-100)
   */
  async calculateCompatibilityScore(internshipId, studentId) {
    try {
      const [internship, student] = await Promise.all([
        Internship.findById(internshipId),
        User.findById(studentId)
      ]);

      if (!internship || !student) return 0;

      let score = 0;

      // Program match
      if (internship.targetPrograms?.includes(student.program)) {
        score += 30;
      }

      // Year level match
      if (!internship.yearLevelRequirement || student.yearLevel >= internship.yearLevelRequirement) {
        score += 20;
      }

      // GPA requirement
      if (!internship.gpaRequirement || (student.gpa && student.gpa >= internship.gpaRequirement)) {
        score += 25;
      }

      // Skills match (if available)
      if (internship.skills && student.skills) {
        const matchingSkills = internship.skills.filter(skill => 
          student.skills.some(studentSkill => 
            studentSkill.toLowerCase().includes(skill.toLowerCase())
          )
        );
        score += Math.min(25, (matchingSkills.length / internship.skills.length) * 25);
      } else {
        score += 15; // Default if no skills data
      }

      return Math.round(score);
    } catch (error) {
      console.error('Error calculating compatibility score:', error);
      return 0;
    }
  }

  /**
   * Build sort query for applications
   * @param {String} sortBy - Sort field
   * @param {String} sortOrder - Sort order
   * @returns {Object} Sort query
   */
  buildSortQuery(sortBy = 'submittedAt', sortOrder = 'desc') {
    const sortQuery = {};
    sortQuery[sortBy] = sortOrder === 'desc' ? -1 : 1;
    return sortQuery;
  }

  /**
   * Get review statistics for company
   * @param {Array} internshipIds - Internship IDs
   * @returns {Promise<Object>} Review statistics
   */
  async getReviewStatistics(internshipIds) {
    const stats = await InternshipApplication.aggregate([
      { $match: { internshipId: { $in: internshipIds } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgProcessingTime: {
            $avg: {
              $cond: {
                if: { $ne: ['$reviewedAt', null] },
                then: { $subtract: ['$reviewedAt', '$submittedAt'] },
                else: null
              }
            }
          }
        }
      }
    ]);

    const result = {
      total: 0,
      byStatus: {},
      avgProcessingDays: 0
    };

    stats.forEach(stat => {
      result.total += stat.count;
      result.byStatus[stat._id] = {
        count: stat.count,
        avgProcessingDays: stat.avgProcessingTime ? 
          Math.round(stat.avgProcessingTime / (1000 * 60 * 60 * 24)) : 0
      };
    });

    return result;
  }

  /**
   * Get priority applications needing urgent attention
   * @param {Array} internshipIds - Internship IDs
   * @returns {Promise<Array>} Priority applications
   */
  async getPriorityApplications(internshipIds) {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    return await InternshipApplication.find({
      internshipId: { $in: internshipIds },
      $or: [
        { status: 'submitted', submittedAt: { $lt: threeDaysAgo } },
        { status: 'under_review', reviewedAt: { $lt: sevenDaysAgo } },
        { status: 'interview_scheduled', 'interviewSchedule.date': { $lt: new Date() } }
      ]
    })
      .populate('studentId', 'firstName lastName email')
      .populate('internshipId', 'title')
      .sort({ submittedAt: 1 })
      .limit(10);
  }

  /**
   * Get review recommendations for company
   * @param {String} companyId - Company ID
   * @returns {Promise<Array>} Recommendations
   */
  async getReviewRecommendations(companyId) {
    const recommendations = [];

    // Check for overdue reviews
    const overdueCount = await InternshipApplication.countDocuments({
      'internshipId.companyId': companyId,
      status: 'submitted',
      submittedAt: { $lt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }
    });

    if (overdueCount > 0) {
      recommendations.push({
        type: 'overdue_reviews',
        priority: 'high',
        message: `${overdueCount} applications are overdue for review`,
        action: 'Review pending applications',
        count: overdueCount
      });
    }

    // Check for high-quality candidates
    const highQualityCandidates = await InternshipApplication.countDocuments({
      'internshipId.companyId': companyId,
      status: { $in: ['submitted', 'under_review'] },
      'studentInfo.gpa': { $gte: 3.5 }
    });

    if (highQualityCandidates > 0) {
      recommendations.push({
        type: 'high_quality_candidates',
        priority: 'medium',
        message: `${highQualityCandidates} high-GPA candidates awaiting review`,
        action: 'Prioritize high-performing students',
        count: highQualityCandidates
      });
    }

    return recommendations;
  }

  // Additional helper methods for progress tracking and reminders...

  /**
   * Calculate overall progress for internship
   * @param {Object} application - Application object
   * @returns {Number} Overall progress percentage
   */
  calculateOverallProgress(application) {
    if (application.progressTracking.length === 0) return 0;

    const totalPercentage = application.progressTracking.reduce(
      (sum, entry) => sum + (entry.completionPercentage || 0), 0
    );

    return Math.round(totalPercentage / application.progressTracking.length);
  }

  /**
   * Check milestone achievements
   * @param {Object} application - Application object
   * @param {Number} currentPercentage - Current completion percentage
   * @returns {Promise<Array>} Milestone achievements
   */
  async checkMilestoneAchievements(application, currentPercentage) {
    const achievements = [];
    const milestoneThresholds = [25, 50, 75, 100];

    for (const threshold of milestoneThresholds) {
      if (currentPercentage >= threshold) {
        const existingMilestone = application.progressTracking.find(
          entry => entry.milestone.includes(`${threshold}%`)
        );

        if (!existingMilestone) {
          achievements.push({
            threshold,
            title: `${threshold}% Milestone Achieved`,
            description: `Internship is ${threshold}% complete`
          });
        }
      }
    }

    return achievements;
  }

  /**
   * Generate next milestone suggestions
   * @param {Object} application - Application object
   * @returns {Promise<Array>} Next milestone suggestions
   */
  async generateNextMilestoneSuggestions(application) {
    const InternshipWorkflowService = require('./InternshipWorkflowService');
    const allMilestones = InternshipWorkflowService.getInternshipMilestones(
      application.internshipId.duration
    );

    const completedMilestones = application.progressTracking.length;
    const nextMilestones = allMilestones.slice(completedMilestones, completedMilestones + 3);

    return nextMilestones.map(milestone => ({
      ...milestone,
      suggested: true,
      estimatedDate: this.calculateEstimatedMilestoneDate(application, milestone.week)
    }));
  }

  /**
   * Calculate estimated milestone date
   * @param {Object} application - Application object
   * @param {Number} weekNumber - Week number of milestone
   * @returns {Date} Estimated date
   */
  calculateEstimatedMilestoneDate(application, weekNumber) {
    const startDate = application.startedAt || new Date();
    const estimatedDate = new Date(startDate);
    estimatedDate.setDate(estimatedDate.getDate() + (weekNumber * 7));
    return estimatedDate;
  }

  /**
   * Send progress notifications
   * @param {Object} application - Application object
   * @param {Object} progressEntry - Progress entry
   * @param {Array} achievements - Milestone achievements
   * @returns {Promise<Array>} Sent notifications
   */
  async sendProgressNotifications(application, progressEntry, achievements) {
    const notifications = [];

    // Notify student of progress update
    await NotificationService.sendNotification(
      application.studentId._id,
      {
        title: 'Progress Updated',
        message: `Your progress for "${application.internshipId.title}" has been updated: ${progressEntry.milestone}`,
        type: 'info',
        category: 'internship',
        actionUrl: `/internships/applications/${application._id}/progress`
      }
    );
    notifications.push('student_progress_notification');

    // Send achievement notifications
    for (const achievement of achievements) {
      await NotificationService.sendNotification(
        application.studentId._id,
        {
          title: achievement.title,
          message: achievement.description,
          type: 'success',
          category: 'internship'
        }
      );
      notifications.push(`achievement_${achievement.threshold}`);
    }

    return notifications;
  }

  /**
   * Schedule application reminders
   * @param {String} applicationId - Application ID
   * @returns {Promise<void>}
   */
  async scheduleApplicationReminders(applicationId) {
    // This would integrate with a job queue system like Bull
    // For now, we'll rely on the cron jobs in InternshipWorkflowService
    console.log(`Scheduled reminders for application ${applicationId}`);
  }

  /**
   * Add application to review queue
   * @param {String} applicationId - Application ID
   * @returns {Promise<void>}
   */
  async addToReviewQueue(applicationId) {
    // This could integrate with a queue management system
    // For now, we'll just log the action
    console.log(`Added application ${applicationId} to review queue`);
  }

  // Reminder methods
  async sendApplicationReviewReminders(results) {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    
    const pendingApplications = await InternshipApplication.find({
      status: 'submitted',
      submittedAt: { $lt: threeDaysAgo }
    }).populate({
      path: 'internshipId',
      populate: {
        path: 'companyId',
        select: 'name contactPerson'
      }
    });

    for (const application of pendingApplications) {
      try {
        if (application.internshipId.companyId.contactPerson?.email) {
          await NotificationService.sendNotification(
            null,
            {
              title: 'Application Review Reminder',
              message: `Application from ${application.studentId.firstName} ${application.studentId.lastName} is pending review for 3+ days.`,
              type: 'reminder',
              category: 'internship'
            },
            { email: application.internshipId.companyId.contactPerson.email }
          );
          results.sent++;
        }
      } catch (error) {
        results.failed++;
        results.details.push({
          applicationId: application._id,
          error: error.message
        });
      }
    }
  }

  async sendProgressReportReminders(results) {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const overdueProgress = await InternshipApplication.find({
      internshipStatus: 'in_progress',
      $or: [
        { lastProgressReport: { $lt: oneWeekAgo } },
        { lastProgressReport: { $exists: false } }
      ]
    }).populate('studentId', 'firstName lastName email')
      .populate('internshipId', 'title');

    for (const application of overdueProgress) {
      try {
        await NotificationService.sendNotification(
          application.studentId._id,
          {
            title: 'Progress Report Due',
            message: `Your weekly progress report for "${application.internshipId.title}" is overdue.`,
            type: 'reminder',
            category: 'internship',
            actionUrl: `/internships/applications/${application._id}/progress`
          }
        );
        results.sent++;
      } catch (error) {
        results.failed++;
        results.details.push({
          applicationId: application._id,
          error: error.message
        });
      }
    }
  }

  async sendMilestoneDeadlineReminders(results) {
    // Implementation for milestone deadline reminders
    results.sent += 0; // Placeholder
  }

  async sendEvaluationDueReminders(results) {
    // Implementation for evaluation due reminders
    results.sent += 0; // Placeholder
  }
}

module.exports = new ApplicationTrackingService();