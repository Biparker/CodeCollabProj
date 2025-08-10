const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  refreshToken: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  deviceInfo: {
    userAgent: String,
    ip: String,
    platform: String,
    browser: String
  },
  location: {
    country: String,
    city: String,
    timezone: String
  },
  lastActivity: {
    type: Date,
    default: Date.now,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }
  },
  revokedAt: {
    type: Date
  },
  revokedReason: {
    type: String,
    enum: ['logout', 'password_change', 'admin_revoke', 'security_breach', 'expired']
  }
}, {
  timestamps: true
});

// Index for efficient querying
sessionSchema.index({ userId: 1, isActive: 1 });
sessionSchema.index({ token: 1, isActive: 1 });
sessionSchema.index({ refreshToken: 1, isActive: 1 });

// Method to revoke session
sessionSchema.methods.revoke = function(reason = 'logout') {
  this.isActive = false;
  this.revokedAt = new Date();
  this.revokedReason = reason;
  return this.save();
};

// Static method to revoke all user sessions
sessionSchema.statics.revokeAllUserSessions = async function(userId, reason = 'security') {
  return this.updateMany(
    { userId, isActive: true },
    { 
      isActive: false, 
      revokedAt: new Date(), 
      revokedReason: reason 
    }
  );
};

// Static method to clean expired sessions
sessionSchema.statics.cleanExpiredSessions = async function() {
  const result = await this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isActive: false, revokedAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } // 7 days old
    ]
  });
  return result.deletedCount;
};

// Static method to get active session count for user
sessionSchema.statics.getActiveSessionCount = async function(userId) {
  return this.countDocuments({ userId, isActive: true });
};

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
