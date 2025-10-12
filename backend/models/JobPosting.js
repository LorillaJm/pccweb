const mongoose = require('mongoose');

const jobPostingSchema = new mongoose.Schema({
  posterId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  posterType: { 
    type: String, 
    enum: ['alumni', 'company', 'admin'], 
    required: true,
    index: true
  },
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 200
  },
  company: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  description: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 5000
  },
  requirements: [{
    type: String,
    trim: true,
    maxlength: 500
  }],
  skills: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  location: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100,
    index: true
  },
  workType: { 
    type: String, 
    enum: ['full_time', 'part_time', 'contract', 'internship', 'freelance'], 
    required: true,
    index: true
  },
  workArrangement: {
    type: String,
    enum: ['onsite', 'remote', 'hybrid'],
    default: 'onsite',
    index: true
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'junior', 'mid', 'senior', 'executive'],
    default: 'entry',
    index: true
  },
  salaryRange: {
    min: {
      type: Number,
      min: 0
    },
    max: {
      type: Number,
      min: 0,
      validate: {
        validator: function(v) {
          return !this.salaryRange.min || v >= this.salaryRange.min;
        },
        message: 'Maximum salary must be greater than or equal to minimum salary'
      }
    },
    currency: { 
      type: String, 
      default: 'PHP',
      enum: ['PHP', 'USD', 'EUR', 'SGD', 'AUD']
    },
    isNegotiable: {
      type: Boolean,
      default: false
    }
  },
  benefits: [{
    type: String,
    trim: true,
    maxlength: 100
  }],
  applicationDeadline: { 
    type: Date,
    validate: {
      validator: function(v) {
        return !v || v > new Date();
      },
      message: 'Application deadline must be in the future'
    },
    index: true
  },
  contactEmail: { 
    type: String, 
    required: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  contactPhone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^[\+]?[1-9][\d]{0,15}$/.test(v.replace(/[\s\-\(\)]/g, ''));
      },
      message: 'Invalid phone number format'
    }
  },
  applicationInstructions: { 
    type: String,
    trim: true,
    maxlength: 1000
  },
  targetAudience: { 
    type: String, 
    enum: ['students', 'alumni', 'both'], 
    default: 'both',
    index: true
  },
  preferredGraduationYears: [{
    type: Number,
    min: 1950,
    max: new Date().getFullYear() + 10
  }],
  preferredPrograms: [{
    type: String,
    trim: true
  }],
  requiredDocuments: [{
    type: String,
    enum: ['resume', 'cover_letter', 'portfolio', 'transcript', 'references', 'other'],
    default: 'resume'
  }],
  status: { 
    type: String, 
    enum: ['draft', 'active', 'paused', 'closed', 'expired'], 
    default: 'draft',
    index: true
  },
  priority: {
    type: String,
    enum: ['normal', 'featured', 'urgent'],
    default: 'normal',
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  applicationCount: { 
    type: Number, 
    default: 0,
    min: 0
  },
  viewCount: { 
    type: Number, 
    default: 0,
    min: 0
  },
  applicationLimit: {
    type: Number,
    min: 1,
    default: null // null means no limit
  },
  autoCloseOnLimit: {
    type: Boolean,
    default: false
  },
  externalApplicationUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\//.test(v);
      },
      message: 'Invalid external application URL format'
    }
  },
  companyInfo: {
    website: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\//.test(v);
        },
        message: 'Invalid website URL format'
      }
    },
    size: {
      type: String,
      enum: ['startup', 'small', 'medium', 'large', 'enterprise']
    },
    industry: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  featuredUntil: {
    type: Date
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      // Add computed fields
      ret.isExpired = doc.isExpired;
      ret.daysUntilDeadline = doc.daysUntilDeadline;
      ret.canAcceptApplications = doc.canAcceptApplications;
      return ret;
    }
  }
});

// Indexes for efficient queries
jobPostingSchema.index({ status: 1, createdAt: -1 });
jobPostingSchema.index({ workType: 1, location: 1 });
jobPostingSchema.index({ targetAudience: 1, status: 1 });
jobPostingSchema.index({ skills: 1, status: 1 });
jobPostingSchema.index({ applicationDeadline: 1, status: 1 });
jobPostingSchema.index({ priority: 1, createdAt: -1 });
jobPostingSchema.index({ tags: 1 });

// Text index for search functionality
jobPostingSchema.index({
  title: 'text',
  description: 'text',
  company: 'text',
  skills: 'text',
  requirements: 'text'
});

