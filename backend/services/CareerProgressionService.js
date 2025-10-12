const AlumniProfile = require('../models/AlumniProfile');
const JobApplication = require('../models/JobApplication');
const Mentorship = require('../models/Mentorship');
const User = require('../models/User');
const mongoose = require('mongoose');

class CareerProgressionService {
  /**
   * Track career progression for an alumni
   * @param {string} userId - Alumni user ID
   * @param {Object} careerData - Career progression data
   * @returns {Promise<Object>} Updated career progression
   */
  async trackCareerProgression(userId, careerData) {
    try {
      const alumniProfile = await AlumniProfile.findOne({ userId });
      if (!alumniProfile) {
        throw new Error('Alumni profile not found');
      }

      // Add new career entry
      const careerEntry = {
        position: careerData.position,
        company: careerData.company,
        startDate: careerData.startDate,
        endDate: careerData.endDate,
        description: careerData.description,
        isCurrent: careerData.isCurrent || false
      };

      // If this is current position, mark others as not current
      if (careerEntry.isCurrent) {
        alumniProfile.careerHistory.forEach(entry => {
          entry.isCurrent = false;
        });
      }

      alumniProfile.careerHistory.push(careerEntry);
      
      // Update current position fields
      if (careerEntry.isCurrent) {
        alumniProfile.currentPosition = careerEntry.position;
        alumniProfile.currentCompany = careerEntry.company;
      }

      await alumniProfile.save();

      return {
        success: true,
        data: alumniProfile,
        message: 'Career progression updated successfully'
      };
    } catch (error) {
      throw new Error(`Failed to track career progression: ${error.message}`);
    }
  }

