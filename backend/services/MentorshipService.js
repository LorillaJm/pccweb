const Mentorship = require('../models/Mentorship');
const AlumniProfile = require('../models/AlumniProfile');
const User = require('../models/User');
const notificationService = require('./NotificationService');
const mongoose = require('mongoose');

class MentorshipService {
  constructor() {
    this.notificationService = notificationService;
  }

  /**
   * Request mentorship from a mentor
   * @param {string} menteeId - Mentee user ID
   * @param {string} mentorId - Mentor user ID
   * @param {Object} requestData - Mentorship request data
   * @returns {Promise<Object>} Created mentorship request
   */
  async requestMentorship(menteeId, mentorId, requestData) {
    try {
      // Validate mentor availability
      const mentorProfile = await AlumniProfile.findOne({ userId: mentorId });
      if (!mentorProfile || !mentorProfile.canAcceptMentees) {
        throw new Error('Mentor is not available or has reached maximum mentee capacity');
      }

      // Check if mentorship request already exists
      const existingRequest = await Mentorship.findOne({
        mentorId,
        menteeId,
        status: { $in: ['requested', 'accepted', 'active'] },
        isActive: true
      });

      if (existingRequest) {
        throw new Error('Mentorship request already exists or is active');
      }

      // Create mentorship request
      const mentorship = new Mentorship({
        mentorId,
        menteeId,
        program: requestData.program,
        focusAreas: requestData.focusAreas || [],
        requestMessage: requestData.requestMessage,
        duration: requestData.duration || 6,
        meetingSchedule: requestData.meetingSchedule || {},
        goals: requestData.goals || [],
        status: 'requested'
      });

      await mentorship.save();
      await mentorship.populate('mentorId menteeId', 'firstName lastName email profilePicture');

      // Send notification to mentor
      await this.notificationService.sendNotification(mentorId, {
        title: 'New Mentorship Request',
        message: `${mentorship.menteeId.firstName} ${mentorship.menteeId.lastName} has requested mentorship`,
        type: 'info',
        category: 'social',
        actionUrl: `/alumni/mentorship/requests/${mentorship._id}`,
        data: { mentorshipId: mentorship._id }
      });

      return {
        success: true,
        data: mentorship,
        message: 'Mentorship request sent successfully'
      };
    } catch (error) {
      throw new Error(`Failed to request mentorship: ${error.message}`);
    }
  }

  /**
   * Respond to mentorship request
   * @param {string} mentorshipId - Mentorship ID
   * @param {string} mentorId - Mentor user ID
   * @param {string} response - Response (accepted/rejected)
   * @param {string} responseMessage - Response message
   * @returns {Promise<Object>} Updated mentorship
   */
  async respondToMentorshipRequest(mentorshipId, mentorId, response, responseMessage = '') {
    try {
      const mentorship = await Mentorship.findById(mentorshipId);
      if (!mentorship) {
        throw new Error('Mentorship request not found');
      }

      if (mentorship.mentorId.toString() !== mentorId) {
        throw new Error('Unauthorized to respond to this mentorship request');
      }

      if (mentorship.status !== 'requested') {
        throw new Error('Mentorship request has already been responded to');
      }

      mentorship.status = response;
      mentorship.responseMessage = responseMessage;

      if (response === 'accepted') {
        mentorship.startDate = new Date();
        mentorship.endDate = new Date(Date.now() + mentorship.duration * 30 * 24 * 60 * 60 * 1000); // duration in months

        // Update mentor's mentee count
        const mentorProfile = await AlumniProfile.findOne({ userId: mentorId });
        if (mentorProfile) {
          await mentorProfile.updateMenteeCount(true);
        }
      }

      await mentorship.save();
      await mentorship.populate('mentorId menteeId', 'firstName lastName email profilePicture');

      // Send notification to mentee
      const notificationTitle = response === 'accepted' ? 'Mentorship Request Accepted' : 'Mentorship Request Declined';
      const notificationMessage = response === 'accepted' 
        ? `${mentorship.mentorId.firstName} ${mentorship.mentorId.lastName} has accepted your mentorship request`
        : `${mentorship.mentorId.firstName} ${mentorship.mentorId.lastName} has declined your mentorship request`;

      await this.notificationService.sendNotification(mentorship.menteeId._id, {
        title: notificationTitle,
        message: notificationMessage,
        type: response === 'accepted' ? 'success' : 'info',
        category: 'social',
        actionUrl: `/alumni/mentorship/${mentorship._id}`,
        data: { mentorshipId: mentorship._id }
      });

      return {
        success: true,
        data: mentorship,
        message: `Mentorship request ${response} successfully`
      };
    } catch (error) {
      throw new Error(`Failed to respond to mentorship request: ${error.message}`);
    }
  }

