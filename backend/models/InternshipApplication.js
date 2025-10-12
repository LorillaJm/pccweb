const mongoose = require('mongoose');

const internshipApplicationSchema = new mongoose.Schema({
  internshipId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Internship', 
    required: [true, 'Internship ID is required'],
    index: true
  },
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Student ID is required'],
    index: true
  },
  // Application content
  coverLetter: { 
    type: String, 
    required: [true, 'Cover letter is required'],
    trim: true,
    maxlength: [2000, 'Cover letter cannot exceed 2000 characters']
  },
  resume: { 
    type: String, 
    required: [true, 'Resume is required'] // File path or URL
  },
  portfolio: {
    type: String // Optional portfolio file path or URL
  },
  additionalDocuments: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Document name cannot exceed 100 characters']
    },
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      max: [10485760, 'File size cannot exceed 10MB'] // 10MB in bytes
    },
    mimeType: {
      type: String,
      required: true
    },
    uploadedAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  
  // Application status tracking
  status: { 
    type: String, 
    enum: {
      values: [
        'submitted', 'under_review', 'shortlisted', 'interview_scheduled',
        'interview_completed', 'accepted', 'rejected', 'withdrawn', 'expired'
      ],
      message: 'Invalid application status'
    },
    default: 'submitted',
    index: true
  },
  
  // Timeline tracking
  submittedAt: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  reviewedAt: { 
    type: Date 
  },
  reviewedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  interviewScheduledAt: {
    type: Date
  },
  interviewCompletedAt: {
    type: Date
  },
  finalDecisionAt: {
    type: Date
  },
  
  // Review and feedback
  reviewNotes: {
    type: String,
    maxlength: [1000, 'Review notes cannot exceed 1000 characters']
  },
  feedback: { 
    type: String,
    maxlength: [1000, 'Feedback cannot exceed 1000 characters']
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  
  // Interview details
  interviewSchedule: {
    date: {
      type: Date,
      validate: {
        validator: function(v) {
          if (!v) return true; // Optional field
          return v > new Date();
        },
        message: 'Interview date must be in the future'
      }
    },
    time: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true; // Optional field
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'Time must be in HH:MM format'
      }
    },
    duration: {
      type: Number,
      min: [15, 'Interview duration must be at least 15 minutes'],
      max: [180, 'Interview duration cannot exceed 180 minutes'],
      default: 60
    },
    location: {
      type: String,
      maxlength: [200, 'Location cannot exceed 200 characters']
    },
    type: { 
      type: String, 
      enum: {
        values: ['in_person', 'video_call', 'phone'],
        message: 'Interview type must be in_person, video_call, or phone'
      }
    },
    meetingLink: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true; // Optional field
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Meeting link must be a valid URL'
      }
    },
    interviewerName: {
      type: String,
      maxlength: [100, 'Interviewer name cannot exceed 100 characters']
    },
    interviewerEmail: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true; // Optional field
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please enter a valid email address'
      }
    },
    notes: {
      type: String,
      maxlength: [500, 'Interview notes cannot exceed 500 characters']
    }
  },
  
  // Student information at time of application
  studentInfo: {
    currentYear: {
      type: Number,
      required: true,
      min: [1, 'Year level must be at least 1'],
      max: [4, 'Year level cannot exceed 4']
    },
    program: {
      type: String,
      required: true,
      trim: true
    },
    gpa: {
      type: Number,
      min: [1.0, 'GPA must be at least 1.0'],
      max: [4.0, 'GPA cannot exceed 4.0']
    },
    expectedGraduation: {
      type: Date,
      required: true
    },
    skills: [{
      type: String,
      trim: true,
      maxlength: [50, 'Each skill cannot exceed 50 characters']
    }],
    previousExperience: {
      type: String,
      maxlength: [1000, 'Previous experience cannot exceed 1000 characters']
    }
  },
  
  // Application preferences
  preferences: {
    startDate: {
      type: Date,
      validate: {
        validator: function(v) {
          if (!v) return true; // Optional field
          return v >= new Date();
        },
        message: 'Preferred start date must be in the future'
      }
    },
    workArrangement: {
      type: String,
      enum: ['onsite', 'remote', 'hybrid', 'flexible']
    },
    additionalComments: {
      type: String,
      maxlength: [500, 'Additional comments cannot exceed 500 characters']
    }
  },
  
  // Tracking and analytics
  applicationSource: {
    type: String,
    enum: ['portal', 'email', 'referral', 'job_fair', 'other'],
    default: 'portal'
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Notification preferences
  notificationPreferences: {
    emailUpdates: {
      type: Boolean,
      default: true
    },
    smsUpdates: {
      type: Boolean,
      default: false
    }
  },
  
  // Withdrawal information
  withdrawalReason: {
    type: String,
    maxlength: [500, 'Withdrawal reason cannot exceed 500 characters']
  },
  withdrawnAt: {
    type: Date
  },
  
  // Internship progress and evaluation
  internshipStatus: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'terminated'],
    default: 'not_started'
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  finalRating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  
  // Progress tracking
  progressTracking: [{
    date: {
      type: Date,
      default: Date.now
    },
    milestone: {
      type: String,
      required: true,
      maxlength: [200, 'Milestone cannot exceed 200 characters']
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    completionPercentage: {
      type: Number,
      min: [0, 'Completion percentage cannot be negative'],
      max: [100, 'Completion percentage cannot exceed 100'],
      default: 0
    },
    supervisorNotes: {
      type: String,
      maxlength: [500, 'Supervisor notes cannot exceed 500 characters']
    },
    studentReflection: {
      type: String,
      maxlength: [500, 'Student reflection cannot exceed 500 characters']
    },
    attachments: [{
      filename: String,
      originalName: String,
      uploadedAt: { type: Date, default: Date.now }
    }],
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  
  // Evaluations
  evaluations: [{
    evaluatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    evaluatorType: {
      type: String,
      enum: ['company', 'school', 'student'],
      required: true
    },
    period: {
      type: String,
      enum: ['midterm', 'final', 'monthly', 'weekly'],
      required: true
    },
    ratings: {
      technicalSkills: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
        required: true
      },
      communication: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
        required: true
      },
      teamwork: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
        required: true
      },
      initiative: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
        required: true
      },
      reliability: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
        required: true
      },
      overallPerformance: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
        required: true
      }
    },
    overallRating: {
      type: Number,
      min: [1, 'Overall rating must be at least 1'],
      max: [5, 'Overall rating cannot exceed 5']
    },
    comments: {
      type: String,
      maxlength: [1000, 'Comments cannot exceed 1000 characters']
    },
    recommendations: {
      type: String,
      maxlength: [500, 'Recommendations cannot exceed 500 characters']
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Last progress report date for reminders
  lastProgressReport: {
    type: Date
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient queries
internshipApplicationSchema.index({ internshipId: 1, studentId: 1 }, { unique: true });
internshipApplicationSchema.index({ studentId: 1, status: 1 });
internshipApplicationSchema.index({ internshipId: 1, status: 1 });
internshipApplicationSchema.index({ submittedAt: -1 });
internshipApplicationSchema.index({ status: 1, submittedAt: -1 });

// Text index for searching
internshipApplicationSchema.index({ 
  coverLetter: 'text', 
  'studentInfo.skills': 'text',
  'studentInfo.previousExperience': 'text'
});

// Virtual for application age in days
internshipApplicationSchema.virtual('applicationAge').get(function() {
  return Math.floor((Date.now() - this.submittedAt.getTime()) / (1000 * 60 * 60 * 24));
});

// Virtual for status display
internshipApplicationSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'submitted': 'Application Submitted',
    'under_review': 'Under Review',
    'shortlisted': 'Shortlisted',
    'interview_scheduled': 'Interview Scheduled',
    'interview_completed': 'Interview Completed',
    'accepted': 'Accepted',
    'rejected': 'Not Selected',
    'withdrawn': 'Withdrawn',
    'expired': 'Expired'
  };
  return statusMap[this.status] || this.status;
});

