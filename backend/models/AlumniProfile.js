const mongoose = require('mongoose');

const alumniProfileSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true,
    index: true
  },
  graduationYear: { 
    type: Number, 
    required: true,
    min: 1950,
    max: new Date().getFullYear() + 10,
    index: true
  },
  degree: { 
    type: String, 
    required: true,
    trim: true
  },
  major: { 
    type: String,
    trim: true
  },
  currentPosition: { 
    type: String,
    trim: true
  },
  currentCompany: { 
    type: String,
    trim: true
  },
  industry: { 
    type: String,
    trim: true,
    index: true
  },
  location: { 
    type: String,
    trim: true
  },
  bio: { 
    type: String, 
    maxlength: 500,
    trim: true
  },
  achievements: [{
    type: String,
    trim: true
  }],
  skills: [{
    type: String,
    trim: true
  }],
  socialLinks: {
    linkedin: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/(www\.)?linkedin\.com\//.test(v);
        },
        message: 'Invalid LinkedIn URL format'
      }
    },
    facebook: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/(www\.)?facebook\.com\//.test(v);
        },
        message: 'Invalid Facebook URL format'
      }
    },
    twitter: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/(www\.)?(twitter\.com|x\.com)\//.test(v);
        },
        message: 'Invalid Twitter/X URL format'
      }
    },
    website: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\//.test(v);
        },
        message: 'Invalid website URL format'
      }
    }
  },
  careerHistory: [{
    position: {
      type: String,
      required: true,
      trim: true
    },
    company: {
      type: String,
      required: true,
      trim: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      validate: {
        validator: function(v) {
          return !v || v > this.startDate;
        },
        message: 'End date must be after start date'
      }
    },
    description: {
      type: String,
      maxlength: 1000,
      trim: true
    },
    isCurrent: {
      type: Boolean,
      default: false
    }
  }],
  mentorshipAvailability: {
    isAvailable: { 
      type: Boolean, 
      default: false 
    },
    expertise: [{
      type: String,
      trim: true
    }],
    preferredMenteeLevel: [{
      type: String,
      enum: ['undergraduate', 'graduate', 'new_graduate', 'career_change'],
      default: 'undergraduate'
    }],
    maxMentees: { 
      type: Number, 
      default: 3,
      min: 0,
      max: 10
    },
    currentMentees: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  privacySettings: {
    showContactInfo: { 
      type: Boolean, 
      default: false 
    },
    showCareerHistory: { 
      type: Boolean, 
      default: true 
    },
    allowDirectMessages: { 
      type: Boolean, 
      default: true 
    },
    showInDirectory: {
      type: Boolean,
      default: true
    },
    showGraduationYear: {
      type: Boolean,
      default: true
    }
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
    index: true
  },
  verificationDocuments: [{
    type: {
      type: String,
      enum: ['diploma', 'transcript', 'employment_letter', 'other'],
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  }],
  networkingStats: {
    connectionsCount: {
      type: Number,
      default: 0
    },
    profileViews: {
      type: Number,
      default: 0
    },
    lastActive: {
      type: Date,
      default: Date.now
    }
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
      // Remove sensitive fields based on privacy settings
      if (!doc.privacySettings.showContactInfo) {
        delete ret.socialLinks;
      }
      if (!doc.privacySettings.showCareerHistory) {
        delete ret.careerHistory;
      }
      if (!doc.privacySettings.showGraduationYear) {
        delete ret.graduationYear;
      }
      return ret;
    }
  }
});

// Indexes for efficient queries
alumniProfileSchema.index({ graduationYear: 1, degree: 1 });
alumniProfileSchema.index({ industry: 1, location: 1 });
alumniProfileSchema.index({ 'mentorshipAvailability.isAvailable': 1 });
alumniProfileSchema.index({ verificationStatus: 1, isActive: 1 });

// Virtual for full career timeline
alumniProfileSchema.virtual('currentCareer').get(function() {
  const currentJob = this.careerHistory.find(job => job.isCurrent);
  return currentJob || {
    position: this.currentPosition,
    company: this.currentCompany
  };
});

// Virtual for mentorship availability status
alumniProfileSchema.virtual('canAcceptMentees').get(function() {
  return this.mentorshipAvailability.isAvailable && 
         this.mentorshipAvailability.currentMentees < this.mentorshipAvailability.maxMentees;
});

// Static method to find alumni by graduation year range
alumniProfileSchema.statics.findByGraduationRange = function(startYear, endYear) {
  return this.find({
    graduationYear: { $gte: startYear, $lte: endYear },
    isActive: true,
    verificationStatus: 'verified'
  }).populate('userId', 'firstName lastName email profilePicture');
};

// Static method to find available mentors
alumniProfileSchema.statics.findAvailableMentors = function(expertise, menteeLevel) {
  const query = {
    'mentorshipAvailability.isAvailable': true,
    isActive: true,
    verificationStatus: 'verified',
    $expr: {
      $lt: ['$mentorshipAvailability.currentMentees', '$mentorshipAvailability.maxMentees']
    }
  };

  if (expertise) {
    query['mentorshipAvailability.expertise'] = { $in: [expertise] };
  }

  if (menteeLevel) {
    query['mentorshipAvailability.preferredMenteeLevel'] = { $in: [menteeLevel] };
  }

  return this.find(query).populate('userId', 'firstName lastName email profilePicture');
};

// Static method to search alumni by skills or industry
alumniProfileSchema.statics.searchBySkillsOrIndustry = function(searchTerm) {
  const regex = new RegExp(searchTerm, 'i');
  return this.find({
    $or: [
      { skills: { $in: [regex] } },
      { industry: regex },
      { currentPosition: regex },
      { currentCompany: regex }
    ],
    isActive: true,
    verificationStatus: 'verified',
    'privacySettings.showInDirectory': true
  }).populate('userId', 'firstName lastName email profilePicture');
};

// Method to increment profile views
alumniProfileSchema.methods.incrementProfileViews = function() {
  this.networkingStats.profileViews += 1;
  this.networkingStats.lastActive = new Date();
  return this.save();
};

// Method to update mentee count
alumniProfileSchema.methods.updateMenteeCount = function(increment = true) {
  if (increment) {
    this.mentorshipAvailability.currentMentees += 1;
  } else {
    this.mentorshipAvailability.currentMentees = Math.max(0, this.mentorshipAvailability.currentMentees - 1);
  }
  return this.save();
};

// Pre-save middleware to validate career history
alumniProfileSchema.pre('save', function(next) {
  // Ensure only one current job
  const currentJobs = this.careerHistory.filter(job => job.isCurrent);
  if (currentJobs.length > 1) {
    return next(new Error('Only one current job is allowed'));
  }

  // Update current position and company from career history
  const currentJob = currentJobs[0];
  if (currentJob) {
    this.currentPosition = currentJob.position;
    this.currentCompany = currentJob.company;
  }

  next();
});

module.exports = mongoose.model('AlumniProfile', alumniProfileSchema);