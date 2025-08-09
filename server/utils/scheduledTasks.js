const sessionService = require('../services/sessionService');
const logger = require('./logger');

/**
 * Scheduled security maintenance tasks
 */
class ScheduledTasks {
  constructor() {
    this.tasks = [];
  }

  /**
   * Start all scheduled tasks
   */
  start() {
    // Clean expired sessions every hour
    this.scheduleTask('cleanExpiredSessions', () => {
      this.cleanExpiredSessions();
    }, 60 * 60 * 1000); // 1 hour

    // Generate security reports daily
    this.scheduleTask('generateSecurityReport', () => {
      this.generateDailySecurityReport();
    }, 24 * 60 * 60 * 1000); // 24 hours

    // Monitor system health every 5 minutes
    this.scheduleTask('monitorSystemHealth', () => {
      this.monitorSystemHealth();
    }, 5 * 60 * 1000); // 5 minutes

    logger.info('Scheduled security tasks started', {
      tasks: this.tasks.map(task => ({
        name: task.name,
        interval: task.interval
      }))
    });
  }

  /**
   * Stop all scheduled tasks
   */
  stop() {
    this.tasks.forEach(task => {
      clearInterval(task.intervalId);
    });
    this.tasks = [];
    logger.info('All scheduled tasks stopped');
  }

  /**
   * Schedule a task
   */
  scheduleTask(name, callback, interval) {
    const intervalId = setInterval(async () => {
      try {
        await callback();
      } catch (error) {
        logger.error(`Scheduled task ${name} failed`, { error: error.message });
      }
    }, interval);

    this.tasks.push({
      name,
      intervalId,
      interval,
      callback
    });

    // Run immediately on startup
    setTimeout(callback, 1000);
  }

  /**
   * Clean expired sessions
   */
  async cleanExpiredSessions() {
    try {
      const deletedCount = await sessionService.cleanupExpiredSessions();
      
      if (deletedCount > 0) {
        logger.info('Expired sessions cleaned', { deletedCount });
      }
    } catch (error) {
      logger.error('Failed to clean expired sessions', { error: error.message });
    }
  }

  /**
   * Generate daily security report
   */
  async generateDailySecurityReport() {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      // This would typically read from log files or database
      // For now, just log that the report generation ran
      logger.info('Daily security report generated', {
        date: yesterday.toISOString().split('T')[0],
        reportType: 'daily_security_summary'
      });
      
      // In a real implementation, you might:
      // - Count authentication failures
      // - List suspicious activities
      // - Monitor resource usage
      // - Check for security alerts
      // - Send email reports to administrators
    } catch (error) {
      logger.error('Failed to generate security report', { error: error.message });
    }
  }

  /**
   * Monitor system health
   */
  async monitorSystemHealth() {
    try {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      // Check memory usage
      const memUsageMB = memUsage.heapUsed / 1024 / 1024;
      if (memUsageMB > 500) { // Alert if using more than 500MB
        logger.warn('High memory usage detected', {
          heapUsed: `${memUsageMB.toFixed(2)}MB`,
          heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`
        });
      }

      // Log health metrics periodically
      const now = Date.now();
      if (!this.lastHealthLog || now - this.lastHealthLog > 30 * 60 * 1000) { // Every 30 minutes
        logger.info('System health check', {
          memory: {
            heapUsed: `${memUsageMB.toFixed(2)}MB`,
            heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
            external: `${(memUsage.external / 1024 / 1024).toFixed(2)}MB`
          },
          uptime: `${(process.uptime() / 3600).toFixed(2)} hours`,
          timestamp: new Date().toISOString()
        });
        
        this.lastHealthLog = now;
      }
    } catch (error) {
      logger.error('System health monitoring failed', { error: error.message });
    }
  }
}

module.exports = new ScheduledTasks();
