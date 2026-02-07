import * as os from 'os';

// Define interface for the logger module
interface SecurityLogger {
  logLevel: string;
  error: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  info: (message: string, meta?: Record<string, unknown>) => void;
  debug: (message: string, meta?: Record<string, unknown>) => void;
  authAttempt: (success: boolean, details?: Record<string, unknown>) => void;
  suspiciousActivity: (activity: string, details?: Record<string, unknown>) => void;
  securityEvent: (event: string, details?: Record<string, unknown>) => void;
}

// Mock fs module before any imports
const mockExistsSync = jest.fn();
const mockMkdirSync = jest.fn();
const mockAppendFileSync = jest.fn();

jest.mock('fs', () => ({
  existsSync: mockExistsSync,
  mkdirSync: mockMkdirSync,
  appendFileSync: mockAppendFileSync,
}));

describe('SecurityLogger', () => {
  let logger: SecurityLogger;
  let consoleSpy: jest.SpyInstance;
  const originalEnv = process.env;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    mockExistsSync.mockClear();
    mockMkdirSync.mockClear();
    mockAppendFileSync.mockClear();

    // Spy on console.log before loading the module
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    // Reset environment
    process.env = { ...originalEnv };

    // Mock fs methods
    mockExistsSync.mockReturnValue(true);
    mockMkdirSync.mockImplementation(() => undefined);
    mockAppendFileSync.mockImplementation(() => {});

    // Clear module cache and re-require logger to get fresh instance
    jest.resetModules();
    logger = require('../utils/logger') as SecurityLogger;
  });

  afterEach(() => {
    process.env = originalEnv;
    consoleSpy.mockRestore();
  });

  describe('Initialization', () => {
    test('should create log directory if it does not exist', () => {
      mockExistsSync.mockReturnValue(false);

      // Re-require to trigger directory creation
      jest.resetModules();
      require('../utils/logger');

      expect(mockMkdirSync).toHaveBeenCalledWith(expect.stringContaining('logs'), {
        recursive: true,
      });
    });

    test('should set default log level to info', () => {
      delete process.env.LOG_LEVEL;

      jest.resetModules();
      const testLogger = require('../utils/logger') as SecurityLogger;

      expect(testLogger.logLevel).toBe('info');
    });

    test('should respect LOG_LEVEL environment variable', () => {
      process.env.LOG_LEVEL = 'debug';

      jest.resetModules();
      const testLogger = require('../utils/logger') as SecurityLogger;

      expect(testLogger.logLevel).toBe('debug');
    });
  });

  describe('Log Level Filtering', () => {
    test('should filter out debug messages when log level is info', () => {
      process.env.LOG_LEVEL = 'info';

      jest.resetModules();
      const testLogger = require('../utils/logger') as SecurityLogger;
      consoleSpy.mockClear();
      mockAppendFileSync.mockClear();

      testLogger.debug('Debug message');
      expect(consoleSpy).not.toHaveBeenCalled();
      expect(mockAppendFileSync).not.toHaveBeenCalled();
    });

    test('should allow info messages when log level is info', () => {
      process.env.LOG_LEVEL = 'info';

      jest.resetModules();
      const testLogger = require('../utils/logger') as SecurityLogger;
      consoleSpy.mockClear();
      mockAppendFileSync.mockClear();

      testLogger.info('Info message');
      expect(consoleSpy).toHaveBeenCalled();
      expect(mockAppendFileSync).toHaveBeenCalled();
    });

    test('should allow error messages at any level', () => {
      process.env.LOG_LEVEL = 'error';

      jest.resetModules();
      const testLogger = require('../utils/logger') as SecurityLogger;
      consoleSpy.mockClear();
      mockAppendFileSync.mockClear();

      testLogger.error('Error message');
      expect(consoleSpy).toHaveBeenCalled();
      expect(mockAppendFileSync).toHaveBeenCalled();
    });
  });

  describe('Log Entry Formatting', () => {
    test('should format log entries with correct structure', () => {
      const testMessage = 'Test message';
      const testMeta = { userId: 123, action: 'test' };

      logger.info(testMessage, testMeta);

      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0] as string;
      const logEntry = JSON.parse(logCall) as Record<string, unknown>;

      expect(logEntry).toMatchObject({
        level: 'INFO',
        message: testMessage,
        userId: 123,
        action: 'test',
        pid: process.pid,
        hostname: os.hostname(),
      });

      expect(logEntry.timestamp).toBeDefined();
    });

    test('should handle empty meta object', () => {
      const testMessage = 'Test message without meta';

      logger.info(testMessage);

      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0] as string;
      const logEntry = JSON.parse(logCall) as Record<string, unknown>;

      expect(logEntry).toMatchObject({
        level: 'INFO',
        message: testMessage,
        pid: process.pid,
        hostname: os.hostname(),
      });
    });
  });

  describe('File Writing', () => {
    test('should write to daily app log file', () => {
      const today = new Date().toISOString().split('T')[0];

      logger.info('Test message');

      expect(mockAppendFileSync).toHaveBeenCalledWith(
        expect.stringContaining(`app-${today}.log`),
        expect.stringContaining('Test message')
      );
    });

    test('should write errors to both app log and error log', () => {
      const today = new Date().toISOString().split('T')[0];

      logger.error('Error message');

      // Should be called twice - once for app log, once for error log
      expect(mockAppendFileSync).toHaveBeenCalledTimes(2);

      // Check app log
      expect(mockAppendFileSync).toHaveBeenCalledWith(
        expect.stringContaining(`app-${today}.log`),
        expect.stringContaining('Error message')
      );

      // Check error log
      expect(mockAppendFileSync).toHaveBeenCalledWith(
        expect.stringContaining(`error-${today}.log`),
        expect.stringContaining('Error message')
      );
    });
  });

  describe('Security Logging', () => {
    beforeEach(() => {
      process.env.ENABLE_SECURITY_LOGGING = 'true';

      jest.resetModules();
      logger = require('../utils/logger') as SecurityLogger;
      consoleSpy.mockClear();
      mockAppendFileSync.mockClear();
    });

    test('should log authentication attempts', () => {
      const authDetails = {
        userId: 123,
        email: 'test@example.com',
        ip: '192.168.1.1',
      };

      logger.authAttempt(true, authDetails);

      expect(consoleSpy).toHaveBeenCalled();

      // Should write to both regular log and security log
      const today = new Date().toISOString().split('T')[0];
      expect(mockAppendFileSync).toHaveBeenCalledWith(
        expect.stringContaining(`security-${today}.log`),
        expect.stringContaining('AUTH_SUCCESS')
      );
    });

    test('should log suspicious activities', () => {
      const activity = 'Multiple failed login attempts';
      const details = {
        ip: '192.168.1.100',
        attempts: 5,
      };

      logger.suspiciousActivity(activity, details);

      expect(consoleSpy).toHaveBeenCalled();

      const today = new Date().toISOString().split('T')[0];
      expect(mockAppendFileSync).toHaveBeenCalledWith(
        expect.stringContaining(`security-${today}.log`),
        expect.stringContaining('SUSPICIOUS_ACTIVITY')
      );
    });

    test('should not log security events when disabled', () => {
      process.env.ENABLE_SECURITY_LOGGING = 'false';

      jest.resetModules();
      const testLogger = require('../utils/logger') as SecurityLogger;
      consoleSpy.mockClear();
      mockAppendFileSync.mockClear();

      const today = new Date().toISOString().split('T')[0];

      testLogger.securityEvent('TEST_EVENT', { test: true });

      // Should not write to security log when disabled
      expect(mockAppendFileSync).not.toHaveBeenCalledWith(
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

      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0] as string;
      const logEntry = JSON.parse(logCall) as Record<string, unknown>;

      expect(logEntry.level).toBe('ERROR');
      expect(logEntry.message).toBe(errorMessage);
      expect(logEntry.code).toBe(500);
    });

    test('should log warning messages', () => {
      const warnMessage = 'Test warning';

      logger.warn(warnMessage);

      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0] as string;
      const logEntry = JSON.parse(logCall) as Record<string, unknown>;

      expect(logEntry.level).toBe('WARN');
      expect(logEntry.message).toBe(warnMessage);
    });

    test('should log info messages', () => {
      const infoMessage = 'Test info';

      logger.info(infoMessage);

      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0] as string;
      const logEntry = JSON.parse(logCall) as Record<string, unknown>;

      expect(logEntry.level).toBe('INFO');
      expect(logEntry.message).toBe(infoMessage);
    });
  });

  describe('Edge Cases', () => {
    test('should handle logging with null meta', () => {
      expect(() => {
        logger.info('Test message', null as unknown as Record<string, unknown>);
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalled();
    });

    test('should handle logging with undefined meta', () => {
      expect(() => {
        logger.info('Test message', undefined);
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
