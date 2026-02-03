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
    console.log('🔐 Auth middleware - checking authentication for', req.path);

    // Try cookie first (httpOnly cookie for XSS protection), then Authorization header for backward compatibility
    let token: string | undefined = req.cookies?.accessToken;
    if (!token) {
      token = req.header('Authorization')?.replace('Bearer ', '');
    }

    console.log(
      '🔐 Token source:',
      token ? (req.cookies?.accessToken ? 'cookie' : 'header') : 'none'
    );

    if (!token) {
      console.log('❌ No token found');
      logger.securityEvent('MISSING_AUTH_TOKEN', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
      });
      res.status(401).json({ message: 'Access token required' });
      return;
    }

    console.log('🔐 Validating session...');
    const sessionData = await sessionService.validateSession(token);
    console.log('🔐 Session validated:', !!sessionData);

    if (!sessionData) {
      console.log('❌ Session validation failed');
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
    console.log('✅ Auth successful, user:', sessionData.user.username);
    next();
  } catch (error) {
    const err = error as Error;
    console.error('❌ Auth error:', err.message);
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
