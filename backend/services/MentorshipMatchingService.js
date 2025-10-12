const AlumniProfile = require('../models/AlumniProfile');
const Mentorship = require('../models/Mentorship');
const User = require('../models/User');
const JobApplication = require('../models/JobApplication');
const notificationService = require('./NotificationService');
const mongoose = require('mongoose');

class MentorshipMatchingService {
  constructor() {
    this.notificationService = notificationService;
  }

  /**
   * Find advanced mentorship matches using ML-like scoring
   * @param {string} menteeId - Mentee user ID
   * @param {Object} preferences - Matching preferences
   * @returns {Promise<Object>} Advanced mentorship matches
   */
  async findAdvancedMatches(menteeId, preferences = {}) {
    try {
      const menteeProfile = await AlumniProfile.findOne({ userId: menteeId })
        .populate('userId', 'firstName lastName email');
      
      if (!menteeProfile) {
        throw new Error('Mentee profile not found');
      }

      // Get available mentors
      const availableMentors = await AlumniProfile.find({
        'mentorshipAvailability.isAvailable': true,
        isActive: true,
        verificationStatus: 'verified',
        userId: { $ne: menteeId },
        $expr: {
          $lt: ['$mentorshipAvailability.currentMentees', '$mentorshipAvailability.maxMentees']
        }
      }).populate('userId', 'firstName lastName email profilePicture');

      // Get mentee's career goals and job applications for context
      const menteeJobApplications = await JobApplication.find({ applicantId: menteeId })
        .populate('jobId', 'title company industry workType experienceLevel')
        .limit(10);

      // Score each mentor using advanced matching algorithm
      const scoredMentors = await Promise.all(
        availableMentors.map(mentor => this.calculateAdvancedMatchScore(menteeProfile, mentor, menteeJobApplications, preferences))
      );

      // Sort by match score
      scoredMentors.sort((a, b) => b.totalScore - a.totalScore);

      // Get top matches with detailed explanations
      const topMatches = scoredMentors.slice(0, 10).map(match => ({
        mentor: match.mentor,
        matchScore: match.totalScore,
        matchBreakdown: match.scoreBreakdown,
        matchReasons: match.matchReasons,
        compatibility: this.calculateCompatibility(match.totalScore),
        recommendedProgram: this.recommendProgram(menteeProfile, match.mentor),
        estimatedDuration: this.estimateMentorshipDuration(menteeProfile, match.mentor)
      }));

      return {
        success: true,
        data: {
          mentee: menteeProfile,
          matches: topMatches,
          totalMentors: availableMentors.length,
          matchingCriteria: preferences
        }
      };
    } catch (error) {
      throw new Error(`Failed to find advanced mentorship matches: ${error.message}`);
    }
  }

