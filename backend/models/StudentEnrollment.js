const mongoose = require('mongoose');

const studentEnrollmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassSection',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'enrolled', 'rejected', 'dropped'],
    default: 'pending',
    index: true
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  statusReason: {
    type: String,
    default: null
  },
  grade: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
studentEnrollmentSchema.index({ studentId: 1, sectionId: 1 }, { unique: true });
studentEnrollmentSchema.index({ status: 1, enrollmentDate: -1 });

module.exports = mongoose.model('StudentEnrollment', studentEnrollmentSchema);