// Virtual for checking if job posting is expired
jobPostingSchema.virtual('isExpired').get(function() {
  return this.applicationDeadline && this.applicationDeadline < new Date();
});

// Virtual for days until deadline
jobPostingSchema.virtual('daysUntilDeadline').get(function() {
  if (!this.applicationDeadline) return null;
  const now = new Date();
  const deadline = new Date(this.applicationDeadline);
  const diffTime = deadline - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for checking if can accept applications
jobPostingSchema.virtual('canAcceptApplications').get(function() {
  if (this.status !== 'active') return false;
  if (this.isExpired) return false;
  if (this.applicationLimit && this.applicationCount >= this.applicationLimit) return false;
  return true;
});

// Static method to find active jobs
jobPostingSchema.statics.findActiveJobs = function(filters = {}) {
  const query = {
    status: 'active',
    $or: [
      { applicationDeadline: { $exists: false } },
      { applicationDeadline: { $gte: new Date() } }
    ]
  };

  // Apply filters
  if (filters.workType) {
    query.workType = filters.workType;
  }
  if (filters.location) {
    query.location = new RegExp(filters.location, 'i');
  }
  if (filters.workArrangement) {
    query.workArrangement = filters.workArrangement;
  }
  if (filters.experienceLevel) {
    query.experienceLevel = filters.experienceLevel;
  }
  if (filters.targetAudience) {
    query.targetAudience = { $in: [filters.targetAudience, 'both'] };
  }
  if (filters.skills && filters.skills.length > 0) {
    query.skills = { $in: filters.skills };
  }
  if (filters.salaryMin) {
    query['salaryRange.min'] = { $gte: filters.salaryMin };
  }
  if (filters.salaryMax) {
    query['salaryRange.max'] = { $lte: filters.salaryMax };
  }

  return this.find(query)
    .populate('posterId', 'firstName lastName email')
    .sort({ priority: -1, createdAt: -1 });
};

// Static method to search jobs by text
jobPostingSchema.statics.searchJobs = function(searchTerm, filters = {}) {
  const query = {
    $text: { $search: searchTerm },
    status: 'active',
    $or: [
      { applicationDeadline: { $exists: false } },
      { applicationDeadline: { $gte: new Date() } }
    ]
  };

  // Apply additional filters
  Object.assign(query, filters);

  return this.find(query, { score: { $meta: 'textScore' } })
    .populate('posterId', 'firstName lastName email')
    .sort({ score: { $meta: 'textScore' }, priority: -1 });
};

// Static method to find jobs for specific user
jobPostingSchema.statics.findJobsForUser = function(userId, userProfile) {
  const query = {
    status: 'active',
    $or: [
      { applicationDeadline: { $exists: false } },
      { applicationDeadline: { $gte: new Date() } }
    ]
  };

  // Filter by target audience
  if (userProfile.role === 'student') {
    query.targetAudience = { $in: ['students', 'both'] };
  } else {
    query.targetAudience = { $in: ['alumni', 'both'] };
  }

  // Filter by graduation year if specified
  if (userProfile.graduationYear) {
    query.$or = [
      { preferredGraduationYears: { $size: 0 } },
      { preferredGraduationYears: userProfile.graduationYear }
    ];
  }

  // Filter by program if specified
  if (userProfile.program) {
    query.$or = [
      { preferredPrograms: { $size: 0 } },
      { preferredPrograms: userProfile.program }
    ];
  }

  return this.find(query)
    .populate('posterId', 'firstName lastName email')
    .sort({ priority: -1, createdAt: -1 });
};

// Method to increment view count
jobPostingSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Method to increment application count
jobPostingSchema.methods.incrementApplicationCount = function() {
  this.applicationCount += 1;
  
  // Auto-close if limit reached and auto-close is enabled
  if (this.applicationLimit && 
      this.applicationCount >= this.applicationLimit && 
      this.autoCloseOnLimit) {
    this.status = 'closed';
  }
  
  return this.save();
};

// Pre-save middleware to update lastModified
jobPostingSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.lastModified = new Date();
  }
  next();
});

// Pre-save middleware to auto-expire jobs
jobPostingSchema.pre('save', function(next) {
  if (this.applicationDeadline && this.applicationDeadline < new Date() && this.status === 'active') {
    this.status = 'expired';
  }
  next();
});

module.exports = mongoose.model('JobPosting', jobPostingSchema);