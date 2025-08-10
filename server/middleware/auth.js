const sessionService = require('../services/sessionService');
const logger = require('../utils/logger');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      logger.securityEvent('MISSING_AUTH_TOKEN', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path
      });
      return res.status(401).json({ message: 'Access token required' });
    }

    const sessionData = await sessionService.validateSession(token);
    
    if (!sessionData) {
      logger.securityEvent('INVALID_AUTH_TOKEN', {
        token: token.substring(0, 10) + '...',
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path
      });
      return res.status(401).json({ message: 'Invalid or expired access token' });
    }

    req.token = token;
    req.user = sessionData.user;
    req.sessionId = sessionData.sessionId;
    next();
  } catch (error) {
    logger.error('Authentication error', { 
      error: error.message,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = auth; 