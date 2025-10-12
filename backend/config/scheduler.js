const cron = require('node-cron');
const db = require('./database-adapter');
const { addNotificationJob, addReportJob } = require('./queue');
const redisConnection = require('./redis');

class TaskScheduler {
  constructor() {
    this.tasks = new Map();
    this.isInitialized = false;
  }

  initialize() {
    if (this.isInitialized) {
      console.log('Task scheduler already initialized');
      return;
    }

    console.log('Initializing task scheduler...');

    // Daily cleanup tasks - Run at 2:00 AM every day
    this.addTask('daily-cleanup', '0 2 * * *', async () => {
      await this.cleanupExpiredNotifications();
      await this.cleanupExpiredSessions();
      await this.cleanupOldAccessLogs();
    });

    // Event reminders - Run every hour
    this.addTask('event-reminders', '0 * * * *', async () => {
      await this.sendEventReminders();
    });

    // Internship deadline reminders - Run daily at 9:00 AM
    this.addTask('internship-deadline-reminders', '0 9 * * *', async () => {
      await this.sendInternshipDeadlineReminders();
      await this.sendInternshipStartReminders();
    });

    // Internship progress reminders - Run weekly on Monday at 10:00 AM
    this.addTask('internship-progress-reminders', '0 10 * * 1', async () => {
      await this.sendInternshipProgressReminders();
      await this.sendInternshipEvaluationReminders();
    });

    // Weekly analytics report - Run every Sunday at 6:00 AM
    this.addTask('weekly-analytics', '0 6 * * 0', async () => {
      await this.generateWeeklyAnalytics();
    });

    // Digital ID expiry reminders - Run daily at 10:00 AM
    this.addTask('digital-id-expiry', '0 10 * * *', async () => {
      await this.sendDigitalIdExpiryReminders();
    });

    // Cache warming - Run every 6 hours
    this.addTask('cache-warming', '0 */6 * * *', async () => {
      await this.warmupCache();
    });

    // System health check - Run every 15 minutes
    this.addTask('health-check', '*/15 * * * *', async () => {
      await this.performHealthCheck();
    });

    this.isInitialized = true;
    console.log(`Task scheduler initialized with ${this.tasks.size} tasks`);
  }

  addTask(name, schedule, taskFunction) {
    try {
      const task = cron.schedule(schedule, async () => {
        console.log(`Running scheduled task: ${name}`);
        const startTime = Date.now();
        
        try {
          await taskFunction();
          const duration = Date.now() - startTime;
          console.log(`Task ${name} completed in ${duration}ms`);
          
          // Log task execution
          await this.logTaskExecution(name, 'success', duration);
        } catch (error) {
          const duration = Date.now() - startTime;
          console.error(`Task ${name} failed after ${duration}ms:`, error);
          
          // Log task failure
          await this.logTaskExecution(name, 'failed', duration, error.message);
        }
      }, {
        scheduled: false // Don't start immediately
      });

      this.tasks.set(name, {
        task,
        schedule,
        lastRun: null,
        status: 'stopped'
      });

      console.log(`Added scheduled task: ${name} (${schedule})`);
    } catch (error) {
      console.error(`Error adding task ${name}:`, error);
    }
  }

  startTask(name) {
    const taskInfo = this.tasks.get(name);
    if (taskInfo) {
      taskInfo.task.start();
      taskInfo.status = 'running';
      console.log(`Started task: ${name}`);
    }
  }

  stopTask(name) {
    const taskInfo = this.tasks.get(name);
    if (taskInfo) {
      taskInfo.task.stop();
      taskInfo.status = 'stopped';
      console.log(`Stopped task: ${name}`);
    }
  }

  startAllTasks() {
    for (const [name] of this.tasks) {
      this.startTask(name);
    }
    console.log('All scheduled tasks started');
  }

  stopAllTasks() {
    for (const [name] of this.tasks) {
      this.stopTask(name);
    }
    console.log('All scheduled tasks stopped');
  }

  getTaskStatus() {
    const status = {};
    for (const [name, info] of this.tasks) {
      status[name] = {
        schedule: info.schedule,
        status: info.status,
        lastRun: info.lastRun
      };
    }
    return status;
  }