  /**
   * Calculate advanced match score between mentee and mentor
   * @private
   * @param {Object} menteeProfile - Mentee alumni profile
   * @param {Object} mentorProfile - Mentor alumni profile
   * @param {Array} menteeJobApplications - Mentee's job applications
   * @param {Object} preferences - Matching preferences
   * @returns {Object} Match score details
   */
  async calculateAdvancedMatchScore(menteeProfile, mentorProfile, menteeJobApplications, preferences) {
    const scoreBreakdown = {};
    const matchReasons = [];
    let totalScore = 0;

    // 1. Industry Alignment (25 points max)
    if (menteeProfile.industry && mentorProfile.industry) {
      if (menteeProfile.industry.toLowerCase() === mentorProfile.industry.toLowerCase()) {
        scoreBreakdown.industryMatch = 25;
        matchReasons.push('Same industry experience');
      } else if (this.isRelatedIndustry(menteeProfile.industry, mentorProfile.industry)) {
        scoreBreakdown.industryMatch = 15;
        matchReasons.push('Related industry experience');
      } else {
        scoreBreakdown.industryMatch = 0;
      }
    }

    // 2. Skills Overlap (20 points max)
    if (menteeProfile.skills && mentorProfile.skills) {
      const commonSkills = menteeProfile.skills.filter(skill => 
        mentorProfile.skills.some(mentorSkill => 
          mentorSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(mentorSkill.toLowerCase())
        )
      );
      
      scoreBreakdown.skillsOverlap = Math.min(commonSkills.length * 4, 20);
      if (commonSkills.length > 0) {
        matchReasons.push(`${commonSkills.length} common skills: ${commonSkills.slice(0, 3).join(', ')}`);
      }
    }

    // 3. Career Progression Potential (20 points max)
    const mentorExperience = this.calculateExperienceYears(mentorProfile);
    const menteeExperience = this.calculateExperienceYears(menteeProfile);
    const experienceGap = mentorExperience - menteeExperience;
    
    if (experienceGap >= 3 && experienceGap <= 10) {
      scoreBreakdown.careerProgression = 20;
      matchReasons.push(`Ideal experience gap (${experienceGap} years)`);
    } else if (experienceGap >= 1 && experienceGap <= 15) {
      scoreBreakdown.careerProgression = 10;
      matchReasons.push(`Good experience gap (${experienceGap} years)`);
    } else {
      scoreBreakdown.careerProgression = 0;
    }

    // 4. Expertise Match (15 points max)
    if (preferences.expertise && mentorProfile.mentorshipAvailability.expertise) {
      const expertiseMatch = mentorProfile.mentorshipAvailability.expertise.some(exp => 
        exp.toLowerCase().includes(preferences.expertise.toLowerCase()) ||
        preferences.expertise.toLowerCase().includes(exp.toLowerCase())
      );
      
      if (expertiseMatch) {
        scoreBreakdown.expertiseMatch = 15;
        matchReasons.push('Expertise alignment');
      } else {
        scoreBreakdown.expertiseMatch = 0;
      }
    }

    // 5. Company Progression Path (10 points max)
    if (menteeJobApplications.length > 0) {
      const targetCompanies = menteeJobApplications.map(app => app.jobId.company);
      const mentorCompanyHistory = mentorProfile.careerHistory.map(job => job.company);
      
      const companyOverlap = targetCompanies.some(company => 
        mentorCompanyHistory.some(mentorCompany => 
          mentorCompany.toLowerCase().includes(company.toLowerCase())
        )
      );
      
      if (companyOverlap) {
        scoreBreakdown.companyPath = 10;
        matchReasons.push('Experience at target companies');
      } else {
        scoreBreakdown.companyPath = 0;
      }
    }

    // 6. Availability Score (10 points max)
    const availabilityRatio = 1 - (mentorProfile.mentorshipAvailability.currentMentees / mentorProfile.mentorshipAvailability.maxMentees);
    scoreBreakdown.availability = Math.round(availabilityRatio * 10);
    if (availabilityRatio > 0.5) {
      matchReasons.push('High availability');
    }

    // 7. Success Rate Bonus (5 points max)
    const completedMentorships = await Mentorship.countDocuments({
      mentorId: mentorProfile.userId,
      status: 'completed'
    });
    
    if (completedMentorships >= 3) {
      scoreBreakdown.successRate = 5;
      matchReasons.push('Experienced mentor');
    } else if (completedMentorships >= 1) {
      scoreBreakdown.successRate = 2;
    } else {
      scoreBreakdown.successRate = 0;
    }

    // 8. Geographic Proximity (5 points max)
    if (menteeProfile.location && mentorProfile.location) {
      if (menteeProfile.location.toLowerCase() === mentorProfile.location.toLowerCase()) {
        scoreBreakdown.location = 5;
        matchReasons.push('Same location');
      } else if (this.isNearbyLocation(menteeProfile.location, mentorProfile.location)) {
        scoreBreakdown.location = 2;
        matchReasons.push('Nearby location');
      } else {
        scoreBreakdown.location = 0;
      }
    }

    // Calculate total score
    totalScore = Object.values(scoreBreakdown).reduce((sum, score) => sum + score, 0);

    return {
      mentor: mentorProfile,
      totalScore,
      scoreBreakdown,
      matchReasons
    };
  }

  /**
   * Calculate compatibility percentage
   * @private
   * @param {number} score - Match score
   * @returns {string} Compatibility level
   */
  calculateCompatibility(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Very Good';
    if (score >= 40) return 'Good';
    if (score >= 20) return 'Fair';
    return 'Limited';
  }

