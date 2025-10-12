const mongoose = require('mongoose');
const crypto = require('crypto');

const eventTicketSchema = new mongoose.Schema({
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
  ticketNumber: { 
    type: String, 
    required: [true, 'Ticket number is required'],
    unique: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        return /^[A-Z0-9]{8,12}$/.test(v);
      },
      message: 'Ticket number must be 8-12 alphanumeric characters'
    }
  },
  qrCode: { 
    type: String, 
    required: [true, 'QR code is required'],
    unique: true
  },
  qrCodeImage: { 
    type: String // Base64 encoded image or file path
  },
  status: { 
    type: String, 
    enum: {
      values: ['active', 'used', 'cancelled', 'expired'],
      message: 'Status must be one of: active, used, cancelled, expired'
    },
    default: 'active',
    index: true
  },
  registrationData: {
    registrationType: {
      type: String,
      enum: ['regular', 'waitlist'],
      default: 'regular'
    },
    specialRequests: {
      type: String,
      maxlength: [500, 'Special requests cannot exceed 500 characters']
    },
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
          message: 'Please enter a valid phone number'
        }
      }
    },
    dietaryRestrictions: [{
      type: String,
      trim: true,
      maxlength: [100, 'Dietary restriction cannot exceed 100 characters']
    }],
    additionalInfo: mongoose.Schema.Types.Mixed
  },
  attendanceRecords: [{
    scannedAt: { 
      type: Date, 
      default: Date.now,
      index: true
    },
    scannedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true
    },
    location: { 
      type: String,
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters']
    },
    deviceInfo: {
      deviceId: String,
      platform: String,
      appVersion: String,
      ipAddress: String
    },
    scanType: {
      type: String,
      enum: ['entry', 'exit', 'checkpoint'],
      default: 'entry'
    },
    isValid: {
      type: Boolean,
      default: true
    },
    notes: {
      type: String,
      maxlength: [300, 'Notes cannot exceed 300 characters']
    }
  }],
  issuedAt: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  expiresAt: { 
    type: Date,
    index: true
  },
  securityHash: {
    type: String,
    required: true
  },
  validationAttempts: [{
    attemptedAt: { type: Date, default: Date.now },
    isSuccessful: { type: Boolean, required: true },
    errorReason: String,
    deviceInfo: mongoose.Schema.Types.Mixed
  }],
  transferHistory: [{
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    toUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    transferredAt: { type: Date, default: Date.now },
    reason: String,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient queries
eventTicketSchema.index({ eventId: 1, userId: 1 }, { unique: true }); // One ticket per user per event
eventTicketSchema.index({ eventId: 1, status: 1 });
eventTicketSchema.index({ userId: 1, status: 1 });
// Note: expiresAt already has index: true in schema
// Note: attendanceRecords.scannedAt already has index: true in schema

// Virtual for is expired
eventTicketSchema.virtual('isExpired').get(function() {
  return this.expiresAt && new Date() > this.expiresAt;
});

// Virtual for is used
eventTicketSchema.virtual('isUsed').get(function() {
  return this.status === 'used' || this.attendanceRecords.length > 0;
});

// Virtual for last attendance
eventTicketSchema.virtual('lastAttendance').get(function() {
  if (this.attendanceRecords.length === 0) return null;
  return this.attendanceRecords[this.attendanceRecords.length - 1];
});

// Virtual for attendance count
eventTicketSchema.virtual('attendanceCount').get(function() {
  return this.attendanceRecords.filter(record => record.isValid).length;
});

// Pre-save middleware to generate ticket number and security hash
eventTicketSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Generate unique ticket number
    if (!this.ticketNumber) {
      this.ticketNumber = await this.constructor.generateTicketNumber();
    }
    
    // Generate security hash
    this.securityHash = this.generateSecurityHash();
    
    // Set expiration date based on event end date
    if (!this.expiresAt && this.eventId) {
      try {
        const Event = mongoose.model('Event');
        const event = await Event.findById(this.eventId);
        if (event) {
          // Ticket expires 24 hours after event ends
          this.expiresAt = new Date(event.endDate.getTime() + 24 * 60 * 60 * 1000);
        }
      } catch (error) {
        console.error('Error setting ticket expiration:', error);
      }
    }
  }
  
  // Auto-expire ticket if past expiration date
  if (this.expiresAt && new Date() > this.expiresAt && this.status === 'active') {
    this.status = 'expired';
  }
  
  next();
});

// Static method to generate unique ticket number
eventTicketSchema.statics.generateTicketNumber = async function() {
  let ticketNumber;
  let isUnique = false;
  
  while (!isUnique) {
    // Generate 10-character alphanumeric code
    ticketNumber = crypto.randomBytes(5).toString('hex').toUpperCase();
    
    // Check if it's unique
    const existing = await this.findOne({ ticketNumber });
    if (!existing) {
      isUnique = true;
    }
  }
  
  return ticketNumber;
};

// Instance method to generate security hash
eventTicketSchema.methods.generateSecurityHash = function() {
  const data = `${this.eventId}:${this.userId}:${this.ticketNumber}:${Date.now()}`;
  return crypto.createHash('sha256').update(data).digest('hex');
};

// Instance method to validate security hash
eventTicketSchema.methods.validateSecurityHash = function(providedHash) {
  return this.securityHash === providedHash;
};

// Instance method to record attendance
eventTicketSchema.methods.recordAttendance = function(scannedBy, location, deviceInfo, scanType = 'entry') {
  const attendanceRecord = {
    scannedBy,
    location,
    deviceInfo,
    scanType,
    isValid: true,
    scannedAt: new Date()
  };
  
  this.attendanceRecords.push(attendanceRecord);
  
  // Update ticket status to used if it's the first scan
  if (this.status === 'active' && this.attendanceRecords.length === 1) {
    this.status = 'used';
  }
  
  return attendanceRecord;
};

// Instance method to validate ticket for scanning
eventTicketSchema.methods.canBeScanned = function() {
  if (this.status !== 'active') {
    return { valid: false, reason: `Ticket is ${this.status}` };
  }
  
  if (this.isExpired) {
    return { valid: false, reason: 'Ticket has expired' };
  }
  
  return { valid: true };
};

// Static method to find tickets by event
eventTicketSchema.statics.findByEvent = function(eventId, status = null) {
  const query = { eventId };
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('userId', 'firstName lastName email studentId')
    .sort({ issuedAt: -1 });
};

// Static method to find user's tickets
eventTicketSchema.statics.findByUser = function(userId, status = null) {
  const query = { userId };
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('eventId', 'title startDate endDate venue')
    .sort({ issuedAt: -1 });
};

// Static method to get attendance statistics
eventTicketSchema.statics.getAttendanceStats = function(eventId) {
  return this.aggregate([
    { $match: { eventId: mongoose.Types.ObjectId(eventId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('EventTicket', eventTicketSchema);