const mongoose = require('mongoose');

// Access Log Schema for tracking facility access attempts
const accessLogSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  digitalIdId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DigitalID',
    required: true,
    index: true
  },
  facilityId: { 
    type: String, 
    required: true,
    index: true
  },
  facilityName: { 
    type: String, 
    required: true 
  },
  accessTime: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  accessResult: { 
    type: String, 
    enum: ['granted', 'denied'], 
    required: true,
    index: true
  },
  denialReason: { 
    type: String 
  },
  deviceInfo: {
    deviceId: { 
      type: String 
    },
    location: { 
      type: String 
    },
    ipAddress: { 
      type: String 
    },
    userAgent: { 
      type: String 
    },
    scannerType: {
      type: String,
      enum: ['mobile', 'fixed', 'web'],
      default: 'mobile'
    }
  },
  qrCodeUsed: { 
    type: String,
    index: true
  },
  metadata: {
    attemptNumber: {
      type: Number,
      default: 1
    },
    sessionId: {
      type: String
    },
    responseTime: {
      type: Number // milliseconds
    },
    securityFlags: [{
      type: String,
      enum: ['suspicious_timing', 'multiple_attempts', 'invalid_location', 'tampered_qr']
    }],
    emergencyOverride: {
      type: Boolean,
      default: false
    },
    overrideReason: {
      type: String
    },
    overrideBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance and analytics
accessLogSchema.index({ userId: 1, accessTime: -1 });
accessLogSchema.index({ facilityId: 1, accessTime: -1 });
accessLogSchema.index({ accessResult: 1, accessTime: -1 });
accessLogSchema.index({ 'deviceInfo.deviceId': 1, accessTime: -1 });
accessLogSchema.index({ qrCodeUsed: 1, accessTime: -1 });

// Compound indexes for common queries
accessLogSchema.index({ userId: 1, facilityId: 1, accessTime: -1 });
accessLogSchema.index({ facilityId: 1, accessResult: 1, accessTime: -1 });

// Virtual for determining if access was successful
accessLogSchema.virtual('wasSuccessful').get(function() {
  return this.accessResult === 'granted';
});

// Virtual for calculating time since access
accessLogSchema.virtual('timeSinceAccess').get(function() {
  return Date.now() - this.accessTime.getTime();
});

// Static method to get access history for a user
accessLogSchema.statics.getUserAccessHistory = function(userId, options = {}) {
  const {
    facilityId,
    startDate,
    endDate,
    limit = 50,
    skip = 0,
    accessResult
  } = options;

  const query = { userId };
  
  if (facilityId) query.facilityId = facilityId;
  if (accessResult) query.accessResult = accessResult;
  
  if (startDate || endDate) {
    query.accessTime = {};
    if (startDate) query.accessTime.$gte = new Date(startDate);
    if (endDate) query.accessTime.$lte = new Date(endDate);
  }

  return this.find(query)
    .populate('userId', 'firstName lastName email studentId')
    .populate('digitalIdId', 'accessLevel')
    .sort({ accessTime: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get facility access statistics
accessLogSchema.statics.getFacilityStats = function(facilityId, options = {}) {
  const {
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate = new Date()
  } = options;

  return this.aggregate([
    {
      $match: {
        facilityId,
        accessTime: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$accessTime' } },
          result: '$accessResult'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.date',
        granted: {
          $sum: { $cond: [{ $eq: ['$_id.result', 'granted'] }, '$count', 0] }
        },
        denied: {
          $sum: { $cond: [{ $eq: ['$_id.result', 'denied'] }, '$count', 0] }
        },
        total: { $sum: '$count' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

// Static method to detect suspicious access patterns
accessLogSchema.statics.detectSuspiciousActivity = function(options = {}) {
  const {
    timeWindow = 5, // minutes
    maxAttempts = 5,
    facilityId
  } = options;

  const timeWindowMs = timeWindow * 60 * 1000;
  const cutoffTime = new Date(Date.now() - timeWindowMs);

  const matchStage = {
    accessTime: { $gte: cutoffTime },
    accessResult: 'denied'
  };

  if (facilityId) matchStage.facilityId = facilityId;

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          userId: '$userId',
          facilityId: '$facilityId',
          deviceId: '$deviceInfo.deviceId'
        },
        attempts: { $sum: 1 },
        lastAttempt: { $max: '$accessTime' },
        reasons: { $addToSet: '$denialReason' }
      }
    },
    {
      $match: {
        attempts: { $gte: maxAttempts }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id.userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $lookup: {
        from: 'facilities',
        localField: '_id.facilityId',
        foreignField: 'facilityId',
        as: 'facility'
      }
    }
  ]);
};

// Static method to get recent access attempts for a facility
accessLogSchema.statics.getRecentFacilityAccess = function(facilityId, minutes = 60) {
  const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
  
  return this.find({
    facilityId,
    accessTime: { $gte: cutoffTime }
  })
    .populate('userId', 'firstName lastName email studentId role')
    .populate('digitalIdId', 'accessLevel')
    .sort({ accessTime: -1 });
};

// Static method to log access attempt
accessLogSchema.statics.logAccessAttempt = async function(logData) {
  const {
    userId,
    digitalIdId,
    facilityId,
    facilityName,
    accessResult,
    denialReason,
    deviceInfo,
    qrCodeUsed,
    metadata = {}
  } = logData;

  // Count recent attempts for this user/facility combination
  const recentAttempts = await this.countDocuments({
    userId,
    facilityId,
    accessTime: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // last 5 minutes
  });

  const accessLog = new this({
    userId,
    digitalIdId,
    facilityId,
    facilityName,
    accessResult,
    denialReason,
    deviceInfo,
    qrCodeUsed,
    metadata: {
      ...metadata,
      attemptNumber: recentAttempts + 1
    }
  });

  return accessLog.save();
};

module.exports = mongoose.model('AccessLog', accessLogSchema);