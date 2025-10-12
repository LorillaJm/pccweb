const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  subjectCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  subjectName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  units: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  prerequisites: [{
    type: String,
    trim: true
  }],
  department: {
    type: String,
    required: true,
    trim: true
  },
  yearLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 2
  },
  program: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
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

// Indexes for better query performance
// Note: subjectCode index is automatically created by unique: true
subjectSchema.index({ program: 1, yearLevel: 1, semester: 1 });
subjectSchema.index({ department: 1 });
subjectSchema.index({ isActive: 1 });

module.exports = mongoose.model('Subject', subjectSchema);
