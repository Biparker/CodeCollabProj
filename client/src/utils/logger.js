/**
 * Client-side logging utility
 * Wraps console methods to prevent logging in production
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  error: (...args) => {
    // Always log errors, but sanitize sensitive data in production
    if (isDevelopment) {
      console.error(...args);
    } else {
      // In production, log errors but remove sensitive data
      const sanitized = args.map(arg => {
        if (typeof arg === 'string') {
          // Remove potential token patterns
          return arg.replace(/token['"]?\s*[:=]\s*['"]?[^'"]+/gi, 'token: [REDACTED]');
        }
        if (typeof arg === 'object' && arg !== null) {
          const sanitized = { ...arg };
          // Remove sensitive fields
          delete sanitized.token;
          delete sanitized.accessToken;
          delete sanitized.refreshToken;
          delete sanitized.password;
          delete sanitized.passwordHash;
          return sanitized;
        }
        return arg;
      });
      console.error(...sanitized);
    }
  },
  
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
};

export default logger;

