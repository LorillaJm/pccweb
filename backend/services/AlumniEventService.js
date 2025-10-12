const Event = require('../models/Event');
const EventTicket = require('../models/EventTicket');
const EventRegistration = require('../models/EventRegistration');
const AlumniProfile = require('../models/AlumniProfile');
const User = require('../models/User');
const EventService = require('./EventService');
const notificationService = require('./NotificationService');
const mongoose = require('mongoose');

class AlumniEventService extends EventService {
  constructor() {
    super();
    this.notificationService = notificationService;
  }

  /**
   * Create alumni-specific event
   * @param {string} organizerId - Event organizer ID
   * @param {Object} eventData - Event data
   * @returns {Promise<Object>} Created event
   */
  async createAlumniEvent(organizerId, eventData) {
    try {
      // Verify organizer is alumni or admin
      const organizer = await User.findById(organizerId);
      if (!organizer || (!organizer.isAlumni && organizer.role !== 'admin')) {
        throw new Error('Only alumni or administrators can create alumni events');
      }

      // Add alumni-specific fields
      const alumniEventData = {
        ...eventData,
        category: eventData.category || 'social',
        tags: [...(eventData.tags || []), 'alumni'],
        targetAudience: eventData.targetAudience || 'alumni', // alumni, students, both
        graduationYearRange: eventData.graduationYearRange || null,
        industryFocus: eventData.industryFocus || null,
        networkingOpportunities: eventData.networkingOpportunities || true,
        mentorshipOpportunities: eventData.mentorshipOpportunities || false,
        careerFocus: eventData.careerFocus || false
      };

      const result = await this.createEvent(organizerId, alumniEventData);
      
      // Send notifications to relevant alumni
      if (result.success && eventData.notifyAlumni) {
        await this.notifyRelevantAlumni(result.data, eventData.targetAudience);
      }

      return result;
    } catch (error) {
      throw new Error(`Failed to create alumni event: ${error.message}`);
    }
  }

