const mongoose = require('mongoose');

const mentorshipSchema = new mongoose.Schema({
  mentorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  menteeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  program: { 
    type: String, 
    required: true,
    trim: true,
    enum: ['career_guidance', 'skill_development', 'industry_transition', 'entrepreneurship', 'academic_support', 'personal_development']
  },
  focusAreas: [{
    type: String,
    trim: true,
    maxlength: 100
  }],
  status: { 
    type: String, 
    enum: ['requested', 'accepted', 'active', 'paused', 'completed', 'cancelled', 'rejected'], 
    default: 'requested',
    index: true
  },
  requestMessage: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  responseMessage: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  startDate: { 
    type: Date,
    validate: {
      validator: function(v) {
        return !v || v >= new Date();
      },
      message: 'Start date cannot be in the past'
    }
  },
  endDate: { 
    type: Date,
    validate: {
      validator: function(v) {
        return !v || !this.startDate || v > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  duration: {
    type: Number, // Duration in months
    min: 1,
    max: 24,
    default: 6
  },
  meetingSchedule: {
    frequency: {
      type: String,
      enum: ['weekly', 'bi_weekly', 'monthly', 'as_needed'],
      default: 'bi_weekly'
    },
    preferredDay: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    preferredTime: {
      type: String, // Format: HH:MM
      validate: {
        validator: function(v) {
          return !v || /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'Invalid time format. Use HH:MM format'
      }
    },
    timezone: {
      type: String,
      default: 'Asia/Manila'
    },
    meetingType: {
      type: String,
      enum: ['in_person', 'video_call', 'phone_call', 'flexible'],
      default: 'flexible'
    }
  },
  goals: [{
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    targetDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'cancelled'],
      default: 'not_started'
    },
    completedDate: {
      type: Date
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000
    }
  }],
  sessions: [{
    scheduledDate: {
      type: Date,
      required: true
    },
    actualDate: {
      type: Date
    },
    duration: {
      type: Number, // Duration in minutes
      min: 15,
      max: 180
    },
    type: {
      type: String,
      enum: ['in_person', 'video_call', 'phone_call', 'email', 'chat'],
      required: true
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'no_show'],
      default: 'scheduled'
    },
    agenda: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 2000
    },
    actionItems: [{
      description: {
        type: String,
        required: true,
        trim: true
      },
      assignedTo: {
        type: String,
        enum: ['mentor', 'mentee', 'both'],
        required: true
      },
      dueDate: {
        type: Date
      },
      status: {
        type: String,
        enum: ['pending', 'completed', 'overdue'],
        default: 'pending'
      }
    }],
    mentorRating: {
      type: Number,
      min: 1,
      max: 5
    },
    menteeRating: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  progress: [{
    date: { 
      type: Date, 
      default: Date.now 
    },
    milestone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    attachments: [{
      filename: String,
      originalName: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  feedback: {
    mentorFeedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      communication: {
        type: Number,
        min: 1,
        max: 5
      },
      commitment: {
        type: Number,
        min: 1,
        max: 5
      },
      growth: {
        type: Number,
        min: 1,
        max: 5
      },
      comments: {
        type: String,
        trim: true,
        maxlength: 1000
      },
      wouldRecommend: {
        type: Boolean
      },
      submittedAt: {
        type: Date
      }
    },
    menteeFeedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      helpfulness: {
        type: Number,
        min: 1,
        max: 5
      },
      availability: {
        type: Number,
        min: 1,
        max: 5
      },
      expertise: {
        type: Number,
        min: 1,
        max: 5
      },
      comments: {
        type: String,
        trim: true,
        maxlength: 1000
      },
      wouldRecommend: {
        type: Boolean
      },
      submittedAt: {
        type: Date
      }
    }
  },
  completionCertificate: {
    issued: {
      type: Boolean,
      default: false
    },
    issuedDate: {
      type: Date
    },
    certificateId: {
      type: String,
      unique: true,
      sparse: true
    }
  },
  statistics: {
    totalSessions: {
      type: Number,
      default: 0
    },
    completedSessions: {
      type: Number,
      default: 0
    },
    cancelledSessions: {
      type: Number,
      default: 0
    },
    averageSessionDuration: {
      type: Number,
      default: 0
    },
    goalsCompleted: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.progressPercentage = doc.progressPercentage;
      ret.nextSession = doc.nextSession;
      ret.overallRating = doc.overallRating;
      return ret;
    }
  }
});

// Compound indexes for efficient queries
mentorshipSchema.index({ mentorId: 1, status: 1 });
mentorshipSchema.index({ menteeId: 1, status: 1 });
mentorshipSchema.index({ status: 1, createdAt: -1 });
mentorshipSchema.index({ program: 1, status: 1 });
mentorshipSchema.index({ startDate: 1, endDate: 1 });

// Virtual for progress percentage
mentorshipSchema.virtual('progressPercentage').get(function() {
  if (this.goals.length === 0) return 0;
  const completedGoals = this.goals.filter(goal => goal.status === 'completed').length;
  return Math.round((completedGoals / this.goals.length) * 100);
});

// Virtual for next scheduled session
mentorshipSchema.virtual('nextSession').get(function() {
  const upcomingSessions = this.sessions
    .filter(session => session.status === 'scheduled' && session.scheduledDate > new Date())
    .sort((a, b) => a.scheduledDate - b.scheduledDate);
  return upcomingSessions[0] || null;
});

// Virtual for overall rating
mentorshipSchema.virtual('overallRating').get(function() {
  const mentorRating = this.feedback.mentorFeedback.rating;
  const menteeRating = this.feedback.menteeFeedback.rating;
  
  if (mentorRating && menteeRating) {
    return (mentorRating + menteeRating) / 2;
  } else if (mentorRating) {
    return mentorRating;
  } else if (menteeRating) {
    return menteeRating;
  }
  return null;
});

// Static method to find active mentorships for a user
mentorshipSchema.statics.findActiveForUser = function(userId) {
  return this.find({
    $or: [
      { mentorId: userId },
      { menteeId: userId }
    ],
    status: { $in: ['active', 'accepted'] },
    isActive: true
  }).populate('mentorId menteeId', 'firstName lastName email profilePicture');
};

// Static method to find mentorship requests
mentorshipSchema.statics.findPendingRequests = function(mentorId) {
  return this.find({
    mentorId: mentorId,
    status: 'requested',
    isActive: true
  }).populate('menteeId', 'firstName lastName email profilePicture program yearLevel');
};

// Static method to get mentorship statistics
mentorshipSchema.statics.getMentorshipStats = function(userId, role) {
  const matchStage = role === 'mentor' 
    ? { mentorId: mongoose.Types.ObjectId(userId) }
    : { menteeId: mongoose.Types.ObjectId(userId) };

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgRating: { 
          $avg: role === 'mentor' 
            ? '$feedback.menteeFeedback.rating' 
            : '$feedback.mentorFeedback.rating' 
        }
      }
    }
  ]);
};