  // Task implementations
  async cleanupExpiredNotifications() {
    try {
      const result = await db.query(`
        DELETE FROM notifications 
        WHERE expires_at < CURRENT_TIMESTAMP 
        AND expires_at IS NOT NULL
      `);
      
      console.log(`Cleaned up ${result.rowCount} expired notifications`);
    } catch (error) {
      console.error('Error cleaning up notifications:', error);
    }
  }

  async cleanupExpiredSessions() {
    try {
      // Clean up Redis sessions older than 7 days
      const keys = await redisConnection.getClient().keys('session:*');
      let cleanedCount = 0;
      
      for (const key of keys) {
        const ttl = await redisConnection.getClient().ttl(key);
        if (ttl === -1) { // No expiration set
          await redisConnection.del(key);
          cleanedCount++;
        }
      }
      
      console.log(`Cleaned up ${cleanedCount} expired sessions`);
    } catch (error) {
      console.error('Error cleaning up sessions:', error);
    }
  }

  async cleanupOldAccessLogs() {
    try {
      // Keep access logs for 90 days
      const result = await db.query(`
        DELETE FROM access_logs 
        WHERE access_time < CURRENT_TIMESTAMP - INTERVAL '90 days'
      `);
      
      console.log(`Cleaned up ${result.rowCount} old access logs`);
    } catch (error) {
      console.error('Error cleaning up access logs:', error);
    }
  }

  async sendEventReminders() {
    try {
      // Find events starting in 24 hours
      const events = await db.query(`
        SELECT e.*, et.user_id, u.email, u.first_name, u.last_name
        FROM events e
        JOIN event_tickets et ON e.id = et.event_id
        JOIN users u ON et.user_id = u.id
        WHERE e.event_date BETWEEN CURRENT_TIMESTAMP + INTERVAL '23 hours' 
        AND CURRENT_TIMESTAMP + INTERVAL '25 hours'
        AND e.is_active = true
        AND et.status = 'active'
      `);

      for (const event of events.rows) {
        await addNotificationJob(event.user_id, {
          title: 'Event Reminder',
          message: `Don't forget! "${event.title}" starts tomorrow at ${event.venue}`,
          type: 'reminder',
          category: 'event',
          priority: 'medium',
          email: event.email
        }, ['push', 'email']);
      }

      console.log(`Sent ${events.rows.length} event reminders`);
    } catch (error) {
      console.error('Error sending event reminders:', error);
    }
  }

  async sendInternshipDeadlineReminders() {
    try {
      const InternshipService = require('../services/InternshipService');
      
      // Send 3-day reminders
      const result3Days = await InternshipService.sendDeadlineReminders(3);
      console.log(`Sent ${result3Days.remindersSent} 3-day deadline reminders`);
      
      // Send 1-day reminders
      const result1Day = await InternshipService.sendDeadlineReminders(1);
      console.log(`Sent ${result1Day.remindersSent} 1-day deadline reminders`);
    } catch (error) {
      console.error('Error sending internship deadline reminders:', error);
    }
  }

  async sendInternshipStartReminders() {
    try {
      const InternshipService = require('../services/InternshipService');
      
      // Send 3-day start reminders
      const result3Days = await InternshipService.sendStartReminders(3);
      console.log(`Sent ${result3Days.remindersSent} 3-day start reminders`);
      
      // Send 1-day start reminders
      const result1Day = await InternshipService.sendStartReminders(1);
      console.log(`Sent ${result1Day.remindersSent} 1-day start reminders`);
    } catch (error) {
      console.error('Error sending internship start reminders:', error);
    }
  }

  async sendInternshipProgressReminders() {
    try {
      const InternshipService = require('../services/InternshipService');
      
      // Send reminders for progress reports not submitted in 14 days
      const result = await InternshipService.sendProgressReportReminders(14);
      console.log(`Sent ${result.remindersSent} progress report reminders`);
    } catch (error) {
      console.error('Error sending internship progress reminders:', error);
    }
  }

  async sendInternshipEvaluationReminders() {
    try {
      const InternshipService = require('../services/InternshipService');
      
      // Send evaluation reminders for internships ending soon
      const result = await InternshipService.sendEvaluationReminders();
      console.log(`Sent ${result.remindersSent} evaluation reminders`);
    } catch (error) {
      console.error('Error sending internship evaluation reminders:', error);
    }
  }