  /**
   * Get mentorship by ID
   * @param {string} mentorshipId - Mentorship ID
   * @param {string} userId - User ID requesting the mentorship
   * @returns {Promise<Object>} Mentorship details
   */
  async getMentorship(mentorshipId, userId) {
    try {
      const mentorship = await Mentorship.findById(mentorshipId)
        .populate('mentorId menteeId', 'firstName lastName email profilePicture')
        .populate('progress.addedBy', 'firstName lastName');

      if (!mentorship) {
        throw new Error('Mentorship not found');
      }

      // Check if user is authorized to view this mentorship
      if (mentorship.mentorId._id.toString() !== userId && 
          mentorship.menteeId._id.toString() !== userId) {
        const user = await User.findById(userId);
        if (!user || user.role !== 'admin') {
          throw new Error('Unauthorized to view this mentorship');
        }
      }

      return {
        success: true,
        data: mentorship
      };
    } catch (error) {
      throw new Error(`Failed to get mentorship: ${error.message}`);
    }
  }

  /**
   * Get mentorships for a user
   * @param {string} userId - User ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} User's mentorships
   */
  async getUserMentorships(userId, filters = {}) {
    try {
      const query = {
        $or: [
          { mentorId: userId },
          { menteeId: userId }
        ],
        isActive: true
      };

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.program) {
        query.program = filters.program;
      }

      const mentorships = await Mentorship.find(query)
        .populate('mentorId menteeId', 'firstName lastName email profilePicture')
        .sort({ createdAt: -1 });

      // Separate mentorships by role
      const asMentor = mentorships.filter(m => m.mentorId._id.toString() === userId);
      const asMentee = mentorships.filter(m => m.menteeId._id.toString() === userId);

      return {
        success: true,
        data: {
          asMentor,
          asMentee,
          total: mentorships.length
        }
      };
    } catch (error) {
      throw new Error(`Failed to get user mentorships: ${error.message}`);
    }
  }

  /**
   * Get pending mentorship requests for a mentor
   * @param {string} mentorId - Mentor user ID
   * @returns {Promise<Object>} Pending requests
   */
  async getPendingRequests(mentorId) {
    try {
      const requests = await Mentorship.findPendingRequests(mentorId);

      return {
        success: true,
        data: requests
      };
    } catch (error) {
      throw new Error(`Failed to get pending requests: ${error.message}`);
    }
  }

  /**
   * Schedule a mentorship session
   * @param {string} mentorshipId - Mentorship ID
   * @param {string} userId - User ID scheduling the session
   * @param {Object} sessionData - Session data
   * @returns {Promise<Object>} Updated mentorship
   */
  async scheduleSession(mentorshipId, userId, sessionData) {
    try {
      const mentorship = await Mentorship.findById(mentorshipId);
      if (!mentorship) {
        throw new Error('Mentorship not found');
      }

      // Check authorization
      if (mentorship.mentorId.toString() !== userId && 
          mentorship.menteeId.toString() !== userId) {
        throw new Error('Unauthorized to schedule session for this mentorship');
      }

      await mentorship.scheduleSession(sessionData);
      await mentorship.populate('mentorId menteeId', 'firstName lastName email');

      // Send notification to the other party
      const otherPartyId = mentorship.mentorId.toString() === userId 
        ? mentorship.menteeId._id 
        : mentorship.mentorId._id;

      const schedulerName = mentorship.mentorId.toString() === userId 
        ? `${mentorship.mentorId.firstName} ${mentorship.mentorId.lastName}`
        : `${mentorship.menteeId.firstName} ${mentorship.menteeId.lastName}`;

      await this.notificationService.sendNotification(otherPartyId, {
        title: 'Mentorship Session Scheduled',
        message: `${schedulerName} has scheduled a mentorship session`,
        type: 'info',
        category: 'social',
        actionUrl: `/alumni/mentorship/${mentorship._id}`,
        data: { 
          mentorshipId: mentorship._id,
          sessionDate: sessionData.scheduledDate
        }
      });

      return {
        success: true,
        data: mentorship,
        message: 'Session scheduled successfully'
      };
    } catch (error) {
      throw new Error(`Failed to schedule session: ${error.message}`);
    }
  }

  /**
   * Complete a mentorship session
   * @param {string} mentorshipId - Mentorship ID
   * @param {string} sessionId - Session ID
   * @param {string} userId - User ID completing the session
   * @param {Object} sessionData - Session completion data
   * @returns {Promise<Object>} Updated mentorship
   */
  async completeSession(mentorshipId, sessionId, userId, sessionData) {
    try {
      const mentorship = await Mentorship.findById(mentorshipId);
      if (!mentorship) {
        throw new Error('Mentorship not found');
      }

      // Check authorization
      if (mentorship.mentorId.toString() !== userId && 
          mentorship.menteeId.toString() !== userId) {
        throw new Error('Unauthorized to complete session for this mentorship');
      }

      await mentorship.completeSession(sessionId, sessionData);

      return {
        success: true,
        data: mentorship,
        message: 'Session completed successfully'
      };
    } catch (error) {
      throw new Error(`Failed to complete session: ${error.message}`);
    }
  }

  /**
   * Add progress update to mentorship
   * @param {string} mentorshipId - Mentorship ID
   * @param {string} userId - User ID adding progress
   * @param {Object} progressData - Progress data
   * @returns {Promise<Object>} Updated mentorship
   */
  async addProgress(mentorshipId, userId, progressData) {
    try {
      const mentorship = await Mentorship.findById(mentorshipId);
      if (!mentorship) {
        throw new Error('Mentorship not found');
      }

      // Check authorization
      if (mentorship.mentorId.toString() !== userId && 
          mentorship.menteeId.toString() !== userId) {
        throw new Error('Unauthorized to add progress to this mentorship');
      }

      await mentorship.addProgress(progressData, userId);
      await mentorship.populate('mentorId menteeId', 'firstName lastName email');

      // Send notification to the other party
      const otherPartyId = mentorship.mentorId.toString() === userId 
        ? mentorship.menteeId._id 
        : mentorship.mentorId._id;

      const updaterName = mentorship.mentorId.toString() === userId 
        ? `${mentorship.mentorId.firstName} ${mentorship.mentorId.lastName}`
        : `${mentorship.menteeId.firstName} ${mentorship.menteeId.lastName}`;

      await this.notificationService.sendNotification(otherPartyId, {
        title: 'Mentorship Progress Update',
        message: `${updaterName} has added a progress update`,
        type: 'info',
        category: 'social',
        actionUrl: `/alumni/mentorship/${mentorship._id}`,
        data: { mentorshipId: mentorship._id }
      });

      return {
        success: true,
        data: mentorship,
        message: 'Progress added successfully'
      };
    } catch (error) {
      throw new Error(`Failed to add progress: ${error.message}`);
    }
  }

  /**
   * Update goal status
   * @param {string} mentorshipId - Mentorship ID
   * @param {string} goalId - Goal ID
   * @param {string} userId - User ID updating the goal
   * @param {string} status - New goal status
   * @param {string} notes - Goal notes
   * @returns {Promise<Object>} Updated mentorship
   */
  async updateGoalStatus(mentorshipId, goalId, userId, status, notes = '') {
    try {
      const mentorship = await Mentorship.findById(mentorshipId);
      if (!mentorship) {
        throw new Error('Mentorship not found');
      }

      // Check authorization
      if (mentorship.mentorId.toString() !== userId && 
          mentorship.menteeId.toString() !== userId) {
        throw new Error('Unauthorized to update goals for this mentorship');
      }

      await mentorship.updateGoalStatus(goalId, status, notes);

      return {
        success: true,
        data: mentorship,
        message: 'Goal status updated successfully'
      };
    } catch (error) {
      throw new Error(`Failed to update goal status: ${error.message}`);
    }
  }

  /**
   * Submit feedback for mentorship
   * @param {string} mentorshipId - Mentorship ID
   * @param {string} userId - User ID submitting feedback
   * @param {Object} feedbackData - Feedback data
   * @returns {Promise<Object>} Updated mentorship
   */
  async submitFeedback(mentorshipId, userId, feedbackData) {
    try {
      const mentorship = await Mentorship.findById(mentorshipId);
      if (!mentorship) {
        throw new Error('Mentorship not found');
      }

      // Determine user role
      let userRole;
      if (mentorship.mentorId.toString() === userId) {
        userRole = 'mentor';
      } else if (mentorship.menteeId.toString() === userId) {
        userRole = 'mentee';
      } else {
        throw new Error('Unauthorized to submit feedback for this mentorship');
      }

      await mentorship.submitFeedback(feedbackData, userRole);

      return {
        success: true,
        data: mentorship,
        message: 'Feedback submitted successfully'
      };
    } catch (error) {
      throw new Error(`Failed to submit feedback: ${error.message}`);
    }
  }

  /**
   * Complete mentorship
   * @param {string} mentorshipId - Mentorship ID
   * @param {string} userId - User ID completing the mentorship
   * @returns {Promise<Object>} Completed mentorship
   */
  async completeMentorship(mentorshipId, userId) {
    try {
      const mentorship = await Mentorship.findById(mentorshipId);
      if (!mentorship) {
        throw new Error('Mentorship not found');
      }

      // Check authorization (both mentor and mentee can complete)
      if (mentorship.mentorId.toString() !== userId && 
          mentorship.menteeId.toString() !== userId) {
        throw new Error('Unauthorized to complete this mentorship');
      }

      mentorship.status = 'completed';
      mentorship.endDate = new Date();
      await mentorship.save();

      // Update mentor's mentee count
      const mentorProfile = await AlumniProfile.findOne({ userId: mentorship.mentorId });
      if (mentorProfile) {
        await mentorProfile.updateMenteeCount(false);
      }

      // Generate completion certificate
      await mentorship.generateCompletionCertificate();

      await mentorship.populate('mentorId menteeId', 'firstName lastName email');

      // Send completion notifications
      await Promise.all([
        this.notificationService.sendNotification(mentorship.mentorId._id, {
          title: 'Mentorship Completed',
          message: 'Your mentorship has been completed successfully',
          type: 'success',
          category: 'social',
          actionUrl: `/alumni/mentorship/${mentorship._id}`,
          data: { mentorshipId: mentorship._id }
        }),
        this.notificationService.sendNotification(mentorship.menteeId._id, {
          title: 'Mentorship Completed',
          message: 'Your mentorship has been completed successfully',
          type: 'success',
          category: 'social',
          actionUrl: `/alumni/mentorship/${mentorship._id}`,
          data: { mentorshipId: mentorship._id }
        })
      ]);

      return {
        success: true,
        data: mentorship,
        message: 'Mentorship completed successfully'
      };
    } catch (error) {
      throw new Error(`Failed to complete mentorship: ${error.message}`);
    }
  }

  /**
   * Get mentorship statistics
   * @param {string} userId - User ID (optional, for user-specific stats)
   * @param {string} role - User role (mentor/mentee)
   * @returns {Promise<Object>} Mentorship statistics
   */
  async getMentorshipStats(userId = null, role = null) {
    try {
      let stats;

      if (userId && role) {
        // Get user-specific stats
        stats = await Mentorship.getMentorshipStats(userId, role);
      } else {
        // Get overall stats
        stats = await Mentorship.aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              avgDuration: { $avg: '$duration' }
            }
          }
        ]);
      }

      // Get additional metrics
      const additionalStats = await Mentorship.aggregate([
        {
          $facet: {
            programStats: [
              {
                $group: {
                  _id: '$program',
                  count: { $sum: 1 }
                }
              }
            ],
            monthlyTrends: [
              {
                $group: {
                  _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                  },
                  newMentorships: { $sum: 1 }
                }
              },
              { $sort: { '_id.year': 1, '_id.month': 1 } }
            ],
            completionRates: [
              {
                $group: {
                  _id: null,
                  total: { $sum: 1 },
                  completed: {
                    $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                  },
                  active: {
                    $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                  }
                }
              }
            ]
          }
        }
      ]);

      return {
        success: true,
        data: {
          statusDistribution: stats,
          programDistribution: additionalStats[0].programStats,
          monthlyTrends: additionalStats[0].monthlyTrends,
          completionMetrics: additionalStats[0].completionRates[0] || {}
        }
      };
    } catch (error) {
      throw new Error(`Failed to get mentorship stats: ${error.message}`);
    }
  }

  /**
   * Find mentorship matches for a user
   * @param {string} userId - User ID looking for mentorship
   * @param {Object} preferences - Matching preferences
   * @returns {Promise<Object>} Potential mentorship matches
   */
  async findMentorshipMatches(userId, preferences = {}) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get user's profile for matching
      let userProfile = null;
      if (user.isAlumni) {
        userProfile = await AlumniProfile.findOne({ userId });
      }

      // Find available mentors based on preferences
      const mentors = await AlumniProfile.findAvailableMentors(
        preferences.expertise,
        preferences.menteeLevel || 'undergraduate'
      );

      // Score mentors based on compatibility
      const scoredMentors = mentors.map(mentor => {
        let score = 0;

        // Industry match
        if (userProfile && userProfile.industry && mentor.industry === userProfile.industry) {
          score += 20;
        }

        // Skills overlap
        if (userProfile && userProfile.skills && mentor.skills) {
          const commonSkills = userProfile.skills.filter(skill => 
            mentor.skills.some(mentorSkill => 
              mentorSkill.toLowerCase().includes(skill.toLowerCase())
            )
          );
          score += commonSkills.length * 5;
        }

        // Graduation year proximity (for alumni mentees)
        if (userProfile && userProfile.graduationYear && mentor.graduationYear) {
          const yearDiff = Math.abs(mentor.graduationYear - userProfile.graduationYear);
          if (yearDiff >= 3 && yearDiff <= 10) { // Ideal mentor-mentee gap
            score += 15;
          }
        }

        // Expertise match
        if (preferences.expertise && mentor.mentorshipAvailability.expertise.includes(preferences.expertise)) {
          score += 25;
        }

        // Availability score
        const availabilityRatio = 1 - (mentor.mentorshipAvailability.currentMentees / mentor.mentorshipAvailability.maxMentees);
        score += availabilityRatio * 10;

        return {
          ...mentor.toJSON(),
          matchScore: score
        };
      });

      // Sort by match score
      scoredMentors.sort((a, b) => b.matchScore - a.matchScore);

      return {
        success: true,
        data: {
          matches: scoredMentors.slice(0, 10), // Top 10 matches
          total: scoredMentors.length
        }
      };
    } catch (error) {
      throw new Error(`Failed to find mentorship matches: ${error.message}`);
    }
  }
}

module.exports = MentorshipService;