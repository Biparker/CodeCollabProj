const fs = require('fs');
const path = require('path');
const os = require('os');

// Mock fs and console before requiring the logger
jest.mock('fs');
jest.mock('console', () => ({
  log: jest.fn()
}));

describe('SecurityLogger', () => {
  let logger;
  const originalEnv = process.env;
  const mockLogDir = path.join(__dirname, '../logs');
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset environment
    process.env = { ...originalEnv };
    
    // Mock fs methods
    fs.existsSync.mockReturnValue(true);
    fs.mkdirSync.mockImplementation(() => {});
    fs.appendFileSync.mockImplementation(() => {});
    
    // Clear module cache and re-require logger to get fresh instance
    delete require.cache[require.resolve('../utils/logger')];
    logger = require('../utils/logger');
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Initialization', () => {
    test('should create log directory if it does not exist', () => {
      fs.existsSync.mockReturnValue(false);
      
      // Re-require to trigger directory creation
      delete require.cache[require.resolve('../utils/logger')];
      require('../utils/logger');
      
      expect(fs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('logs'),
        { recursive: true }
      );
    });

    test('should set default log level to info', () => {
      delete process.env.LOG_LEVEL;
      
      delete require.cache[require.resolve('../utils/logger')];
      const testLogger = require('../utils/logger');
      
      expect(testLogger.logLevel).toBe('info');
    });

    test('should respect LOG_LEVEL environment variable', () => {
      process.env.LOG_LEVEL = 'debug';
      
      delete require.cache[require.resolve('../utils/logger')];
      const testLogger = require('../utils/logger');
      
      expect(testLogger.logLevel).toBe('debug');
    });
  });

  describe('Log Level Filtering', () => {
    test('should filter out debug messages when log level is info', () => {
      process.env.LOG_LEVEL = 'info';
      
      delete require.cache[require.resolve('../utils/logger')];
      const testLogger = require('../utils/logger');
      
      testLogger.debug('Debug message');
      expect(console.log).not.toHaveBeenCalled();
      expect(fs.appendFileSync).not.toHaveBeenCalled();
    });

    test('should allow info messages when log level is info', () => {
      process.env.LOG_LEVEL = 'info';
      
      delete require.cache[require.resolve('../utils/logger')];
      const testLogger = require('../utils/logger');
      
      testLogger.info('Info message');
      expect(console.log).toHaveBeenCalled();
      expect(fs.appendFileSync).toHaveBeenCalled();
    });

    test('should allow error messages at any level', () => {
      process.env.LOG_LEVEL = 'error';
      
      delete require.cache[require.resolve('../utils/logger')];
      const testLogger = require('../utils/logger');
      
      testLogger.error('Error message');
      expect(console.log).toHaveBeenCalled();
      expect(fs.appendFileSync).toHaveBeenCalled();
    });
  });

  describe('Log Entry Formatting', () => {
    test('should format log entries with correct structure', () => {
      const testMessage = 'Test message';
      const testMeta = { userId: 123, action: 'test' };
      
      logger.info(testMessage, testMeta);
      
      expect(console.log).toHaveBeenCalled();
      const logCall = console.log.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      
      expect(logEntry).toMatchObject({
        level: 'INFO',
        message: testMessage,
        userId: 123,
        action: 'test',
        pid: process.pid,
        hostname: os.hostname()
      });
      
      expect(logEntry.timestamp).toBeDefined();
    });

    test('should handle empty meta object', () => {
      const testMessage = 'Test message without meta';
      
      logger.info(testMessage);
      
      expect(console.log).toHaveBeenCalled();
      const logCall = console.log.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      
      expect(logEntry).toMatchObject({
        level: 'INFO',
        message: testMessage,
        pid: process.pid,
        hostname: os.hostname()
      });
    });
  });

  describe('File Writing', () => {
    test('should write to daily app log file', () => {
      const today = new Date().toISOString().split('T')[0];
      
      logger.info('Test message');
      
      expect(fs.appendFileSync).toHaveBeenCalledWith(
        expect.stringContaining(`app-${today}.log`),
        expect.stringContaining('Test message')
      );
    });

    test('should write errors to both app log and error log', () => {
      const today = new Date().toISOString().split('T')[0];
      
      logger.error('Error message');
      
      // Should be called twice - once for app log, once for error log
      expect(fs.appendFileSync).toHaveBeenCalledTimes(2);
      
      // Check app log
      expect(fs.appendFileSync).toHaveBeenCalledWith(
        expect.stringContaining(`app-${today}.log`),
        expect.stringContaining('Error message')
      );
      
      // Check error log
      expect(fs.appendFileSync).toHaveBeenCalledWith(
        expect.stringContaining(`error-${today}.log`),
        expect.stringContaining('Error message')
      );
    });
  });

  describe('Security Logging', () => {
    beforeEach(() => {
      process.env.ENABLE_SECURITY_LOGGING = 'true';
      
      delete require.cache[require.resolve('../utils/logger')];
      logger = require('../utils/logger');
    });

    test('should log authentication attempts', () => {
      const authDetails = { 
        userId: 123, 
        email: 'test@example.com',
        ip: '192.168.1.1' 
      };
      
      logger.authAttempt(true, authDetails);
      
      expect(console.log).toHaveBeenCalled();
      
      // Should write to both regular log and security log
      const today = new Date().toISOString().split('T')[0];
      expect(fs.appendFileSync).toHaveBeenCalledWith(
        expect.stringContaining(`security-${today}.log`),
        expect.stringContaining('AUTH_SUCCESS')
      );
    });

    test('should log suspicious activities', () => {
      const activity = 'Multiple failed login attempts';
      const details = {
        ip: '192.168.1.100',
        attempts: 5
      };
      
      logger.suspiciousActivity(activity, details);
      
      expect(console.log).toHaveBeenCalled();
      
      const today = new Date().toISOString().split('T')[0];
      expect(fs.appendFileSync).toHaveBeenCalledWith(
        expect.stringContaining(`security-${today}.log`),
        expect.stringContaining('SUSPICIOUS_ACTIVITY')
      );
    });

    test('should not log security events when disabled', () => {
      process.env.ENABLE_SECURITY_LOGGING = 'false';
      
      delete require.cache[require.resolve('../utils/logger')];
      const testLogger = require('../utils/logger');
      
      const today = new Date().toISOString().split('T')[0];
      
      testLogger.securityEvent('TEST_EVENT', { test: true });
      
      // Should not write to security log when disabled
      expect(fs.appendFileSync).not.toHaveBeenCalledWith(
        expect.stringContaining(`security-${today}.log`),
        expect.anything()
      );
    });
  });

  describe('Standard Log Methods', () => {
    test('should log error messages', () => {
      const errorMessage = 'Test error';
      const errorMeta = { code: 500 };
      
      logger.error(errorMessage, errorMeta);
      
      expect(console.log).toHaveBeenCalled();
      const logCall = console.log.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      
      expect(logEntry.level).toBe('ERROR');
      expect(logEntry.message).toBe(errorMessage);
      expect(logEntry.code).toBe(500);
    });

    test('should log warning messages', () => {
      const warnMessage = 'Test warning';
      
      logger.warn(warnMessage);
      
      expect(console.log).toHaveBeenCalled();
      const logCall = console.log.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      
      expect(logEntry.level).toBe('WARN');
      expect(logEntry.message).toBe(warnMessage);
    });

    test('should log info messages', () => {
      const infoMessage = 'Test info';
      
      logger.info(infoMessage);
      
      expect(console.log).toHaveBeenCalled();
      const logCall = console.log.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      
      expect(logEntry.level).toBe('INFO');
      expect(logEntry.message).toBe(infoMessage);
    });
  });

  describe('Edge Cases', () => {
    test('should handle logging with null meta', () => {
      expect(() => {
        logger.info('Test message', null);
      }).not.toThrow();
      
      expect(console.log).toHaveBeenCalled();
    });

    test('should handle logging with undefined meta', () => {
      expect(() => {
        logger.info('Test message', undefined);
      }).not.toThrow();
      
      expect(console.log).toHaveBeenCalled();
    });
  });
});
