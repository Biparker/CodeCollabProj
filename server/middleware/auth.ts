import { Request, Response, NextFunction } from 'express';

const sessionService = require('../services/sessionService');
const logger = require('../utils/logger');

/**
 * Authentication middleware
 * Validates access token from cookies or Authorization header
 * and attaches user info to the request object
 */
const auth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Try cookie first (httpOnly cookie for XSS protection), then Authorization header for backward compatibility
    let token: string | undefined = req.cookies?.accessToken;
    if (!token) {
      token = req.header('Authorization')?.replace('Bearer ', '');
    }

    if (!token) {
      logger.securityEvent('MISSING_AUTH_TOKEN', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
      });
      res.status(401).json({ message: 'Access token required' });
      return;
    }

    const sessionData = await sessionService.validateSession(token);

    if (!sessionData) {
      logger.securityEvent('INVALID_AUTH_TOKEN', {
        token: token.substring(0, 10) + '...',
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
      });
      res.status(401).json({ message: 'Invalid or expired access token' });
      return;
    }

    req.token = token;
    req.user = sessionData.user;
    req.sessionId = sessionData.sessionId;
    next();
  } catch (error) {
    const err = error as Error;
    logger.error('Authentication error', {
      error: err.message,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
    res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = auth;

export default auth;