// Virtual for interview status
internshipApplicationSchema.virtual('interviewStatus').get(function() {
  if (!this.interviewSchedule || !this.interviewSchedule.date) {
    return 'not_scheduled';
  }
  
  const now = new Date();
  const interviewDate = new Date(this.interviewSchedule.date);
  
  if (this.interviewCompletedAt) {
    return 'completed';
  } else if (interviewDate < now) {
    return 'missed';
  } else {
    return 'scheduled';
  }
});

// Pre-save middleware
internshipApplicationSchema.pre('save', function(next) {
  // Set review timestamp when status changes to under_review
  if (this.isModified('status')) {
    const now = new Date();
    
    switch (this.status) {
      case 'under_review':
        if (!this.reviewedAt) this.reviewedAt = now;
        break;
      case 'interview_scheduled':
        if (!this.interviewScheduledAt) this.interviewScheduledAt = now;
        break;
      case 'interview_completed':
        if (!this.interviewCompletedAt) this.interviewCompletedAt = now;
        break;
      case 'accepted':
      case 'rejected':
        if (!this.finalDecisionAt) this.finalDecisionAt = now;
        break;
      case 'withdrawn':
        if (!this.withdrawnAt) this.withdrawnAt = now;
        break;
    }
  }
  
  next();
});

