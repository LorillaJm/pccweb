const InternshipApplication = require('../models/InternshipApplication');
const Internship = require('../models/Internship');
const User = require('../models/User');
const Company = require('../models/Company');
const NotificationService = require('./NotificationService');
const cron = require('node-cron');

class InternshipWorkflowService {
  constructor() {
    this.initializeScheduledTasks();
  }

  /**
   * Initialize scheduled tasks for automated reminders
   */
  initializeScheduledTasks() {
    // Run daily at 9 AM to send reminders
    cron.schedule('0 9 * * *', async () => {
      try {
        await this.sendDailyReminders();
      } catch (error) {
        console.error('Error in daily reminders:', error);
      }
    });

    // Run weekly on Mondays at 10 AM for progress reports
    cron.schedule('0 10 * * 1', async () => {
      try {
        await this.sendWeeklyProgressReminders();
      } catch (error) {
        console.error('Error in weekly progress reminders:', error);
      }
    });
  }

  /**
   * Process application submission workflow
   * @param {String} applicationId - Application ID
   * @returns {Promise<Object>} Workflow result
   */
  async processApplicationSubmission(applicationId) {
    try {
      const application = await InternshipApplication.findById(applicationId)
        .populate('studentId', 'firstName lastName email')
        .populate('internshipId', 'title companyId applicationDeadline')
        .populate({
          path: 'internshipId',
          populate: {
            path: 'companyId',
            select: 'name contactPerson'
          }
        });

      if (!application) {
        throw new Error('Application not found');
      }

      const workflow = {
        applicationId,
        currentStatus: application.status,
        nextSteps: [],
        notifications: [],
        timeline: []
      };

      // Set up initial workflow steps
      workflow.nextSteps.push({
        step: 'company_review',
        description: 'Company will review your application',
        estimatedDuration: '3-5 business days',
        responsible: 'company'
      });

      // Send confirmation notification to student
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

      workflow.notifications.push('Student confirmation sent');

      // Notify company of new application
      if (application.internshipId.companyId.contactPerson?.email) {
        await NotificationService.sendNotification(
          null,
          {
            title: 'New Internship Application',
            message: `${application.studentId.firstName} ${application.studentId.lastName} has applied for "${application.internshipId.title}".`,
            type: 'info',
            category: 'internship'
          },
          { email: application.internshipId.companyId.contactPerson.email }
        );

        workflow.notifications.push('Company notification sent');
      }

      // Schedule follow-up reminders
      await this.scheduleApplicationReminders(applicationId);

      return workflow;
    } catch (error) {
      throw new Error(`Failed to process application submission: ${error.message}`);
    }
  }

