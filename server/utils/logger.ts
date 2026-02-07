import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Log level type
 */
type LogLevel = 'error' | 'warn' | 'info' | 'debug';

/**
 * Log level priority mapping
 */
type LogLevelPriority = {
  [K in LogLevel]: number;
};

/**
 * Log entry metadata
 */
interface LogMeta {
  [key: string]: unknown;
  severity?: 'low' | 'medium' | 'high';
}

/**
 * Formatted log entry structure
 */
interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  pid: number;
  hostname: string;
  [key: string]: unknown;
}

/**
 * Security event details
 */
interface SecurityEventDetails extends LogMeta {
  event?: string;
  success?: boolean;
  activity?: string;
  violation?: string;
}

/**
 * Security-focused logging utility
 * Logs security events, authentication attempts, and suspicious activities
 */
class SecurityLogger {
  private logDir: string;
  private logLevel: LogLevel;
  private enableSecurityLogging: boolean;
  private levels: LogLevelPriority;

  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.ensureLogDirectory();

    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
    this.enableSecurityLogging = process.env.ENABLE_SECURITY_LOGGING === 'true';

    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
    };
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private formatLogEntry(level: LogLevel, message: string, meta: LogMeta = {}): string {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      ...meta,
      pid: process.pid,
      hostname: os.hostname(),
    };
    return JSON.stringify(entry) + '\n';
  }

  private writeToFile(filename: string, entry: string): void {
    const filePath = path.join(this.logDir, filename);
    fs.appendFileSync(filePath, entry);
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] <= this.levels[this.logLevel];
  }

  log(level: LogLevel, message: string, meta: LogMeta = {}): void {
    if (!this.shouldLog(level)) return;

    const entry = this.formatLogEntry(level, message, meta);

    // Console output
    console.log(entry.trim());

    // File output
    const today = new Date().toISOString().split('T')[0];
    this.writeToFile(`app-${today}.log`, entry);

    // Error logs to separate file
    if (level === 'error') {
      this.writeToFile(`error-${today}.log`, entry);
    }
  }

  // Standard log levels
  error(message: string, meta: LogMeta = {}): void {
    this.log('error', message, meta);
  }

  warn(message: string, meta: LogMeta = {}): void {
    this.log('warn', message, meta);
  }

  info(message: string, meta: LogMeta = {}): void {
    this.log('info', message, meta);
  }

  debug(message: string, meta: LogMeta = {}): void {
    this.log('debug', message, meta);
  }

  // Security-specific logging methods
  securityEvent(event: string, details: SecurityEventDetails = {}): void {
    if (!this.enableSecurityLogging) return;

    const securityEntry = this.formatLogEntry('warn', `SECURITY_EVENT: ${event}`, {
      event,
      ...details,
      severity: details.severity || 'medium',
    });

    const today = new Date().toISOString().split('T')[0];
    this.writeToFile(`security-${today}.log`, securityEntry);

    // Also log to console and main log
    this.warn(`Security Event: ${event}`, details);
  }

  authAttempt(success: boolean, details: SecurityEventDetails = {}): void {
    this.securityEvent(success ? 'AUTH_SUCCESS' : 'AUTH_FAILURE', {
      success,
      ...details,
      severity: success ? 'low' : 'high',
    });
  }

  suspiciousActivity(activity: string, details: SecurityEventDetails = {}): void {
    this.securityEvent('SUSPICIOUS_ACTIVITY', {
      activity,
      ...details,
      severity: 'high',
    });
  }

  accessViolation(violation: string, details: SecurityEventDetails = {}): void {
    this.securityEvent('ACCESS_VIOLATION', {
      violation,
      ...details,
      severity: 'high',
    });
  }

  rateLimitHit(details: SecurityEventDetails = {}): void {
    this.securityEvent('RATE_LIMIT_HIT', {
      ...details,
      severity: 'medium',
    });
  }

  sessionEvent(event: string, details: SecurityEventDetails = {}): void {
    this.securityEvent(`SESSION_${event.toUpperCase()}`, {
      ...details,
      severity: 'low',
    });
  }

  adminAction(action: string, details: SecurityEventDetails = {}): void {
    this.securityEvent(`ADMIN_${action.toUpperCase()}`, {
      ...details,
      severity: 'medium',
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = new SecurityLogger();