// Instance methods
internshipApplicationSchema.methods.updateStatus = function(newStatus, reviewerId, notes) {
  const validTransitions = {
    'submitted': ['under_review', 'rejected', 'withdrawn'],
    'under_review': ['shortlisted', 'rejected', 'withdrawn'],
    'shortlisted': ['interview_scheduled', 'accepted', 'rejected', 'withdrawn'],
    'interview_scheduled': ['interview_completed', 'rejected', 'withdrawn'],
    'interview_completed': ['accepted', 'rejected', 'withdrawn'],
    'accepted': ['withdrawn'],
    'rejected': [],
    'withdrawn': [],
    'expired': []
  };
  
  if (!validTransitions[this.status].includes(newStatus)) {
    throw new Error(`Cannot transition from ${this.status} to ${newStatus}`);
  }
  
  this.status = newStatus;
  if (reviewerId) this.reviewedBy = reviewerId;
  if (notes) this.reviewNotes = notes;
  
  return this.save();
};

internshipApplicationSchema.methods.scheduleInterview = function(interviewDetails) {
  this.interviewSchedule = interviewDetails;
  this.status = 'interview_scheduled';
  return this.save();
};

internshipApplicationSchema.methods.withdraw = function(reason) {
  this.status = 'withdrawn';
  this.withdrawalReason = reason;
  this.withdrawnAt = new Date();
  return this.save();
};

internshipApplicationSchema.methods.accept = function(reviewerId, feedback) {
  this.status = 'accepted';
  this.reviewedBy = reviewerId;
  this.feedback = feedback;
  this.finalDecisionAt = new Date();
  return this.save();
};

internshipApplicationSchema.methods.reject = function(reviewerId, feedback) {
  this.status = 'rejected';
  this.reviewedBy = reviewerId;
  this.feedback = feedback;
  this.finalDecisionAt = new Date();
  return this.save();
};

// Static methods
internshipApplicationSchema.statics.findByStudent = function(studentId) {
  return this.find({ studentId })
    .populate('internshipId', 'title companyId startDate endDate status')
    .populate({
      path: 'internshipId',
      populate: {
        path: 'companyId',
        select: 'name industry'
      }
    })
    .sort({ submittedAt: -1 });
};

internshipApplicationSchema.statics.findByInternship = function(internshipId) {
  return this.find({ internshipId })
    .populate('studentId', 'firstName lastName email studentId program')
    .sort({ submittedAt: -1 });
};

internshipApplicationSchema.statics.findByStatus = function(status) {
  return this.find({ status })
    .populate('studentId', 'firstName lastName email')
    .populate('internshipId', 'title companyId')
    .sort({ submittedAt: -1 });
};

internshipApplicationSchema.statics.findPendingReview = function() {
  return this.find({ 
    status: { $in: ['submitted', 'under_review'] }
  })
    .populate('studentId', 'firstName lastName email')
    .populate('internshipId', 'title companyId applicationDeadline')
    .sort({ submittedAt: 1 });
};

internshipApplicationSchema.statics.findExpiredApplications = function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return this.find({
    status: { $in: ['submitted', 'under_review'] },
    submittedAt: { $lt: thirtyDaysAgo }
  });
};

module.exports = mongoose.model('InternshipApplication', internshipApplicationSchema);