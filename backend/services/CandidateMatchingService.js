const InternshipApplication = require('../models/InternshipApplication');
const Internship = require('../models/Internship');
const User = require('../models/User');
const Company = require('../models/Company');

class CandidateMatchingService {
  /**
   * Match candidates for a specific internship
   * @param {String} internshipId - Internship ID
   * @param {Object} matchingCriteria - Additional matching criteria
   * @returns {Promise<Array>} Recommended candidates
   */
  async matchCandidatesForInternship(internshipId, matchingCriteria = {}) {
    try {
      const internship = await Internship.findById(internshipId);
      if (!internship) {
        throw new Error('Internship not found');
      }

      // Get all applications for this internship
      const applications = await InternshipApplication.find({ internshipId })
        .populate('studentId', 'firstName lastName email program yearLevel gpa')
        .sort({ submittedAt: -1 });

      // Score and rank candidates
      const scoredCandidates = applications.map(application => {
        const score = this.calculateCandidateScore(application, internship, matchingCriteria);
        return {
          application,
          student: application.studentId,
          score,
          matchReasons: this.getMatchReasons(application, internship)
        };
      });

      // Sort by score and return top candidates
      return scoredCandidates
        .sort((a, b) => b.score - a.score)
        .slice(0, matchingCriteria.limit || 10);
    } catch (error) {
      throw new Error(`Failed to match candidates: ${error.message}`);
    }
  }