  /**
   * Manage company application review workflow
   * @param {String} applicationId - Application ID
   * @param {String} action - Review action
   * @param {Object} data - Action data
   * @returns {Promise<Object>} Review result
   */
  async manageApplicationReview(applicationId, action, data = {}) {
    try {
      const application = await InternshipApplication.findById(applicationId)
        .populate('studentId', 'firstName lastName email')
        .populate('internshipId', 'title companyId');

      if (!application) {
        throw new Error('Application not found');
      }

      const result = {
        applicationId,
        action,
        previousStatus: application.status,
        newStatus: null,
        notifications: []
      };

      switch (action) {
        case 'start_review':
          application.status = 'under_review';
          application.reviewedAt = new Date();
          application.reviewedBy = data.reviewerId;
          result.newStatus = 'under_review';

          // Notify student
          await NotificationService.sendNotification(
            application.studentId._id,
            {
              title: 'Application Under Review',
              message: `Your application for "${application.internshipId.title}" is now being reviewed.`,
              type: 'info',
              category: 'internship'
            }
          );
          result.notifications.push('Student notified of review start');
          break;

        case 'shortlist':
          application.status = 'shortlisted';
          if (data.notes) application.reviewNotes = data.notes;
          result.newStatus = 'shortlisted';

          // Notify student
          await NotificationService.sendNotification(
            application.studentId._id,
            {
              title: 'Application Shortlisted',
              message: `Great news! You've been shortlisted for "${application.internshipId.title}".`,
              type: 'success',
              category: 'internship'
            }
          );
          result.notifications.push('Student notified of shortlisting');
          break;

        case 'schedule_interview':
          application.status = 'interview_scheduled';
          application.interviewSchedule = data.interviewDetails;
          result.newStatus = 'interview_scheduled';

          // Send detailed interview notification
          await this.sendInterviewNotification(application, data.interviewDetails);
          result.notifications.push('Interview notification sent');
          break;

        case 'accept':
          application.status = 'accepted';
          application.finalDecisionAt = new Date();
          if (data.feedback) application.feedback = data.feedback;
          result.newStatus = 'accepted';

          // Start internship preparation workflow
          await this.startInternshipPreparation(applicationId);
          result.notifications.push('Acceptance notification and preparation workflow started');
          break;

        case 'reject':
          application.status = 'rejected';
          application.finalDecisionAt = new Date();
          if (data.feedback) application.feedback = data.feedback;
          result.newStatus = 'rejected';

          // Send rejection notification with feedback
          await NotificationService.sendNotification(
            application.studentId._id,
            {
              title: 'Application Update',
              message: `Thank you for your interest in "${application.internshipId.title}". Unfortunately, we have decided to move forward with other candidates.`,
              type: 'info',
              category: 'internship'
            }
          );
          result.notifications.push('Rejection notification sent');
          break;

        default:
          throw new Error(`Unknown review action: ${action}`);
      }

      await application.save();
      return result;
    } catch (error) {
      throw new Error(`Failed to manage application review: ${error.message}`);
    }
  }

  /**
   * Track internship progress and milestones
   * @param {String} applicationId - Application ID
   * @param {Object} progressData - Progress data
   * @param {String} updatedBy - User ID of updater
   * @returns {Promise<Object>} Progress tracking result
   */
  async trackInternshipProgress(applicationId, progressData, updatedBy) {
    try {
      const application = await InternshipApplication.findById(applicationId)
        .populate('studentId', 'firstName lastName email')
        .populate('internshipId', 'title duration companyId');

      if (!application) {
        throw new Error('Application not found');
      }

      // Add progress entry
      const progressEntry = {
        date: new Date(),
        milestone: progressData.milestone,
        description: progressData.description,
        completionPercentage: progressData.completionPercentage || 0,
        supervisorNotes: progressData.supervisorNotes,
        studentReflection: progressData.studentReflection,
        updatedBy
      };

      application.progressTracking.push(progressEntry);
      application.lastProgressReport = new Date();

      // Check for milestone achievements
      const milestones = this.getInternshipMilestones(application.internshipId.duration);
      const completedMilestones = application.progressTracking.length;
      const progressPercentage = (completedMilestones / milestones.length) * 100;

      // Send progress notifications
      if (progressData.completionPercentage >= 25 && progressData.completionPercentage < 50) {
        await this.sendMilestoneNotification(application, '25% Progress Milestone');
      } else if (progressData.completionPercentage >= 50 && progressData.completionPercentage < 75) {
        await this.sendMilestoneNotification(application, '50% Progress Milestone');
      } else if (progressData.completionPercentage >= 75 && progressData.completionPercentage < 100) {
        await this.sendMilestoneNotification(application, '75% Progress Milestone');
      } else if (progressData.completionPercentage >= 100) {
        await this.sendMilestoneNotification(application, 'Internship Completion');
      }

      await application.save();

      return {
        applicationId,
        progressEntry,
        totalProgress: progressPercentage,
        milestonesCompleted: completedMilestones,
        totalMilestones: milestones.length,
        nextMilestone: milestones[completedMilestones] || null
      };
    } catch (error) {
      throw new Error(`Failed to track progress: ${error.message}`);
    }
  }

