const AlumniProfile = require('../models/AlumniProfile');
const User = require('../models/User');
const Mentorship = require('../models/Mentorship');
const alumniNotificationService = require('./AlumniNotificationService');
const mongoose = require('mongoose');

class AlumniService {
  /**
   * Create or update alumni profile
   * @param {string} userId - User ID
   * @param {Object} profileData - Alumni profile data
   * @returns {Promise<Object>} Created/updated alumni profile
   */
  async createOrUpdateProfile(userId, profileData) {
    try {
      // Verify user exists and is eligible for alumni status
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if profile already exists
      let alumniProfile = await AlumniProfile.findOne({ userId });

      if (alumniProfile) {
        // Update existing profile
        Object.assign(alumniProfile, profileData);
        alumniProfile.lastModified = new Date();
      } else {
        // Create new profile
        alumniProfile = new AlumniProfile({
          userId,
          ...profileData,
          verificationStatus: 'pending'
        });

        // Update user role to alumni if not already set
        if (!user.isAlumni) {
          user.isAlumni = true;
          user.alumniVerificationStatus = 'pending';
          await user.save();
        }
      }

      await alumniProfile.save();
      
      // Populate user data for response
      await alumniProfile.populate('userId', 'firstName lastName email profilePicture');
      
      return {
        success: true,
        data: alumniProfile,
        message: alumniProfile.isNew ? 'Alumni profile created successfully' : 'Alumni profile updated successfully'
      };
    } catch (error) {
      throw new Error(`Failed to create/update alumni profile: ${error.message}`);
    }
  }

  /**
   * Get alumni profile by user ID
   * @param {string} userId - User ID
   * @param {string} viewerId - ID of user viewing the profile (for privacy)
   * @returns {Promise<Object>} Alumni profile
   */
  async getProfile(userId, viewerId = null) {
    try {
      const alumniProfile = await AlumniProfile.findOne({ userId, isActive: true })
        .populate('userId', 'firstName lastName email profilePicture');

      if (!alumniProfile) {
        throw new Error('Alumni profile not found');
      }

      // Increment profile views if viewed by someone else
      if (viewerId && viewerId !== userId) {
        await alumniProfile.incrementProfileViews();
      }

      // Apply privacy settings if viewer is not the profile owner
      let profileData = alumniProfile.toJSON();
      if (viewerId !== userId) {
        profileData = this._applyPrivacySettings(profileData, alumniProfile.privacySettings);
      }

      return {
        success: true,
        data: profileData
      };
    } catch (error) {
      throw new Error(`Failed to get alumni profile: ${error.message}`);
    }
  }

