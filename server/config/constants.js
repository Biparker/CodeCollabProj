/**
 * Server-side application constants
 * Centralized configuration for maintainability
 */

// Session configuration
const SESSION_CONFIG = {
  MAX_CONCURRENT_SESSIONS: parseInt(process.env.MAX_CONCURRENT_SESSIONS) || 3,
  SESSION_TIMEOUT_MINUTES: parseInt(process.env.SESSION_TIMEOUT_MINUTES) || 30,
  REFRESH_TOKEN_EXPIRE_DAYS: 7,
  ACCESS_TOKEN_EXPIRY: '15m', // 15 minutes
};

// Rate limiting configuration
const RATE_LIMITS = {
  GENERAL_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  GENERAL_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  AUTH_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  AUTH_MAX_ATTEMPTS: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 50,
  ADMIN_WINDOW_MS: 5 * 60 * 1000, // 5 minutes
  ADMIN_MAX_REQUESTS: 200,
  PASSWORD_RESET_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  PASSWORD_RESET_MAX_ATTEMPTS: 5, // Limit password reset requests
};

// Password requirements
const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL: true,
};

// Security constants
const SECURITY = {
  JWT_SECRET_MIN_LENGTH: 32,
  PASSWORD_RESET_TOKEN_EXPIRY: 60 * 60 * 1000, // 1 hour
  EMAIL_VERIFICATION_TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
  BCRYPT_SALT_ROUNDS: 10,
};

// Validation limits
const VALIDATION_LIMITS = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  EMAIL_MAX_LENGTH: 255,
  BIO_MAX_LENGTH: 500,
  PROJECT_TITLE_MIN: 3,
  PROJECT_TITLE_MAX: 100,
  PROJECT_DESCRIPTION_MIN: 10,
  PROJECT_DESCRIPTION_MAX: 2000,
  COMMENT_MAX_LENGTH: 1000,
  MESSAGE_SUBJECT_MAX: 100,
  MESSAGE_CONTENT_MAX: 1000,
};

// Request body size limits
const REQUEST_LIMITS = {
  JSON_BODY_SIZE: '10mb',
  URL_ENCODED_BODY_SIZE: '10mb',
};

module.exports = {
  SESSION_CONFIG,
  RATE_LIMITS,
  PASSWORD_REQUIREMENTS,
  SECURITY,
  VALIDATION_LIMITS,
  REQUEST_LIMITS,
};