  /**
   * Find suitable internships for a student
   * @param {String} studentId - Student ID
   * @param {Object} preferences - Student preferences
   * @returns {Promise<Array>} Recommended internships
   */
  async findInternshipsForStudent(studentId, preferences = {}) {
    try {
      const student = await User.findById(studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      // Get available internships
      const internships = await Internship.find({
        status: 'published',
        applicationDeadline: { $gt: new Date() },
        $expr: { $gt: ['$slots', '$filledSlots'] }
      }).populate('companyId', 'name industry verificationStatus partnershipLevel');

      // Filter out internships student has already applied to
      const appliedInternships = await InternshipApplication.find({ studentId }).distinct('internshipId');
      const availableInternships = internships.filter(
        internship => !appliedInternships.includes(internship._id.toString())
      );

      // Score and rank internships
      const scoredInternships = availableInternships.map(internship => {
        const score = this.calculateInternshipScore(student, internship, preferences);
        return {
          internship,
          score,
          matchReasons: this.getInternshipMatchReasons(student, internship)
        };
      });

      // Sort by score and return top recommendations
      return scoredInternships
        .sort((a, b) => b.score - a.score)
        .slice(0, preferences.limit || 10);
    } catch (error) {
      throw new Error(`Failed to find internships: ${error.message}`);
    }
  }

  /**
   * Get application workflow recommendations
   * @param {String} applicationId - Application ID
   * @returns {Promise<Object>} Workflow recommendations
   */
  async getApplicationWorkflowRecommendations(applicationId) {
    try {
      const application = await InternshipApplication.findById(applicationId)
        .populate('studentId', 'firstName lastName program yearLevel gpa')
        .populate('internshipId', 'title requirements skills companyId');

      if (!application) {
        throw new Error('Application not found');
      }

      const recommendations = {
        nextActions: [],
        improvementSuggestions: [],
        timelineEstimate: null
      };

      // Generate recommendations based on current status
      switch (application.status) {
        case 'submitted':
          recommendations.nextActions.push({
            action: 'review_application',
            priority: 'high',
            description: 'Review application documents and student profile',
            estimatedTime: '30 minutes'
          });
          recommendations.timelineEstimate = '3-5 business days for initial review';
          break;

        case 'under_review':
          recommendations.nextActions.push({
            action: 'make_decision',
            priority: 'medium',
            description: 'Make shortlisting or rejection decision',
            estimatedTime: '15 minutes'
          });
          recommendations.timelineEstimate = '1-2 weeks for decision';
          break;

        case 'shortlisted':
          recommendations.nextActions.push({
            action: 'schedule_interview',
            priority: 'high',
            description: 'Schedule interview with candidate',
            estimatedTime: '10 minutes'
          });
          recommendations.timelineEstimate = '1 week to schedule interview';
          break;

        case 'interview_scheduled':
          recommendations.nextActions.push({
            action: 'conduct_interview',
            priority: 'high',
            description: 'Conduct scheduled interview',
            estimatedTime: '60 minutes'
          });
          break;

        case 'accepted':
          recommendations.nextActions.push({
            action: 'prepare_onboarding',
            priority: 'medium',
            description: 'Prepare onboarding materials and schedule',
            estimatedTime: '2 hours'
          });
          break;
      }

      // Add improvement suggestions based on application quality
      const qualityScore = this.assessApplicationQuality(application);
      if (qualityScore < 0.7) {
        recommendations.improvementSuggestions.push({
          area: 'application_completeness',
          suggestion: 'Request additional documents or information from candidate'
        });
      }

      return recommendations;
    } catch (error) {
      throw new Error(`Failed to get workflow recommendations: ${error.message}`);
    }
  }

  /**
   * Calculate candidate score for internship matching
   * @param {Object} application - Application object
   * @param {Object} internship - Internship object
   * @param {Object} criteria - Additional criteria
   * @returns {Number} Candidate score (0-100)
   */
  calculateCandidateScore(application, internship, criteria = {}) {
    let score = 0;
    const weights = {
      program: 25,
      gpa: 20,
      skills: 20,
      experience: 15,
      yearLevel: 10,
      applicationQuality: 10
    };

    // Program match
    if (internship.targetPrograms && internship.targetPrograms.length > 0) {
      if (internship.targetPrograms.includes(application.studentInfo.program)) {
        score += weights.program;
      }
    } else {
      score += weights.program * 0.5; // Partial score if no specific program requirement
    }

    // GPA score
    if (application.studentInfo.gpa) {
      const gpaScore = Math.min(application.studentInfo.gpa / 4.0, 1.0);
      score += weights.gpa * gpaScore;
    }

    // Skills match
    if (internship.skills && internship.skills.length > 0 && application.studentInfo.skills) {
      const matchingSkills = internship.skills.filter(skill => 
        application.studentInfo.skills.some(studentSkill => 
          studentSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(studentSkill.toLowerCase())
        )
      );
      const skillsMatchRatio = matchingSkills.length / internship.skills.length;
      score += weights.skills * skillsMatchRatio;
    }

    // Experience score
    if (application.studentInfo.previousExperience) {
      const experienceLength = application.studentInfo.previousExperience.length;
      const experienceScore = Math.min(experienceLength / 500, 1.0); // Normalize by character count
      score += weights.experience * experienceScore;
    }

    // Year level appropriateness
    if (internship.yearLevelRequirement) {
      if (application.studentInfo.currentYear >= internship.yearLevelRequirement) {
        score += weights.yearLevel;
      } else {
        score += weights.yearLevel * 0.3; // Penalty for not meeting requirement
      }
    } else {
      score += weights.yearLevel * 0.8; // Most of the points if no requirement
    }

    // Application quality
    const qualityScore = this.assessApplicationQuality(application);
    score += weights.applicationQuality * qualityScore;

    return Math.round(score);
  }

  /**
   * Calculate internship score for student matching
   * @param {Object} student - Student object
   * @param {Object} internship - Internship object
   * @param {Object} preferences - Student preferences
   * @returns {Number} Internship score (0-100)
   */
  calculateInternshipScore(student, internship, preferences = {}) {
    let score = 0;
    const weights = {
      program: 30,
      location: 20,
      workArrangement: 15,
      stipend: 15,
      companyRating: 10,
      duration: 10
    };

    // Program relevance
    if (internship.targetPrograms && internship.targetPrograms.length > 0) {
      if (internship.targetPrograms.includes(student.program)) {
        score += weights.program;
      }
    } else {
      score += weights.program * 0.7; // Good score if open to all programs
    }

    // Location preference
    if (preferences.preferredLocation) {
      if (internship.location.toLowerCase().includes(preferences.preferredLocation.toLowerCase())) {
        score += weights.location;
      }
    } else {
      score += weights.location * 0.5; // Neutral score if no preference
    }

    // Work arrangement preference
    if (preferences.workArrangement) {
      if (internship.workArrangement === preferences.workArrangement) {
        score += weights.workArrangement;
      }
    } else {
      score += weights.workArrangement * 0.7; // Good score if no strong preference
    }

    // Stipend consideration
    if (preferences.minStipend) {
      if (internship.stipend >= preferences.minStipend) {
        score += weights.stipend;
      } else {
        const stipendRatio = internship.stipend / preferences.minStipend;
        score += weights.stipend * Math.max(stipendRatio, 0.2);
      }
    } else {
      score += weights.stipend * 0.6; // Moderate score if no stipend requirement
    }

    // Company rating
    if (internship.companyId.averageRating) {
      const ratingScore = internship.companyId.averageRating / 5.0;
      score += weights.companyRating * ratingScore;
    } else {
      score += weights.companyRating * 0.5; // Neutral score for unrated companies
    }

    // Duration preference
    if (preferences.maxDuration) {
      if (internship.duration <= preferences.maxDuration) {
        score += weights.duration;
      } else {
        const durationRatio = preferences.maxDuration / internship.duration;
        score += weights.duration * durationRatio;
      }
    } else {
      score += weights.duration * 0.8; // Good score if no duration constraint
    }

    return Math.round(score);
  }

  /**
   * Assess application quality
   * @param {Object} application - Application object
   * @returns {Number} Quality score (0-1)
   */
  assessApplicationQuality(application) {
    let qualityScore = 0;
    const factors = {
      coverLetter: 0.3,
      resume: 0.2,
      completeness: 0.2,
      timeliness: 0.15,
      additionalDocs: 0.15
    };

    // Cover letter quality (based on length and content)
    if (application.coverLetter) {
      const coverLetterLength = application.coverLetter.length;
      if (coverLetterLength >= 200) {
        qualityScore += factors.coverLetter;
      } else {
        qualityScore += factors.coverLetter * (coverLetterLength / 200);
      }
    }

    // Resume presence
    if (application.resume) {
      qualityScore += factors.resume;
    }

    // Application completeness
    let completenessScore = 0;
    const requiredFields = ['coverLetter', 'resume', 'studentInfo'];
    const completedFields = requiredFields.filter(field => application[field]);
    completenessScore = completedFields.length / requiredFields.length;
    qualityScore += factors.completeness * completenessScore;

    // Timeliness (submitted early gets bonus)
    if (application.internshipId && application.internshipId.applicationDeadline) {
      const daysBeforeDeadline = Math.floor(
        (application.internshipId.applicationDeadline - application.submittedAt) / (1000 * 60 * 60 * 24)
      );
      if (daysBeforeDeadline > 7) {
        qualityScore += factors.timeliness;
      } else if (daysBeforeDeadline > 0) {
        qualityScore += factors.timeliness * (daysBeforeDeadline / 7);
      }
    }

    // Additional documents
    if (application.additionalDocuments && application.additionalDocuments.length > 0) {
      qualityScore += factors.additionalDocs;
    }

    return Math.min(qualityScore, 1.0);
  }

  /**
   * Get match reasons for candidate
   * @param {Object} application - Application object
   * @param {Object} internship - Internship object
   * @returns {Array} Match reasons
   */
  getMatchReasons(application, internship) {
    const reasons = [];

    // Program match
    if (internship.targetPrograms && internship.targetPrograms.includes(application.studentInfo.program)) {
      reasons.push(`Program match: ${application.studentInfo.program}`);
    }

    // GPA
    if (application.studentInfo.gpa && application.studentInfo.gpa >= 3.0) {
      reasons.push(`Strong GPA: ${application.studentInfo.gpa}`);
    }

    // Skills match
    if (internship.skills && application.studentInfo.skills) {
      const matchingSkills = internship.skills.filter(skill => 
        application.studentInfo.skills.some(studentSkill => 
          studentSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      if (matchingSkills.length > 0) {
        reasons.push(`Relevant skills: ${matchingSkills.join(', ')}`);
      }
    }

    // Experience
    if (application.studentInfo.previousExperience && application.studentInfo.previousExperience.length > 100) {
      reasons.push('Has relevant experience');
    }

    // Application quality
    const qualityScore = this.assessApplicationQuality(application);
    if (qualityScore > 0.8) {
      reasons.push('High-quality application');
    }

    return reasons;
  }

  /**
   * Get internship match reasons for student
   * @param {Object} student - Student object
   * @param {Object} internship - Internship object
   * @returns {Array} Match reasons
   */
  getInternshipMatchReasons(student, internship) {
    const reasons = [];

    // Program relevance
    if (internship.targetPrograms && internship.targetPrograms.includes(student.program)) {
      reasons.push(`Perfect match for ${student.program} students`);
    }

    // Company reputation
    if (internship.companyId.verificationStatus === 'verified') {
      reasons.push('Verified partner company');
    }

    if (internship.companyId.partnershipLevel === 'gold' || internship.companyId.partnershipLevel === 'platinum') {
      reasons.push(`${internship.companyId.partnershipLevel.charAt(0).toUpperCase() + internship.companyId.partnershipLevel.slice(1)} partner`);
    }

    // Stipend
    if (internship.stipend > 0) {
      reasons.push(`Paid internship: ${internship.currency} ${internship.stipend.toLocaleString()}`);
    }

    // Work arrangement
    if (internship.workArrangement === 'remote' || internship.workArrangement === 'hybrid') {
      reasons.push(`Flexible work arrangement: ${internship.workArrangement}`);
    }

    // Duration
    if (internship.duration <= 12) {
      reasons.push(`Manageable duration: ${internship.duration} weeks`);
    }

    return reasons;
  }

  /**
   * Get application statistics for matching insights
   * @param {String} internshipId - Internship ID
   * @returns {Promise<Object>} Application statistics
   */
  async getApplicationStatistics(internshipId) {
    try {
      const applications = await InternshipApplication.find({ internshipId })
        .populate('studentId', 'program yearLevel gpa');

      const stats = {
        total: applications.length,
        byProgram: {},
        byYearLevel: {},
        averageGPA: 0,
        qualityDistribution: {
          high: 0,
          medium: 0,
          low: 0
        }
      };

      let totalGPA = 0;
      let gpaCount = 0;

      applications.forEach(application => {
        // Program distribution
        const program = application.studentInfo.program;
        stats.byProgram[program] = (stats.byProgram[program] || 0) + 1;

        // Year level distribution
        const yearLevel = application.studentInfo.currentYear;
        stats.byYearLevel[yearLevel] = (stats.byYearLevel[yearLevel] || 0) + 1;

        // GPA calculation
        if (application.studentInfo.gpa) {
          totalGPA += application.studentInfo.gpa;
          gpaCount++;
        }

        // Quality assessment
        const quality = this.assessApplicationQuality(application);
        if (quality > 0.8) {
          stats.qualityDistribution.high++;
        } else if (quality > 0.5) {
          stats.qualityDistribution.medium++;
        } else {
          stats.qualityDistribution.low++;
        }
      });

      if (gpaCount > 0) {
        stats.averageGPA = Math.round((totalGPA / gpaCount) * 100) / 100;
      }

      return stats;
    } catch (error) {
      throw new Error(`Failed to get application statistics: ${error.message}`);
    }
  }

  /**
   * Generate matching report for internship
   * @param {String} internshipId - Internship ID
   * @returns {Promise<Object>} Matching report
   */
  async generateMatchingReport(internshipId) {
    try {
      const [candidates, statistics] = await Promise.all([
        this.matchCandidatesForInternship(internshipId),
        this.getApplicationStatistics(internshipId)
      ]);

      return {
        internshipId,
        totalCandidates: statistics.total,
        topCandidates: candidates.slice(0, 5),
        statistics,
        recommendations: {
          shouldIncreaseSlots: statistics.total > 10 && candidates.filter(c => c.score > 70).length > 5,
          shouldExtendDeadline: statistics.total < 3,
          qualityAssessment: statistics.qualityDistribution.high > statistics.total * 0.3 ? 'high' : 
                           statistics.qualityDistribution.medium > statistics.total * 0.5 ? 'medium' : 'low'
        }
      };
    } catch (error) {
      throw new Error(`Failed to generate matching report: ${error.message}`);
    }
  }
}

module.exports = new CandidateMatchingService();