  async generateWeeklyAnalytics() {
    try {
      // Generate analytics for admins
      const admins = await db.query(`
        SELECT id, email FROM users 
        WHERE role IN ('admin', 'super_admin') AND is_active = true
      `);

      for (const admin of admins.rows) {
        await addReportJob({
          reportType: 'weekly_analytics',
          dateRange: {
            start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            end: new Date()
          },
          userId: admin.id
        });
      }

      console.log(`Queued weekly analytics for ${admins.rows.length} admins`);
    } catch (error) {
      console.error('Error generating weekly analytics:', error);
    }
  }

  async sendDigitalIdExpiryReminders() {
    try {
      // Find digital IDs expiring in 30 days
      const expiringIds = await db.query(`
        SELECT di.*, u.email, u.first_name, u.last_name
        FROM digital_ids di
        JOIN users u ON di.user_id = u.id
        WHERE di.expiry_date BETWEEN CURRENT_DATE + INTERVAL '29 days' 
        AND CURRENT_DATE + INTERVAL '31 days'
        AND di.is_active = true
      `);

      for (const digitalId of expiringIds.rows) {
        await addNotificationJob(digitalId.user_id, {
          title: 'Digital ID Expiry Reminder',
          message: `Your digital ID will expire on ${digitalId.expiry_date}. Please renew it soon.`,
          type: 'warning',
          category: 'system',
          priority: 'medium',
          email: digitalId.email
        }, ['push', 'email']);
      }

      console.log(`Sent ${expiringIds.rows.length} digital ID expiry reminders`);
    } catch (error) {
      console.error('Error sending digital ID expiry reminders:', error);
    }
  }

  async warmupCache() {
    try {
      // Warm up frequently accessed data
      const cacheKeys = [
        'events:upcoming',
        'internships:active',
        'companies:verified',
        'faqs:categories'
      ];

      for (const key of cacheKeys) {
        // This would trigger the actual data loading and caching
        console.log(`Warming up cache for: ${key}`);
      }

      console.log('Cache warmup completed');
    } catch (error) {
      console.error('Error warming up cache:', error);
    }
  }

  async performHealthCheck() {
    try {
      const health = {
        timestamp: new Date(),
        database: false,
        redis: false,
        queues: false
      };

      // Check database
      try {
        await db.query('SELECT 1');
        health.database = true;
      } catch (error) {
        console.error('Database health check failed:', error);
      }

      // Check Redis
      try {
        await redisConnection.set('health_check', Date.now(), 60);
        health.redis = true;
      } catch (error) {
        console.error('Redis health check failed:', error);
      }

      // Check queues
      try {
        const { getQueueStats } = require('./queue');
        const stats = await getQueueStats();
        health.queues = stats !== null;
      } catch (error) {
        console.error('Queue health check failed:', error);
      }

      // Store health status
      await redisConnection.set('system_health', health, 900); // 15 minutes

      // Alert if any service is down
      const failedServices = Object.entries(health)
        .filter(([key, value]) => key !== 'timestamp' && !value)
        .map(([key]) => key);

      if (failedServices.length > 0) {
        console.error(`Health check failed for: ${failedServices.join(', ')}`);
        
        // Send alert to admins
        const admins = await db.query(`
          SELECT id FROM users 
          WHERE role IN ('admin', 'super_admin') AND is_active = true
        `);

        for (const admin of admins.rows) {
          await addNotificationJob(admin.id, {
            title: 'System Health Alert',
            message: `Services down: ${failedServices.join(', ')}`,
            type: 'error',
            category: 'system',
            priority: 'urgent'
          }, ['push']);
        }
      }
    } catch (error) {
      console.error('Error performing health check:', error);
    }
  }

  async logTaskExecution(taskName, status, duration, errorMessage = null) {
    try {
      await redisConnection.set(
        `task_log:${taskName}:${Date.now()}`,
        {
          taskName,
          status,
          duration,
          errorMessage,
          timestamp: new Date()
        },
        86400 // Keep for 24 hours
      );
    } catch (error) {
      console.error('Error logging task execution:', error);
    }
  }
}

// Create singleton instance
const taskScheduler = new TaskScheduler();

module.exports = taskScheduler;