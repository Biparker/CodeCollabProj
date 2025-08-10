const logger = require('../utils/logger');

/**
 * Security-focused error handling middleware
 * Prevents information disclosure while maintaining proper logging
 */

class SecurityError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

const sanitizeError = (error) => {
  // Define safe error messages that don't reveal system internals
  const safeErrorMessages = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden', 
    404: 'Not Found',
    422: 'Validation Error',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    503: 'Service Unavailable'
  };

  const statusCode = error.statusCode || 500;
  
  // In production, use generic messages for server errors
  if (process.env.NODE_ENV === 'production' && statusCode >= 500) {
    return {
      message: safeErrorMessages[statusCode] || 'Internal Server Error',
      statusCode
    };
  }

  // For validation errors, return the actual validation messages
  if (error.name === 'ValidationError' || statusCode === 422) {
    return {
      message: error.message,
      statusCode: 422,
      errors: error.errors || []
    };
  }

  // For client errors (4xx), return the actual message but sanitized
  if (statusCode < 500) {
    return {
      message: error.message || safeErrorMessages[statusCode],
      statusCode
    };
  }

  // For development, return more detailed errors (but still sanitized)
  if (process.env.NODE_ENV === 'development') {
    return {
      message: error.message || safeErrorMessages[statusCode],
      statusCode,
      stack: error.stack
    };
  }

  return {
    message: safeErrorMessages[statusCode] || 'Internal Server Error',
    statusCode
  };
};

const handleMongoError = (error) => {
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message
    }));
    
    return new SecurityError('Validation failed', 422, true);
  }

  if (error.code === 11000) {
    // Duplicate key error - don't reveal which field
    return new SecurityError('Resource already exists', 409, true);
  }

  if (error.name === 'CastError') {
    return new SecurityError('Invalid resource ID', 400, true);
  }

  // For other MongoDB errors, return generic message
  logger.error('MongoDB Error:', {
    name: error.name,
    code: error.code,
    message: error.message,
    stack: error.stack
  });

  return new SecurityError('Database operation failed', 500, false);
};

const handleJWTError = (error) => {
  if (error.name === 'JsonWebTokenError') {
    return new SecurityError('Invalid authentication token', 401, true);
  }

  if (error.name === 'TokenExpiredError') {
    return new SecurityError('Authentication token expired', 401, true);
  }

  return new SecurityError('Authentication failed', 401, true);
};

const errorHandler = (error, req, res, next) => {
  let transformedError = error;

  // Handle specific error types
  if (error.name && error.name.includes('Mongo')) {
    transformedError = handleMongoError(error);
  } else if (error.name && error.name.includes('JsonWebToken')) {
    transformedError = handleJWTError(error);
  } else if (!error.isOperational) {
    // This is an unexpected error - log it and return generic message
    logger.error('Unexpected Error:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
    
    transformedError = new SecurityError('Internal Server Error', 500, false);
  }

  const sanitizedError = sanitizeError(transformedError);

  // Log security-relevant errors
  if (sanitizedError.statusCode >= 400) {
    const logLevel = sanitizedError.statusCode >= 500 ? 'error' : 'warn';
    logger[logLevel]('HTTP Error Response:', {
      statusCode: sanitizedError.statusCode,
      message: sanitizedError.message,
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id
    });
  }

  res.status(sanitizedError.statusCode).json({
    success: false,
    error: {
      message: sanitizedError.message,
      ...(sanitizedError.errors && { errors: sanitizedError.errors }),
      ...(process.env.NODE_ENV === 'development' && sanitizedError.stack && { stack: sanitizedError.stack })
    }
  });
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 404 handler
const notFoundHandler = (req, res, next) => {
  const error = new SecurityError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

module.exports = {
  SecurityError,
  errorHandler,
  asyncHandler,
  notFoundHandler
};
