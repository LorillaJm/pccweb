const notificationService = require('./NotificationService');
const AlumniProfile = require('../models/AlumniProfile');
const User = require('../models/User');

/**
 * AlumniNotificationService - Handles notifications for alumni-related activities
 * Integrates with NotificationService to send targeted notifications for:
 * - Alumni verification
 * - Networking activities
 * - Job postings and applications
 * - Mentorship matching and progress
 */
class AlumniNotificationService {
  constructor() {
    this.notificationService = notificationService;
  }

  /**
   * Send alumni verification notification
   * @param {string} userId - User ID
   * @param {string} status - Verification status (verified/rejected)
   * @param {string} reason - Reason for rejection (if applicable)
   * @returns {Promise<Object>} Notification result
   */
  async sendVerificationNotification(userId, status, reason = null) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const notificationData = {
        title: status === 'verified' ? 'Alumni Verification Approved' : 'Alumni Verification Update',
        message: status === 'verified' 
          ? 'Congratulations! Your alumni profile has been verified. You now have access to all alumni features.'
          : `Your alumni verification request has been ${status}. ${reason || ''}`,
        type: status === 'verified' ? 'success' : 'warning',
        category: 'social',
        priority: 'high',
        actionUrl: '/alumni/profile',
        data: {
          verificationType: 'alumni',
          status,
          reason
        }
      };

      const result = await this.notificationService.sendToUser(
        userId,
        notificationData,
        ['web', 'email', 'push']
      );

