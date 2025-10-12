const mongoose = require('mongoose');

// Facility Schema for managing campus facilities and access requirements
const facilitySchema = new mongoose.Schema({
  facilityId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true,
    uppercase: true
  },
  name: { 
    type: String, 
    required: true,
    index: true
  },
  description: {
    type: String
  },
  type: { 
    type: String, 
    enum: ['library', 'laboratory', 'classroom', 'office', 'gym', 'cafeteria', 'auditorium', 'parking', 'dormitory', 'clinic'],
    required: true,
    index: true
  },
  location: { 
    type: String, 
    required: true 
  },
  building: {
    type: String,
    required: true,
    index: true
  },
  floor: {
    type: String
  },
  room: {
    type: String
  },
  capacity: { 
    type: Number,
    min: 0
  },
  currentOccupancy: {
    type: Number,
    default: 0,
    min: 0
  },
  accessRequirements: [{
    role: { 
      type: String, 
      enum: ['student', 'faculty', 'staff', 'admin', 'visitor'],
      required: true
    },
    accessLevel: {
      type: String,
      enum: ['basic', 'standard', 'premium'],
      default: 'basic'
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
    additionalRequirements: [{
      type: String,
      enum: ['appointment_required', 'escort_required', 'special_permission', 'health_clearance']
    }],
    priority: {
      type: Number,
      default: 1,
      min: 1,
      max: 10
    }
  }],
  isActive: { 
    type: Boolean, 
    default: true,
    index: true
  },
  emergencyOverride: { 
    type: Boolean, 
    default: false,
    index: true
  },
  emergencySettings: {
    lockdownActive: {
      type: Boolean,
      default: false
    },
    lockdownReason: {
      type: String
    },
    lockdownBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lockdownAt: {
      type: Date
    },
    emergencyContacts: [{
      name: String,
      phone: String,
      role: String
    }]
  },
  operatingHours: {
    monday: { start: String, end: String, closed: { type: Boolean, default: false } },
    tuesday: { start: String, end: String, closed: { type: Boolean, default: false } },
    wednesday: { start: String, end: String, closed: { type: Boolean, default: false } },
    thursday: { start: String, end: String, closed: { type: Boolean, default: false } },
    friday: { start: String, end: String, closed: { type: Boolean, default: false } },
    saturday: { start: String, end: String, closed: { type: Boolean, default: false } },
    sunday: { start: String, end: String, closed: { type: Boolean, default: true } }
  },
  equipment: [{
    name: String,
    type: String,
    quantity: Number,
    status: {
      type: String,
      enum: ['available', 'in_use', 'maintenance', 'broken'],
      default: 'available'
    }
  }],
  metadata: {
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    contactInfo: {
      phone: String,
      email: String,
      extension: String
    },
    lastInspection: Date,
    nextInspection: Date,
    maintenanceSchedule: String,
    specialInstructions: String,
    accessInstructions: String
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
facilitySchema.index({ type: 1, isActive: 1 });
facilitySchema.index({ building: 1, floor: 1 });
facilitySchema.index({ 'accessRequirements.role': 1 });
facilitySchema.index({ emergencyOverride: 1, isActive: 1 });

// Virtual for checking if facility is currently open
facilitySchema.virtual('isCurrentlyOpen').get(function() {
  if (!this.isActive || this.emergencySettings.lockdownActive) {
    return false;
  }

  const now = new Date();
  const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
  const currentTime = now.toTimeString().substring(0, 5); // HH:MM format
  
  const daySchedule = this.operatingHours[currentDay];
  if (!daySchedule || daySchedule.closed) {
    return false;
  }

  return currentTime >= daySchedule.start && currentTime <= daySchedule.end;
});

// Virtual for checking occupancy status
facilitySchema.virtual('occupancyStatus').get(function() {
  if (!this.capacity) return 'unknown';
  
  const percentage = (this.currentOccupancy / this.capacity) * 100;
  
  if (percentage >= 100) return 'full';
  if (percentage >= 80) return 'nearly_full';
  if (percentage >= 50) return 'moderate';
  if (percentage > 0) return 'low';
  return 'empty';
});

// Virtual for available capacity
facilitySchema.virtual('availableCapacity').get(function() {
  if (!this.capacity) return null;
  return Math.max(0, this.capacity - this.currentOccupancy);
});

// Method to check if a user role has access to this facility
facilitySchema.methods.checkRoleAccess = function(userRole, userAccessLevel = 'basic', currentTime = new Date()) {
  if (!this.isActive) {
    return { hasAccess: false, reason: 'Facility is inactive' };
  }

  if (this.emergencySettings.lockdownActive) {
    return { hasAccess: false, reason: 'Facility is under emergency lockdown' };
  }

  // Find matching access requirement
  const accessReq = this.accessRequirements.find(req => 
    req.role === userRole && 
    (req.accessLevel === userAccessLevel || userAccessLevel === 'premium')
  );

  if (!accessReq) {
    return { hasAccess: false, reason: 'No access permission for this role' };
  }

  // Check time restrictions
  if (accessReq.timeRestrictions) {
    const { startTime, endTime, daysOfWeek } = accessReq.timeRestrictions;
    
    // Check day of week
    if (daysOfWeek && daysOfWeek.length > 0) {
      const currentDay = currentTime.getDay();
      if (!daysOfWeek.includes(currentDay)) {
        return { hasAccess: false, reason: 'Access not allowed on this day' };
      }
    }

    // Check time range
    if (startTime && endTime) {
      const currentTimeStr = currentTime.toTimeString().substring(0, 5);
      if (currentTimeStr < startTime || currentTimeStr > endTime) {
        return { hasAccess: false, reason: 'Access not allowed at this time' };
      }
    }
  }

  // Check operating hours
  if (!this.isCurrentlyOpen) {
    return { hasAccess: false, reason: 'Facility is currently closed' };
  }

  // Check capacity
  if (this.capacity && this.currentOccupancy >= this.capacity) {
    return { hasAccess: false, reason: 'Facility is at full capacity' };
  }

  return { 
    hasAccess: true, 
    accessRequirement: accessReq,
    additionalRequirements: accessReq.additionalRequirements || []
  };
};

// Method to update occupancy
facilitySchema.methods.updateOccupancy = function(change) {
  this.currentOccupancy = Math.max(0, this.currentOccupancy + change);
  if (this.capacity) {
    this.currentOccupancy = Math.min(this.capacity, this.currentOccupancy);
  }
  return this.save();
};

// Method to activate emergency lockdown
facilitySchema.methods.activateEmergencyLockdown = function(reason, activatedBy) {
  this.emergencySettings.lockdownActive = true;
  this.emergencySettings.lockdownReason = reason;
  this.emergencySettings.lockdownBy = activatedBy;
  this.emergencySettings.lockdownAt = new Date();
  return this.save();
};

// Method to deactivate emergency lockdown
facilitySchema.methods.deactivateEmergencyLockdown = function() {
  this.emergencySettings.lockdownActive = false;
  this.emergencySettings.lockdownReason = null;
  this.emergencySettings.lockdownBy = null;
  this.emergencySettings.lockdownAt = null;
  return this.save();
};

// Static method to find facilities by type
facilitySchema.statics.findByType = function(type, includeInactive = false) {
  const query = { type };
  if (!includeInactive) {
    query.isActive = true;
  }
  return this.find(query).sort({ name: 1 });
};

// Static method to find facilities by building
facilitySchema.statics.findByBuilding = function(building, includeInactive = false) {
  const query = { building };
  if (!includeInactive) {
    query.isActive = true;
  }
  return this.find(query).sort({ floor: 1, room: 1 });
};

// Static method to find facilities accessible by role
facilitySchema.statics.findAccessibleByRole = function(userRole, userAccessLevel = 'basic') {
  return this.find({
    isActive: true,
    'accessRequirements.role': userRole,
    'accessRequirements.accessLevel': { $in: [userAccessLevel, 'basic'] }
  }).sort({ name: 1 });
};

// Static method to get facilities under lockdown
facilitySchema.statics.findUnderLockdown = function() {
  return this.find({
    'emergencySettings.lockdownActive': true
  }).populate('emergencySettings.lockdownBy', 'firstName lastName email');
};

// Static method to get facility occupancy summary
facilitySchema.statics.getOccupancySummary = function() {
  return this.aggregate([
    {
      $match: { isActive: true, capacity: { $exists: true, $gt: 0 } }
    },
    {
      $group: {
        _id: '$type',
        totalCapacity: { $sum: '$capacity' },
        totalOccupancy: { $sum: '$currentOccupancy' },
        facilityCount: { $sum: 1 },
        avgOccupancyRate: { 
          $avg: { 
            $multiply: [
              { $divide: ['$currentOccupancy', '$capacity'] }, 
              100
            ] 
          } 
        }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
};

module.exports = mongoose.model('Facility', facilitySchema);