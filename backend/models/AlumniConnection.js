const mongoose = require('mongoose');

const alumniConnectionSchema = new mongoose.Schema({
  requesterId: {
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
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'blocked'],
    default: 'pending',
    index: true
  },
  connectionType: {
    type: String,
    enum: ['professional', 'academic', 'personal', 'mentorship', 'collaboration'],
    default: 'professional'
  },
  requestMessage: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  responseMessage: {
    type: String,
    trim: true,
    maxlength: 500
  },
  commonInterests: [{
    type: String,
    trim: true
  }],
  mutualConnections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  connectionStrength: {
    type: Number,
    min: 1,
    max: 5,
    default: 1
  },
  lastInteraction: {
    type: Date,
    default: Date.now
  },
  interactionCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  isActive: {
    type: Boolean,
    default: true
  },
  acceptedAt: {
    type: Date
  },
  declinedAt: {
    type: Date
  },
  blockedAt: {
    type: Date
  },
  blockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true
  }
});

// Compound indexes for efficient queries
alumniConnectionSchema.index({ requesterId: 1, recipientId: 1 }, { unique: true });
alumniConnectionSchema.index({ requesterId: 1, status: 1 });
alumniConnectionSchema.index({ recipientId: 1, status: 1 });
alumniConnectionSchema.index({ status: 1, createdAt: -1 });

// Virtual for connection age in days
alumniConnectionSchema.virtual('connectionAge').get(function() {
  const acceptedDate = this.acceptedAt || this.createdAt;
  const now = new Date();
  const diffTime = now - acceptedDate;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Static method to find connections for a user
alumniConnectionSchema.statics.findUserConnections = function(userId, status = 'accepted') {
  return this.find({
    $or: [
      { requesterId: userId },
      { recipientId: userId }
    ],
    status: status,
    isActive: true
  }).populate('requesterId recipientId', 'firstName lastName email profilePicture');
};

// Static method to find pending connection requests
alumniConnectionSchema.statics.findPendingRequests = function(userId) {
  return this.find({
    recipientId: userId,
    status: 'pending',
    isActive: true
  }).populate('requesterId', 'firstName lastName email profilePicture program graduationYear');
};

// Static method to find sent requests
alumniConnectionSchema.statics.findSentRequests = function(userId) {
  return this.find({
    requesterId: userId,
    status: 'pending',
    isActive: true
  }).populate('recipientId', 'firstName lastName email profilePicture');
};

// Static method to check if connection exists
alumniConnectionSchema.statics.connectionExists = function(userId1, userId2) {
  return this.findOne({
    $or: [
      { requesterId: userId1, recipientId: userId2 },
      { requesterId: userId2, recipientId: userId1 }
    ],
    isActive: true
  });
};

// Static method to get mutual connections
alumniConnectionSchema.statics.findMutualConnections = function(userId1, userId2) {
  return this.aggregate([
    {
      $match: {
        $or: [
          { requesterId: mongoose.Types.ObjectId(userId1) },
          { recipientId: mongoose.Types.ObjectId(userId1) }
        ],
        status: 'accepted',
        isActive: true
      }
    },
    {
      $project: {
        connectedUser: {
          $cond: {
            if: { $eq: ['$requesterId', mongoose.Types.ObjectId(userId1)] },
            then: '$recipientId',
            else: '$requesterId'
          }
        }
      }
    },
    {
      $lookup: {
        from: 'alumniconnections',
        let: { connectedUserId: '$connectedUser' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $or: [
                      {
                        $and: [
                          { $eq: ['$requesterId', '$$connectedUserId'] },
                          { $eq: ['$recipientId', mongoose.Types.ObjectId(userId2)] }
                        ]
                      },
                      {
                        $and: [
                          { $eq: ['$requesterId', mongoose.Types.ObjectId(userId2)] },
                          { $eq: ['$recipientId', '$$connectedUserId'] }
                        ]
                      }
                    ]
                  },
                  { $eq: ['$status', 'accepted'] },
                  { $eq: ['$isActive', true] }
                ]
              }
            }
          }
        ],
        as: 'mutualConnection'
      }
    },
    {
      $match: {
        mutualConnection: { $ne: [] }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'connectedUser',
        foreignField: '_id',
        as: 'userInfo'
      }
    },
    {
      $unwind: '$userInfo'
    },
    {
      $project: {
        _id: '$userInfo._id',
        firstName: '$userInfo.firstName',
        lastName: '$userInfo.lastName',
        email: '$userInfo.email',
        profilePicture: '$userInfo.profilePicture'
      }
    }
  ]);
};

// Static method to get connection statistics
alumniConnectionSchema.statics.getConnectionStats = function(userId) {
  return this.aggregate([
    {
      $match: {
        $or: [
          { requesterId: mongoose.Types.ObjectId(userId) },
          { recipientId: mongoose.Types.ObjectId(userId) }
        ],
        isActive: true
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Method to accept connection request
alumniConnectionSchema.methods.acceptConnection = function(responseMessage) {
  this.status = 'accepted';
  this.responseMessage = responseMessage;
  this.acceptedAt = new Date();
  this.lastInteraction = new Date();
  return this.save();
};

// Method to decline connection request
alumniConnectionSchema.methods.declineConnection = function(responseMessage) {
  this.status = 'declined';
  this.responseMessage = responseMessage;
  this.declinedAt = new Date();
  return this.save();
};

// Method to block connection
alumniConnectionSchema.methods.blockConnection = function(blockedByUserId) {
  this.status = 'blocked';
  this.blockedAt = new Date();
  this.blockedBy = blockedByUserId;
  this.isActive = false;
  return this.save();
};

// Method to update interaction
alumniConnectionSchema.methods.updateInteraction = function() {
  this.lastInteraction = new Date();
  this.interactionCount += 1;
  
  // Update connection strength based on interaction frequency
  const daysSinceConnection = this.connectionAge;
  const interactionRate = this.interactionCount / Math.max(daysSinceConnection, 1);
  
  if (interactionRate > 0.5) {
    this.connectionStrength = 5;
  } else if (interactionRate > 0.3) {
    this.connectionStrength = 4;
  } else if (interactionRate > 0.1) {
    this.connectionStrength = 3;
  } else if (interactionRate > 0.05) {
    this.connectionStrength = 2;
  } else {
    this.connectionStrength = 1;
  }
  
  return this.save();
};

// Method to add tags
alumniConnectionSchema.methods.addTags = function(newTags) {
  const uniqueTags = [...new Set([...this.tags, ...newTags])];
  this.tags = uniqueTags;
  return this.save();
};

// Method to remove tags
alumniConnectionSchema.methods.removeTags = function(tagsToRemove) {
  this.tags = this.tags.filter(tag => !tagsToRemove.includes(tag));
  return this.save();
};

// Pre-save middleware to update mutual connections
alumniConnectionSchema.pre('save', async function(next) {
  if (this.isModified('status') && this.status === 'accepted') {
    try {
      // Find mutual connections
      const mutualConnections = await this.constructor.findMutualConnections(
        this.requesterId, 
        this.recipientId
      );
      this.mutualConnections = mutualConnections.map(conn => conn._id);
    } catch (error) {
      console.error('Error finding mutual connections:', error);
    }
  }
  next();
});

module.exports = mongoose.model('AlumniConnection', alumniConnectionSchema);