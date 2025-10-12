const mongoose = require('mongoose');

const alumniMessageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  subject: {
    type: String,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  messageType: {
    type: String,
    enum: ['text', 'connection_request', 'mentorship_request', 'job_inquiry', 'event_invitation'],
    default: 'text'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  replyToMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AlumniMessage'
  },
  threadId: {
    type: String,
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  metadata: {
    connectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AlumniConnection'
    },
    mentorshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mentorship'
    },
    jobPostingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobPosting'
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    }
  },
  deliveryStatus: {
    type: String,
    enum: ['sent', 'delivered', 'failed'],
    default: 'sent'
  },
  deliveredAt: {
    type: Date
  },
  failureReason: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.isRecent = doc.isRecent;
      ret.hasAttachments = doc.hasAttachments;
      return ret;
    }
  }
});

// Compound indexes for efficient queries
alumniMessageSchema.index({ senderId: 1, recipientId: 1, createdAt: -1 });
alumniMessageSchema.index({ conversationId: 1, createdAt: -1 });
alumniMessageSchema.index({ threadId: 1, createdAt: 1 });
alumniMessageSchema.index({ recipientId: 1, isRead: 1, isDeleted: 1 });
alumniMessageSchema.index({ messageType: 1, createdAt: -1 });

// Virtual for checking if message is recent (within 24 hours)
alumniMessageSchema.virtual('isRecent').get(function() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return this.createdAt > oneDayAgo;
});

// Virtual for checking if message has attachments
alumniMessageSchema.virtual('hasAttachments').get(function() {
  return this.attachments && this.attachments.length > 0;
});

// Static method to find conversation between two users
alumniMessageSchema.statics.findConversation = function(userId1, userId2, limit = 50) {
  const conversationId = this.generateConversationId(userId1, userId2);
  
  return this.find({
    conversationId: conversationId,
    isDeleted: false
  })
  .populate('senderId recipientId', 'firstName lastName profilePicture')
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to find user's conversations
alumniMessageSchema.statics.findUserConversations = function(userId) {
  return this.aggregate([
    {
      $match: {
        $or: [
          { senderId: mongoose.Types.ObjectId(userId) },
          { recipientId: mongoose.Types.ObjectId(userId) }
        ],
        isDeleted: false
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: '$conversationId',
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$recipientId', mongoose.Types.ObjectId(userId)] },
                  { $eq: ['$isRead', false] }
                ]
              },
              1,
              0
            ]
          }
        },
        totalMessages: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'lastMessage.senderId',
        foreignField: '_id',
        as: 'sender'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'lastMessage.recipientId',
        foreignField: '_id',
        as: 'recipient'
      }
    },
    {
      $sort: { 'lastMessage.createdAt': -1 }
    }
  ]);
};

// Static method to get unread message count
alumniMessageSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    recipientId: userId,
    isRead: false,
    isDeleted: false
  });
};

// Static method to generate conversation ID
alumniMessageSchema.statics.generateConversationId = function(userId1, userId2) {
  const sortedIds = [userId1.toString(), userId2.toString()].sort();
  return `conv_${sortedIds[0]}_${sortedIds[1]}`;
};

// Static method to search messages
alumniMessageSchema.statics.searchMessages = function(userId, searchTerm, filters = {}) {
  const query = {
    $or: [
      { senderId: userId },
      { recipientId: userId }
    ],
    isDeleted: false,
    $text: { $search: searchTerm }
  };

  // Apply filters
  if (filters.messageType) {
    query.messageType = filters.messageType;
  }
  if (filters.isRead !== undefined) {
    query.isRead = filters.isRead;
  }
  if (filters.dateFrom) {
    query.createdAt = { $gte: new Date(filters.dateFrom) };
  }
  if (filters.dateTo) {
    query.createdAt = { ...query.createdAt, $lte: new Date(filters.dateTo) };
  }

  return this.find(query, { score: { $meta: 'textScore' } })
    .populate('senderId recipientId', 'firstName lastName profilePicture')
    .sort({ score: { $meta: 'textScore' }, createdAt: -1 });
};

// Method to mark as read
alumniMessageSchema.methods.markAsRead = function() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    this.deliveryStatus = 'delivered';
    this.deliveredAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to archive message
alumniMessageSchema.methods.archive = function() {
  this.isArchived = true;
  this.archivedAt = new Date();
  return this.save();
};

// Method to soft delete message
alumniMessageSchema.methods.softDelete = function(deletedByUserId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedByUserId;
  return this.save();
};

// Method to add tags
alumniMessageSchema.methods.addTags = function(newTags) {
  const uniqueTags = [...new Set([...this.tags, ...newTags])];
  this.tags = uniqueTags;
  return this.save();
};

// Pre-save middleware to generate conversation and thread IDs
alumniMessageSchema.pre('save', function(next) {
  if (this.isNew) {
    // Generate conversation ID
    this.conversationId = this.constructor.generateConversationId(this.senderId, this.recipientId);
    
    // Generate thread ID if it's a reply
    if (this.replyToMessageId && !this.threadId) {
      this.threadId = `thread_${this.replyToMessageId}_${Date.now()}`;
    } else if (!this.threadId) {
      this.threadId = `thread_${this._id}_${Date.now()}`;
    }
  }
  next();
});

// Text index for search functionality
alumniMessageSchema.index({
  subject: 'text',
  content: 'text'
});

module.exports = mongoose.model('AlumniMessage', alumniMessageSchema);