const mongoose = require('mongoose');

const notificationPreferencesSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true,
    index: true
  },
  preferences: {
    academic: {
      web: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    event: {
      web: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    payment: {
      web: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    system: {
      web: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    social: {
      web: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: false }
    }
  },
  quietHours: {
    enabled: { type: Boolean, default: false },
    startTime: { type: String, default: '22:00' },
    endTime: { type: String, default: '07:00' },
    timezone: { type: String, default: 'Asia/Manila' }
  },
  deviceTokens: [{
    token: { type: String, required: true },
    platform: { 
      type: String, 
      enum: ['ios', 'android', 'web'], 
      required: true 
    },
    isActive: { type: Boolean, default: true },
    registeredAt: { type: Date, default: Date.now },
    lastUsed: { type: Date, default: Date.now }
  }],
  globalSettings: {
    enabled: { type: Boolean, default: true },
    maxDailyNotifications: { type: Number, default: 50, min: 1, max: 100 },
    batchNotifications: { type: Boolean, default: false },
    batchInterval: { type: Number, default: 60 } // minutes
  }
}, { 
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      // Remove sensitive device tokens from JSON output
      if (ret.deviceTokens) {
        ret.deviceTokens = ret.deviceTokens.map(token => ({
          platform: token.platform,
          isActive: token.isActive,
          registeredAt: token.registeredAt,
          lastUsed: token.lastUsed
        }));
      }
      return ret;
    }
  }
});

// Index for efficient device token queries
notificationPreferencesSchema.index({ 'deviceTokens.token': 1 });
notificationPreferencesSchema.index({ 'deviceTokens.platform': 1, 'deviceTokens.isActive': 1 });

// Virtual to check if notifications are enabled
notificationPreferencesSchema.virtual('isEnabled').get(function() {
  return this.globalSettings.enabled;
});

// Virtual to check if in quiet hours
notificationPreferencesSchema.virtual('isInQuietHours').get(function() {
  if (!this.quietHours.enabled) return false;
  
  const now = new Date();
  const currentTime = now.toLocaleTimeString('en-US', { 
    hour12: false, 
    timeZone: this.quietHours.timezone 
  }).substring(0, 5);
  
  const startTime = this.quietHours.startTime;
  const endTime = this.quietHours.endTime;
  
  // Handle overnight quiet hours (e.g., 22:00 to 07:00)
  if (startTime > endTime) {
    return currentTime >= startTime || currentTime <= endTime;
  }
  
  return currentTime >= startTime && currentTime <= endTime;
});

// Method to check if a specific channel is enabled for a category
notificationPreferencesSchema.methods.isChannelEnabled = function(category, channel) {
  if (!this.globalSettings.enabled) return false;
  if (this.isInQuietHours && channel !== 'web') return false;
  
  return this.preferences[category] && this.preferences[category][channel];
};

// Method to get enabled channels for a category
notificationPreferencesSchema.methods.getEnabledChannels = function(category) {
  if (!this.globalSettings.enabled) return [];
  
  const categoryPrefs = this.preferences[category];
  if (!categoryPrefs) return [];
  
  const enabledChannels = [];
  
  // Web notifications are always allowed
  if (categoryPrefs.web) enabledChannels.push('web');
  
  // Other channels respect quiet hours
  if (!this.isInQuietHours) {
    if (categoryPrefs.email) enabledChannels.push('email');
    if (categoryPrefs.sms) enabledChannels.push('sms');
    if (categoryPrefs.push) enabledChannels.push('push');
  }
  
  return enabledChannels;
};

// Method to add or update device token
notificationPreferencesSchema.methods.addDeviceToken = function(token, platform) {
  // Remove existing token for the same device/platform
  this.deviceTokens = this.deviceTokens.filter(
    dt => !(dt.token === token && dt.platform === platform)
  );
  
  // Add new token
  this.deviceTokens.push({
    token: token,
    platform: platform,
    isActive: true,
    registeredAt: new Date(),
    lastUsed: new Date()
  });
  
  return this.save();
};

// Method to remove device token
notificationPreferencesSchema.methods.removeDeviceToken = function(token) {
  this.deviceTokens = this.deviceTokens.filter(dt => dt.token !== token);
  return this.save();
};

// Method to update device token last used
notificationPreferencesSchema.methods.updateTokenLastUsed = function(token) {
  const deviceToken = this.deviceTokens.find(dt => dt.token === token);
  if (deviceToken) {
    deviceToken.lastUsed = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method to create default preferences for a user
notificationPreferencesSchema.statics.createDefault = function(userId) {
  return this.create({
    userId: userId,
    preferences: {
      academic: { web: true, email: true, sms: false, push: true },
      event: { web: true, email: true, sms: false, push: true },
      payment: { web: true, email: true, sms: true, push: true },
      system: { web: true, email: false, sms: false, push: true },
      social: { web: true, email: false, sms: false, push: false }
    },
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '07:00',
      timezone: 'Asia/Manila'
    },
    globalSettings: {
      enabled: true,
      maxDailyNotifications: 50,
      batchNotifications: false,
      batchInterval: 60
    }
  });
};

// Static method to find preferences by user ID
notificationPreferencesSchema.statics.findByUserId = function(userId) {
  return this.findOne({ userId: userId });
};

// Static method to find active device tokens by platform
notificationPreferencesSchema.statics.findActiveTokensByPlatform = function(platform) {
  return this.find({
    'deviceTokens.platform': platform,
    'deviceTokens.isActive': true,
    'globalSettings.enabled': true
  }).select('deviceTokens userId');
};

module.exports = mongoose.model('NotificationPreferences', notificationPreferencesSchema);