const mongoose = require('mongoose');

const classMaterialSchema = new mongoose.Schema({
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassSection',
    required: true,
    index: true
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  materialType: {
    type: String,
    enum: ['document', 'video', 'link', 'assignment'],
    required: true,
    index: true
  },
  filePath: {
    type: String,
    default: null
  },
  fileName: {
    type: String,
    default: null
  },
  fileSize: {
    type: Number,
    default: null
  },
  externalUrl: {
    type: String,
    default: null
  },
  dueDate: {
    type: Date,
    default: null
  },
  isPublished: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
classMaterialSchema.index({ sectionId: 1, isPublished: 1, createdAt: -1 });
classMaterialSchema.index({ facultyId: 1, createdAt: -1 });

module.exports = mongoose.model('ClassMaterial', classMaterialSchema);