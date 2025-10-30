const mongoose = require('mongoose');

const emailVerificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['registration', 'email-change'],
    default: 'registration'
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  otp: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date
  },
  attempts: {
    type: Number,
    default: 0
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Index for automatic cleanup of expired tokens
emailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for efficient queries
emailVerificationSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('EmailVerification', emailVerificationSchema);
