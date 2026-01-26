/**
 * Logger interface for type safety
 */
interface Logger {
  error(message: string, meta?: object): void;
  warn(message: string, meta?: object): void;
  info(message: string, meta?: object): void;
}

/**
 * Session service interface for type safety
 */
interface SessionService {
  cleanupExpiredSessions(): Promise<number>;
}

/**
 * Scheduled task definition
 */
interface ScheduledTask {
  name: string;
  intervalId: ReturnType<typeof setInterval>;
  interval: number;
  callback: () => Promise<void> | void;
}

/**
 * Scheduled security maintenance tasks
 */
class ScheduledTasks {
  private tasks: ScheduledTask[];
  private lastHealthLog: number | null;

  constructor() {
    this.tasks = [];
    this.lastHealthLog = null;
  }

  /**
   * Start all scheduled tasks
   */
  start(): void {
    const logger: Logger = require('./logger');

    // Clean expired sessions every hour
    this.scheduleTask(
      'cleanExpiredSessions',
      () => {
        this.cleanExpiredSessions();
      },
      60 * 60 * 1000
    ); // 1 hour

    // Generate security reports daily
    this.scheduleTask(
      'generateSecurityReport',
      () => {
        this.generateDailySecurityReport();
      },
      24 * 60 * 60 * 1000
    ); // 24 hours

    // Monitor system health every 5 minutes
    this.scheduleTask(
      'monitorSystemHealth',
      () => {
        this.monitorSystemHealth();
      },
      5 * 60 * 1000
    ); // 5 minutes

    logger.info('Scheduled security tasks started', {
      tasks: this.tasks.map((task) => ({
        name: task.name,
        interval: task.interval,
      })),
    });
  }

  /**
   * Stop all scheduled tasks
   */
  stop(): void {
    const logger: Logger = require('./logger');

    this.tasks.forEach((task) => {
      clearInterval(task.intervalId);
    });
    this.tasks = [];
    logger.info('All scheduled tasks stopped');
  }

  /**
   * Schedule a task
   */
  scheduleTask(name: string, callback: () => Promise<void> | void, interval: number): void {
    const logger: Logger = require('./logger');

    const intervalId = setInterval(async () => {
      try {
        await callback();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Scheduled task ${name} failed`, { error: errorMessage });
      }
    }, interval);

    this.tasks.push({
      name,
      intervalId,
      interval,
      callback,
    });

    // Run immediately on startup
    setTimeout(callback, 1000);
  }

  /**
   * Clean expired sessions
   */
  async cleanExpiredSessions(): Promise<void> {
    const logger: Logger = require('./logger');
    const sessionService: SessionService = require('../services/sessionService');

    try {
      const deletedCount = await sessionService.cleanupExpiredSessions();

      if (deletedCount > 0) {
        logger.info('Expired sessions cleaned', { deletedCount });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Failed to clean expired sessions', { error: errorMessage });
    }
  }

  /**
   * Generate daily security report
   */
  async generateDailySecurityReport(): Promise<void> {
    const logger: Logger = require('./logger');

    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      // This would typically read from log files or database
      // For now, just log that the report generation ran
      logger.info('Daily security report generated', {
        date: yesterday.toISOString().split('T')[0],
        reportType: 'daily_security_summary',
      });

      // In a real implementation, you might:
      // - Count authentication failures
      // - List suspicious activities
      // - Monitor resource usage
      // - Check for security alerts
      // - Send email reports to administrators
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Failed to generate security report', { error: errorMessage });
    }
  }

  /**
   * Monitor system health
   */
  async monitorSystemHealth(): Promise<void> {
    const logger: Logger = require('./logger');

    try {
      const memUsage = process.memoryUsage();

      // Check memory usage
      const memUsageMB = memUsage.heapUsed / 1024 / 1024;
      if (memUsageMB > 500) {
        // Alert if using more than 500MB
        logger.warn('High memory usage detected', {
          heapUsed: `${memUsageMB.toFixed(2)}MB`,
          heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
        });
      }

      // Log health metrics periodically
      const now = Date.now();
      if (!this.lastHealthLog || now - this.lastHealthLog > 30 * 60 * 1000) {
        // Every 30 minutes
        logger.info('System health check', {
          memory: {
            heapUsed: `${memUsageMB.toFixed(2)}MB`,
            heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
            external: `${(memUsage.external / 1024 / 1024).toFixed(2)}MB`,
          },
          uptime: `${(process.uptime() / 3600).toFixed(2)} hours`,
          timestamp: new Date().toISOString(),
        });

        this.lastHealthLog = now;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('System health monitoring failed', { error: errorMessage });
    }
  }
}

module.exports = new ScheduledTasks();
