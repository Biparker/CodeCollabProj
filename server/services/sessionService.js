const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Session = require('../models/Session');
const logger = require('../utils/logger');

/**
 * Enhanced session management service with security features
 */
class SessionService {
  constructor() {
    this.maxConcurrentSessions = parseInt(process.env.MAX_CONCURRENT_SESSIONS) || 3;
    this.sessionTimeoutMinutes = parseInt(process.env.SESSION_TIMEOUT_MINUTES) || 30;
    this.refreshTokenExpireDays = 7; // Refresh tokens last 7 days
  }

  /**
   * Create a new session with both access and refresh tokens
   */
  async createSession(userId, deviceInfo = {}) {
    try {
      // Check and enforce concurrent session limit
      await this.enforceConcurrentSessionLimit(userId);

      // Generate tokens
      const accessToken = this.generateAccessToken(userId);
      const refreshToken = this.generateRefreshToken();

      // Calculate expiration
      const expiresAt = new Date(Date.now() + this.refreshTokenExpireDays * 24 * 60 * 60 * 1000);

      // Create session record
      const session = new Session({
        userId,
        token: accessToken,
        refreshToken,
        deviceInfo: {
          userAgent: deviceInfo.userAgent,
          ip: deviceInfo.ip,
          platform: this.extractPlatform(deviceInfo.userAgent),
          browser: this.extractBrowser(deviceInfo.userAgent)
        },
        expiresAt
      });

      await session.save();

      logger.sessionEvent('created', {
        userId,
        sessionId: session._id,
        ip: deviceInfo.ip,
        userAgent: deviceInfo.userAgent
      });

      return {
        accessToken,
        refreshToken,
        sessionId: session._id,
        expiresIn: 15 * 60, // 15 minutes in seconds
        refreshExpiresIn: this.refreshTokenExpireDays * 24 * 60 * 60 // 7 days in seconds
      };
    } catch (error) {
      logger.error('Session creation failed', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * Refresh an access token using refresh token
   */
  async refreshSession(refreshToken, deviceInfo = {}) {
    try {
      const session = await Session.findOne({ 
        refreshToken, 
        isActive: true,
        expiresAt: { $gt: new Date() }
      });

      if (!session) {
        logger.securityEvent('INVALID_REFRESH_TOKEN', {
          refreshToken: refreshToken.substring(0, 10) + '...',
          ip: deviceInfo.ip
        });
        throw new Error('Invalid or expired refresh token');
      }

      // Update last activity
      session.lastActivity = new Date();
      
      // Generate new access token
      const newAccessToken = this.generateAccessToken(session.userId);
      session.token = newAccessToken;

      await session.save();

      logger.sessionEvent('refreshed', {
        userId: session.userId,
        sessionId: session._id,
        ip: deviceInfo.ip
      });

      return {
        accessToken: newAccessToken,
        expiresIn: 15 * 60 // 15 minutes in seconds
      };
    } catch (error) {
      logger.error('Session refresh failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Validate and get session info from access token
   */
  async validateSession(accessToken) {
    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
      
      const session = await Session.findOne({
        token: accessToken,
        userId: decoded.userId,
        isActive: true,
        expiresAt: { $gt: new Date() }
      }).populate('userId');

      if (!session) {
        logger.securityEvent('INVALID_ACCESS_TOKEN', {
          userId: decoded.userId,
          token: accessToken.substring(0, 10) + '...'
        });
        return null;
      }

      // Update last activity
      session.lastActivity = new Date();
      await session.save();

      return {
        user: session.userId,
        sessionId: session._id,
        token: accessToken
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        logger.sessionEvent('token_expired', { token: accessToken.substring(0, 10) + '...' });
      }
      return null;
    }
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(sessionId, reason = 'logout') {
    try {
      const session = await Session.findById(sessionId);
      if (session) {
        await session.revoke(reason);
        
        logger.sessionEvent('revoked', {
          userId: session.userId,
          sessionId,
          reason
        });
      }
    } catch (error) {
      logger.error('Session revocation failed', { sessionId, error: error.message });
      throw error;
    }
  }

  /**
   * Revoke all sessions for a user (useful for password changes)
   */
  async revokeAllUserSessions(userId, reason = 'security') {
    try {
      const result = await Session.revokeAllUserSessions(userId, reason);
      
      logger.sessionEvent('all_revoked', {
        userId,
        reason,
        count: result.modifiedCount
      });

      return result.modifiedCount;
    } catch (error) {
      logger.error('Bulk session revocation failed', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * Get active sessions for a user
   */
  async getUserSessions(userId) {
    try {
      return await Session.find({ 
        userId, 
        isActive: true,
        expiresAt: { $gt: new Date() }
      }).select('-token -refreshToken').sort({ lastActivity: -1 });
    } catch (error) {
      logger.error('Failed to get user sessions', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * Enforce concurrent session limit
   */
  async enforceConcurrentSessionLimit(userId) {
    const activeSessionCount = await Session.getActiveSessionCount(userId);
    
    if (activeSessionCount >= this.maxConcurrentSessions) {
      // Revoke oldest session
      const oldestSession = await Session.findOne({
        userId,
        isActive: true
      }).sort({ lastActivity: 1 });

      if (oldestSession) {
        await oldestSession.revoke('concurrent_limit');
        
        logger.sessionEvent('limit_enforced', {
          userId,
          revokedSessionId: oldestSession._id,
          activeCount: activeSessionCount
        });
      }
    }
  }

  /**
   * Clean up expired sessions (should be run periodically)
   */
  async cleanupExpiredSessions() {
    try {
      const deletedCount = await Session.cleanExpiredSessions();
      logger.info('Cleaned up expired sessions', { deletedCount });
      return deletedCount;
    } catch (error) {
      logger.error('Session cleanup failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate secure access token
   */
  generateAccessToken(userId) {
    return jwt.sign(
      { userId, type: 'access' }, 
      process.env.JWT_SECRET, 
      { expiresIn: '15m' }
    );
  }

  /**
   * Generate secure refresh token
   */
  generateRefreshToken() {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Extract platform from user agent
   */
  extractPlatform(userAgent = '') {
    if (/android/i.test(userAgent)) return 'Android';
    if (/iphone|ipad/i.test(userAgent)) return 'iOS';
    if (/windows/i.test(userAgent)) return 'Windows';
    if (/macintosh|mac os x/i.test(userAgent)) return 'macOS';
    if (/linux/i.test(userAgent)) return 'Linux';
    return 'Unknown';
  }

  /**
   * Extract browser from user agent
   */
  extractBrowser(userAgent = '') {
    if (/chrome/i.test(userAgent)) return 'Chrome';
    if (/firefox/i.test(userAgent)) return 'Firefox';
    if (/safari/i.test(userAgent)) return 'Safari';
    if (/edge/i.test(userAgent)) return 'Edge';
    return 'Unknown';
  }
}

module.exports = new SessionService();
