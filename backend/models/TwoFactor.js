const mongoose = require('mongoose');

const twoFactorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  enabled: {
    type: Boolean,
    default: false
  },
  method: {
    type: String,
    enum: ['email', 'sms', 'totp'],
    default: 'email'
  },
  code: {
    type: String
  },
  codeExpiresAt: {
    type: Date
  },
  attempts: {
    type: Number,
    default: 0
  },
  lockedUntil: {
    type: Date
  },
  backupCodes: [{
    type: String
  }],
  lastUsedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
twoFactorSchema.index({ userId: 1, enabled: 1 });

module.exports = mongoose.model('TwoFactor', twoFactorSchema);