// Method to schedule a session
mentorshipSchema.methods.scheduleSession = function(sessionData) {
  this.sessions.push({
    scheduledDate: sessionData.scheduledDate,
    type: sessionData.type,
    agenda: sessionData.agenda,
    status: 'scheduled'
  });
  this.statistics.totalSessions += 1;
  this.lastActivity = new Date();
  return this.save();
};

// Method to complete a session
mentorshipSchema.methods.completeSession = function(sessionId, sessionData) {
  const session = this.sessions.id(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  session.status = 'completed';
  session.actualDate = sessionData.actualDate || new Date();
  session.duration = sessionData.duration;
  session.notes = sessionData.notes;
  session.actionItems = sessionData.actionItems || [];
  session.mentorRating = sessionData.mentorRating;
  session.menteeRating = sessionData.menteeRating;

  this.statistics.completedSessions += 1;
  this.lastActivity = new Date();

  // Update average session duration
  const completedSessions = this.sessions.filter(s => s.status === 'completed' && s.duration);
  if (completedSessions.length > 0) {
    const totalDuration = completedSessions.reduce((sum, s) => sum + s.duration, 0);
    this.statistics.averageSessionDuration = Math.round(totalDuration / completedSessions.length);
  }

  return this.save();
};

// Method to add progress update
mentorshipSchema.methods.addProgress = function(progressData, userId) {
  this.progress.push({
    milestone: progressData.milestone,
    description: progressData.description,
    attachments: progressData.attachments || [],
    addedBy: userId
  });
  this.lastActivity = new Date();
  return this.save();
};

// Method to update goal status
mentorshipSchema.methods.updateGoalStatus = function(goalId, status, notes) {
  const goal = this.goals.id(goalId);
  if (!goal) {
    throw new Error('Goal not found');
  }

  goal.status = status;
  goal.notes = notes;
  
  if (status === 'completed') {
    goal.completedDate = new Date();
    this.statistics.goalsCompleted += 1;
  }

  this.lastActivity = new Date();
  return this.save();
};

// Method to submit feedback
mentorshipSchema.methods.submitFeedback = function(feedbackData, userRole) {
  if (userRole === 'mentor') {
    this.feedback.mentorFeedback = {
      ...feedbackData,
      submittedAt: new Date()
    };
  } else {
    this.feedback.menteeFeedback = {
      ...feedbackData,
      submittedAt: new Date()
    };
  }

  this.lastActivity = new Date();
  return this.save();
};

// Method to generate completion certificate
mentorshipSchema.methods.generateCompletionCertificate = function() {
  if (this.status !== 'completed') {
    throw new Error('Mentorship must be completed to generate certificate');
  }

  const certificateId = `CERT-${this._id.toString().slice(-8).toUpperCase()}-${Date.now()}`;
  
  this.completionCertificate = {
    issued: true,
    issuedDate: new Date(),
    certificateId: certificateId
  };

  return this.save();
};

// Pre-save middleware to update statistics
mentorshipSchema.pre('save', function(next) {
  // Update goals completed count
  this.statistics.goalsCompleted = this.goals.filter(goal => goal.status === 'completed').length;
  
  // Update session counts
  this.statistics.completedSessions = this.sessions.filter(session => session.status === 'completed').length;
  this.statistics.cancelledSessions = this.sessions.filter(session => session.status === 'cancelled').length;
  
  next();
});

// Pre-save middleware to auto-complete mentorship
mentorshipSchema.pre('save', function(next) {
  if (this.endDate && this.endDate < new Date() && this.status === 'active') {
    this.status = 'completed';
  }
  next();
});

module.exports = mongoose.model('Mentorship', mentorshipSchema);