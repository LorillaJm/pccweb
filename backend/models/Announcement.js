const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  category: {
    type: String,
    trim: true,
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
    index: true
  },
  targetAudience: {
    type: String,
    enum: ['all', 'students', 'faculty'],
    default: 'all',
    index: true
  },
  isPublished: {
    type: Boolean,
    default: false,
    index: true
  },
  publishedAt: {
    type: Date,
    default: null
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String
  }],
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Compound indexes for better query performance
announcementSchema.index({ isPublished: 1, targetAudience: 1, priority: -1, createdAt: -1 });
announcementSchema.index({ authorId: 1, createdAt: -1 });
announcementSchema.index({ category: 1, isPublished: 1 });

// Virtual for author details
announcementSchema.virtual('author', {
  ref: 'User',
  localField: 'authorId',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware to set publishedAt
announcementSchema.pre('save', function(next) {
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Static method to get announcements for a specific role
announcementSchema.statics.getForRole = function(role, options = {}) {
  const {
    page = 1,
    limit = 10,
    category,
    priority,
    search
  } = options;

  const query = {
    isPublished: true,
    $or: [
      { targetAudience: 'all' },
      { targetAudience: role }
    ]
  };

  if (category) {
    query.category = category;
  }

  if (priority) {
    query.priority = priority;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;

  return this.find(query)
    .populate('authorId', 'firstName lastName email role')
    .sort({ priority: -1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
};

// Static method to get count for pagination
announcementSchema.statics.getCountForRole = function(role, options = {}) {
  const { category, priority, search } = options;

  const query = {
    isPublished: true,
    $or: [
      { targetAudience: 'all' },
      { targetAudience: role }
    ]
  };

  if (category) {
    query.category = category;
  }

  if (priority) {
    query.priority = priority;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } }
    ];
  }

  return this.countDocuments(query);
};

// Instance method to add a like
announcementSchema.methods.addLike = function(userId) {
  const existingLike = this.likes.find(like => like.userId.toString() === userId.toString());
  
  if (!existingLike) {
    this.likes.push({ userId });
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Instance method to remove a like
announcementSchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(like => like.userId.toString() !== userId.toString());
  return this.save();
};

// Instance method to add a comment
announcementSchema.methods.addComment = function(userId, content) {
  this.comments.push({ userId, content });
  return this.save();
};

module.exports = mongoose.model('Announcement', announcementSchema);
