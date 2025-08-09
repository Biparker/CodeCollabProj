const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  // Email verification fields
  isEmailVerified: {
    type: Boolean,
    default: process.env.NODE_ENV === 'development' ? true : false
  },
  emailVerificationToken: {
    type: String
  },
  emailVerificationExpires: {
    type: Date
  },
  // Password reset fields
  passwordResetToken: {
    type: String
  },
  passwordResetExpires: {
    type: Date
  },
  firstName: {
    type: String,
    trim: true,
    minlength: 2
  },
  lastName: {
    type: String,
    trim: true,
    minlength: 2
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500
  },
  skills: [{
    type: String,
    trim: true
  }],
  experience: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner'
  },
  location: {
    type: String,
    trim: true
  },
  timezone: {
    type: String,
    trim: true
  },
  availability: {
    type: String,
    enum: ['full-time', 'part-time', 'weekends', 'evenings', 'flexible'],
    default: 'flexible'
  },
  portfolioLinks: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    }
  }],
  socialLinks: {
    github: {
      type: String,
      trim: true
    },
    linkedin: {
      type: String,
      trim: true
    },
    twitter: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    }
  },
  profileImage: {
    type: String,
    trim: true
  },
  isProfilePublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  console.log('🔐 Pre-save middleware triggered');
  console.log('🔐 Password modified:', this.isModified('password'));
  console.log('🔐 Password field:', this.password ? 'exists' : 'undefined');
  
  if (!this.isModified('password')) {
    console.log('🔐 Password not modified, skipping hash');
    return next();
  }
  
  try {
    console.log('🔐 Hashing password...');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('🔐 Password hashed successfully');
    next();
  } catch (error) {
    console.error('🔐 Error hashing password:', error);
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = token;
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

// Method to generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = token;
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  return token;
};

// Method to clear password reset token
userSchema.methods.clearPasswordResetToken = function() {
  this.passwordResetToken = undefined;
  this.passwordResetExpires = undefined;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 