  /**
   * Search alumni profiles with filters
   * @param {Object} filters - Search filters
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Search results
   */
  async searchAlumni(filters = {}, pagination = { page: 1, limit: 20 }) {
    try {
      const query = {
        isActive: true,
        verificationStatus: 'verified',
        'privacySettings.showInDirectory': true
      };

      // Apply filters
      if (filters.graduationYear) {
        if (typeof filters.graduationYear === 'object') {
          query.graduationYear = filters.graduationYear; // Range query
        } else {
          query.graduationYear = filters.graduationYear;
        }
      }

      if (filters.degree) {
        query.degree = new RegExp(filters.degree, 'i');
      }

      if (filters.industry) {
        query.industry = new RegExp(filters.industry, 'i');
      }

      if (filters.location) {
        query.location = new RegExp(filters.location, 'i');
      }

      if (filters.skills && filters.skills.length > 0) {
        query.skills = { $in: filters.skills.map(skill => new RegExp(skill, 'i')) };
      }

      if (filters.company) {
        query.currentCompany = new RegExp(filters.company, 'i');
      }

      if (filters.mentorshipAvailable) {
        query['mentorshipAvailability.isAvailable'] = true;
        query.$expr = {
          $lt: ['$mentorshipAvailability.currentMentees', '$mentorshipAvailability.maxMentees']
        };
      }

      // Text search
      if (filters.searchTerm) {
        const searchRegex = new RegExp(filters.searchTerm, 'i');
        query.$or = [
          { 'userId.firstName': searchRegex },
          { 'userId.lastName': searchRegex },
          { currentPosition: searchRegex },
          { currentCompany: searchRegex },
          { skills: { $in: [searchRegex] } },
          { industry: searchRegex }
        ];
      }

      const skip = (pagination.page - 1) * pagination.limit;
      
      const [alumni, total] = await Promise.all([
        AlumniProfile.find(query)
          .populate('userId', 'firstName lastName email profilePicture')
          .sort({ 'networkingStats.lastActive': -1, createdAt: -1 })
          .skip(skip)
          .limit(pagination.limit),
        AlumniProfile.countDocuments(query)
      ]);

      // Apply privacy settings to all profiles
      const sanitizedAlumni = alumni.map(profile => 
        this._applyPrivacySettings(profile.toJSON(), profile.privacySettings)
      );

      return {
        success: true,
        data: {
          alumni: sanitizedAlumni,
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total,
            pages: Math.ceil(total / pagination.limit)
          }
        }
      };
    } catch (error) {
      throw new Error(`Failed to search alumni: ${error.message}`);
    }
  }

  /**
   * Get alumni by graduation year range
   * @param {number} startYear - Start year
   * @param {number} endYear - End year
   * @returns {Promise<Object>} Alumni list
   */
  async getAlumniByGraduationRange(startYear, endYear) {
    try {
      const alumni = await AlumniProfile.findByGraduationRange(startYear, endYear);
      
      return {
        success: true,
        data: alumni.map(profile => 
          this._applyPrivacySettings(profile.toJSON(), profile.privacySettings)
        )
      };
    } catch (error) {
      throw new Error(`Failed to get alumni by graduation range: ${error.message}`);
    }
  }

  /**
   * Get available mentors
   * @param {string} expertise - Expertise area
   * @param {string} menteeLevel - Mentee level
   * @returns {Promise<Object>} Available mentors
   */
  async getAvailableMentors(expertise = null, menteeLevel = null) {
    try {
      const mentors = await AlumniProfile.findAvailableMentors(expertise, menteeLevel);
      
      return {
        success: true,
        data: mentors.map(profile => 
          this._applyPrivacySettings(profile.toJSON(), profile.privacySettings)
        )
      };
    } catch (error) {
      throw new Error(`Failed to get available mentors: ${error.message}`);
    }
  }

  /**
   * Update mentorship availability
   * @param {string} userId - User ID
   * @param {Object} availabilityData - Mentorship availability data
   * @returns {Promise<Object>} Updated profile
   */
  async updateMentorshipAvailability(userId, availabilityData) {
    try {
      const alumniProfile = await AlumniProfile.findOne({ userId });
      if (!alumniProfile) {
        throw new Error('Alumni profile not found');
      }

      alumniProfile.mentorshipAvailability = {
        ...alumniProfile.mentorshipAvailability,
        ...availabilityData
      };

      await alumniProfile.save();

      return {
        success: true,
        data: alumniProfile,
        message: 'Mentorship availability updated successfully'
      };
    } catch (error) {
      throw new Error(`Failed to update mentorship availability: ${error.message}`);
    }
  }

  /**
   * Verify alumni profile
   * @param {string} profileId - Alumni profile ID
   * @param {string} adminId - Admin user ID
   * @param {string} status - Verification status
   * @param {string} reason - Reason for rejection (if applicable)
   * @returns {Promise<Object>} Verification result
   */
  async verifyAlumniProfile(profileId, adminId, status, reason = null) {
    try {
      const alumniProfile = await AlumniProfile.findById(profileId);
      if (!alumniProfile) {
        throw new Error('Alumni profile not found');
      }

      alumniProfile.verificationStatus = status;
      
      if (status === 'rejected' && reason) {
        alumniProfile.rejectionReason = reason;
      }

      await alumniProfile.save();

      // Update user's alumni verification status
      const user = await User.findById(alumniProfile.userId);
      if (user) {
        user.alumniVerificationStatus = status;
        await user.save();
      }

      // Send verification notification
      await alumniNotificationService.sendVerificationNotification(
        alumniProfile.userId,
        status,
        reason
      );

      return {
        success: true,
        data: alumniProfile,
        message: `Alumni profile ${status} successfully`
      };
    } catch (error) {
      throw new Error(`Failed to verify alumni profile: ${error.message}`);
    }
  }

  /**
   * Get alumni analytics and engagement data
   * @param {Object} filters - Analytics filters
   * @returns {Promise<Object>} Analytics data
   */
  async getAlumniAnalytics(filters = {}) {
    try {
      const matchStage = {
        isActive: true,
        verificationStatus: 'verified'
      };

      // Apply date filters
      if (filters.startDate || filters.endDate) {
        matchStage.createdAt = {};
        if (filters.startDate) matchStage.createdAt.$gte = new Date(filters.startDate);
        if (filters.endDate) matchStage.createdAt.$lte = new Date(filters.endDate);
      }

      const analytics = await AlumniProfile.aggregate([
        { $match: matchStage },
        {
          $facet: {
            // Total counts
            totalStats: [
              {
                $group: {
                  _id: null,
                  totalAlumni: { $sum: 1 },
                  totalMentors: {
                    $sum: {
                      $cond: ['$mentorshipAvailability.isAvailable', 1, 0]
                    }
                  },
                  totalProfileViews: { $sum: '$networkingStats.profileViews' },
                  averageProfileViews: { $avg: '$networkingStats.profileViews' }
                }
              }
            ],
            
            // Graduation year distribution
            graduationYearStats: [
              {
                $group: {
                  _id: '$graduationYear',
                  count: { $sum: 1 }
                }
              },
              { $sort: { _id: -1 } }
            ],
            
            // Industry distribution
            industryStats: [
              {
                $group: {
                  _id: '$industry',
                  count: { $sum: 1 }
                }
              },
              { $sort: { count: -1 } },
              { $limit: 10 }
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
            
            // Skills analysis
            skillsStats: [
              { $unwind: '$skills' },
              {
                $group: {
                  _id: '$skills',
                  count: { $sum: 1 }
                }
              },
              { $sort: { count: -1 } },
              { $limit: 20 }
            ],
            
            // Mentorship stats
            mentorshipStats: [
              {
                $group: {
                  _id: null,
                  availableMentors: {
                    $sum: {
                      $cond: ['$mentorshipAvailability.isAvailable', 1, 0]
                    }
                  },
                  totalMentorCapacity: { $sum: '$mentorshipAvailability.maxMentees' },
                  currentMentees: { $sum: '$mentorshipAvailability.currentMentees' }
                }
              }
            ]
          }
        }
      ]);

      // Get recent activity stats
      const recentActivity = await AlumniProfile.aggregate([
        {
          $match: {
            ...matchStage,
            'networkingStats.lastActive': {
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$networkingStats.lastActive'
              }
            },
            activeAlumni: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      return {
        success: true,
        data: {
          overview: analytics[0].totalStats[0] || {},
          graduationYears: analytics[0].graduationYearStats,
          industries: analytics[0].industryStats,
          locations: analytics[0].locationStats,
          topSkills: analytics[0].skillsStats,
          mentorship: analytics[0].mentorshipStats[0] || {},
          recentActivity
        }
      };
    } catch (error) {
      throw new Error(`Failed to get alumni analytics: ${error.message}`);
    }
  }

  /**
   * Get networking suggestions for a user
   * @param {string} userId - User ID
   * @param {number} limit - Number of suggestions
   * @returns {Promise<Object>} Networking suggestions
   */
  async getNetworkingSuggestions(userId, limit = 10) {
    try {
      const userProfile = await AlumniProfile.findOne({ userId }).populate('userId');
      if (!userProfile) {
        throw new Error('Alumni profile not found');
      }

      // Find alumni with similar backgrounds
      const suggestions = await AlumniProfile.find({
        userId: { $ne: userId },
        isActive: true,
        verificationStatus: 'verified',
        'privacySettings.showInDirectory': true,
        $or: [
          { industry: userProfile.industry },
          { skills: { $in: userProfile.skills } },
          { graduationYear: { $gte: userProfile.graduationYear - 2, $lte: userProfile.graduationYear + 2 } },
          { degree: userProfile.degree }
        ]
      })
      .populate('userId', 'firstName lastName email profilePicture')
      .limit(limit)
      .sort({ 'networkingStats.profileViews': -1 });

      return {
        success: true,
        data: suggestions.map(profile => 
          this._applyPrivacySettings(profile.toJSON(), profile.privacySettings)
        )
      };
    } catch (error) {
      throw new Error(`Failed to get networking suggestions: ${error.message}`);
    }
  }

  /**
   * Update networking statistics
   * @param {string} userId - User ID
   * @param {Object} stats - Statistics to update
   * @returns {Promise<Object>} Updated profile
   */
  async updateNetworkingStats(userId, stats) {
    try {
      const alumniProfile = await AlumniProfile.findOne({ userId });
      if (!alumniProfile) {
        throw new Error('Alumni profile not found');
      }

      if (stats.connectionsCount !== undefined) {
        alumniProfile.networkingStats.connectionsCount = stats.connectionsCount;
      }

      alumniProfile.networkingStats.lastActive = new Date();
      await alumniProfile.save();

      return {
        success: true,
        data: alumniProfile
      };
    } catch (error) {
      throw new Error(`Failed to update networking stats: ${error.message}`);
    }
  }

  /**
   * Apply privacy settings to profile data
   * @private
   * @param {Object} profileData - Profile data
   * @param {Object} privacySettings - Privacy settings
   * @returns {Object} Sanitized profile data
   */
  _applyPrivacySettings(profileData, privacySettings) {
    const sanitized = { ...profileData };

    if (!privacySettings.showContactInfo) {
      delete sanitized.socialLinks;
      if (sanitized.userId) {
        delete sanitized.userId.email;
      }
    }

    if (!privacySettings.showCareerHistory) {
      delete sanitized.careerHistory;
      delete sanitized.currentPosition;
      delete sanitized.currentCompany;
    }

    if (!privacySettings.showGraduationYear) {
      delete sanitized.graduationYear;
    }

    return sanitized;
  }
}

module.exports = AlumniService;