  /**
   * Get alumni events with filtering
   * @param {Object} filters - Event filters
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Alumni events
   */
  async getAlumniEvents(filters = {}, pagination = { page: 1, limit: 20 }) {
    try {
      const query = {
        status: 'published',
        $or: [
          { tags: 'alumni' },
          { targetAudience: { $in: ['alumni', 'both'] } }
        ]
      };

      // Apply filters
      if (filters.category) {
        query.category = filters.category;
      }

      if (filters.graduationYear) {
        query.$or = [
          { graduationYearRange: { $exists: false } },
          { 
            'graduationYearRange.start': { $lte: filters.graduationYear },
            'graduationYearRange.end': { $gte: filters.graduationYear }
          }
        ];
      }

      if (filters.industry) {
        query.$or = [
          { industryFocus: { $exists: false } },
          { industryFocus: new RegExp(filters.industry, 'i') }
        ];
      }

      if (filters.networkingOpportunities) {
        query.networkingOpportunities = true;
      }

      if (filters.mentorshipOpportunities) {
        query.mentorshipOpportunities = true;
      }

      if (filters.careerFocus) {
        query.careerFocus = true;
      }

      if (filters.dateRange) {
        query.startDate = {
          $gte: new Date(filters.dateRange.start),
          $lte: new Date(filters.dateRange.end)
        };
      } else {
        // Default to upcoming events
        query.startDate = { $gte: new Date() };
      }

      const skip = (pagination.page - 1) * pagination.limit;

      const [events, total] = await Promise.all([
        Event.find(query)
          .populate('organizer', 'firstName lastName email')
          .sort({ startDate: 1 })
          .skip(skip)
          .limit(pagination.limit),
        Event.countDocuments(query)
      ]);

      // Enhance events with alumni-specific data
      const enhancedEvents = await Promise.all(
        events.map(event => this.enhanceEventWithAlumniData(event))
      );

      return {
        success: true,
        data: {
          events: enhancedEvents,
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total,
            pages: Math.ceil(total / pagination.limit)
          }
        }
      };
    } catch (error) {
      throw new Error(`Failed to get alumni events: ${error.message}`);
    }
  }

  /**
   * Register alumni for event with networking preferences and ticketing
   * @param {string} eventId - Event ID
   * @param {string} userId - User ID
   * @param {Object} registrationData - Registration data
   * @returns {Promise<Object>} Registration result
   */
  async registerAlumniForEvent(eventId, userId, registrationData = {}) {
    try {
      // Verify user is alumni
      const user = await User.findById(userId);
      if (!user || !user.isAlumni) {
        throw new Error('Only alumni can register for alumni events');
      }

      const alumniProfile = await AlumniProfile.findOne({ userId });
      if (!alumniProfile) {
        throw new Error('Alumni profile not found');
      }

      // Add alumni-specific registration data
      const alumniRegistrationData = {
        ...registrationData,
        graduationYear: alumniProfile.graduationYear,
        degree: alumniProfile.degree,
        currentPosition: alumniProfile.currentPosition,
        currentCompany: alumniProfile.currentCompany,
        industry: alumniProfile.industry,
        networkingInterests: registrationData.networkingInterests || [],
        mentorshipInterests: registrationData.mentorshipInterests || {
          willingToMentor: false,
          seekingMentor: false,
          expertise: []
        },
        careerGoals: registrationData.careerGoals || [],
        alumniDiscount: this.calculateAlumniDiscount(alumniProfile)
      };

      const result = await this.registerForEvent(eventId, userId, alumniRegistrationData);

      // If successful, create networking opportunities and generate ticket
      if (result.success) {
        await this.createNetworkingOpportunities(eventId, userId, alumniRegistrationData);
        
        // Generate digital ticket with QR code for alumni events
        if (result.data.ticket) {
          await this.enhanceTicketWithAlumniData(result.data.ticket, alumniProfile);
        }
      }

      return result;
    } catch (error) {
      throw new Error(`Failed to register alumni for event: ${error.message}`);
    }
  }

  /**
   * Calculate alumni discount based on profile
   * @private
   * @param {Object} alumniProfile - Alumni profile
   * @returns {number} Discount percentage
   */
  calculateAlumniDiscount(alumniProfile) {
    let discount = 0;
    
    // Base alumni discount
    discount += 10;
    
    // Long-time alumni discount
    const yearsGraduated = new Date().getFullYear() - alumniProfile.graduationYear;
    if (yearsGraduated >= 10) {
      discount += 5;
    }
    
    // Active mentor discount
    if (alumniProfile.mentorshipAvailability.isAvailable) {
      discount += 5;
    }
    
    // High engagement discount
    if (alumniProfile.networkingStats.connectionsCount >= 20) {
      discount += 5;
    }
    
    return Math.min(discount, 25); // Max 25% discount
  }

  /**
   * Enhance ticket with alumni-specific data
   * @private
   * @param {Object} ticket - Event ticket
   * @param {Object} alumniProfile - Alumni profile
   */
  async enhanceTicketWithAlumniData(ticket, alumniProfile) {
    try {
      // Add alumni-specific data to ticket
      ticket.alumniData = {
        graduationYear: alumniProfile.graduationYear,
        degree: alumniProfile.degree,
        industry: alumniProfile.industry,
        networkingProfile: {
          willingToMentor: alumniProfile.mentorshipAvailability.isAvailable,
          expertise: alumniProfile.mentorshipAvailability.expertise,
          interests: alumniProfile.skills
        }
      };
      
      await ticket.save();
    } catch (error) {
      console.error('Failed to enhance ticket with alumni data:', error);
    }
  }

  /**
   * Get networking opportunities for an event
   * @param {string} eventId - Event ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Networking opportunities
   */
  async getEventNetworkingOpportunities(eventId, userId) {
    try {
      const event = await Event.findById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      const userRegistration = await EventRegistration.findOne({ eventId, userId });
      if (!userRegistration) {
        throw new Error('User not registered for this event');
      }

      const userProfile = await AlumniProfile.findOne({ userId });
      if (!userProfile) {
        throw new Error('Alumni profile not found');
      }

      // Find other registered alumni with similar interests
      const otherRegistrations = await EventRegistration.find({
        eventId,
        userId: { $ne: userId },
        status: 'confirmed'
      }).populate('userId', 'firstName lastName email profilePicture');

      const networkingMatches = [];

      for (const registration of otherRegistrations) {
        const otherProfile = await AlumniProfile.findOne({ userId: registration.userId._id });
        if (!otherProfile) continue;

        let matchScore = 0;
        const matchReasons = [];

        // Industry match
        if (userProfile.industry && otherProfile.industry === userProfile.industry) {
          matchScore += 20;
          matchReasons.push('Same industry');
        }

        // Skills overlap
        if (userProfile.skills && otherProfile.skills) {
          const commonSkills = userProfile.skills.filter(skill => 
            otherProfile.skills.some(otherSkill => 
              otherSkill.toLowerCase().includes(skill.toLowerCase())
            )
          );
          if (commonSkills.length > 0) {
            matchScore += commonSkills.length * 5;
            matchReasons.push(`${commonSkills.length} common skills`);
          }
        }

        // Graduation year proximity
        const yearDiff = Math.abs(userProfile.graduationYear - otherProfile.graduationYear);
        if (yearDiff <= 3) {
          matchScore += 15;
          matchReasons.push('Similar graduation years');
        }

        // Networking interests overlap
        if (registration.registrationData?.networkingInterests && userRegistration.registrationData?.networkingInterests) {
          const commonInterests = registration.registrationData.networkingInterests.filter(interest =>
            userRegistration.registrationData.networkingInterests.includes(interest)
          );
          if (commonInterests.length > 0) {
            matchScore += commonInterests.length * 10;
            matchReasons.push(`${commonInterests.length} common networking interests`);
          }
        }

        // Mentorship opportunities
        if (registration.registrationData?.mentorshipInterests?.willingToMentor && 
            userRegistration.registrationData?.mentorshipInterests?.seekingMentor) {
          matchScore += 25;
          matchReasons.push('Potential mentorship opportunity');
        }

        if (matchScore > 0) {
          networkingMatches.push({
            profile: otherProfile,
            user: registration.userId,
            matchScore,
            matchReasons,
            registrationData: registration.registrationData
          });
        }
      }

      // Sort by match score
      networkingMatches.sort((a, b) => b.matchScore - a.matchScore);

      return {
        success: true,
        data: {
          event,
          userProfile,
          networkingMatches: networkingMatches.slice(0, 10), // Top 10 matches
          totalMatches: networkingMatches.length
        }
      };
    } catch (error) {
      throw new Error(`Failed to get networking opportunities: ${error.message}`);
    }
  }

  /**
   * Get alumni event analytics
   * @param {string} eventId - Event ID (optional, for specific event)
   * @param {Object} filters - Analytics filters
   * @returns {Promise<Object>} Event analytics
   */
  async getAlumniEventAnalytics(eventId = null, filters = {}) {
    try {
      const matchStage = {
        $or: [
          { tags: 'alumni' },
          { targetAudience: { $in: ['alumni', 'both'] } }
        ]
      };

      if (eventId) {
        matchStage._id = mongoose.Types.ObjectId(eventId);
      }

      if (filters.dateRange) {
        matchStage.startDate = {
          $gte: new Date(filters.dateRange.start),
          $lte: new Date(filters.dateRange.end)
        };
      }

      const analytics = await Event.aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: 'eventregistrations',
            localField: '_id',
            foreignField: 'eventId',
            as: 'registrations'
          }
        },
        {
          $lookup: {
            from: 'alumniprofiles',
            localField: 'registrations.userId',
            foreignField: 'userId',
            as: 'attendeeProfiles'
          }
        },
        {
          $addFields: {
            alumniAttendees: {
              $filter: {
                input: '$attendeeProfiles',
                cond: { $ne: ['$$this', null] }
              }
            }
          }
        },
        {
          $group: {
            _id: eventId ? '$_id' : null,
            totalEvents: { $sum: 1 },
            totalRegistrations: { $sum: { $size: '$registrations' } },
            totalAlumniAttendees: { $sum: { $size: '$alumniAttendees' } },
            avgRegistrationsPerEvent: { $avg: { $size: '$registrations' } },
            graduationYearDistribution: {
              $push: {
                $map: {
                  input: '$alumniAttendees',
                  as: 'profile',
                  in: '$$profile.graduationYear'
                }
              }
            },
            industryDistribution: {
              $push: {
                $map: {
                  input: '$alumniAttendees',
                  as: 'profile',
                  in: '$$profile.industry'
                }
              }
            },
            categoryDistribution: { $push: '$category' },
            networkingEvents: {
              $sum: { $cond: ['$networkingOpportunities', 1, 0] }
            },
            mentorshipEvents: {
              $sum: { $cond: ['$mentorshipOpportunities', 1, 0] }
            },
            careerFocusedEvents: {
              $sum: { $cond: ['$careerFocus', 1, 0] }
            }
          }
        }
      ]);

      // Get networking success metrics
      const networkingMetrics = await EventRegistration.aggregate([
        {
          $match: {
            'registrationData.networkingInterests': { $exists: true, $ne: [] }
          }
        },
        {
          $lookup: {
            from: 'events',
            localField: 'eventId',
            foreignField: '_id',
            as: 'event'
          }
        },
        {
          $match: {
            'event.tags': 'alumni'
          }
        },
        {
          $group: {
            _id: null,
            totalNetworkingRegistrations: { $sum: 1 },
            avgNetworkingInterests: {
              $avg: { $size: '$registrationData.networkingInterests' }
            }
          }
        }
      ]);

      return {
        success: true,
        data: {
          overview: analytics[0] || {},
          networkingMetrics: networkingMetrics[0] || {},
          eventId
        }
      };
    } catch (error) {
      throw new Error(`Failed to get alumni event analytics: ${error.message}`);
    }
  }

  /**
   * Create networking opportunities for registered alumni
   * @private
   * @param {string} eventId - Event ID
   * @param {string} userId - User ID
   * @param {Object} registrationData - Registration data
   */
  async createNetworkingOpportunities(eventId, userId, registrationData) {
    try {
      // This could be expanded to create structured networking sessions,
      // schedule one-on-one meetings, or create interest-based groups
      
      // For now, we'll just log the networking interests for matching
      console.log(`Creating networking opportunities for user ${userId} at event ${eventId}`);
      console.log('Networking interests:', registrationData.networkingInterests);
      console.log('Mentorship interests:', registrationData.mentorshipInterests);
    } catch (error) {
      console.error('Failed to create networking opportunities:', error);
    }
  }

  /**
   * Notify relevant alumni about new events
   * @private
   * @param {Object} event - Event object
   * @param {string} targetAudience - Target audience
   */
  async notifyRelevantAlumni(event, targetAudience) {
    try {
      const query = {
        isActive: true,
        verificationStatus: 'verified'
      };

      // Filter by graduation year if specified
      if (event.graduationYearRange) {
        query.graduationYear = {
          $gte: event.graduationYearRange.start,
          $lte: event.graduationYearRange.end
        };
      }

      // Filter by industry if specified
      if (event.industryFocus) {
        query.industry = new RegExp(event.industryFocus, 'i');
      }

      const relevantAlumni = await AlumniProfile.find(query)
        .populate('userId', 'firstName lastName email')
        .limit(100); // Limit to prevent spam

      // Send notifications
      const notifications = relevantAlumni.map(profile => 
        this.notificationService.sendNotification(profile.userId._id, {
          title: 'New Alumni Event',
          message: `${event.title} - ${event.startDate.toLocaleDateString()}`,
          type: 'info',
          category: 'event',
          actionUrl: `/alumni/events/${event._id}`,
          data: { eventId: event._id }
        })
      );

      await Promise.all(notifications);
    } catch (error) {
      console.error('Failed to notify relevant alumni:', error);
    }
  }

  /**
   * Enhance event with alumni-specific data
   * @private
   * @param {Object} event - Event object
   * @returns {Object} Enhanced event
   */
  async enhanceEventWithAlumniData(event) {
    try {
      // Get registration statistics
      const registrationStats = await EventRegistration.aggregate([
        { $match: { eventId: event._id } },
        {
          $lookup: {
            from: 'alumniprofiles',
            localField: 'userId',
            foreignField: 'userId',
            as: 'profile'
          }
        },
        {
          $group: {
            _id: null,
            totalRegistrations: { $sum: 1 },
            alumniRegistrations: {
              $sum: { $cond: [{ $gt: [{ $size: '$profile' }, 0] }, 1, 0] }
            },
            graduationYears: {
              $push: { $arrayElemAt: ['$profile.graduationYear', 0] }
            },
            industries: {
              $push: { $arrayElemAt: ['$profile.industry', 0] }
            }
          }
        }
      ]);

      const stats = registrationStats[0] || {
        totalRegistrations: 0,
        alumniRegistrations: 0,
        graduationYears: [],
        industries: []
      };

      return {
        ...event.toJSON(),
        alumniStats: {
          alumniRegistrations: stats.alumniRegistrations,
          graduationYearDistribution: this.getDistribution(stats.graduationYears),
          industryDistribution: this.getDistribution(stats.industries)
        }
      };
    } catch (error) {
      console.error('Failed to enhance event with alumni data:', error);
      return event.toJSON();
    }
  }

  /**
   * Get distribution of values
   * @private
   * @param {Array} values - Array of values
   * @returns {Object} Distribution object
   */
  getDistribution(values) {
    const distribution = {};
    values.filter(v => v).forEach(value => {
      distribution[value] = (distribution[value] || 0) + 1;
    });
    return distribution;
  }
}

module.exports = AlumniEventService;