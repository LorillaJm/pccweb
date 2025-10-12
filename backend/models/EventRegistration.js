const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema({
  eventId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event', 
    required: [true, 'Event ID is required'],
    index: true
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'User ID is required'],
    index: true
  },
  registrationType: {
    type: String,
    enum: {
      values: ['regular', 'waitlist', 'vip', 'staff', 'speaker'],
      message: 'Registration type must be one of: regular, waitlist, vip, staff, speaker'
    },
    default: 'regular',
    index: true
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'cancelled', 'attended', 'no_show'],
      message: 'Status must be one of: pending, confirmed, cancelled, attended, no_show'
    },
    default: 'pending',
    index: true
  },
  registrationData: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please enter a valid email address'
      }
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true; // Optional field
          return /^[\+]?[0-9\s\-\(\)]{10,15}$/.test(v);
        },
        message: 'Please enter a valid phone number'
      }
    },
    organization: {
      type: String,
      trim: true,
      maxlength: [100, 'Organization cannot exceed 100 characters']
    },
    position: {
      type: String,
      trim: true,
      maxlength: [100, 'Position cannot exceed 100 characters']
    },
    specialRequests: {
      type: String,
      trim: true,
      maxlength: [500, 'Special requests cannot exceed 500 characters']
    },
    dietaryRestrictions: [{
      type: String,
      trim: true,
      maxlength: [100, 'Dietary restriction cannot exceed 100 characters']
    }],
    emergencyContact: {
      name: {
        type: String,
        trim: true,
        maxlength: [100, 'Emergency contact name cannot exceed 100 characters']
      },
      phone: {
        type: String,
        trim: true,
        validate: {
          validator: function(v) {
            if (!v) return true; // Optional field
            return /^[\+]?[0-9\s\-\(\)]{10,15}$/.test(v);
          },
          message: 'Please enter a valid emergency contact phone number'
        }
      },
      relationship: {
        type: String,
        trim: true,
        maxlength: [50, 'Relationship cannot exceed 50 characters']
      }
    },
    additionalInfo: mongoose.Schema.Types.Mixed
  },
  waitlistPosition: {
    type: Number,
    min: [1, 'Waitlist position must be at least 1']
  },
  waitlistNotified: {
    type: Boolean,
    default: false
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  confirmedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String,
    trim: true,
    maxlength: [300, 'Cancellation reason cannot exceed 300 characters']
  },
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EventTicket'
  },
  paymentInfo: {
    required: {
      type: Boolean,
      default: false
    },
    amount: {
      type: Number,
      min: [0, 'Payment amount cannot be negative']
    },
    currency: {
      type: String,
      default: 'PHP',
      uppercase: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'failed'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'bank_transfer', 'gcash', 'paymaya', 'free']
    },
    transactionId: String,
    paidAt: Date,
    refundedAt: Date
  },
  notifications: [{
    type: {
      type: String,
      enum: ['registration_confirmation', 'waitlist_notification', 'event_reminder', 'cancellation', 'update'],
      required: true
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    channel: {
      type: String,
      enum: ['email', 'sms', 'push', 'web'],
      required: true
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed'],
      default: 'sent'
    },
    content: String
  }],
  checkInHistory: [{
    checkedInAt: {
      type: Date,
      default: Date.now
    },
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    location: String,
    method: {
      type: String,
      enum: ['qr_scan', 'manual', 'self_checkin'],
      default: 'qr_scan'
    },
    deviceInfo: mongoose.Schema.Types.Mixed
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient queries
eventRegistrationSchema.index({ eventId: 1, userId: 1 }, { unique: true }); // One registration per user per event
eventRegistrationSchema.index({ eventId: 1, status: 1 });
eventRegistrationSchema.index({ eventId: 1, registrationType: 1 });
eventRegistrationSchema.index({ userId: 1, status: 1 });
eventRegistrationSchema.index({ registeredAt: 1 });
eventRegistrationSchema.index({ waitlistPosition: 1 });
eventRegistrationSchema.index({ 'paymentInfo.status': 1 });

// Virtual for full name
eventRegistrationSchema.virtual('fullName').get(function() {
  return `${this.registrationData.firstName} ${this.registrationData.lastName}`;
});

// Virtual for is waitlisted
eventRegistrationSchema.virtual('isWaitlisted').get(function() {
  return this.registrationType === 'waitlist';
});

// Virtual for is confirmed
eventRegistrationSchema.virtual('isConfirmed').get(function() {
  return this.status === 'confirmed';
});

// Virtual for has attended
eventRegistrationSchema.virtual('hasAttended').get(function() {
  return this.status === 'attended' || this.checkInHistory.length > 0;
});

// Virtual for payment required
eventRegistrationSchema.virtual('paymentRequired').get(function() {
  return this.paymentInfo.required && this.paymentInfo.amount > 0;
});

// Virtual for payment completed
eventRegistrationSchema.virtual('paymentCompleted').get(function() {
  return !this.paymentRequired || this.paymentInfo.status === 'paid';
});

// Pre-save middleware for business logic
eventRegistrationSchema.pre('save', async function(next) {
  // Auto-confirm registration if payment is not required or is completed
  if (this.isNew && this.status === 'pending') {
    // Check actual fields instead of virtuals (virtuals may not be available in pre-save)
    const paymentRequired = this.paymentInfo?.required && this.paymentInfo?.amount > 0;
    const paymentCompleted = !paymentRequired || this.paymentInfo?.status === 'paid';
    
    if (!paymentRequired || paymentCompleted) {
      this.status = 'confirmed';
      this.confirmedAt = new Date();
    }
  }
  
  // Set cancellation timestamp
  if (this.isModified('status') && this.status === 'cancelled' && !this.cancelledAt) {
    this.cancelledAt = new Date();
  }
  
  // Note: Event capacity updates are handled by the EventService during transactions
  // to avoid write conflicts. This hook is kept for reference but disabled.
  // If you need to update event capacity outside of EventService, uncomment this code
  // and ensure you're not in a transaction context.
  
  /*
  // Update event capacity when registration is confirmed or cancelled
  if (this.isModified('status')) {
    try {
      const Event = mongoose.model('Event');
      const event = await Event.findById(this.eventId);
      
      if (event) {
        if (this.status === 'confirmed' && this.registrationType === 'regular') {
          // Increment registered count
          await Event.findByIdAndUpdate(this.eventId, {
            $inc: { registeredCount: 1 }
          });
        } else if (this.status === 'cancelled' && this.registrationType === 'regular') {
          // Decrement registered count
          await Event.findByIdAndUpdate(this.eventId, {
            $inc: { registeredCount: -1 }
          });
        } else if (this.status === 'confirmed' && this.registrationType === 'waitlist') {
          // Increment waitlist count
          await Event.findByIdAndUpdate(this.eventId, {
            $inc: { waitlistCount: 1 }
          });
        }
      }
    } catch (error) {
      console.error('Error updating event capacity:', error);
    }
  }
  */
  
  next();
});

// Instance method to confirm registration
eventRegistrationSchema.methods.confirm = function() {
  if (this.status === 'pending') {
    this.status = 'confirmed';
    this.confirmedAt = new Date();
    return true;
  }
  return false;
};

// Instance method to cancel registration
eventRegistrationSchema.methods.cancel = function(reason) {
  if (['pending', 'confirmed'].includes(this.status)) {
    this.status = 'cancelled';
    this.cancelledAt = new Date();
    if (reason) {
      this.cancellationReason = reason;
    }
    return true;
  }
  return false;
};

// Instance method to mark as attended
eventRegistrationSchema.methods.markAttended = function(checkedInBy, location, method = 'qr_scan', deviceInfo = null) {
  this.status = 'attended';
  this.checkInHistory.push({
    checkedInBy,
    location,
    method,
    deviceInfo,
    checkedInAt: new Date()
  });
  return true;
};

// Instance method to add notification record
eventRegistrationSchema.methods.addNotification = function(type, channel, content, status = 'sent') {
  this.notifications.push({
    type,
    channel,
    content,
    status,
    sentAt: new Date()
  });
};

// Static method to find registrations by event
eventRegistrationSchema.statics.findByEvent = function(eventId, status = null, registrationType = null) {
  const query = { eventId };
  if (status) query.status = status;
  if (registrationType) query.registrationType = registrationType;
  
  return this.find(query)
    .populate('userId', 'firstName lastName email studentId')
    .populate('ticketId')
    .sort({ registeredAt: -1 });
};

// Static method to find user registrations
eventRegistrationSchema.statics.findByUser = function(userId, status = null) {
  const query = { userId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('eventId', 'title startDate endDate venue status')
    .sort({ registeredAt: -1 });
};

// Static method to get waitlist for event
eventRegistrationSchema.statics.getWaitlist = function(eventId) {
  return this.find({
    eventId,
    registrationType: 'waitlist',
    status: { $in: ['pending', 'confirmed'] }
  })
  .populate('userId', 'firstName lastName email')
  .sort({ waitlistPosition: 1, registeredAt: 1 });
};

// Static method to get registration statistics
eventRegistrationSchema.statics.getRegistrationStats = function(eventId) {
  return this.aggregate([
    { $match: { eventId: mongoose.Types.ObjectId(eventId) } },
    {
      $group: {
        _id: {
          status: '$status',
          registrationType: '$registrationType'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.status',
        types: {
          $push: {
            type: '$_id.registrationType',
            count: '$count'
          }
        },
        total: { $sum: '$count' }
      }
    }
  ]);
};

// Static method to promote from waitlist
eventRegistrationSchema.statics.promoteFromWaitlist = async function(eventId, numberOfSlots = 1) {
  const waitlistRegistrations = await this.find({
    eventId,
    registrationType: 'waitlist',
    status: 'confirmed'
  })
  .sort({ waitlistPosition: 1, registeredAt: 1 })
  .limit(numberOfSlots);
  
  const promoted = [];
  for (const registration of waitlistRegistrations) {
    registration.registrationType = 'regular';
    registration.waitlistNotified = true;
    await registration.save();
    promoted.push(registration);
  }
  
  return promoted;
};

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema);