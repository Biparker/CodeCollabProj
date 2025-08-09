const fs = require('fs');
const path = require('path');

/**
 * Security-focused logging utility
 * Logs security events, authentication attempts, and suspicious activities
 */
class SecurityLogger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.ensureLogDirectory();
    
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.enableSecurityLogging = process.env.ENABLE_SECURITY_LOGGING === 'true';
    
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatLogEntry(level, message, meta = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      ...meta,
      pid: process.pid,
      hostname: require('os').hostname()
    }) + '\n';
  }

  writeToFile(filename, entry) {
    const filePath = path.join(this.logDir, filename);
    fs.appendFileSync(filePath, entry);
  }

  shouldLog(level) {
    return this.levels[level] <= this.levels[this.logLevel];
  }

  log(level, message, meta = {}) {
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
  error(message, meta = {}) {
    this.log('error', message, meta);
  }

  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }

  // Security-specific logging methods
  securityEvent(event, details = {}) {
    if (!this.enableSecurityLogging) return;
    
    const securityEntry = this.formatLogEntry('warn', `SECURITY_EVENT: ${event}`, {
      event,
      ...details,
      severity: details.severity || 'medium'
    });
    
    const today = new Date().toISOString().split('T')[0];
    this.writeToFile(`security-${today}.log`, securityEntry);
    
    // Also log to console and main log
    this.warn(`Security Event: ${event}`, details);
  }

  authAttempt(success, details = {}) {
    this.securityEvent(success ? 'AUTH_SUCCESS' : 'AUTH_FAILURE', {
      success,
      ...details,
      severity: success ? 'low' : 'high'
    });
  }

  suspiciousActivity(activity, details = {}) {
    this.securityEvent('SUSPICIOUS_ACTIVITY', {
      activity,
      ...details,
      severity: 'high'
    });
  }

  accessViolation(violation, details = {}) {
    this.securityEvent('ACCESS_VIOLATION', {
      violation,
      ...details,
      severity: 'high'
    });
  }

  rateLimitHit(details = {}) {
    this.securityEvent('RATE_LIMIT_HIT', {
      ...details,
      severity: 'medium'
    });
  }

  sessionEvent(event, details = {}) {
    this.securityEvent(`SESSION_${event.toUpperCase()}`, {
      ...details,
      severity: 'low'
    });
  }
}

module.exports = new SecurityLogger();