  /**
   * Send interview notification with details
   * @param {Object} application - Application object
   * @param {Object} interviewDetails - Interview details
   */
  async sendInterviewNotification(application, interviewDetails) {
    const interviewDate = new Date(interviewDetails.date);
    const formattedDate = interviewDate.toLocaleDateString();
    const formattedTime = interviewDetails.time;

    let message = `Your interview for "${application.internshipId.title}" has been scheduled for ${formattedDate} at ${formattedTime}.`;
    
    if (interviewDetails.location) {
      message += ` Location: ${interviewDetails.location}`;
    }
    
    if (interviewDetails.meetingLink) {
      message += ` Meeting link: ${interviewDetails.meetingLink}`;
    }

    await NotificationService.sendNotification(
      application.studentId._id,
      {
        title: 'Interview Scheduled',
        message,
        type: 'info',
        category: 'internship',
        actionUrl: `/internships/applications/${application._id}`
      }
    );

    // Schedule interview reminder 24 hours before
    const reminderDate = new Date(interviewDate.getTime() - 24 * 60 * 60 * 1000);
    if (reminderDate > new Date()) {
      await this.scheduleInterviewReminder(application._id, reminderDate);
    }
  }

  /**
   * Start internship preparation workflow
   * @param {String} applicationId - Application ID
   */
  async startInternshipPreparation(applicationId) {
    const application = await InternshipApplication.findById(applicationId)
      .populate('studentId', 'firstName lastName email')
      .populate('internshipId', 'title startDate companyId');

    // Send acceptance notification
    await NotificationService.sendNotification(
      application.studentId._id,
      {
        title: 'Congratulations! Application Accepted',
        message: `Your application for "${application.internshipId.title}" has been accepted! Please prepare for your internship start date.`,
        type: 'success',
        category: 'internship',
        actionUrl: `/internships/applications/${applicationId}`
      }
    );

    // Schedule pre-internship reminders
    const startDate = new Date(application.internshipId.startDate);
    const oneWeekBefore = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const threeDaysBefore = new Date(startDate.getTime() - 3 * 24 * 60 * 60 * 1000);

    if (oneWeekBefore > new Date()) {
      await this.schedulePreInternshipReminder(applicationId, oneWeekBefore, '1 week');
    }

    if (threeDaysBefore > new Date()) {
      await this.schedulePreInternshipReminder(applicationId, threeDaysBefore, '3 days');
    }
  }

  /**
   * Send milestone notification
   * @param {Object} application - Application object
   * @param {String} milestone - Milestone name
   */
  async sendMilestoneNotification(application, milestone) {
    await NotificationService.sendNotification(
      application.studentId._id,
      {
        title: `Internship Milestone: ${milestone}`,
        message: `You've reached a new milestone in your internship at "${application.internshipId.title}". Keep up the great work!`,
        type: 'success',
        category: 'internship'
      }
    );
  }

  /**
   * Get standard internship milestones based on duration
   * @param {Number} durationWeeks - Duration in weeks
   * @returns {Array} Milestone list
   */
  getInternshipMilestones(durationWeeks) {
    const milestones = [
      { week: 1, title: 'Orientation and Setup', description: 'Complete orientation and workspace setup' },
      { week: 2, title: 'Initial Training', description: 'Complete initial training and familiarization' }
    ];

    if (durationWeeks >= 4) {
      milestones.push({ week: 4, title: 'First Month Review', description: 'First month performance review' });
    }

    if (durationWeeks >= 8) {
      milestones.push({ week: 8, title: 'Mid-term Evaluation', description: 'Mid-term performance evaluation' });
    }

    if (durationWeeks >= 12) {
      milestones.push({ week: 12, title: 'Project Completion', description: 'Complete assigned projects' });
    }

    milestones.push({ 
      week: durationWeeks, 
      title: 'Final Evaluation', 
      description: 'Final performance evaluation and completion' 
    });

    return milestones;
  }

