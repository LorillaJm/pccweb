const Company = require('../models/Company');
const Internship = require('../models/Internship');
const InternshipApplication = require('../models/InternshipApplication');
const User = require('../models/User');
const NotificationService = require('./NotificationService');

class CompanyService {
  /**
   * Register a new partner company
   * @param {Object} companyData - Company registration data
   * @param {String} contactPersonId - User ID of contact person
   * @returns {Promise<Object>} Created company
   */
  async registerCompany(companyData, contactPersonId) {
    try {
      // Validate contact person exists
      const contactPerson = await User.findById(contactPersonId);
      if (!contactPerson) {
        throw new Error('Contact person not found');
      }

      // Check if company with same name already exists
      const existingCompany = await Company.findOne({
        name: { $regex: new RegExp(`^${companyData.name}$`, 'i') }
      });
      if (existingCompany) {
        throw new Error('Company with this name already exists');
      }

      // Create company
      const company = new Company({
        ...companyData,
        verificationStatus: 'pending',
        isActive: true
      });

      await company.save();

      // Send notification to admins for verification
      const adminUsers = await User.find({ role: 'admin' });
      for (const admin of adminUsers) {
        await NotificationService.sendNotification(
          admin._id,
          {
            title: 'New Company Registration',
            message: `${company.name} has registered as a partner company and requires verification.`,
            type: 'info',
            category: 'admin'
          }
        );
      }

      return company;
    } catch (error) {
      throw new Error(`Failed to register company: ${error.message}`);
    }
  }

  /**
   * Get company by ID with detailed information
   * @param {String} companyId - Company ID
   * @returns {Promise<Object>} Company details
   */
  async getCompanyById(companyId) {
    try {
      const company = await Company.findById(companyId);
      if (!company) {
        throw new Error('Company not found');
      }

      return company;
    } catch (error) {
      throw new Error(`Failed to get company: ${error.message}`);
    }
  }

  /**
   * Get companies with filtering and pagination
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<Object>} Paginated companies
   */
  async getCompanies(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search = ''
      } = options;

      // Build query
      let query = {};

      // Apply filters
      if (filters.verificationStatus) {
        query.verificationStatus = filters.verificationStatus;
      }
      if (filters.industry) {
        query.industry = filters.industry;
      }
      if (filters.partnershipLevel) {
        query.partnershipLevel = filters.partnershipLevel;
      }
      if (filters.isActive !== undefined) {
        query.isActive = filters.isActive;
      }

      // Add search functionality
      if (search) {
        query.$text = { $search: search };
      }

      // Execute query with pagination
      const skip = (page - 1) * limit;
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const [companies, total] = await Promise.all([
        Company.find(query)
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean(),
        Company.countDocuments(query)
      ]);

