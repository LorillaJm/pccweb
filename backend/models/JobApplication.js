const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  jobId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'JobPosting', 
    required: true,
    index: true
  },
  applicantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  coverLetter: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 2000
  },
  resume: { 
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  additionalDocuments: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: { 
    type: String, 
    enum: ['submitted', 'under_review', 'shortlisted', 'interview_scheduled', 'accepted', 'rejected', 'withdrawn'], 
    default: 'submitted',
    index: true
  },
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
  feedback: { 
    type: String,
    trim: true,
    maxlength: 1000
  },
  interviewSchedule: {
    date: Date,
    time: String,
    location: String,
    type: { 
      type: String, 
      enum: ['in_person', 'video_call', 'phone_call'] 
    },
    meetingLink: String,
    notes: String
  },
  applicationAnswers: [{
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      required: true,
      maxlength: 1000
    }
  }],
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  notes: [{
    content: {
      type: String,
      required: true,
      maxlength: 500
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    isPrivate: {
      type: Boolean,
      default: true
    }
  }],
  timeline: [{
    status: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    notes: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  withdrawalReason: {
    type: String,
    trim: true,
    maxlength: 500
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.daysSinceSubmission = doc.daysSinceSubmission;
      ret.currentStatusDuration = doc.currentStatusDuration;
      return ret;
    }
  }
});

// Compound indexes for efficient queries
jobApplicationSchema.index({ jobId: 1, status: 1 });
jobApplicationSchema.index({ applicantId: 1, status: 1 });
jobApplicationSchema.index({ status: 1, submittedAt: -1 });
jobApplicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true }); // Prevent duplicate applications

// Virtual for days since submission
jobApplicationSchema.virtual('daysSinceSubmission').get(function() {
  const now = new Date();
  const submitted = new Date(this.submittedAt);
  const diffTime = now - submitted;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for current status duration
jobApplicationSchema.virtual('currentStatusDuration').get(function() {
  if (this.timeline.length === 0) return this.daysSinceSubmission;
  
  const lastStatusChange = this.timeline[this.timeline.length - 1];
  const now = new Date();
  const statusDate = new Date(lastStatusChange.date);
  const diffTime = now - statusDate;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Static method to find applications by job
jobApplicationSchema.statics.findByJob = function(jobId, filters = {}) {
  const query = { jobId, isActive: true };
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.dateRange) {
    query.submittedAt = {
      $gte: new Date(filters.dateRange.start),
      $lte: new Date(filters.dateRange.end)
    };
  }

  return this.find(query)
    .populate('applicantId', 'firstName lastName email profilePicture')
    .populate('reviewedBy', 'firstName lastName')
    .sort({ submittedAt: -1 });
};

// Static method to find applications by applicant
jobApplicationSchema.statics.findByApplicant = function(applicantId, filters = {}) {
  const query = { applicantId, isActive: true };
  
  if (filters.status) {
    query.status = filters.status;
  }

  return this.find(query)
    .populate('jobId', 'title company location workType status applicationDeadline')
    .populate('reviewedBy', 'firstName lastName')
    .sort({ submittedAt: -1 });
};

// Static method to get application statistics
jobApplicationSchema.statics.getApplicationStats = function(filters = {}) {
  const matchStage = { isActive: true };
  
  if (filters.jobId) {
    matchStage.jobId = mongoose.Types.ObjectId(filters.jobId);
  }
  
  if (filters.dateRange) {
    matchStage.submittedAt = {
      $gte: new Date(filters.dateRange.start),
      $lte: new Date(filters.dateRange.end)
    };
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
};

// Method to update status with timeline tracking
jobApplicationSchema.methods.updateStatus = function(newStatus, updatedBy, notes = '') {
  // Add to timeline
  this.timeline.push({
    status: newStatus,
    date: new Date(),
    notes: notes,
    updatedBy: updatedBy
  });

  // Update current status
  this.status = newStatus;
  
  // Set reviewed date and reviewer if moving from submitted
  if (this.status === 'submitted' && newStatus !== 'submitted') {
    this.reviewedAt = new Date();
    this.reviewedBy = updatedBy;
  }

  return this.save();
};

// Method to add note
jobApplicationSchema.methods.addNote = function(content, addedBy, isPrivate = true) {
  this.notes.push({
    content: content,
    addedBy: addedBy,
    isPrivate: isPrivate
  });

  return this.save();
};

// Method to schedule interview
jobApplicationSchema.methods.scheduleInterview = function(interviewData) {
  this.interviewSchedule = {
    ...interviewData,
    scheduledAt: new Date()
  };

  // Update status to interview_scheduled
  this.status = 'interview_scheduled';
  
  // Add to timeline
  this.timeline.push({
    status: 'interview_scheduled',
    date: new Date(),
    notes: `Interview scheduled for ${interviewData.date} at ${interviewData.time}`
  });

  return this.save();
};

// Method to withdraw application
jobApplicationSchema.methods.withdraw = function(reason = '') {
  this.status = 'withdrawn';
  this.withdrawalReason = reason;
  
  // Add to timeline
  this.timeline.push({
    status: 'withdrawn',
    date: new Date(),
    notes: reason ? `Withdrawn: ${reason}` : 'Application withdrawn by applicant'
  });

  return this.save();
};

// Pre-save middleware to initialize timeline
jobApplicationSchema.pre('save', function(next) {
  // Initialize timeline with submitted status if new document
  if (this.isNew && this.timeline.length === 0) {
    this.timeline.push({
      status: 'submitted',
      date: this.submittedAt || new Date(),
      notes: 'Application submitted'
    });
  }
  
  next();
});

module.exports = mongoose.model('JobApplication', jobApplicationSchema);