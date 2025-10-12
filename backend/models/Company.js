const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [200, 'Company name cannot exceed 200 characters']
  },
  industry: {
    type: String,
    required: [true, 'Industry is required'],
    trim: true,
    index: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  website: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\//.test(v);
      },
      message: 'Invalid website URL format'
    }
  },
  size: {
    type: String,
    enum: ['startup', 'small', 'medium', 'large', 'enterprise'],
    default: 'small'
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  contactPerson: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    position: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function(v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Invalid email format'
      }
    },
    phone: {
      type: String,
      trim: true
    }
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
    index: true
  },
  verificationDocuments: [{
    type: {
      type: String,
      enum: ['business_permit', 'sec_registration', 'dti_registration', 'other'],
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  }],
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
companySchema.index({ name: 'text', description: 'text' });
companySchema.index({ industry: 1, verificationStatus: 1 });

// Static methods
companySchema.statics.findVerified = function() {
  return this.find({ 
    verificationStatus: 'verified',
    isActive: true
  }).populate('userId', 'email');
};

module.exports = mongoose.model('Company', companySchema);
