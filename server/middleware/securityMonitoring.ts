import { Request, Response, NextFunction, RequestHandler } from 'express';

const logger = require('../utils/logger');

/**
 * Tracking data entry with timestamps
 */
type TrackingEntry = number[];

/**
 * Map of IP addresses to tracking data
 */
type TrackingMap = Map<string, TrackingEntry>;

/**
 * File info from multer (minimal interface for security monitoring)
 */
interface UploadedFileInfo {
  originalname: string;
  mimetype: string;
  size: number;
}

/**
 * Security monitoring middleware to detect suspicious activities
 */

// Track failed login attempts per IP
const failedAttempts: TrackingMap = new Map();
const suspiciousActivities: TrackingMap = new Map();

// Configuration
const MAX_FAILED_ATTEMPTS = 5;
const ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes
const SUSPICIOUS_THRESHOLD = 10;
const SUSPICIOUS_WINDOW = 60 * 60 * 1000; // 1 hour

/**
 * Monitor failed authentication attempts
 */
const trackFailedAuth: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  const originalSend = res.send.bind(res);

  res.send = function (data: unknown): Response {
    if (res.statusCode === 401 || res.statusCode === 403) {
      const ip = req.ip || 'unknown';
      const now = Date.now();

      // Clean old attempts
      if (failedAttempts.has(ip)) {
        const attempts = failedAttempts.get(ip)!.filter((time) => now - time < ATTEMPT_WINDOW);
        failedAttempts.set(ip, attempts);
      }

      // Add new attempt
      const attempts = failedAttempts.get(ip) || [];
      attempts.push(now);
      failedAttempts.set(ip, attempts);

      // Check if threshold exceeded
      if (attempts.length >= MAX_FAILED_ATTEMPTS) {
        logger.securityEvent('MULTIPLE_FAILED_AUTH_ATTEMPTS', {
          ip,
          attempts: attempts.length,
          timeWindow: ATTEMPT_WINDOW,
          userAgent: req.get('User-Agent'),
          path: req.path,
          severity: 'high',
        });
      }
    }

    return originalSend(data);
  };

  next();
};

/**
 * Monitor suspicious request patterns
 */
const trackSuspiciousActivity: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const ip = req.ip || 'unknown';
  const now = Date.now();

  // Track requests per IP
  if (suspiciousActivities.has(ip)) {
    const activities = suspiciousActivities
      .get(ip)!
      .filter((time) => now - time < SUSPICIOUS_WINDOW);
    suspiciousActivities.set(ip, activities);
  }

  const activities = suspiciousActivities.get(ip) || [];
  activities.push(now);
  suspiciousActivities.set(ip, activities);

  // Check for suspicious patterns
  if (activities.length > SUSPICIOUS_THRESHOLD) {
    logger.suspiciousActivity('HIGH_REQUEST_VOLUME', {
      ip,
      requestCount: activities.length,
      timeWindow: SUSPICIOUS_WINDOW,
      userAgent: req.get('User-Agent'),
      path: req.path,
    });
  }

  // Check for suspicious paths
  const suspiciousPaths = [
    '/admin',
    '/wp-admin',
    '/phpmyadmin',
    '/mysql',
    '/.env',
    '/config',
    '/backup',
    '/debug',
  ];

  if (suspiciousPaths.some((path) => req.path.includes(path))) {
    logger.suspiciousActivity('SUSPICIOUS_PATH_ACCESS', {
      ip,
      path: req.path,
      userAgent: req.get('User-Agent'),
      method: req.method,
    });
  }

  // Check for SQL injection patterns
  const sqlPatterns = ['union', 'select', 'drop', 'insert', 'delete', 'update', '--', ';'];
  const queryString = JSON.stringify(req.query || {}).toLowerCase();
  const bodyString = JSON.stringify(req.body || {}).toLowerCase();

  if (
    sqlPatterns.some((pattern) => queryString.includes(pattern) || bodyString.includes(pattern))
  ) {
    logger.suspiciousActivity('POTENTIAL_SQL_INJECTION', {
      ip,
      path: req.path,
      userAgent: req.get('User-Agent'),
      query: req.query,
      severity: 'high',
    });
  }

  next();
};

/**
 * Monitor file upload attempts
 */
const trackFileUploads: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reqAny = req as any;
  const file = reqAny.file as UploadedFileInfo | undefined;
  const filesArray = reqAny.files as UploadedFileInfo[] | undefined;

  if (file || filesArray) {
    const files: UploadedFileInfo[] = filesArray || (file ? [file] : []);

    files.forEach((file) => {
      if (file) {
        logger.securityEvent('FILE_UPLOAD_ATTEMPT', {
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          ip: req.ip,
          userId: req.user?._id,
          path: req.path,
        });

        // Check for suspicious file types
        const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.com', '.pif', '.vbs', '.js'];
        const fileExtension = file.originalname.toLowerCase().split('.').pop();

        if (fileExtension && dangerousExtensions.includes(`.${fileExtension}`)) {
          logger.suspiciousActivity('DANGEROUS_FILE_UPLOAD_ATTEMPT', {
            filename: file.originalname,
            extension: fileExtension,
            ip: req.ip,
            userId: req.user?._id,
            severity: 'high',
          });
        }
      }
    });
  }

  next();
};

/**
 * Monitor access violations
 */
const trackAccessViolations: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const originalSend = res.send.bind(res);

  res.send = function (data: unknown): Response {
    if (res.statusCode === 403) {
      logger.accessViolation('FORBIDDEN_ACCESS_ATTEMPT', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        userAgent: req.get('User-Agent'),
        userId: req.user?._id,
        referer: req.get('Referer'),
      });
    }

    return originalSend(data);
  };

  next();
};

/**
 * Clean up old tracking data
 */
const cleanupTrackingData = (): void => {
  const now = Date.now();

  // Clean failed attempts
  for (const [ip, attempts] of failedAttempts.entries()) {
    const recentAttempts = attempts.filter((time) => now - time < ATTEMPT_WINDOW);
    if (recentAttempts.length === 0) {
      failedAttempts.delete(ip);
    } else {
      failedAttempts.set(ip, recentAttempts);
    }
  }

  // Clean suspicious activities
  for (const [ip, activities] of suspiciousActivities.entries()) {
    const recentActivities = activities.filter((time) => now - time < SUSPICIOUS_WINDOW);
    if (recentActivities.length === 0) {
      suspiciousActivities.delete(ip);
    } else {
      suspiciousActivities.set(ip, recentActivities);
    }
  }
};

// Clean up every 5 minutes
setInterval(cleanupTrackingData, 5 * 60 * 1000);

module.exports = {
  trackFailedAuth,
  trackSuspiciousActivity,
  trackFileUploads,
  trackAccessViolations,
  cleanupTrackingData,
};

export {
  trackFailedAuth,
  trackSuspiciousActivity,
  trackFileUploads,
  trackAccessViolations,
  cleanupTrackingData,
};
