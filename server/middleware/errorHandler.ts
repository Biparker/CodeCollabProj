import { Request, Response, NextFunction, ErrorRequestHandler, RequestHandler } from 'express';

const logger = require('../utils/logger');

/**
 * HTTP status code to safe message mapping
 */
interface SafeErrorMessages {
  [key: number]: string;
}

/**
 * Sanitized error response structure
 */
interface SanitizedError {
  message: string;
  statusCode: number;
  errors?: ValidationError[];
  stack?: string;
}

/**
 * Validation error structure
 */
interface ValidationError {
  field: string;
  message: string;
}

/**
 * MongoDB error interface
 */
interface MongoError extends Error {
  code?: number;
  errors?: {
    [key: string]: {
      path: string;
      message: string;
    };
  };
}

/**
 * Security-focused error handling middleware
 * Prevents information disclosure while maintaining proper logging
 */
class SecurityError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Sanitize error for client response
 */
const sanitizeError = (error: SecurityError & { errors?: ValidationError[] }): SanitizedError => {
  // Define safe error messages that don't reveal system internals
  const safeErrorMessages: SafeErrorMessages = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    422: 'Validation Error',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    503: 'Service Unavailable',
  };

  const statusCode = error.statusCode || 500;

  // In production, use generic messages for server errors
  if (process.env.NODE_ENV === 'production' && statusCode >= 500) {
    return {
      message: safeErrorMessages[statusCode] || 'Internal Server Error',
      statusCode,
    };
  }

  // For validation errors, return the actual validation messages
  if (error.name === 'ValidationError' || statusCode === 422) {
    return {
      message: error.message,
      statusCode: 422,
      errors: error.errors || [],
    };
  }

  // For client errors (4xx), return the actual message but sanitized
  if (statusCode < 500) {
    return {
      message: error.message || safeErrorMessages[statusCode],
      statusCode,
    };
  }

  // For development, return more detailed errors (but still sanitized)
  if (process.env.NODE_ENV === 'development') {
    return {
      message: error.message || safeErrorMessages[statusCode],
      statusCode,
      stack: error.stack,
    };
  }

  return {
    message: safeErrorMessages[statusCode] || 'Internal Server Error',
    statusCode,
  };
};

/**
 * Handle MongoDB-specific errors
 */
const handleMongoError = (error: MongoError): SecurityError => {
  if (error.name === 'ValidationError') {
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
    stack: error.stack,
  });

  return new SecurityError('Database operation failed', 500, false);
};

/**
 * Handle JWT-specific errors
 */
const handleJWTError = (error: Error): SecurityError => {
  if (error.name === 'JsonWebTokenError') {
    return new SecurityError('Invalid authentication token', 401, true);
  }

  if (error.name === 'TokenExpiredError') {
    return new SecurityError('Authentication token expired', 401, true);
  }

  return new SecurityError('Authentication failed', 401, true);
};

/**
 * Main error handler middleware
 */
const errorHandler: ErrorRequestHandler = (
  error: Error & {
    statusCode?: number;
    isOperational?: boolean;
    errors?: ValidationError[];
    code?: number;
  },
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  let transformedError: SecurityError & { errors?: ValidationError[] } = error as SecurityError;

  // Handle specific error types
  if (error.name && error.name.includes('Mongo')) {
    const mongoError: MongoError = {
      name: error.name,
      message: error.message,
      code: error.code,
    };
    transformedError = handleMongoError(mongoError);
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
      ip: req.ip,
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
      userId: req.user?._id,
    });
  }

  res.status(sanitizedError.statusCode).json({
    success: false,
    error: {
      message: sanitizedError.message,
      ...(sanitizedError.errors && { errors: sanitizedError.errors }),
      ...(process.env.NODE_ENV === 'development' &&
        sanitizedError.stack && { stack: sanitizedError.stack }),
    },
  });
};

/**
 * Async error wrapper for route handlers
 */
const asyncHandler = <T>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found handler
 */
const notFoundHandler: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new SecurityError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

module.exports = {
  SecurityError,
  errorHandler,
  asyncHandler,
  notFoundHandler,
};

export {
  SecurityError,
  errorHandler,
  asyncHandler,
  notFoundHandler,
  SanitizedError,
  ValidationError,
};