  /**
   * Send daily reminders for various internship activities
   */
  async sendDailyReminders() {
    try {
      // Remind companies about pending applications
      await this.remindCompaniesAboutPendingApplications();

      // Remind students about upcoming deadlines
      await this.remindStudentsAboutDeadlines();

      // Remind about upcoming interviews
      await this.remindAboutUpcomingInterviews();

      console.log('Daily reminders sent successfully');
    } catch (error) {
      console.error('Error sending daily reminders:', error);
    }
  }

  /**
   * Send weekly progress reminders
   */
  async sendWeeklyProgressReminders() {
    try {
      // Find active internships that need progress reports
      const activeInternships = await InternshipApplication.find({
        internshipStatus: 'in_progress',
        $or: [
          { lastProgressReport: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
          { lastProgressReport: { $exists: false } }
        ]
      }).populate('studentId', 'firstName lastName email')
        .populate('internshipId', 'title companyId');

      for (const internship of activeInternships) {
        // Remind student to submit progress report
        await NotificationService.sendNotification(
          internship.studentId._id,
          {
            title: 'Weekly Progress Report Due',
            message: `Please submit your weekly progress report for your internship at "${internship.internshipId.title}".`,
            type: 'reminder',
            category: 'internship',
            actionUrl: `/internships/applications/${internship._id}/progress`
          }
        );

        // Remind supervisor to review progress
        const company = await Company.findById(internship.internshipId.companyId);
        if (company?.contactPerson?.email) {
          await NotificationService.sendNotification(
            null,
            {
              title: 'Intern Progress Review',
              message: `Please review the progress of ${internship.studentId.firstName} ${internship.studentId.lastName} for their internship.`,
              type: 'reminder',
              category: 'internship'
            },
            { email: company.contactPerson.email }
          );
        }
      }

      console.log(`Weekly progress reminders sent for ${activeInternships.length} internships`);
    } catch (error) {
      console.error('Error sending weekly progress reminders:', error);
    }
  }

  /**
   * Send milestone-based reminders
   */
  async sendMilestoneReminders() {
    try {
      const activeInternships = await InternshipApplication.find({
        internshipStatus: 'in_progress',
        startedAt: { $exists: true }
      }).populate('studentId', 'firstName lastName email')
        .populate('internshipId', 'title duration companyId');

      for (const internship of activeInternships) {
        const startDate = new Date(internship.startedAt);
        const currentDate = new Date();
        const weeksElapsed = Math.floor((currentDate - startDate) / (7 * 24 * 60 * 60 * 1000));
        
        const milestones = this.getInternshipMilestones(internship.internshipId.duration);
        const currentMilestone = milestones.find(m => m.week === weeksElapsed + 1);
        
        if (currentMilestone) {
          // Send milestone reminder to student
          await NotificationService.sendNotification(
            internship.studentId._id,
            {
              title: `Internship Milestone: Week ${currentMilestone.week}`,
              message: `${currentMilestone.title} - ${currentMilestone.description}`,
              type: 'info',
              category: 'internship',
              actionUrl: `/internships/applications/${internship._id}/progress`
            }
          );

          // Send milestone reminder to supervisor
          const company = await Company.findById(internship.internshipId.companyId);
          if (company?.contactPerson?.email) {
            await NotificationService.sendNotification(
              null,
              {
                title: `Intern Milestone: Week ${currentMilestone.week}`,
                message: `${internship.studentId.firstName} ${internship.studentId.lastName} has reached week ${currentMilestone.week} of their internship. Milestone: ${currentMilestone.title}`,
                type: 'info',
                category: 'internship'
              },
              { email: company.contactPerson.email }
            );
          }
        }
      }

      console.log('Milestone reminders processed');
    } catch (error) {
      console.error('Error sending milestone reminders:', error);
    }
  }

  /**
   * Send evaluation reminders
   */
  async sendEvaluationReminders() {
    try {
      const now = new Date();
      
      // Find internships that need mid-term evaluations
      const midTermDue = await InternshipApplication.find({
        internshipStatus: 'in_progress',
        startedAt: { $exists: true },
        'evaluations.period': { $ne: 'midterm' }
      }).populate('studentId', 'firstName lastName email')
        .populate('internshipId', 'title duration companyId');

      for (const internship of midTermDue) {
        const startDate = new Date(internship.startedAt);
        const weeksElapsed = Math.floor((now - startDate) / (7 * 24 * 60 * 60 * 1000));
        const midPoint = Math.floor(internship.internshipId.duration / 2);
        
        if (weeksElapsed >= midPoint && weeksElapsed <= midPoint + 1) {
          // Send mid-term evaluation reminder
          const company = await Company.findById(internship.internshipId.companyId);
          if (company?.contactPerson?.email) {
            await NotificationService.sendNotification(
              null,
              {
                title: 'Mid-term Evaluation Due',
                message: `Please complete the mid-term evaluation for ${internship.studentId.firstName} ${internship.studentId.lastName}.`,
                type: 'reminder',
                category: 'internship'
              },
              { email: company.contactPerson.email }
            );
          }
        }
      }

      // Find internships approaching completion that need final evaluations
      const finalEvalDue = await InternshipApplication.find({
        internshipStatus: 'in_progress',
        startedAt: { $exists: true },
        'evaluations.period': { $ne: 'final' }
      }).populate('studentId', 'firstName lastName email')
        .populate('internshipId', 'title duration companyId');

      for (const internship of finalEvalDue) {
        const startDate = new Date(internship.startedAt);
        const weeksElapsed = Math.floor((now - startDate) / (7 * 24 * 60 * 60 * 1000));
        
        if (weeksElapsed >= internship.internshipId.duration - 1) {
          // Send final evaluation reminder
          const company = await Company.findById(internship.internshipId.companyId);
          if (company?.contactPerson?.email) {
            await NotificationService.sendNotification(
              null,
              {
                title: 'Final Evaluation Due',
                message: `Please complete the final evaluation for ${internship.studentId.firstName} ${internship.studentId.lastName} as their internship is nearing completion.`,
                type: 'reminder',
                category: 'internship'
              },
              { email: company.contactPerson.email }
            );
          }
        }
      }

      console.log('Evaluation reminders processed');
    } catch (error) {
      console.error('Error sending evaluation reminders:', error);
    }
  }

  /**
   * Remind companies about pending applications
   */
  async remindCompaniesAboutPendingApplications() {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    
    const pendingApplications = await InternshipApplication.find({
      status: 'submitted',
      submittedAt: { $lt: threeDaysAgo }
    }).populate('internshipId', 'title companyId')
      .populate({
        path: 'internshipId',
        populate: {
          path: 'companyId',
          select: 'name contactPerson'
        }
      });

    const companiesWithPending = {};
    
    pendingApplications.forEach(app => {
      const companyId = app.internshipId.companyId._id.toString();
      if (!companiesWithPending[companyId]) {
        companiesWithPending[companyId] = {
          company: app.internshipId.companyId,
          applications: []
        };
      }
      companiesWithPending[companyId].applications.push(app);
    });

    for (const [companyId, data] of Object.entries(companiesWithPending)) {
      if (data.company.contactPerson?.email) {
        await NotificationService.sendNotification(
          null,
          {
            title: 'Pending Internship Applications',
            message: `You have ${data.applications.length} pending internship application(s) that require review.`,
            type: 'reminder',
            category: 'internship'
          },
          { email: data.company.contactPerson.email }
        );
      }
    }
  }

  /**
   * Remind students about upcoming deadlines
   */
  async remindStudentsAboutDeadlines() {
    const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    
    const expiringInternships = await Internship.find({
      status: 'published',
      applicationDeadline: {
        $gt: new Date(),
        $lt: threeDaysFromNow
      }
    });

    for (const internship of expiringInternships) {
      // Find students who might be interested but haven't applied
      const eligibleStudents = await User.find({
        role: 'student',
        isActive: true,
        program: { $in: internship.targetPrograms || [] }
      });

      const appliedStudents = await InternshipApplication.find({
        internshipId: internship._id
      }).distinct('studentId');

      const unappliedStudents = eligibleStudents.filter(
        student => !appliedStudents.includes(student._id.toString())
      );

      for (const student of unappliedStudents.slice(0, 10)) { // Limit to 10 to avoid spam
        await NotificationService.sendNotification(
          student._id,
          {
            title: 'Application Deadline Approaching',
            message: `The application deadline for "${internship.title}" is in 3 days. Don't miss this opportunity!`,
            type: 'reminder',
            category: 'internship',
            actionUrl: `/internships/${internship._id}`
          }
        );
      }
    }
  }

  /**
   * Remind about upcoming interviews
   */
  async remindAboutUpcomingInterviews() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    const upcomingInterviews = await InternshipApplication.find({
      status: 'interview_scheduled',
      'interviewSchedule.date': {
        $gte: tomorrow,
        $lt: dayAfterTomorrow
      }
    }).populate('studentId', 'firstName lastName email')
      .populate('internshipId', 'title');

    for (const application of upcomingInterviews) {
      const interviewTime = application.interviewSchedule.time || 'TBD';
      
      await NotificationService.sendNotification(
        application.studentId._id,
        {
          title: 'Interview Reminder',
          message: `Reminder: You have an interview tomorrow at ${interviewTime} for "${application.internshipId.title}".`,
          type: 'reminder',
          category: 'internship'
        }
      );
    }
  }