      return {
        success: true,
        notificationId: result.notificationId,
        message: 'Verification notification sent successfully'
      };
    } catch (error) {
      console.error('Error sending verification notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send networking connection notification
   * @param {string} recipientId - Recipient user ID
   * @param {string} senderId - Sender user ID
   * @param {string} action - Action type (request/accept/reject)
   * @returns {Promise<Object>} Notification result
   */
  async sendNetworkingNotification(recipientId, senderId, action) {
    try {
      const sender = await User.findById(senderId);
      if (!sender) {
        throw new Error('Sender not found');
      }

      const senderProfile = await AlumniProfile.findOne({ userId: senderId });
      const senderName = `${sender.firstName} ${sender.lastName}`;
      const senderTitle = senderProfile?.currentPosition || 'Alumni';

      const messages = {
        request: {
          title: 'New Connection Request',
          message: `${senderName} (${senderTitle}) wants to connect with you`,
          type: 'info',
          actionUrl: `/alumni/networking/requests`
        },
        accept: {
          title: 'Connection Request Accepted',
          message: `${senderName} accepted your connection request`,
          type: 'success',
          actionUrl: `/alumni/networking/connections`
        },
        reject: {
          title: 'Connection Request Declined',
          message: `${senderName} declined your connection request`,
          type: 'info',
          actionUrl: `/alumni/networking`
        }
      };

      const notificationData = {
        ...messages[action],
        category: 'social',
        priority: action === 'request' ? 'medium' : 'low',
        data: {
          senderId,
          senderName,
          action,
          networkingType: 'connection'
        }
      };

      const result = await this.notificationService.sendToUser(
        recipientId,
        notificationData,
        ['web', 'push']
      );

      return {
        success: true,
        notificationId: result.notificationId,
        message: 'Networking notification sent successfully'
      };
    } catch (error) {
      console.error('Error sending networking notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send job posting notification to relevant alumni
   * @param {Object} jobPosting - Job posting object
   * @param {Array} targetAudience - Target audience criteria
   * @returns {Promise<Object>} Notification result
   */
  async sendJobPostingNotification(jobPosting, targetAudience = {}) {
    try {
      // Build query to find relevant alumni
      const query = {
        isActive: true,
        verificationStatus: 'verified'
      };

      // Apply targeting criteria
      if (targetAudience.graduationYears && targetAudience.graduationYears.length > 0) {
        query.graduationYear = { $in: targetAudience.graduationYears };
      }

      if (targetAudience.programs && targetAudience.programs.length > 0) {
        query.degree = { $in: targetAudience.programs };
      }

      if (targetAudience.skills && targetAudience.skills.length > 0) {
        query.skills = { $in: targetAudience.skills };
      }

      if (targetAudience.industry) {
        query.industry = targetAudience.industry;
      }

      // Find matching alumni profiles
      const alumniProfiles = await AlumniProfile.find(query).select('userId');
      const userIds = alumniProfiles.map(profile => profile.userId);

      if (userIds.length === 0) {
        return {
          success: true,
          message: 'No matching alumni found',
          sentCount: 0
        };
      }

      const notificationData = {
        title: 'New Job Opportunity',
        message: `${jobPosting.title} at ${jobPosting.company}`,
        type: 'info',
        category: 'academic',
        priority: 'medium',
        actionUrl: `/alumni/jobs/${jobPosting._id}`,
        data: {
          jobId: jobPosting._id,
          jobTitle: jobPosting.title,
          company: jobPosting.company,
          workType: jobPosting.workType,
          location: jobPosting.location
        }
      };

      const result = await this.notificationService.sendToUsers(
        userIds,
        notificationData,
        ['web', 'push']
      );

      return {
        success: true,
        sentCount: result.totalSent,
        failedCount: result.totalFailed,
        message: `Job posting notification sent to ${result.totalSent} alumni`
      };
    } catch (error) {
      console.error('Error sending job posting notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send job application status update notification
   * @param {string} applicantId - Applicant user ID
   * @param {Object} application - Application object
   * @param {string} newStatus - New application status
   * @param {string} feedback - Feedback message
   * @returns {Promise<Object>} Notification result
   */
  async sendJobApplicationUpdateNotification(applicantId, application, newStatus, feedback = '') {
    try {
      const statusMessages = {
        'under_review': {
          title: 'Application Under Review',
          message: `Your application for ${application.jobId.title} is now under review`,
          type: 'info'
        },
        'shortlisted': {
          title: 'Application Shortlisted',
          message: `Congratulations! You have been shortlisted for ${application.jobId.title}`,
          type: 'success'
        },
        'interview_scheduled': {
          title: 'Interview Scheduled',
          message: `An interview has been scheduled for your application to ${application.jobId.title}`,
          type: 'info'
        },
        'accepted': {
          title: 'Application Accepted',
          message: `Congratulations! Your application for ${application.jobId.title} has been accepted`,
          type: 'success'
        },
        'rejected': {
          title: 'Application Status Update',
          message: `Your application for ${application.jobId.title} was not selected this time`,
          type: 'info'
        },
        'withdrawn': {
          title: 'Application Withdrawn',
          message: `Your application for ${application.jobId.title} has been withdrawn`,
          type: 'info'
        }
      };

      const statusConfig = statusMessages[newStatus] || {
        title: 'Application Status Update',
        message: `Your application status has been updated to ${newStatus}`,
        type: 'info'
      };

      const notificationData = {
        ...statusConfig,
        category: 'academic',
        priority: ['accepted', 'shortlisted', 'interview_scheduled'].includes(newStatus) ? 'high' : 'medium',
        actionUrl: `/alumni/jobs/applications/${application._id}`,
        data: {
          applicationId: application._id,
          jobId: application.jobId._id,
          jobTitle: application.jobId.title,
          company: application.jobId.company,
          status: newStatus,
          feedback: feedback || null
        }
      };

      const result = await this.notificationService.sendToUser(
        applicantId,
        notificationData,
        ['web', 'email', 'push']
      );

      return {
        success: true,
        notificationId: result.notificationId,
        message: 'Application update notification sent successfully'
      };
    } catch (error) {
      console.error('Error sending application update notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send mentorship matching notification
   * @param {string} menteeId - Mentee user ID
   * @param {string} mentorId - Mentor user ID
   * @param {Object} matchData - Match details
   * @returns {Promise<Object>} Notification result
   */
  async sendMentorshipMatchNotification(menteeId, mentorId, matchData) {
    try {
      const [mentor, mentee] = await Promise.all([
        User.findById(mentorId),
        User.findById(menteeId)
      ]);

      if (!mentor || !mentee) {
        throw new Error('Mentor or mentee not found');
      }

      const mentorProfile = await AlumniProfile.findOne({ userId: mentorId });
      const mentorName = `${mentor.firstName} ${mentor.lastName}`;
      const mentorTitle = mentorProfile?.currentPosition || 'Alumni';

      const notificationData = {
        title: 'Mentorship Match Found',
        message: `You have been matched with ${mentorName} (${mentorTitle}) for mentorship`,
        type: 'success',
        category: 'social',
        priority: 'high',
        actionUrl: `/alumni/mentorship/matches`,
        data: {
          mentorId,
          mentorName,
          mentorTitle,
          matchScore: matchData.matchScore || 0,
          focusAreas: matchData.focusAreas || []
        }
      };

      const result = await this.notificationService.sendToUser(
        menteeId,
        notificationData,
        ['web', 'email', 'push']
      );

      return {
        success: true,
        notificationId: result.notificationId,
        message: 'Mentorship match notification sent successfully'
      };
    } catch (error) {
      console.error('Error sending mentorship match notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send mentorship progress notification
   * @param {string} recipientId - Recipient user ID
   * @param {Object} mentorship - Mentorship object
   * @param {string} updateType - Type of update (session/progress/goal/completion)
   * @param {Object} updateData - Update details
   * @returns {Promise<Object>} Notification result
   */
  async sendMentorshipProgressNotification(recipientId, mentorship, updateType, updateData = {}) {
    try {
      const updateMessages = {
        session: {
          title: 'Mentorship Session Scheduled',
          message: `A mentorship session has been scheduled`,
          type: 'info'
        },
        progress: {
          title: 'Mentorship Progress Update',
          message: `A new progress update has been added to your mentorship`,
          type: 'info'
        },
        goal: {
          title: 'Mentorship Goal Updated',
          message: `A mentorship goal has been updated`,
          type: 'info'
        },
        milestone: {
          title: 'Mentorship Milestone Achieved',
          message: `Congratulations! A mentorship milestone has been achieved`,
          type: 'success'
        },
        completion: {
          title: 'Mentorship Completed',
          message: `Your mentorship has been successfully completed`,
          type: 'success'
        }
      };

      const updateConfig = updateMessages[updateType] || {
        title: 'Mentorship Update',
        message: 'Your mentorship has been updated',
        type: 'info'
      };

      const notificationData = {
        ...updateConfig,
        category: 'social',
        priority: updateType === 'completion' ? 'high' : 'medium',
        actionUrl: `/alumni/mentorship/${mentorship._id}`,
        data: {
          mentorshipId: mentorship._id,
          updateType,
          ...updateData
        }
      };

      const result = await this.notificationService.sendToUser(
        recipientId,
        notificationData,
        ['web', 'push']
      );

      return {
        success: true,
        notificationId: result.notificationId,
        message: 'Mentorship progress notification sent successfully'
      };
    } catch (error) {
      console.error('Error sending mentorship progress notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send alumni event invitation notification
   * @param {Array} alumniIds - Array of alumni user IDs
   * @param {Object} event - Event object
   * @returns {Promise<Object>} Notification result
   */
  async sendAlumniEventInvitation(alumniIds, event) {
    try {
      const notificationData = {
        title: 'Alumni Event Invitation',
        message: `You're invited to ${event.title}`,
        type: 'info',
        category: 'event',
        priority: 'medium',
        actionUrl: `/events/${event._id}`,
        data: {
          eventId: event._id,
          eventTitle: event.title,
          eventDate: event.startDate,
          venue: event.venue
        }
      };

      const result = await this.notificationService.sendToUsers(
        alumniIds,
        notificationData,
        ['web', 'email', 'push']
      );

      return {
        success: true,
        sentCount: result.totalSent,
        failedCount: result.totalFailed,
        message: `Event invitation sent to ${result.totalSent} alumni`
      };
    } catch (error) {
      console.error('Error sending alumni event invitation:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send profile completion reminder
   * @param {string} userId - User ID
   * @param {number} completionPercentage - Profile completion percentage
   * @param {Array} missingFields - List of missing fields
   * @returns {Promise<Object>} Notification result
   */
  async sendProfileCompletionReminder(userId, completionPercentage, missingFields = []) {
    try {
      const notificationData = {
        title: 'Complete Your Alumni Profile',
        message: `Your profile is ${completionPercentage}% complete. Complete it to unlock all features!`,
        type: 'info',
        category: 'social',
        priority: 'low',
        actionUrl: '/alumni/profile/edit',
        data: {
          completionPercentage,
          missingFields
        }
      };

      const result = await this.notificationService.sendToUser(
        userId,
        notificationData,
        ['web']
      );

      return {
        success: true,
        notificationId: result.notificationId,
        message: 'Profile completion reminder sent successfully'
      };
    } catch (error) {
      console.error('Error sending profile completion reminder:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send mentorship request notification
   * @param {string} mentorId - Mentor user ID
   * @param {string} menteeId - Mentee user ID
   * @param {Object} requestData - Request details
   * @returns {Promise<Object>} Notification result
   */
  async sendMentorshipRequestNotification(mentorId, menteeId, requestData) {
    try {
      const mentee = await User.findById(menteeId);
      if (!mentee) {
        throw new Error('Mentee not found');
      }

      const menteeName = `${mentee.firstName} ${mentee.lastName}`;

      const notificationData = {
        title: 'New Mentorship Request',
        message: `${menteeName} has requested you as a mentor`,
        type: 'info',
        category: 'social',
        priority: 'medium',
        actionUrl: `/alumni/mentorship/requests`,
        data: {
          menteeId,
          menteeName,
          focusAreas: requestData.focusAreas || [],
          message: requestData.message || ''
        }
      };

      const result = await this.notificationService.sendToUser(
        mentorId,
        notificationData,
        ['web', 'email', 'push']
      );

      return {
        success: true,
        notificationId: result.notificationId,
        message: 'Mentorship request notification sent successfully'
      };
    } catch (error) {
      console.error('Error sending mentorship request notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send mentorship request response notification
   * @param {string} menteeId - Mentee user ID
   * @param {string} mentorId - Mentor user ID
   * @param {string} status - Request status (accepted/rejected)
   * @param {string} message - Optional message from mentor
   * @returns {Promise<Object>} Notification result
   */
  async sendMentorshipRequestResponseNotification(menteeId, mentorId, status, message = '') {
    try {
      const mentor = await User.findById(mentorId);
      if (!mentor) {
        throw new Error('Mentor not found');
      }

      const mentorProfile = await AlumniProfile.findOne({ userId: mentorId });
      const mentorName = `${mentor.firstName} ${mentor.lastName}`;
      const mentorTitle = mentorProfile?.currentPosition || 'Alumni';

      const notificationData = {
        title: status === 'accepted' ? 'Mentorship Request Accepted' : 'Mentorship Request Update',
        message: status === 'accepted'
          ? `${mentorName} (${mentorTitle}) has accepted your mentorship request`
          : `${mentorName} has declined your mentorship request. ${message}`,
        type: status === 'accepted' ? 'success' : 'info',
        category: 'social',
        priority: status === 'accepted' ? 'high' : 'medium',
        actionUrl: status === 'accepted' ? `/alumni/mentorship/${mentorId}` : '/alumni/mentorship',
        data: {
          mentorId,
          mentorName,
          mentorTitle,
          status,
          message
        }
      };

      const result = await this.notificationService.sendToUser(
        menteeId,
        notificationData,
        ['web', 'email', 'push']
      );

      return {
        success: true,
        notificationId: result.notificationId,
        message: 'Mentorship request response notification sent successfully'
      };
    } catch (error) {
      console.error('Error sending mentorship request response notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send job application received notification to employer
   * @param {string} employerId - Employer user ID
   * @param {Object} application - Application object
   * @returns {Promise<Object>} Notification result
   */
  async sendJobApplicationReceivedNotification(employerId, application) {
    try {
      const applicant = await User.findById(application.applicantId);
      if (!applicant) {
        throw new Error('Applicant not found');
      }

      const notificationData = {
        title: 'New Job Application Received',
        message: `${applicant.firstName} ${applicant.lastName} has applied for ${application.jobId.title}`,
        type: 'info',
        category: 'academic',
        priority: 'medium',
        actionUrl: `/alumni/jobs/applications/${application._id}`,
        data: {
          applicationId: application._id,
          applicantId: application.applicantId,
          applicantName: `${applicant.firstName} ${applicant.lastName}`,
          jobId: application.jobId._id,
          jobTitle: application.jobId.title
        }
      };

      const result = await this.notificationService.sendToUser(
        employerId,
        notificationData,
        ['web', 'email', 'push']
      );

      return {
        success: true,
        notificationId: result.notificationId,
        message: 'Job application received notification sent successfully'
      };
    } catch (error) {
      console.error('Error sending job application received notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send alumni directory update notification
   * @param {string} userId - User ID
   * @param {string} updateType - Type of update
   * @param {Object} updateData - Update details
   * @returns {Promise<Object>} Notification result
   */
  async sendAlumniDirectoryUpdateNotification(userId, updateType, updateData = {}) {
    try {
      const updateMessages = {
        profile_featured: {
          title: 'Your Profile is Featured',
          message: 'Your alumni profile has been featured in the directory',
          type: 'success'
        },
        new_connection: {
          title: 'New Connection',
          message: `You are now connected with ${updateData.connectionName}`,
          type: 'success'
        },
        profile_viewed: {
          title: 'Profile View',
          message: `${updateData.viewerName} viewed your profile`,
          type: 'info'
        }
      };

      const updateConfig = updateMessages[updateType] || {
        title: 'Alumni Directory Update',
        message: 'Your alumni directory has been updated',
        type: 'info'
      };

      const notificationData = {
        ...updateConfig,
        category: 'social',
        priority: 'low',
        actionUrl: '/alumni/profile',
        data: {
          updateType,
          ...updateData
        }
      };

      const result = await this.notificationService.sendToUser(
        userId,
        notificationData,
        ['web']
      );

      return {
        success: true,
        notificationId: result.notificationId,
        message: 'Alumni directory update notification sent successfully'
      };
    } catch (error) {
      console.error('Error sending alumni directory update notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new AlumniNotificationService();
