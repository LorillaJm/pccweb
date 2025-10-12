const mongoose = require('mongoose');

const chatConversationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    index: true
  },
  sessionId: { 
    type: String, 
    required: true, 
    unique: true
  },
  messages: [{
    content: { 
      type: String, 
      required: true,
      maxlength: 2000
    },
    sender: { 
      type: String, 
      enum: ['user', 'bot', 'human'], 
      required: true 
    },
    timestamp: { 
      type: Date, 
      default: Date.now 
    },
    confidence: { 
      type: Number, 
      min: 0, 
      max: 1,
      default: null
    },
    intent: { 
      type: String,
      default: null
    },
    entities: [{
      type: { type: String },
      value: { type: String }
    }],
    messageId: {
      type: String,
      required: true,
      default: () => new mongoose.Types.ObjectId().toString()
    }
  }],
  status: { 
    type: String, 
    enum: ['active', 'resolved', 'escalated', 'abandoned'], 
    default: 'active',
    index: true
  },
  escalatedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null
  },
  escalationReason: {
    type: String,
    default: null
  },
  satisfaction: { 
    type: Number, 
    min: 1, 
    max: 5,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  language: { 
    type: String, 
    enum: ['en', 'fil'],
    default: 'en' 
  },
  context: {
    userRole: { type: String },
    currentPage: { type: String },
    previousQueries: [{ type: String }],
    sessionStartTime: { type: Date, default: Date.now },
    lastActivity: { type: Date, default: Date.now }
  },
  metadata: {
    userAgent: { type: String },
    ipAddress: { type: String },
    deviceType: { type: String, enum: ['desktop', 'mobile', 'tablet'] },
    referrer: { type: String }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      // Remove sensitive metadata from JSON output
      if (ret.metadata) {
        delete ret.metadata.ipAddress;
      }
      return ret;
    }
  }
});

// Indexes for efficient querying
chatConversationSchema.index({ userId: 1, createdAt: -1 });
chatConversationSchema.index({ status: 1, createdAt: -1 });
chatConversationSchema.index({ 'context.lastActivity': -1 });

// Update last activity on message addition
chatConversationSchema.pre('save', function(next) {
  if (this.isModified('messages')) {
    this.context.lastActivity = new Date();
  }
  next();
});

// Instance methods
chatConversationSchema.methods.addMessage = function(messageData) {
  const message = {
    content: messageData.content,
    sender: messageData.sender,
    timestamp: new Date(),
    confidence: messageData.confidence || null,
    intent: messageData.intent || null,
    entities: messageData.entities || [],
    messageId: new mongoose.Types.ObjectId().toString()
  };
  
  this.messages.push(message);
  this.context.lastActivity = new Date();
  
  return message;
};

chatConversationSchema.methods.escalateToHuman = function(reason, humanUserId = null) {
  this.status = 'escalated';
  this.escalationReason = reason;
  this.escalatedTo = humanUserId;
  this.context.lastActivity = new Date();
  
  return this.save();
};

chatConversationSchema.methods.markResolved = function(satisfaction = null) {
  this.status = 'resolved';
  if (satisfaction) {
    this.satisfaction = satisfaction;
  }
  this.context.lastActivity = new Date();
  
  return this.save();
};

// Static methods
chatConversationSchema.statics.findActiveByUser = function(userId) {
  return this.findOne({ 
    userId: userId, 
    status: 'active' 
  }).sort({ 'context.lastActivity': -1 });
};

chatConversationSchema.statics.findBySessionId = function(sessionId) {
  return this.findOne({ sessionId: sessionId });
};

chatConversationSchema.statics.getConversationHistory = function(userId, limit = 10) {
  return this.find({ userId: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('sessionId status createdAt messages.content messages.sender messages.timestamp satisfaction');
};

chatConversationSchema.statics.getAnalytics = function(dateRange = {}) {
  const matchStage = {};
  
  if (dateRange.start || dateRange.end) {
    matchStage.createdAt = {};
    if (dateRange.start) matchStage.createdAt.$gte = new Date(dateRange.start);
    if (dateRange.end) matchStage.createdAt.$lte = new Date(dateRange.end);
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalConversations: { $sum: 1 },
        activeConversations: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        resolvedConversations: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
        },
        escalatedConversations: {
          $sum: { $cond: [{ $eq: ['$status', 'escalated'] }, 1, 0] }
        },
        averageMessages: { $avg: { $size: '$messages' } },
        averageSatisfaction: { $avg: '$satisfaction' }
      }
    }
  ]);
};

module.exports = mongoose.model('ChatConversation', chatConversationSchema);