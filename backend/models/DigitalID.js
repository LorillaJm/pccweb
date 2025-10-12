const mongoose = require('mongoose');
const crypto = require('crypto');

// Digital ID Schema for campus access control
const digitalIDSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true,
    index: true
  },
  qrCode: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  qrCodeImage: { 
    type: String // Base64 encoded QR image or file path
  },
  accessLevel: { 
    type: String, 
    enum: ['student', 'faculty', 'staff', 'admin', 'visitor'], 
    required: true,
    index: true
  },
  permissions: [{
    facilityId: { 
      type: String, 
      required: true,
      index: true
    },
    facilityName: { 
      type: String, 
      required: true 
    },
    accessType: { 
      type: String, 
      enum: ['full', 'restricted', 'time_limited'],
      default: 'restricted'
    },
    timeRestrictions: {
      startTime: { 
        type: String, 
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
      },
      endTime: { 
        type: String, 
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
      },
      daysOfWeek: [{ 
        type: Number, 
        min: 0, 
        max: 6 // 0-6, Sunday to Saturday
      }]
    },
    expiresAt: { 
      type: Date 
    }
  }],
  isActive: { 
    type: Boolean, 
    default: true,
    index: true
  },
  issuedAt: { 
    type: Date, 
    default: Date.now 
  },
  expiresAt: { 
    type: Date, 
    required: true,
    index: true
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  },
  securityHash: { 
    type: String, 
    required: true 
  }, // For QR validation and tamper detection
  metadata: {
    issuer: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    lastAccessAttempt: { 
      type: Date 
    },
    totalAccessAttempts: { 
      type: Number, 
      default: 0 
    },
    suspensionReason: { 
      type: String 
    },
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance - removed duplicates to avoid warnings
// Note: userId already has unique: true and index: true in schema
// Note: qrCode already has unique: true and index: true in schema
// Note: accessLevel already has index: true in schema
// Note: isActive already has index: true in schema
// Note: expiresAt already has index: true in schema
// Note: permissions.facilityId already has index: true in schema
digitalIDSchema.index({ userId: 1, isActive: 1 });
digitalIDSchema.index({ qrCode: 1, isActive: 1 });

// Virtual for checking if ID is expired
digitalIDSchema.virtual('isExpired').get(function() {
  return this.expiresAt < new Date();
});

// Virtual for checking if ID is valid (active and not expired)
digitalIDSchema.virtual('isValid').get(function() {
  return this.isActive && !this.isExpired;
});

// Pre-save middleware to generate security hash
digitalIDSchema.pre('save', function(next) {
  if (this.isModified('qrCode') || this.isModified('userId') || this.isModified('permissions')) {
    this.securityHash = this.generateSecurityHash();
    this.lastUpdated = new Date();
  }
  next();
});

// Method to generate security hash for QR validation
digitalIDSchema.methods.generateSecurityHash = function() {
  const data = `${this.userId}:${this.qrCode}:${this.accessLevel}:${JSON.stringify(this.permissions)}`;
  return crypto.createHash('sha256').update(data).digest('hex');
};

// Method to validate security hash
digitalIDSchema.methods.validateSecurityHash = function() {
  const expectedHash = this.generateSecurityHash();
  return this.securityHash === expectedHash;
};

// Method to check if user has access to a specific facility
digitalIDSchema.methods.hasAccessToFacility = function(facilityId, currentTime = new Date()) {
  if (!this.isValid) {
    return { hasAccess: false, reason: 'Digital ID is inactive or expired' };
  }

  const permission = this.permissions.find(p => p.facilityId === facilityId);
  if (!permission) {
    return { hasAccess: false, reason: 'No permission for this facility' };
  }

  // Check if permission has expired
  if (permission.expiresAt && permission.expiresAt < currentTime) {
    return { hasAccess: false, reason: 'Permission has expired' };
  }

  // Check time restrictions
  if (permission.accessType === 'time_limited' && permission.timeRestrictions) {
    const { startTime, endTime, daysOfWeek } = permission.timeRestrictions;
    
    // Check day of week
    if (daysOfWeek && daysOfWeek.length > 0) {
      const currentDay = currentTime.getDay();
      if (!daysOfWeek.includes(currentDay)) {
        return { hasAccess: false, reason: 'Access not allowed on this day' };
      }
    }

    // Check time range
    if (startTime && endTime) {
      const currentTimeStr = currentTime.toTimeString().substring(0, 5); // HH:MM format
      if (currentTimeStr < startTime || currentTimeStr > endTime) {
        return { hasAccess: false, reason: 'Access not allowed at this time' };
      }
    }
  }

  return { hasAccess: true, permission };
};

// Method to add facility permission
digitalIDSchema.methods.addFacilityPermission = function(facilityId, facilityName, accessType = 'restricted', timeRestrictions = null, expiresAt = null) {
  // Remove existing permission for the same facility
  this.permissions = this.permissions.filter(p => p.facilityId !== facilityId);
  
  // Add new permission
  this.permissions.push({
    facilityId,
    facilityName,
    accessType,
    timeRestrictions,
    expiresAt
  });
  
  return this.save();
};

// Method to remove facility permission
digitalIDSchema.methods.removeFacilityPermission = function(facilityId) {
  this.permissions = this.permissions.filter(p => p.facilityId !== facilityId);
  return this.save();
};

// Method to update access level and regenerate security hash
digitalIDSchema.methods.updateAccessLevel = function(newAccessLevel) {
  this.accessLevel = newAccessLevel;
  this.securityHash = this.generateSecurityHash();
  this.lastUpdated = new Date();
  return this.save();
};

// Static method to find by QR code
digitalIDSchema.statics.findByQRCode = function(qrCode) {
  return this.findOne({ qrCode, isActive: true }).populate('userId', 'firstName lastName email studentId role');
};

// Static method to find active IDs by user
digitalIDSchema.statics.findActiveByUser = function(userId) {
  return this.findOne({ userId, isActive: true }).populate('userId', 'firstName lastName email studentId role');
};

// Static method to find expiring IDs
digitalIDSchema.statics.findExpiringIDs = function(daysFromNow = 30) {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + daysFromNow);
  
  return this.find({
    isActive: true,
    expiresAt: { $lte: expirationDate, $gte: new Date() }
  }).populate('userId', 'firstName lastName email');
};

module.exports = mongoose.model('DigitalID', digitalIDSchema);