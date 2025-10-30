const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  action: {
    type: String,
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: ['auth', 'verification', '2fa', 'admin', 'security'],
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['success', 'failure', 'error'],
    required: true
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
auditLogSchema.index({ userId: 1, category: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

// Index for cleanup of old logs (optional - can be used with TTL)
auditLogSchema.index({ createdAt: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
