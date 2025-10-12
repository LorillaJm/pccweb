const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  title: { 
    type: String, 
    required: true,
    maxlength: 200
  },
  message: { 
    type: String, 
    required: true,
    maxlength: 1000
  },
  type: { 
    type: String, 
    enum: ['info', 'warning', 'error', 'success', 'reminder'], 
    required: true,
    index: true
  },
  category: { 
    type: String, 
    enum: ['academic', 'event', 'payment', 'system', 'social'], 
    required: true,
    index: true
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    default: 'medium',
    index: true
  },
  channels: [{
    type: { 
      type: String, 
      enum: ['web', 'email', 'sms', 'push'],
      required: true
    },
    status: { 
      type: String, 
      enum: ['pending', 'sent', 'delivered', 'failed'], 
      default: 'pending'
    },
    sentAt: Date,
    deliveredAt: Date,
    errorMessage: String
  }],
  data: mongoose.Schema.Types.Mixed, // Additional data for the notification
  actionUrl: { type: String }, // URL to navigate when notification is clicked
  isRead: { 
    type: Boolean, 
    default: false,
    index: true
  },
  readAt: { type: Date },
  expiresAt: { 
    type: Date
  },
  scheduledFor: { 
    type: Date,
    index: true
  }
}, { 
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      // Remove sensitive data from JSON output
      if (ret.channels) {
        ret.channels.forEach(channel => {
          delete channel.errorMessage;
        });
      }
      return ret;
    }
  }
});

// Compound indexes for efficient queries
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, category: 1, createdAt: -1 });
notificationSchema.index({ scheduledFor: 1, 'channels.status': 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for checking if notification is expired
notificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// Virtual for checking if notification is scheduled
notificationSchema.virtual('isScheduled').get(function() {
  return this.scheduledFor && this.scheduledFor > new Date();
});

// Method to mark notification as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Method to update channel status
notificationSchema.methods.updateChannelStatus = function(channelType, status, errorMessage = null) {
  const channel = this.channels.find(ch => ch.type === channelType);
  if (channel) {
    channel.status = status;
    if (status === 'sent') {
      channel.sentAt = new Date();
    } else if (status === 'delivered') {
      channel.deliveredAt = new Date();
    } else if (status === 'failed' && errorMessage) {
      channel.errorMessage = errorMessage;
    }
  }
  return this.save();
};

// Static method to find unread notifications for a user
notificationSchema.statics.findUnreadForUser = function(userId, limit = 50) {
  return this.find({ 
    userId: userId, 
    isRead: false,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to find notifications by category
notificationSchema.statics.findByCategory = function(userId, category, limit = 20) {
  return this.find({ 
    userId: userId, 
    category: category,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to find scheduled notifications ready to send
notificationSchema.statics.findScheduledReady = function() {
  return this.find({
    scheduledFor: { $lte: new Date() },
    'channels.status': 'pending'
  });
};

// Static method to cleanup expired notifications
notificationSchema.statics.cleanupExpired = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

module.exports = mongoose.model('Notification', notificationSchema);