  /**
   * Recommend mentorship program based on profiles
   * @private
   * @param {Object} menteeProfile - Mentee profile
   * @param {Object} mentorProfile - Mentor profile
   * @returns {string} Recommended program
   */
  recommendProgram(menteeProfile, mentorProfile) {
    const menteeExperience = this.calculateExperienceYears(menteeProfile);
    
    if (menteeExperience <= 1) return 'career_guidance';
    if (menteeExperience <= 3) return 'skill_development';
    if (mentorProfile.currentPosition.toLowerCase().includes('entrepreneur')) return 'entrepreneurship';
    if (menteeProfile.industry !== mentorProfile.industry) return 'industry_transition';
    return 'personal_development';
  }

  /**
   * Estimate mentorship duration
   * @private
   * @param {Object} menteeProfile - Mentee profile
   * @param {Object} mentorProfile - Mentor profile
   * @returns {number} Estimated duration in months
   */
  estimateMentorshipDuration(menteeProfile, mentorProfile) {
    const menteeExperience = this.calculateExperienceYears(menteeProfile);
    
    if (menteeExperience <= 1) return 9; // New graduates need longer mentorship
    if (menteeExperience <= 3) return 6; // Standard duration
    return 4; // Experienced professionals need shorter mentorship
  }

  /**
   * Calculate years of experience
   * @private
   * @param {Object} profile - Alumni profile
   * @returns {number} Years of experience
   */
  calculateExperienceYears(profile) {
    return new Date().getFullYear() - profile.graduationYear;
  }

  /**
   * Check if industries are related
   * @private
   * @param {string} industry1 - First industry
   * @param {string} industry2 - Second industry
   * @returns {boolean} Whether industries are related
   */
  isRelatedIndustry(industry1, industry2) {
    const relatedIndustries = {
      'Technology': ['Software', 'IT', 'Tech', 'Digital', 'Computer'],
      'Finance': ['Banking', 'Investment', 'Insurance', 'Fintech'],
      'Healthcare': ['Medical', 'Pharmaceutical', 'Biotech', 'Health'],
      'Marketing': ['Advertising', 'Digital Marketing', 'PR', 'Communications'],
      'Education': ['Academic', 'Training', 'E-learning', 'EdTech']
    };

    for (const [category, related] of Object.entries(relatedIndustries)) {
      if ((industry1.includes(category) || related.some(r => industry1.includes(r))) &&
          (industry2.includes(category) || related.some(r => industry2.includes(r)))) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if locations are nearby
   * @private
   * @param {string} location1 - First location
   * @param {string} location2 - Second location
   * @returns {boolean} Whether locations are nearby
   */
  isNearbyLocation(location1, location2) {
    // Simple proximity check - can be enhanced with actual geographic data
    const nearbyAreas = {
      'Manila': ['Quezon City', 'Makati', 'Taguig', 'Pasig', 'Mandaluyong'],
      'Cebu': ['Lapu-Lapu', 'Mandaue', 'Talisay'],
      'Davao': ['Tagum', 'Panabo', 'Samal']
    };

    for (const [city, nearby] of Object.entries(nearbyAreas)) {
      if ((location1.includes(city) && nearby.some(area => location2.includes(area))) ||
          (location2.includes(city) && nearby.some(area => location1.includes(area)))) {
        return true;
      }
    }
    return false;
  }

  /**
   * Create mentorship matching report
   * @param {string} menteeId - Mentee user ID
   * @returns {Promise<Object>} Matching report
   */
  async createMatchingReport(menteeId) {
    try {
      const matches = await this.findAdvancedMatches(menteeId);
      
      const report = {
        generatedAt: new Date(),
        mentee: matches.data.mentee,
        totalMentorsAvailable: matches.data.totalMentors,
        topMatches: matches.data.matches.slice(0, 5),
        recommendations: [
          'Consider reaching out to mentors with "Excellent" or "Very Good" compatibility',
          'Focus on mentors in your target industry or related fields',
          'Look for mentors with experience at companies you\'re interested in',
          'Consider the recommended program type for each mentor'
        ],
        nextSteps: [
          'Review the top 3-5 mentor matches',
          'Prepare a thoughtful mentorship request message',
          'Clearly define your mentorship goals',
          'Be specific about what you hope to learn'
        ]
      };

      return {
        success: true,
        data: report
      };
    } catch (error) {
      throw new Error(`Failed to create matching report: ${error.message}`);
    }
  }
}

module.exports = MentorshipMatchingService;