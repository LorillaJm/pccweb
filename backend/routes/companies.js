const express = require('express');
const router = express.Router();
const CompanyService = require('../services/CompanyService');
const { requireAuth, requireRole } = require('../middleware/sessionAuth');
const multer = require('multer');
const path = require('path');

// Configure multer for document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/companies/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and image files are allowed.'));
    }
  }
});

// GET /api/companies - Get all companies with filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search = '',
      verificationStatus,
      industry,
      partnershipLevel,
      isActive
    } = req.query;

    const filters = {};
    if (verificationStatus) filters.verificationStatus = verificationStatus;
    if (industry) filters.industry = industry;
    if (partnershipLevel) filters.partnershipLevel = partnershipLevel;
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder,
      search
    };

    const result = await CompanyService.getCompanies(filters, options);
    res.json(result);
  } catch (error) {
    console.error('Error getting companies:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/companies/verified - Get verified companies only
router.get('/verified', async (req, res) => {
  try {
    const companies = await CompanyService.getVerifiedCompanies();
    res.json(companies);
  } catch (error) {
    console.error('Error getting verified companies:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/companies/industry/:industry - Get companies by industry
router.get('/industry/:industry', async (req, res) => {
  try {
    const { industry } = req.params;
    const companies = await CompanyService.getCompaniesByIndustry(industry);
    res.json(companies);
  } catch (error) {
    console.error('Error getting companies by industry:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/companies/search - Search companies
router.get('/search', async (req, res) => {
  try {
    const { q: searchTerm, industry, partnershipLevel } = req.query;
    
    if (!searchTerm) {
      return res.status(400).json({ error: 'Search term is required' });
    }

    const filters = {};
    if (industry) filters.industry = industry;
    if (partnershipLevel) filters.partnershipLevel = partnershipLevel;

    const companies = await CompanyService.searchCompanies(searchTerm, filters);
    res.json(companies);
  } catch (error) {
    console.error('Error searching companies:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/companies/:id - Get company by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const company = await CompanyService.getCompanyById(id);
    res.json(company);
  } catch (error) {
    console.error('Error getting company:', error);
    res.status(404).json({ error: error.message });
  }
});

// POST /api/companies - Register new company
router.post('/', 
  requireAuth,
  upload.fields([
    { name: 'business_permit', maxCount: 1 },
    { name: 'sec_registration', maxCount: 1 },
    { name: 'moa', maxCount: 1 },
    { name: 'tax_clearance', maxCount: 1 },
    { name: 'other', maxCount: 3 }
  ]),
  async (req, res) => {
    try {
      const companyData = { ...req.body };
      const contactPersonId = req.user.id;

      // Parse contactPerson if it's a string
      if (typeof companyData.contactPerson === 'string') {
        companyData.contactPerson = JSON.parse(companyData.contactPerson);
      }

      // Add uploaded documents
      if (req.files) {
        companyData.documents = [];
        Object.keys(req.files).forEach(fieldName => {
          req.files[fieldName].forEach(file => {
            companyData.documents.push({
              type: fieldName,
              filename: file.filename,
              originalName: file.originalname,
              uploadedBy: contactPersonId
            });
          });
        });
      }

      const company = await CompanyService.registerCompany(companyData, contactPersonId);
      res.status(201).json(company);
    } catch (error) {
      console.error('Error registering company:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

// PUT /api/companies/:id - Update company information
router.put('/:id', 
  requireAuth, 
  requireRole(['admin', 'company']), 
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedBy = req.user.id;

      const company = await CompanyService.updateCompany(id, updateData, updatedBy);
      res.json(company);
    } catch (error) {
      console.error('Error updating company:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

// POST /api/companies/:id/verify - Verify company (Admin only)
router.post('/:id/verify', 
  requireAuth, 
  requireRole(['admin']), 
  async (req, res) => {
    try {
      const { id } = req.params;
      const { notes = '' } = req.body;
      const verifiedBy = req.user.id;

      const company = await CompanyService.verifyCompany(id, verifiedBy, notes);
      res.json(company);
    } catch (error) {
      console.error('Error verifying company:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

// POST /api/companies/:id/reject - Reject company verification (Admin only)
router.post('/:id/reject', 
  requireAuth, 
  requireRole(['admin']), 
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const rejectedBy = req.user.id;

      if (!reason) {
        return res.status(400).json({ error: 'Rejection reason is required' });
      }

      const company = await CompanyService.rejectCompany(id, rejectedBy, reason);
      res.json(company);
    } catch (error) {
      console.error('Error rejecting company:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

// PUT /api/companies/:id/partnership-level - Update partnership level (Admin only)
router.put('/:id/partnership-level', 
  requireAuth, 
  requireRole(['admin']), 
  async (req, res) => {
    try {
      const { id } = req.params;
      const { level } = req.body;
      const updatedBy = req.user.id;

      if (!level) {
        return res.status(400).json({ error: 'Partnership level is required' });
      }

      const company = await CompanyService.updatePartnershipLevel(id, level, updatedBy);
      res.json(company);
    } catch (error) {
      console.error('Error updating partnership level:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

// GET /api/companies/:id/dashboard - Get company dashboard data
router.get('/:id/dashboard', 
  requireAuth, 
  requireRole(['admin', 'company']), 
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if user has permission to view this company's dashboard
      if (req.user.role !== 'admin' && req.user.companyId !== id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const dashboard = await CompanyService.getCompanyDashboard(id);
      res.json(dashboard);
    } catch (error) {
      console.error('Error getting company dashboard:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /api/companies/:id/applications - Manage applications for company
router.get('/:id/applications', 
  requireAuth, 
  requireRole(['admin', 'company']), 
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, internshipId } = req.query;

      // Check if user has permission to view this company's applications
      if (req.user.role !== 'admin' && req.user.companyId !== id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const filters = {};
      if (status) filters.status = status;
      if (internshipId) filters.internshipId = internshipId;

      const applications = await CompanyService.manageApplications(id, filters);
      res.json(applications);
    } catch (error) {
      console.error('Error getting company applications:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /api/companies/:id/analytics - Get company analytics
router.get('/:id/analytics', 
  requireAuth, 
  requireRole(['admin', 'company']), 
  async (req, res) => {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      // Check if user has permission to view this company's analytics
      if (req.user.role !== 'admin' && req.user.companyId !== id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const dateRange = {};
      if (startDate && endDate) {
        dateRange.startDate = startDate;
        dateRange.endDate = endDate;
      }

      const analytics = await CompanyService.getCompanyAnalytics(id, dateRange);
      res.json(analytics);
    } catch (error) {
      console.error('Error getting company analytics:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /api/companies/:id/performance - Get company performance metrics
router.get('/:id/performance', 
  requireAuth, 
  requireRole(['admin', 'company']), 
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check if user has permission to view this company's performance
      if (req.user.role !== 'admin' && req.user.companyId !== id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const performance = await CompanyService.getCompanyPerformance(id);
      res.json(performance);
    } catch (error) {
      console.error('Error getting company performance:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// PUT /api/companies/:id/rating - Update company rating (System use)
router.put('/:id/rating', 
  requireAuth, 
  requireRole(['admin']), 
  async (req, res) => {
    try {
      const { id } = req.params;
      const company = await CompanyService.updateCompanyRating(id);
      res.json(company);
    } catch (error) {
      console.error('Error updating company rating:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files uploaded.' });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({ error: error.message });
  }
  
  next(error);
});

module.exports = router;
