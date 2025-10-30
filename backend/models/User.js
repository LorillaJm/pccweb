const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      // Password is required only for local authentication
      return !this.googleId && !this.appleId;
    }
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: function() {
      // lastName is required for local auth, but can be empty for OAuth
      return this.authProvider === 'local';
    },
    default: '',
    trim: true
  },
  middleName: {
    type: String,
    default: null,
    trim: true
  },
  phone: {
    type: String,
    default: null,
    trim: true
  },
  address: {
    type: String,
    default: null,
    trim: true
  },
  role: {
    type: String,
    enum: ['student', 'faculty', 'admin', 'super_admin', 'alumni', 'company'],
    default: 'student'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Social authentication fields
  googleId: {
    type: String,
    sparse: true,
    index: true
  },
  appleId: {
    type: String,
    sparse: true,
    index: true
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'apple'],
    default: 'local'
  },
  profilePicture: {
    type: String,
    default: null
  },
  // Student-specific fields
  studentId: {
    type: String,
    sparse: true,
    index: true
  },
  program: {
    type: String,
    default: null
  },
  yearLevel: {
    type: Number,
    default: null
  },
  section: {
    type: String,
    default: null
  },
  // Faculty-specific fields
  employeeId: {
    type: String,
    sparse: true,
    index: true
  },
  department: {
    type: String,
    default: null
  },
  position: {
    type: String,
    default: null
  },
  // Timestamps
  lastLogin: {
    type: Date,
    default: null
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerifiedAt: {
    type: Date,
    default: null
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  // Two-Factor Authentication
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  // Account Security
  accountLocked: {
    type: Boolean,
    default: false
  },
  lockReason: {
    type: String,
    default: null
  },
  lockedUntil: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.emailVerificationToken;
      delete ret.passwordResetToken;
      return ret;
    }
  }
});

// Rely on field-level index definitions above to avoid duplicate index warnings

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Static method to find user by social ID
userSchema.statics.findBySocialId = function(provider, socialId) {
  const query = {};
  if (provider === 'google') {
    query.googleId = socialId;
  } else if (provider === 'apple') {
    query.appleId = socialId;
  }
  return this.findOne(query);
};

// Static method to create social user
userSchema.statics.createSocialUser = function(profile, provider) {
  let email, firstName, lastName, profilePicture = null;
  
  // Handle different profile structures for different providers
  if (provider === 'google') {
    email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
    firstName = profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User';
    lastName = profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '';
    profilePicture = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
  } else if (provider === 'apple') {
    email = profile.email;
    firstName = profile.name?.firstName || profile.email?.split('@')[0] || 'User';
    lastName = profile.name?.lastName || '';
    profilePicture = null; // Apple doesn't provide profile pictures
  }

  // Validate required fields
  if (!email) {
    throw new Error(`Email is required for ${provider} authentication`);
  }

  if (!firstName || firstName.trim().length === 0) {
    throw new Error(`First name is required for ${provider} authentication`);
  }

  const userData = {
    email: email.toLowerCase(),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    role: 'student', // Default role for OAuth users
    authProvider: provider,
    emailVerified: true,
    profilePicture
  };

  if (provider === 'google') {
    userData.googleId = profile.id;
  } else if (provider === 'apple') {
    userData.appleId = profile.id;
  }

  try {
    console.log('Creating user with data:', { ...userData, password: '[hidden]' });
    return this.create(userData);
  } catch (error) {
    console.error('MongoDB validation error:', error);
    throw error;
  }
};

module.exports = mongoose.model('User', userSchema);