      return {
        companies,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get companies: ${error.message}`);
    }
  }

  /**
   * Update company information
   * @param {String} companyId - Company ID
   * @param {Object} updateData - Update data
   * @param {String} updatedBy - User ID of updater
   * @returns {Promise<Object>} Updated company
   */
  async updateCompany(companyId, updateData, updatedBy) {
    try {
      const company = await Company.findById(companyId);
      if (!company) {
        throw new Error('Company not found');
      }

      // Update company data
      Object.assign(company, updateData);
      await company.save();

      return company;
    } catch (error) {
      throw new Error(`Failed to update company: ${error.message}`);
    }
  }

  /**
   * Verify a company
   * @param {String} companyId - Company ID
   * @param {String} verifiedBy - User ID of verifier
   * @param {String} notes - Verification notes
   * @returns {Promise<Object>} Verified company
   */
  async verifyCompany(companyId, verifiedBy, notes = '') {
    try {
      const company = await Company.findById(companyId);
      if (!company) {
        throw new Error('Company not found');
      }

      await company.verify(verifiedBy, notes);

      // Send notification to company contact person
      if (company.contactPerson.email) {
        await NotificationService.sendNotification(
          null, // No user ID for company notifications
          {
            title: 'Company Verification Approved',
            message: `Congratulations! ${company.name} has been verified as a partner company. You can now post internship opportunities.`,
            type: 'success',
            category: 'company'
          },
          { email: company.contactPerson.email }
        );
      }

      return company;
    } catch (error) {
      throw new Error(`Failed to verify company: ${error.message}`);
    }
  }

  /**
   * Reject company verification
   * @param {String} companyId - Company ID
   * @param {String} rejectedBy - User ID of rejector
   * @param {String} reason - Rejection reason
   * @returns {Promise<Object>} Rejected company
   */
  async rejectCompany(companyId, rejectedBy, reason) {
    try {
      const company = await Company.findById(companyId);
      if (!company) {
        throw new Error('Company not found');
      }

      await company.reject(rejectedBy, reason);

      // Send notification to company contact person
      if (company.contactPerson.email) {
        await NotificationService.sendNotification(
          null, // No user ID for company notifications
          {
            title: 'Company Verification Rejected',
            message: `Unfortunately, the verification for ${company.name} has been rejected. Reason: ${reason}`,
            type: 'warning',
            category: 'company'
          },
          { email: company.contactPerson.email }
        );
      }

      return company;
    } catch (error) {
      throw new Error(`Failed to reject company: ${error.message}`);
    }
  }

  /**
   * Update company partnership level
   * @param {String} companyId - Company ID
   * @param {String} newLevel - New partnership level
   * @param {String} updatedBy - User ID of updater
   * @returns {Promise<Object>} Updated company
   */
  async updatePartnershipLevel(companyId, newLevel, updatedBy) {
    try {
      const company = await Company.findById(companyId);
      if (!company) {
        throw new Error('Company not found');
      }

      const oldLevel = company.partnershipLevel;
      await company.updatePartnershipLevel(newLevel);

      // Send notification about partnership level change
      if (company.contactPerson.email) {
        await NotificationService.sendNotification(
          null,
          {
            title: 'Partnership Level Updated',
            message: `${company.name}'s partnership level has been updated from ${oldLevel} to ${newLevel}.`,
            type: 'info',
            category: 'company'
          },
          { email: company.contactPerson.email }
        );
      }

      return company;
    } catch (error) {
      throw new Error(`Failed to update partnership level: ${error.message}`);
    }
  }

  /**
   * Get company dashboard data
   * @param {String} companyId - Company ID
   * @returns {Promise<Object>} Dashboard data
   */
  async getCompanyDashboard(companyId) {
    try {
      const company = await Company.findById(companyId);
      if (!company) {
        throw new Error('Company not found');
      }

      // Get internship statistics
      const [
        totalInternships,
        activeInternships,
        draftInternships,
        closedInternships,
        totalApplications,
        pendingApplications,
        acceptedApplications,
        recentApplications
      ] = await Promise.all([
        Internship.countDocuments({ companyId }),
        Internship.countDocuments({ companyId, status: 'published' }),
        Internship.countDocuments({ companyId, status: 'draft' }),
        Internship.countDocuments({ companyId, status: 'closed' }),
        InternshipApplication.countDocuments({
          internshipId: { $in: await Internship.find({ companyId }).distinct('_id') }
        }),
        InternshipApplication.countDocuments({
          internshipId: { $in: await Internship.find({ companyId }).distinct('_id') },
          status: { $in: ['submitted', 'under_review'] }
        }),
        InternshipApplication.countDocuments({
          internshipId: { $in: await Internship.find({ companyId }).distinct('_id') },
          status: 'accepted'
        }),
        InternshipApplication.find({
          internshipId: { $in: await Internship.find({ companyId }).distinct('_id') }
        })
          .populate('studentId', 'firstName lastName email')
          .populate('internshipId', 'title')
          .sort({ submittedAt: -1 })
          .limit(5)
      ]);

      return {
        company,
        statistics: {
          internships: {
            total: totalInternships,
            active: activeInternships,
            draft: draftInternships,
            closed: closedInternships
          },
          applications: {
            total: totalApplications,
            pending: pendingApplications,
            accepted: acceptedApplications
          }
        },
        recentApplications
      };
    } catch (error) {
      throw new Error(`Failed to get company dashboard: ${error.message}`);
    }
  }

  /**
   * Manage applications for a company
   * @param {String} companyId - Company ID
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Applications
   */
  async manageApplications(companyId, filters = {}) {
    try {
      // Get company internships
      const companyInternships = await Internship.find({ companyId }).distinct('_id');

      // Build query for applications
      let query = { internshipId: { $in: companyInternships } };

      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.internshipId) {
        query.internshipId = filters.internshipId;
      }

      const applications = await InternshipApplication.find(query)
        .populate('studentId', 'firstName lastName email studentId program yearLevel')
        .populate('internshipId', 'title startDate endDate')
        .sort({ submittedAt: -1 });

      return applications;
    } catch (error) {
      throw new Error(`Failed to manage applications: ${error.message}`);
    }
  }

  /**
   * Get company analytics
   * @param {String} companyId - Company ID
   * @param {Object} dateRange - Date range for analytics
   * @returns {Promise<Object>} Analytics data
   */
  async getCompanyAnalytics(companyId, dateRange = {}) {
    try {
      const { startDate, endDate } = dateRange;
      
      // Build date filter
      const dateFilter = {};
      if (startDate && endDate) {
        dateFilter.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      // Get internship IDs for this company
      const internshipIds = await Internship.find({ 
        companyId, 
        ...dateFilter 
      }).distinct('_id');

      // Application statistics by status
      const applicationStats = await InternshipApplication.aggregate([
        { $match: { internshipId: { $in: internshipIds } } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      // Application trends over time
      const applicationTrends = await InternshipApplication.aggregate([
        { $match: { internshipId: { $in: internshipIds } } },
        {
          $group: {
            _id: {
              year: { $year: '$submittedAt' },
              month: { $month: '$submittedAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      // Top performing internships
      const topInternships = await InternshipApplication.aggregate([
        { $match: { internshipId: { $in: internshipIds } } },
        { $group: { _id: '$internshipId', applicationCount: { $sum: 1 } } },
        { $sort: { applicationCount: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'internships',
            localField: '_id',
            foreignField: '_id',
            as: 'internship'
          }
        },
        { $unwind: '$internship' },
        {
          $project: {
            title: '$internship.title',
            applicationCount: 1
          }
        }
      ]);

      // Student program distribution
      const programDistribution = await InternshipApplication.aggregate([
        { $match: { internshipId: { $in: internshipIds } } },
        { $group: { _id: '$studentInfo.program', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      return {
        applicationStats: applicationStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        applicationTrends,
        topInternships,
        programDistribution
      };
    } catch (error) {
      throw new Error(`Failed to get company analytics: ${error.message}`);
    }
  }

  /**
   * Get companies by industry
   * @param {String} industry - Industry name
   * @returns {Promise<Array>} Companies in industry
   */
  async getCompaniesByIndustry(industry) {
    try {
      return await Company.findByIndustry(industry);
    } catch (error) {
      throw new Error(`Failed to get companies by industry: ${error.message}`);
    }
  }

  /**
   * Get verified companies
   * @returns {Promise<Array>} Verified companies
   */
  async getVerifiedCompanies() {
    try {
      return await Company.findVerified();
    } catch (error) {
      throw new Error(`Failed to get verified companies: ${error.message}`);
    }
  }

  /**
   * Search companies
   * @param {String} searchTerm - Search term
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Search results
   */
  async searchCompanies(searchTerm, filters = {}) {
    try {
      let query = {
        $text: { $search: searchTerm },
        verificationStatus: 'verified',
        isActive: true
      };

      if (filters.industry) {
        query.industry = filters.industry;
      }
      if (filters.partnershipLevel) {
        query.partnershipLevel = filters.partnershipLevel;
      }

      const companies = await Company.find(query)
        .select('name description industry partnershipLevel totalInternships averageRating')
        .sort({ score: { $meta: 'textScore' } })
        .limit(20);

      return companies;
    } catch (error) {
      throw new Error(`Failed to search companies: ${error.message}`);
    }
  }

  /**
   * Update company rating based on internship evaluations
   * @param {String} companyId - Company ID
   * @returns {Promise<Object>} Updated company
   */
  async updateCompanyRating(companyId) {
    try {
      // Get all completed internships for this company
      const internshipIds = await Internship.find({ companyId }).distinct('_id');
      
      const evaluations = await InternshipApplication.aggregate([
        {
          $match: {
            internshipId: { $in: internshipIds },
            internshipStatus: 'completed',
            'evaluations.0': { $exists: true }
          }
        },
        { $unwind: '$evaluations' },
        { $match: { 'evaluations.evaluatorType': 'student' } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$evaluations.overallRating' },
            totalEvaluations: { $sum: 1 }
          }
        }
      ]);

      if (evaluations.length > 0) {
        const { averageRating } = evaluations[0];
        const company = await Company.findByIdAndUpdate(
          companyId,
          { averageRating: Math.round(averageRating * 10) / 10 },
          { new: true }
        );
        return company;
      }

      return await Company.findById(companyId);
    } catch (error) {
      throw new Error(`Failed to update company rating: ${error.message}`);
    }
  }

  /**
   * Get application management dashboard for company
   * @param {String} companyId - Company ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Application management data
   */
  async getApplicationManagementDashboard(companyId, filters = {}) {
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
      if (filters.dateFrom) {
        applicationQuery.submittedAt = { $gte: new Date(filters.dateFrom) };
      }
      if (filters.dateTo) {
        applicationQuery.submittedAt = { 
          ...applicationQuery.submittedAt,
          $lte: new Date(filters.dateTo) 
        };
      }

      // Get applications with pagination
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;

      const [applications, totalApplications] = await Promise.all([
        InternshipApplication.find(applicationQuery)
          .populate('studentId', 'firstName lastName email program yearLevel gpa')
          .populate('internshipId', 'title startDate endDate')
          .sort({ submittedAt: -1 })
          .skip(skip)
          .limit(limit),
        InternshipApplication.countDocuments(applicationQuery)
      ]);

      // Get application statistics
      const applicationStats = await InternshipApplication.aggregate([
        { $match: { internshipId: { $in: internshipIds } } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      // Get recent activity
      const recentActivity = await InternshipApplication.find({
        internshipId: { $in: internshipIds },
        $or: [
          { reviewedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
          { submittedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
        ]
      })
        .populate('studentId', 'firstName lastName')
        .populate('internshipId', 'title')
        .sort({ updatedAt: -1 })
        .limit(10);

      return {
        applications,
        pagination: {
          page,
          limit,
          total: totalApplications,
          pages: Math.ceil(totalApplications / limit)
        },
        statistics: applicationStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        recentActivity
      };

    } catch (error) {
      throw new Error(`Failed to get application management dashboard: ${error.message}`);
    }
  }

  /**
   * Batch process applications for a company
   * @param {String} companyId - Company ID
   * @param {Array} applicationIds - Application IDs to process
   * @param {String} action - Action to perform (accept, reject, shortlist)
   * @param {String} processedBy - User ID of processor
   * @param {Object} actionData - Additional action data
   * @returns {Promise<Object>} Batch processing results
   */
  async batchProcessApplications(companyId, applicationIds, action, processedBy, actionData = {}) {
    try {
      // Verify company exists
      const company = await Company.findById(companyId);
      if (!company) {
        throw new Error('Company not found');
      }

      // Verify applications belong to company
      const internshipIds = await Internship.find({ companyId }).distinct('_id');
      const applications = await InternshipApplication.find({
        _id: { $in: applicationIds },
        internshipId: { $in: internshipIds }
      });

      if (applications.length !== applicationIds.length) {
        throw new Error('Some applications do not belong to this company');
      }

      const results = {
        successful: [],
        failed: []
      };

      // Process each application
      for (const application of applications) {
        try {
          let updatedApplication;
          
          switch (action) {
            case 'accept':
              updatedApplication = await application.accept(processedBy, actionData.feedback);
              break;
            case 'reject':
              updatedApplication = await application.reject(processedBy, actionData.feedback);
              break;
            case 'shortlist':
              updatedApplication = await application.updateStatus('shortlisted', processedBy, actionData.notes);
              break;
            case 'schedule_interview':
              updatedApplication = await application.scheduleInterview(actionData.interviewDetails);
              break;
            default:
              throw new Error(`Invalid action: ${action}`);
          }

          results.successful.push({
            applicationId: application._id,
            newStatus: updatedApplication.status
          });

        } catch (error) {
          results.failed.push({
            applicationId: application._id,
            error: error.message
          });
        }
      }

      return results;

    } catch (error) {
      throw new Error(`Failed to batch process applications: ${error.message}`);
    }
  }

  /**
   * Get candidate evaluation summary for company
   * @param {String} companyId - Company ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Evaluation summary
   */
  async getCandidateEvaluationSummary(companyId, filters = {}) {
    try {
      const internshipIds = await Internship.find({ companyId }).distinct('_id');

      // Get applications with evaluations
      const evaluatedApplications = await InternshipApplication.find({
        internshipId: { $in: internshipIds },
        'evaluations.0': { $exists: true },
        ...(filters.period && { 'evaluations.period': filters.period })
      })
        .populate('studentId', 'firstName lastName program')
        .populate('internshipId', 'title');

      // Calculate evaluation statistics
      const evaluationStats = {
        totalEvaluated: evaluatedApplications.length,
        averageRatings: {
          technicalSkills: 0,
          communication: 0,
          teamwork: 0,
          initiative: 0,
          reliability: 0,
          overallPerformance: 0
        },
        programPerformance: {},
        topPerformers: [],
        improvementAreas: []
      };

      if (evaluatedApplications.length > 0) {
        // Calculate average ratings
        const totalRatings = evaluatedApplications.reduce((acc, app) => {
          app.evaluations.forEach(evaluation => {
            Object.keys(evaluation.ratings).forEach(key => {
              acc[key] = (acc[key] || 0) + evaluation.ratings[key];
            });
          });
          return acc;
        }, {});

        const totalEvaluations = evaluatedApplications.reduce((sum, app) => sum + app.evaluations.length, 0);

        Object.keys(evaluationStats.averageRatings).forEach(key => {
          evaluationStats.averageRatings[key] = totalRatings[key] ? 
            Math.round((totalRatings[key] / totalEvaluations) * 10) / 10 : 0;
        });

        // Program performance analysis
        const programStats = {};
        evaluatedApplications.forEach(app => {
          const program = app.studentId.program;
          if (!programStats[program]) {
            programStats[program] = { total: 0, count: 0 };
          }
          
          app.evaluations.forEach(evaluation => {
            programStats[program].total += evaluation.overallRating;
            programStats[program].count += 1;
          });
        });

        Object.keys(programStats).forEach(program => {
          evaluationStats.programPerformance[program] = 
            Math.round((programStats[program].total / programStats[program].count) * 10) / 10;
        });

        // Top performers (highest average ratings)
        evaluationStats.topPerformers = evaluatedApplications
          .map(app => {
            const avgRating = app.evaluations.reduce((sum, evaluation) => sum + evaluation.overallRating, 0) / app.evaluations.length;
            return {
              student: app.studentId,
              internship: app.internshipId.title,
              averageRating: Math.round(avgRating * 10) / 10
            };
          })
          .sort((a, b) => b.averageRating - a.averageRating)
          .slice(0, 10);
      }

      return evaluationStats;

    } catch (error) {
      throw new Error(`Failed to get evaluation summary: ${error.message}`);
    }
  }

  /**
   * Generate company recruitment insights
   * @param {String} companyId - Company ID
   * @param {Object} timeframe - Analysis timeframe
   * @returns {Promise<Object>} Recruitment insights
   */
  async getRecruitmentInsights(companyId, timeframe = {}) {
    try {
      const { startDate, endDate } = timeframe;
      const dateFilter = {};
      
      if (startDate && endDate) {
        dateFilter.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const internshipIds = await Internship.find({ 
        companyId, 
        ...dateFilter 
      }).distinct('_id');

      // Application funnel analysis
      const funnelData = await InternshipApplication.aggregate([
        { $match: { internshipId: { $in: internshipIds } } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            avgProcessingTime: {
              $avg: {
                $subtract: [
                  { $ifNull: ['$finalDecisionAt', new Date()] },
                  '$submittedAt'
                ]
              }
            }
          }
        }
      ]);

      // Source analysis
      const sourceAnalysis = await InternshipApplication.aggregate([
        { $match: { internshipId: { $in: internshipIds } } },
        { $group: { _id: '$applicationSource', count: { $sum: 1 } } }
      ]);

      // Time-to-hire analysis
      const timeToHire = await InternshipApplication.aggregate([
        {
          $match: {
            internshipId: { $in: internshipIds },
            status: 'accepted',
            finalDecisionAt: { $exists: true }
          }
        },
        {
          $project: {
            daysToHire: {
              $divide: [
                { $subtract: ['$finalDecisionAt', '$submittedAt'] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            avgDaysToHire: { $avg: '$daysToHire' },
            minDaysToHire: { $min: '$daysToHire' },
            maxDaysToHire: { $max: '$daysToHire' }
          }
        }
      ]);

      // Popular skills analysis
      const skillsAnalysis = await InternshipApplication.aggregate([
        { $match: { internshipId: { $in: internshipIds } } },
        { $unwind: '$studentInfo.skills' },
        { $group: { _id: '$studentInfo.skills', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      return {
        applicationFunnel: funnelData.reduce((acc, item) => {
          acc[item._id] = {
            count: item.count,
            avgProcessingDays: Math.round(item.avgProcessingTime / (1000 * 60 * 60 * 24))
          };
          return acc;
        }, {}),
        applicationSources: sourceAnalysis.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        timeToHire: timeToHire.length > 0 ? {
          average: Math.round(timeToHire[0].avgDaysToHire),
          minimum: Math.round(timeToHire[0].minDaysToHire),
          maximum: Math.round(timeToHire[0].maxDaysToHire)
        } : null,
        popularSkills: skillsAnalysis.map(skill => ({
          skill: skill._id,
          count: skill.count
        }))
      };

    } catch (error) {
      throw new Error(`Failed to get recruitment insights: ${error.message}`);
    }
  }

  /**
   * Get company performance metrics
   * @param {String} companyId - Company ID
   * @returns {Promise<Object>} Performance metrics
   */
  async getCompanyPerformance(companyId) {
    try {
      const internshipIds = await Internship.find({ companyId }).distinct('_id');

      const [
        totalApplications,
        acceptedApplications,
        completedInternships,
        averageCompletionTime,
        studentSatisfaction
      ] = await Promise.all([
        InternshipApplication.countDocuments({ internshipId: { $in: internshipIds } }),
        InternshipApplication.countDocuments({ 
          internshipId: { $in: internshipIds },
          status: 'accepted'
        }),
        InternshipApplication.countDocuments({
          internshipId: { $in: internshipIds },
          internshipStatus: 'completed'
        }),
        InternshipApplication.aggregate([
          {
            $match: {
              internshipId: { $in: internshipIds },
              internshipStatus: 'completed',
              startedAt: { $exists: true },
              completedAt: { $exists: true }
            }
          },
          {
            $project: {
              duration: {
                $divide: [
                  { $subtract: ['$completedAt', '$startedAt'] },
                  1000 * 60 * 60 * 24 // Convert to days
                ]
              }
            }
          },
          {
            $group: {
              _id: null,
              averageDuration: { $avg: '$duration' }
            }
          }
        ]),
        InternshipApplication.aggregate([
          {
            $match: {
              internshipId: { $in: internshipIds },
              'evaluations.evaluatorType': 'student'
            }
          },
          { $unwind: '$evaluations' },
          { $match: { 'evaluations.evaluatorType': 'student' } },
          {
            $group: {
              _id: null,
              averageRating: { $avg: '$evaluations.overallRating' }
            }
          }
        ])
      ]);

      const acceptanceRate = totalApplications > 0 ? (acceptedApplications / totalApplications) * 100 : 0;
      const completionRate = acceptedApplications > 0 ? (completedInternships / acceptedApplications) * 100 : 0;
      const avgCompletionDays = averageCompletionTime.length > 0 ? averageCompletionTime[0].averageDuration : 0;
      const avgSatisfaction = studentSatisfaction.length > 0 ? studentSatisfaction[0].averageRating : 0;

      return {
        totalApplications,
        acceptedApplications,
        completedInternships,
        acceptanceRate: Math.round(acceptanceRate * 10) / 10,
        completionRate: Math.round(completionRate * 10) / 10,
        averageCompletionDays: Math.round(avgCompletionDays),
        studentSatisfactionRating: Math.round(avgSatisfaction * 10) / 10
      };
    } catch (error) {
      throw new Error(`Failed to get company performance: ${error.message}`);
    }
  }
}

module.exports = new CompanyService();