  /**
   * Schedule application reminders
   * @param {String} applicationId - Application ID
   */
  async scheduleApplicationReminders(applicationId) {
    // This would integrate with a job queue system like Bull
    // For now, we'll use the daily cron job to check for reminders
    console.log(`Scheduled reminders for application ${applicationId}`);
  }

  /**
   * Schedule interview reminder
   * @param {String} applicationId - Application ID
   * @param {Date} reminderDate - When to send reminder
   */
  async scheduleInterviewReminder(applicationId, reminderDate) {
    // This would integrate with a job queue system
    console.log(`Scheduled interview reminder for application ${applicationId} at ${reminderDate}`);
  }

  /**
   * Schedule pre-internship reminder
   * @param {String} applicationId - Application ID
   * @param {Date} reminderDate - When to send reminder
   * @param {String} timeframe - Time before start (e.g., '1 week')
   */
  async schedulePreInternshipReminder(applicationId, reminderDate, timeframe) {
    // This would integrate with a job queue system
    console.log(`Scheduled pre-internship reminder for application ${applicationId} - ${timeframe} before start`);
  }

  /**
   * Get application workflow status
   * @param {String} applicationId - Application ID
   * @returns {Promise<Object>} Workflow status
   */
  async getApplicationWorkflowStatus(applicationId) {
    try {
      const application = await InternshipApplication.findById(applicationId)
        .populate('studentId', 'firstName lastName email')
        .populate('internshipId', 'title startDate endDate duration')
        .populate('reviewedBy', 'firstName lastName');

      if (!application) {
        throw new Error('Application not found');
      }

      const workflow = {
        applicationId,
        currentStatus: application.status,
        statusDisplay: application.statusDisplay,
        timeline: this.buildApplicationTimeline(application),
        nextSteps: this.getNextSteps(application),
        progress: this.calculateApplicationProgress(application),
        reminders: await this.getScheduledReminders(applicationId)
      };

      return workflow;
    } catch (error) {
      throw new Error(`Failed to get workflow status: ${error.message}`);
    }
  }

