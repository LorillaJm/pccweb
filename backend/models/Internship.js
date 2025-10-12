const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  companyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Company', 
    required: [true, 'Company ID is required'],
    index: true
  },
  title: { 
    type: String, 
    required: [true, 'Internship title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: { 
    type: String, 
    required: [true, 'Internship description is required'],
    trim: true,
    maxlength: [3000, 'Description cannot exceed 3000 characters']
  },
  requirements: [{
    type: String,
    trim: true,
    maxlength: [500, 'Each requirement cannot exceed 500 characters']
  }],
  skills: [{
    type: String,
    trim: true,
    maxlength: [100, 'Each skill cannot exceed 100 characters']
  }],
  duration: { 
    type: Number, 
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 week'],
    max: [52, 'Duration cannot exceed 52 weeks']
  },
  stipend: { 
    type: Number, 
    default: 0,
    min: [0, 'Stipend cannot be negative']
  },
  currency: {
    type: String,
    default: 'PHP',
    enum: ['PHP', 'USD', 'EUR']
  },
  location: { 
    type: String, 
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [300, 'Location cannot exceed 300 characters']
  },
  workArrangement: { 
    type: String, 
    enum: {
      values: ['onsite', 'remote', 'hybrid'],
      message: 'Work arrangement must be onsite, remote, or hybrid'
    },
    default: 'onsite',
    index: true
  },
  slots: { 
    type: Number, 
    required: [true, 'Number of slots is required'],
    min: [1, 'Must have at least 1 slot'],
    max: [100, 'Cannot exceed 100 slots']
  },
  filledSlots: { 
    type: Number, 
    default: 0,
    min: [0, 'Filled slots cannot be negative']
  },
  applicationDeadline: { 
    type: Date, 
    required: [true, 'Application deadline is required'],
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: 'Application deadline must be in the future'
    },
    index: true
  },
  startDate: { 
    type: Date, 
    required: [true, 'Start date is required'],
    validate: {
      validator: function(v) {
        return v > this.applicationDeadline;
      },
      message: 'Start date must be after application deadline'
    },
    index: true
  },
  endDate: { 
    type: Date, 
    required: [true, 'End date is required'],
    validate: {
      validator: function(v) {
        return v > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  status: { 
    type: String, 
    enum: {
      values: ['draft', 'published', 'closed', 'completed', 'cancelled'],
      message: 'Status must be draft, published, closed, completed, or cancelled'
    },
    default: 'draft',
    index: true
  },
  targetPrograms: [{
    type: String,
    trim: true,
    enum: {
      values: [
        'Computer Science', 'Information Technology', 'Engineering', 
        'Business Administration', 'Accounting', 'Marketing', 'Education',
        'Nursing', 'Psychology', 'Communications', 'Hospitality Management',
        'Tourism', 'Architecture', 'Fine Arts', 'Other'
      ],
      message: 'Please select valid target programs'
    }
  }],
  yearLevelRequirement: { 
    type: Number, 
    min: [1, 'Year level must be at least 1'],
    max: [4, 'Year level cannot exceed 4'],
    validate: {
      validator: function(v) {
        return Number.isInteger(v);
      },
      message: 'Year level must be a whole number'
    }
  },
  // Application tracking
  applicationCount: {
    type: Number,
    default: 0,
    min: 0
  },
  acceptedCount: {
    type: Number,
    default: 0,
    min: 0
  },
  // Additional requirements
  gpaRequirement: {
    type: Number,
    min: [1.0, 'GPA requirement must be at least 1.0'],
    max: [4.0, 'GPA requirement cannot exceed 4.0']
  },
  additionalRequirements: {
    portfolioRequired: {
      type: Boolean,
      default: false
    },
    coverLetterRequired: {
      type: Boolean,
      default: true
    },
    interviewRequired: {
      type: Boolean,
      default: false
    },
    technicalTestRequired: {
      type: Boolean,
      default: false
    }
  },
  // Contact and application info
  applicationInstructions: {
    type: String,
    maxlength: [1000, 'Application instructions cannot exceed 1000 characters']
  },
  contactEmail: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  publishedAt: {
    type: Date
  },
  viewCount: {
    type: Number,
    default: 0
  },
  // Tags for better searchability
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Each tag cannot exceed 50 characters']
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
internshipSchema.index({ title: 'text', description: 'text' });
internshipSchema.index({ status: 1, applicationDeadline: 1 });
internshipSchema.index({ workArrangement: 1, status: 1 });
internshipSchema.index({ targetPrograms: 1, status: 1 });
internshipSchema.index({ companyId: 1, status: 1 });
internshipSchema.index({ startDate: 1, endDate: 1 });
internshipSchema.index({ createdAt: -1 });

// Virtual for available slots
internshipSchema.virtual('availableSlots').get(function() {
  return Math.max(0, this.slots - this.filledSlots);
});

// Virtual for application status
internshipSchema.virtual('isApplicationOpen').get(function() {
  const now = new Date();
  return this.status === 'published' && 
         this.applicationDeadline > now && 
         this.availableSlots > 0;
});

// Virtual for duration in weeks display
internshipSchema.virtual('durationDisplay').get(function() {
  if (this.duration === 1) return '1 week';
  if (this.duration < 4) return `${this.duration} weeks`;
  if (this.duration === 4) return '1 month';
  if (this.duration < 52) return `${Math.floor(this.duration / 4)} months`;
  return '1 year';
});

// Virtual for stipend display
internshipSchema.virtual('stipendDisplay').get(function() {
  if (this.stipend === 0) return 'Unpaid';
  return `${this.currency} ${this.stipend.toLocaleString()}`;
});

// Pre-save middleware
internshipSchema.pre('save', function(next) {
  // Set published date when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Validate filled slots doesn't exceed total slots
  if (this.filledSlots > this.slots) {
    const error = new Error('Filled slots cannot exceed total slots');
    error.name = 'ValidationError';
    return next(error);
  }
  
  // Auto-close if deadline passed or slots filled
  if (this.status === 'published') {
    const now = new Date();
    if (this.applicationDeadline <= now || this.filledSlots >= this.slots) {
      this.status = 'closed';
    }
  }
  
  next();
});

// Instance methods
internshipSchema.methods.publish = function() {
  if (this.status !== 'draft') {
    throw new Error('Only draft internships can be published');
  }
  this.status = 'published';
  this.publishedAt = new Date();
  return this.save();
};

internshipSchema.methods.close = function() {
  if (!['published', 'draft'].includes(this.status)) {
    throw new Error('Cannot close internship in current status');
  }
  this.status = 'closed';
  return this.save();
};

internshipSchema.methods.incrementApplication = function() {
  this.applicationCount += 1;
  // Don't auto-save, let caller decide when to save
  return this;
};

internshipSchema.methods.incrementAccepted = function() {
  this.acceptedCount += 1;
  this.filledSlots += 1;
  // Don't auto-save, let caller decide when to save
  return this;
};

internshipSchema.methods.decrementAccepted = function() {
  if (this.acceptedCount > 0) {
    this.acceptedCount -= 1;
  }
  if (this.filledSlots > 0) {
    this.filledSlots -= 1;
  }
  // Don't auto-save, let caller decide when to save
  return this;
};

internshipSchema.methods.incrementView = function() {
  this.viewCount += 1;
  // Don't auto-save, let caller decide when to save
  return this;
};

// Static methods
internshipSchema.statics.findPublished = function() {
  return this.find({ 
    status: 'published',
    applicationDeadline: { $gt: new Date() }
  }).populate('companyId', 'name industry verificationStatus');
};

internshipSchema.statics.findByCompany = function(companyId) {
  return this.find({ companyId }).populate('companyId', 'name industry');
};

internshipSchema.statics.findByProgram = function(program) {
  return this.find({ 
    targetPrograms: program,
    status: 'published',
    applicationDeadline: { $gt: new Date() }
  }).populate('companyId', 'name industry verificationStatus');
};

internshipSchema.statics.findExpiringSoon = function(days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    status: 'published',
    applicationDeadline: { 
      $gt: new Date(),
      $lte: futureDate
    }
  }).populate('companyId', 'name contactPerson.email');
};

module.exports = mongoose.model('Internship', internshipSchema);