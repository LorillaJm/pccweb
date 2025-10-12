const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Event title cannot exceed 200 characters']
  },
  description: { 
    type: String, 
    required: [true, 'Event description is required'],
    trim: true,
    maxlength: [2000, 'Event description cannot exceed 2000 characters']
  },
  category: { 
    type: String, 
    enum: {
      values: ['academic', 'cultural', 'sports', 'seminar', 'workshop', 'conference', 'social'],
      message: 'Category must be one of: academic, cultural, sports, seminar, workshop, conference, social'
    },
    required: [true, 'Event category is required']
  },
  startDate: { 
    type: Date, 
    required: [true, 'Event start date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Event start date must be in the future'
    }
  },
  endDate: { 
    type: Date, 
    required: [true, 'Event end date is required'],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'Event end date must be after start date'
    }
  },
  venue: { 
    type: String, 
    required: [true, 'Event venue is required'],
    trim: true,
    maxlength: [300, 'Venue cannot exceed 300 characters']
  },
  capacity: { 
    type: Number, 
    required: [true, 'Event capacity is required'],
    min: [1, 'Event capacity must be at least 1'],
    max: [10000, 'Event capacity cannot exceed 10,000']
  },
  registeredCount: { 
    type: Number, 
    default: 0,
    min: [0, 'Registered count cannot be negative']
  },
  waitlistCount: { 
    type: Number, 
    default: 0,
    min: [0, 'Waitlist count cannot be negative']
  },
  organizer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Event organizer is required']
  },
  requirements: [{
    type: String,
    trim: true,
    maxlength: [500, 'Requirement cannot exceed 500 characters']
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  isPublic: { 
    type: Boolean, 
    default: true 
  },
  registrationDeadline: { 
    type: Date,
    validate: {
      validator: function(value) {
        if (!value) return true; // Optional field
        return value <= this.startDate;
      },
      message: 'Registration deadline must be before or on event start date'
    }
  },
  status: { 
    type: String, 
    enum: {
      values: ['draft', 'published', 'ongoing', 'completed', 'cancelled'],
      message: 'Status must be one of: draft, published, ongoing, completed, cancelled'
    },
    default: 'draft' 
  },
  qrScannerSettings: {
    allowMultipleScans: { 
      type: Boolean, 
      default: false 
    },
    scanTimeWindow: { 
      type: Number, 
      default: 30,
      min: [5, 'Scan time window must be at least 5 minutes'],
      max: [480, 'Scan time window cannot exceed 8 hours']
    },
    requireLocation: { 
      type: Boolean, 
      default: false 
    }
  },
  eventImage: {
    type: String, // File path or URL
    trim: true
  },
  maxWaitlistSize: {
    type: Number,
    default: 0,
    min: [0, 'Max waitlist size cannot be negative']
  },
  notificationSettings: {
    sendRegistrationConfirmation: {
      type: Boolean,
      default: true
    },
    sendReminders: {
      type: Boolean,
      default: true
    },
    reminderTimes: [{
      type: Number, // Hours before event
      default: [24, 2] // 24 hours and 2 hours before
    }],
    sendUpdateNotifications: {
      type: Boolean,
      default: true
    },
    sendCancellationNotifications: {
      type: Boolean,
      default: true
    },
    sendAttendanceConfirmation: {
      type: Boolean,
      default: true
    },
    sendFollowUp: {
      type: Boolean,
      default: true
    },
    followUpDelayHours: {
      type: Number,
      default: 24 // 24 hours after event ends
    }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for available slots
eventSchema.virtual('availableSlots').get(function() {
  return Math.max(0, this.capacity - this.registeredCount);
});

// Virtual for is full
eventSchema.virtual('isFull').get(function() {
  return this.registeredCount >= this.capacity;
});

// Virtual for is registration open
eventSchema.virtual('isRegistrationOpen').get(function() {
  const now = new Date();
  const deadline = this.registrationDeadline || this.startDate;
  return this.status === 'published' && 
         now < deadline && 
         now < this.startDate &&
         (this.registeredCount < this.capacity || this.maxWaitlistSize > this.waitlistCount);
});

// Indexes for efficient queries
eventSchema.index({ startDate: 1 });
eventSchema.index({ endDate: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ isPublic: 1 });
eventSchema.index({ tags: 1 });
eventSchema.index({ 'startDate': 1, 'status': 1 }); // Compound index for active events
eventSchema.index({ 'category': 1, 'startDate': 1 }); // Compound index for category filtering
eventSchema.index({ 'registrationDeadline': 1 }); // For registration deadline queries

// Text index for search functionality
eventSchema.index({ 
  title: 'text', 
  description: 'text', 
  venue: 'text',
  tags: 'text'
});

// Pre-save middleware to validate capacity management
eventSchema.pre('save', function(next) {
  // Ensure registered count doesn't exceed capacity
  if (this.registeredCount > this.capacity) {
    return next(new Error('Registered count cannot exceed event capacity'));
  }
  
  // Auto-update status based on dates
  const now = new Date();
  if (this.status === 'published') {
    if (now >= this.startDate && now <= this.endDate) {
      this.status = 'ongoing';
    } else if (now > this.endDate) {
      this.status = 'completed';
    }
  }
  
  next();
});

// Instance method to check if user can register
eventSchema.methods.canUserRegister = function() {
  return this.isRegistrationOpen && !this.isFull;
};

// Instance method to add to waitlist
eventSchema.methods.canAddToWaitlist = function() {
  return this.isRegistrationOpen && 
         this.isFull && 
         this.maxWaitlistSize > 0 && 
         this.waitlistCount < this.maxWaitlistSize;
};

// Static method to find upcoming events
eventSchema.statics.findUpcoming = function(limit = 10) {
  return this.find({
    status: 'published',
    startDate: { $gt: new Date() }
  })
  .sort({ startDate: 1 })
  .limit(limit)
  .populate('organizer', 'firstName lastName email');
};

// Static method to find events by category
eventSchema.statics.findByCategory = function(category, limit = 20) {
  return this.find({
    category: category,
    status: 'published',
    startDate: { $gt: new Date() }
  })
  .sort({ startDate: 1 })
  .limit(limit)
  .populate('organizer', 'firstName lastName');
};

module.exports = mongoose.model('Event', eventSchema);