  /**
   * Get career progression analytics for an alumni
   * @param {string} userId - Alumni user ID
   * @returns {Promise<Object>} Career progression analytics
   */
  async getCareerProgressionAnalytics(userId) {
    try {
      const alumniProfile = await AlumniProfile.findOne({ userId }).populate('userId', 'firstName lastName email');
      if (!alumniProfile) {
        throw new Error('Alumni profile not found');
      }

      const careerHistory = alumniProfile.careerHistory.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      
      // Calculate career metrics
      const metrics = {
        totalPositions: careerHistory.length,
        totalCompanies: [...new Set(careerHistory.map(entry => entry.company))].length,
        averageTenure: 0,
        careerGrowthRate: 0,
        industryChanges: 0,
        currentTenure: 0
      };

      if (careerHistory.length > 0) {
        // Calculate average tenure
        const completedPositions = careerHistory.filter(entry => entry.endDate);
        if (completedPositions.length > 0) {
          const totalTenure = completedPositions.reduce((sum, entry) => {
            const tenure = (new Date(entry.endDate) - new Date(entry.startDate)) / (1000 * 60 * 60 * 24 * 30); // months
            return sum + tenure;
          }, 0);
          metrics.averageTenure = Math.round(totalTenure / completedPositions.length);
        }

        // Calculate current tenure
        const currentPosition = careerHistory.find(entry => entry.isCurrent);
        if (currentPosition) {
          metrics.currentTenure = Math.round((new Date() - new Date(currentPosition.startDate)) / (1000 * 60 * 60 * 24 * 30));
        }

        // Calculate career growth rate (positions per year)
        const careerSpan = (new Date() - new Date(careerHistory[0].startDate)) / (1000 * 60 * 60 * 24 * 365);
        metrics.careerGrowthRate = Math.round((careerHistory.length / careerSpan) * 100) / 100;
      }

      // Get job application history
      const jobApplications = await JobApplication.find({ applicantId: userId })
        .populate('jobId', 'title company workType status')
        .sort({ submittedAt: -1 });

      // Get mentorship history
      const mentorships = await Mentorship.find({
        $or: [{ mentorId: userId }, { menteeId: userId }],
        status: { $in: ['completed', 'active'] }
      }).populate('mentorId menteeId', 'firstName lastName');

      // Career timeline
      const timeline = [
        ...careerHistory.map(entry => ({
          type: 'career',
          date: entry.startDate,
          title: `Started at ${entry.company}`,
          description: `${entry.position} at ${entry.company}`,
          data: entry
        })),
        ...jobApplications.filter(app => app.status === 'accepted').map(app => ({
          type: 'job_application',
          date: app.submittedAt,
          title: 'Job Application Accepted',
          description: `${app.jobId.title} at ${app.jobId.company}`,
          data: app
        })),
        ...mentorships.map(mentorship => ({
          type: 'mentorship',
          date: mentorship.startDate || mentorship.createdAt,
          title: mentorship.mentorId._id.toString() === userId ? 'Started Mentoring' : 'Started Mentorship',
          description: `${mentorship.program} program`,
          data: mentorship
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      return {
        success: true,
        data: {
          profile: alumniProfile,
          metrics,
          careerHistory,
          jobApplications: jobApplications.slice(0, 10), // Recent applications
          mentorships,
          timeline: timeline.slice(0, 20) // Recent timeline events
        }
      };
    } catch (error) {
      throw new Error(`Failed to get career progression analytics: ${error.message}`);
    }
  }

  /**
   * Get career progression trends for multiple alumni
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Career progression trends
   */
  async getCareerProgressionTrends(filters = {}) {
    try {
      const matchStage = {
        isActive: true,
        verificationStatus: 'verified'
      };

      // Apply filters
      if (filters.graduationYear) {
        matchStage.graduationYear = filters.graduationYear;
      }
      if (filters.degree) {
        matchStage.degree = new RegExp(filters.degree, 'i');
      }
      if (filters.industry) {
        matchStage.industry = new RegExp(filters.industry, 'i');
      }

      const trends = await AlumniProfile.aggregate([
        { $match: matchStage },
        {
          $addFields: {
            careerSpan: {
              $cond: {
                if: { $gt: [{ $size: '$careerHistory' }, 0] },
                then: {
                  $divide: [
                    { $subtract: [new Date(), { $min: '$careerHistory.startDate' }] },
                    1000 * 60 * 60 * 24 * 365 // Convert to years
                  ]
                },
                else: 0
              }
            },
            totalPositions: { $size: '$careerHistory' },
            totalCompanies: { $size: { $setUnion: '$careerHistory.company' } }
          }
        },
        {
          $group: {
            _id: '$graduationYear',
            avgCareerSpan: { $avg: '$careerSpan' },
            avgPositions: { $avg: '$totalPositions' },
            avgCompanies: { $avg: '$totalCompanies' },
            alumniCount: { $sum: 1 },
            topIndustries: { $push: '$industry' },
            topCompanies: { $push: '$currentCompany' }
          }
        },
        { $sort: { _id: -1 } }
      ]);

      // Get industry progression patterns
      const industryProgression = await AlumniProfile.aggregate([
        { $match: matchStage },
        { $unwind: '$careerHistory' },
        {
          $group: {
            _id: {
              graduationYear: '$graduationYear',
              company: '$careerHistory.company'
            },
            positions: { $push: '$careerHistory.position' },
            alumni: { $addToSet: '$userId' }
          }
        },
        {
          $group: {
            _id: '$_id.graduationYear',
            topCompanies: {
              $push: {
                company: '$_id.company',
                alumniCount: { $size: '$alumni' }
              }
            }
          }
        }
      ]);

      // Get salary progression (if available)
      const salaryTrends = await JobApplication.aggregate([
        {
          $lookup: {
            from: 'jobpostings',
            localField: 'jobId',
            foreignField: '_id',
            as: 'job'
          }
        },
        { $unwind: '$job' },
        {
          $lookup: {
            from: 'users',
            localField: 'applicantId',
            foreignField: '_id',
            as: 'applicant'
          }
        },
        { $unwind: '$applicant' },
        {
          $lookup: {
            from: 'alumniprofiles',
            localField: 'applicantId',
            foreignField: 'userId',
            as: 'profile'
          }
        },
        { $unwind: '$profile' },
        {
          $match: {
            status: 'accepted',
            'job.salaryRange.min': { $exists: true, $gt: 0 },
            'profile.graduationYear': { $exists: true }
          }
        },
        {
          $group: {
            _id: {
              graduationYear: '$profile.graduationYear',
              workType: '$job.workType'
            },
            avgSalaryMin: { $avg: '$job.salaryRange.min' },
            avgSalaryMax: { $avg: '$job.salaryRange.max' },
            jobCount: { $sum: 1 }
          }
        }
      ]);

      return {
        success: true,
        data: {
          careerTrends: trends,
          industryProgression,
          salaryTrends
        }
      };
    } catch (error) {
      throw new Error(`Failed to get career progression trends: ${error.message}`);
    }
  }

  /**
   * Generate career progression report for an alumni
   * @param {string} userId - Alumni user ID
   * @returns {Promise<Object>} Career progression report
   */
  async generateCareerProgressionReport(userId) {
    try {
      const analytics = await this.getCareerProgressionAnalytics(userId);
      const profile = analytics.data.profile;
      const metrics = analytics.data.metrics;

      // Generate insights and recommendations
      const insights = [];
      const recommendations = [];

      // Career stability insight
      if (metrics.averageTenure > 24) {
        insights.push('You demonstrate strong career stability with an average tenure of ' + metrics.averageTenure + ' months per position.');
      } else if (metrics.averageTenure < 12) {
        insights.push('Your career shows frequent position changes. Consider focusing on longer-term roles for career stability.');
        recommendations.push('Look for positions that offer clear growth paths and development opportunities.');
      }

      // Career growth insight
      if (metrics.careerGrowthRate > 0.5) {
        insights.push('You show excellent career progression with ' + metrics.careerGrowthRate + ' position changes per year.');
      } else {
        recommendations.push('Consider seeking new challenges or responsibilities to accelerate your career growth.');
      }

      // Industry diversity
      if (metrics.totalCompanies > metrics.totalPositions * 0.7) {
        insights.push('You have diverse experience across ' + metrics.totalCompanies + ' different companies.');
      }

      // Mentorship recommendation
      const activeMentorships = analytics.data.mentorships.filter(m => m.status === 'active');
      if (activeMentorships.length === 0) {
        recommendations.push('Consider joining a mentorship program to accelerate your career development.');
      }

      // Networking recommendation
      if (profile.networkingStats.connectionsCount < 10) {
        recommendations.push('Expand your professional network by connecting with more alumni in your field.');
      }

      const report = {
        generatedAt: new Date(),
        alumni: {
          name: `${profile.userId.firstName} ${profile.userId.lastName}`,
          graduationYear: profile.graduationYear,
          degree: profile.degree,
          currentPosition: profile.currentPosition,
          currentCompany: profile.currentCompany
        },
        metrics,
        insights,
        recommendations,
        careerTimeline: analytics.data.timeline.slice(0, 10),
        nextSteps: [
          'Update your alumni profile with recent achievements',
          'Connect with alumni in your target industry',
          'Consider mentoring current students',
          'Explore job opportunities in the alumni job board'
        ]
      };

      return {
        success: true,
        data: report
      };
    } catch (error) {
      throw new Error(`Failed to generate career progression report: ${error.message}`);
    }
  }

  /**
   * Compare career progression with peers
   * @param {string} userId - Alumni user ID
   * @returns {Promise<Object>} Career comparison data
   */
  async compareWithPeers(userId) {
    try {
      const alumniProfile = await AlumniProfile.findOne({ userId });
      if (!alumniProfile) {
        throw new Error('Alumni profile not found');
      }

      // Find peers (same graduation year and degree)
      const peers = await AlumniProfile.find({
        graduationYear: alumniProfile.graduationYear,
        degree: alumniProfile.degree,
        userId: { $ne: userId },
        isActive: true,
        verificationStatus: 'verified'
      });

      if (peers.length === 0) {
        return {
          success: true,
          data: {
            message: 'No peers found for comparison',
            userMetrics: await this.calculateIndividualMetrics(alumniProfile)
          }
        };
      }

      // Calculate metrics for user and peers
      const userMetrics = await this.calculateIndividualMetrics(alumniProfile);
      const peerMetrics = await Promise.all(
        peers.map(peer => this.calculateIndividualMetrics(peer))
      );

      // Calculate peer averages
      const peerAverages = {
        totalPositions: peerMetrics.reduce((sum, m) => sum + m.totalPositions, 0) / peerMetrics.length,
        totalCompanies: peerMetrics.reduce((sum, m) => sum + m.totalCompanies, 0) / peerMetrics.length,
        averageTenure: peerMetrics.reduce((sum, m) => sum + m.averageTenure, 0) / peerMetrics.length,
        careerGrowthRate: peerMetrics.reduce((sum, m) => sum + m.careerGrowthRate, 0) / peerMetrics.length
      };

      // Generate comparison insights
      const comparison = {
        totalPositions: {
          user: userMetrics.totalPositions,
          peerAverage: Math.round(peerAverages.totalPositions * 100) / 100,
          percentile: this.calculatePercentile(userMetrics.totalPositions, peerMetrics.map(m => m.totalPositions))
        },
        totalCompanies: {
          user: userMetrics.totalCompanies,
          peerAverage: Math.round(peerAverages.totalCompanies * 100) / 100,
          percentile: this.calculatePercentile(userMetrics.totalCompanies, peerMetrics.map(m => m.totalCompanies))
        },
        averageTenure: {
          user: userMetrics.averageTenure,
          peerAverage: Math.round(peerAverages.averageTenure * 100) / 100,
          percentile: this.calculatePercentile(userMetrics.averageTenure, peerMetrics.map(m => m.averageTenure))
        },
        careerGrowthRate: {
          user: userMetrics.careerGrowthRate,
          peerAverage: Math.round(peerAverages.careerGrowthRate * 100) / 100,
          percentile: this.calculatePercentile(userMetrics.careerGrowthRate, peerMetrics.map(m => m.careerGrowthRate))
        }
      };

      return {
        success: true,
        data: {
          userMetrics,
          peerAverages,
          comparison,
          peerCount: peers.length,
          graduationYear: alumniProfile.graduationYear,
          degree: alumniProfile.degree
        }
      };
    } catch (error) {
      throw new Error(`Failed to compare with peers: ${error.message}`);
    }
  }

  /**
   * Calculate individual career metrics
   * @private
   * @param {Object} alumniProfile - Alumni profile
   * @returns {Object} Career metrics
   */
  async calculateIndividualMetrics(alumniProfile) {
    const careerHistory = alumniProfile.careerHistory.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    
    const metrics = {
      totalPositions: careerHistory.length,
      totalCompanies: [...new Set(careerHistory.map(entry => entry.company))].length,
      averageTenure: 0,
      careerGrowthRate: 0,
      currentTenure: 0
    };

    if (careerHistory.length > 0) {
      // Calculate average tenure
      const completedPositions = careerHistory.filter(entry => entry.endDate);
      if (completedPositions.length > 0) {
        const totalTenure = completedPositions.reduce((sum, entry) => {
          const tenure = (new Date(entry.endDate) - new Date(entry.startDate)) / (1000 * 60 * 60 * 24 * 30);
          return sum + tenure;
        }, 0);
        metrics.averageTenure = Math.round(totalTenure / completedPositions.length);
      }

      // Calculate current tenure
      const currentPosition = careerHistory.find(entry => entry.isCurrent);
      if (currentPosition) {
        metrics.currentTenure = Math.round((new Date() - new Date(currentPosition.startDate)) / (1000 * 60 * 60 * 24 * 30));
      }

      // Calculate career growth rate
      const careerSpan = (new Date() - new Date(careerHistory[0].startDate)) / (1000 * 60 * 60 * 24 * 365);
      metrics.careerGrowthRate = Math.round((careerHistory.length / careerSpan) * 100) / 100;
    }

    return metrics;
  }

  /**
   * Calculate percentile ranking
   * @private
   * @param {number} value - User's value
   * @param {Array} peerValues - Peer values array
   * @returns {number} Percentile (0-100)
   */
  calculatePercentile(value, peerValues) {
    const sortedValues = peerValues.sort((a, b) => a - b);
    const rank = sortedValues.filter(v => v <= value).length;
    return Math.round((rank / sortedValues.length) * 100);
  }
}

module.exports = CareerProgressionService;