  /**
   * Build application timeline
   * @param {Object} application - Application object
   * @returns {Array} Timeline events
   */
  buildApplicationTimeline(application) {
    const timeline = [];

    timeline.push({
      status: 'submitted',
      date: application.submittedAt,
      title: 'Application Submitted',
      description: 'Application successfully submitted',
      completed: true
    });

    if (application.reviewedAt) {
      timeline.push({
        status: 'under_review',
        date: application.reviewedAt,
        title: 'Review Started',
        description: 'Application review process began',
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

    if (application.startedAt) {
      timeline.push({
        status: 'internship_started',
        date: application.startedAt,
        title: 'Internship Started',
        description: 'Internship period has begun',
        completed: true
      });
    }

    if (application.completedAt) {
      timeline.push({
        status: 'internship_completed',
        date: application.completedAt,
        title: 'Internship Completed',
        description: 'Internship successfully completed',
        completed: true
      });
    }

    return timeline;
  }

  /**
   * Get next steps for application
   * @param {Object} application - Application object
   * @returns {Array} Next steps
   */
  getNextSteps(application) {
    const nextSteps = [];

    switch (application.status) {
      case 'submitted':
        nextSteps.push({
          step: 'company_review',
          description: 'Waiting for company to review application',
          estimatedDuration: '3-5 business days',
          responsible: 'company'
        });
        break;

      case 'under_review':
        nextSteps.push({
          step: 'review_decision',
          description: 'Company is reviewing your application',
          estimatedDuration: '2-3 business days',
          responsible: 'company'
        });
        break;

      case 'shortlisted':
        nextSteps.push({
          step: 'interview_scheduling',
          description: 'Interview will be scheduled soon',
          estimatedDuration: '1-2 business days',
          responsible: 'company'
        });
        break;

      case 'interview_scheduled':
        nextSteps.push({
          step: 'attend_interview',
          description: 'Attend scheduled interview',
          estimatedDuration: 'As scheduled',
          responsible: 'student'
        });
        break;

      case 'interview_completed':
        nextSteps.push({
          step: 'final_decision',
          description: 'Waiting for final decision',
          estimatedDuration: '1-3 business days',
          responsible: 'company'
        });
        break;

      case 'accepted':
        if (application.internshipStatus === 'not_started') {
          nextSteps.push({
            step: 'prepare_for_internship',
            description: 'Prepare for internship start date',
            estimatedDuration: 'Until start date',
            responsible: 'student'
          });
        } else if (application.internshipStatus === 'in_progress') {
          nextSteps.push({
            step: 'continue_internship',
            description: 'Continue internship and submit progress reports',
            estimatedDuration: 'Ongoing',
            responsible: 'student'
          });
        }
        break;

      default:
        // No next steps for rejected, withdrawn, or completed applications
        break;
    }

    return nextSteps;
  }

  /**
   * Calculate application progress percentage
   * @param {Object} application - Application object
   * @returns {Number} Progress percentage
   */
  calculateApplicationProgress(application) {
    const statusWeights = {
      'submitted': 10,
      'under_review': 25,
      'shortlisted': 40,
      'interview_scheduled': 60,
      'interview_completed': 75,
      'accepted': 90,
      'rejected': 100,
      'withdrawn': 100
    };

    let progress = statusWeights[application.status] || 0;

    // Add internship progress if accepted
    if (application.status === 'accepted' && application.internshipStatus) {
      if (application.internshipStatus === 'in_progress') {
        progress = 90 + (application.progressTracking.length * 2); // Add 2% per progress report
      } else if (application.internshipStatus === 'completed') {
        progress = 100;
      }
    }

    return Math.min(progress, 100);
  }

  /**
   * Get scheduled reminders for application
   * @param {String} applicationId - Application ID
   * @returns {Promise<Array>} Scheduled reminders
   */
  async getScheduledReminders(applicationId) {
    // This would query a job queue system for scheduled reminders
    // For now, return empty array as reminders are handled by cron jobs
    return [];
  }

  /**
   * Start internship tracking
   * @param {String} applicationId - Application ID
   * @returns {Promise<Object>} Tracking result
   */
  async startInternshipTracking(applicationId) {
    try {
      const application = await InternshipApplication.findById(applicationId)
        .populate('studentId', 'firstName lastName email')
        .populate('internshipId', 'title duration startDate companyId');

      if (!application) {
        throw new Error('Application not found');
      }

      if (application.status !== 'accepted') {
        throw new Error('Application must be accepted to start internship tracking');
      }

      // Update internship status
      application.internshipStatus = 'in_progress';
      application.startedAt = new Date();

      // Create initial milestone
      const initialMilestone = {
        date: new Date(),
        milestone: 'Internship Started',
        description: 'Internship period has officially begun',
        completionPercentage: 0,
        updatedBy: application.studentId._id
      };

      application.progressTracking.push(initialMilestone);
      await application.save();

      // Send start notification
      await NotificationService.sendNotification(
        application.studentId._id,
        {
          title: 'Internship Started',
          message: `Your internship at "${application.internshipId.title}" has officially started. Good luck!`,
          type: 'success',
          category: 'internship',
          actionUrl: `/internships/applications/${applicationId}/progress`
        }
      );

      // Get milestones for this internship duration
      const milestones = this.getInternshipMilestones(application.internshipId.duration);

      return {
        applicationId,
        internshipStatus: 'in_progress',
        startedAt: application.startedAt,
        milestones,
        nextMilestone: milestones[0]
      };
    } catch (error) {
      throw new Error(`Failed to start internship tracking: ${error.message}`);
    }
  }

  /**
   * Complete internship with final evaluation
   * @param {String} applicationId - Application ID
   * @param {Object} completionData - Completion data
   * @returns {Promise<Object>} Completion result
   */
  async completeInternshipWithEvaluation(applicationId, completionData) {
    try {
      const application = await InternshipApplication.findById(applicationId)
        .populate('studentId', 'firstName lastName email')
        .populate('internshipId', 'title companyId');

      if (!application) {
        throw new Error('Application not found');
      }

      if (application.internshipStatus !== 'in_progress') {
        throw new Error('Internship must be in progress to complete');
      }

      // Update internship status
      application.internshipStatus = 'completed';
      application.completedAt = new Date();

      // Add final milestone
      const finalMilestone = {
        date: new Date(),
        milestone: 'Internship Completed',
        description: 'Internship successfully completed',
        completionPercentage: 100,
        supervisorNotes: completionData.supervisorNotes,
        studentReflection: completionData.studentReflection,
        updatedBy: completionData.completedBy
      };

      application.progressTracking.push(finalMilestone);

      // Add final rating if provided
      if (completionData.finalRating) {
        application.finalRating = completionData.finalRating;
      }

      await application.save();

      // Send completion notifications
      await NotificationService.sendNotification(
        application.studentId._id,
        {
          title: 'Internship Completed',
          message: `Congratulations! You have successfully completed your internship at "${application.internshipId.title}".`,
          type: 'success',
          category: 'internship'
        }
      );

      // Notify company
      const company = await Company.findById(application.internshipId.companyId);
      if (company?.contactPerson?.email) {
        await NotificationService.sendNotification(
          null,
          {
            title: 'Internship Completed',
            message: `${application.studentId.firstName} ${application.studentId.lastName} has completed their internship.`,
            type: 'info',
            category: 'internship'
          },
          { email: company.contactPerson.email }
        );
      }

      return {
        applicationId,
        internshipStatus: 'completed',
        completedAt: application.completedAt,
        finalRating: application.finalRating,
        totalProgressReports: application.progressTracking.length
      };
    } catch (error) {
      throw new Error(`Failed to complete internship: ${error.message}`);
    }
  }
}

module.exports = new InternshipWorkflowService();