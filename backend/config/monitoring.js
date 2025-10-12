/**
 * Monitoring and Analytics Configuration Module
 * 
 * Provides application performance monitoring, error tracking, and analytics
 * functionality for the PCC Portal.
 */

const os = require('os');
const logger = require('./logger');

/**
 * Performance Metrics Collector
 */
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        success: 0,
        errors: 0,
        byEndpoint: new Map(),
        byMethod: new Map(),
        byStatusCode: new Map()
      },
      response: {
        times: [],
        avgResponseTime: 0,
        minResponseTime: Infinity,
        maxResponseTime: 0
      },
      system: {
        startTime: Date.now(),
        uptime: 0,
        memory: {},
        cpu: {}
      }
    };

    this.startTime = Date.now();
    this.requestTimings = new Map();
  }

  /**
   * Record request start
   */
  startRequest(requestId) {
    this.requestTimings.set(requestId, Date.now());
  }

  /**
   * Record request completion
   */
  endRequest(requestId, req, res) {
    const startTime = this.requestTimings.get(requestId);
    if (!startTime) return;

    const duration = Date.now() - startTime;
    this.requestTimings.delete(requestId);

    // Update metrics
    this.metrics.requests.total++;
    
    if (res.statusCode >= 200 && res.statusCode < 400) {
      this.metrics.requests.success++;
    } else if (res.statusCode >= 400) {
      this.metrics.requests.errors++;
    }

    // Track by endpoint
    const endpoint = `${req.method} ${req.route?.path || req.path}`;
    const endpointStats = this.metrics.requests.byEndpoint.get(endpoint) || { count: 0, totalTime: 0 };
    endpointStats.count++;
    endpointStats.totalTime += duration;
    this.metrics.requests.byEndpoint.set(endpoint, endpointStats);

    // Track by method
    const methodStats = this.metrics.requests.byMethod.get(req.method) || 0;
    this.metrics.requests.byMethod.set(req.method, methodStats + 1);

    // Track by status code
    const statusStats = this.metrics.requests.byStatusCode.get(res.statusCode) || 0;
    this.metrics.requests.byStatusCode.set(res.statusCode, statusStats + 1);

    // Update response times
    this.metrics.response.times.push(duration);
    if (this.metrics.response.times.length > 1000) {
      this.metrics.response.times.shift(); // Keep last 1000 requests
    }

    this.metrics.response.minResponseTime = Math.min(this.metrics.response.minResponseTime, duration);
    this.metrics.response.maxResponseTime = Math.max(this.metrics.response.maxResponseTime, duration);
    
    const sum = this.metrics.response.times.reduce((a, b) => a + b, 0);
    this.metrics.response.avgResponseTime = sum / this.metrics.response.times.length;
  }

  /**
   * Update system metrics
   */
  updateSystemMetrics() {
    this.metrics.system.uptime = Date.now() - this.startTime;
    this.metrics.system.memory = process.memoryUsage();
    this.metrics.system.cpu = process.cpuUsage();
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    this.updateSystemMetrics();

    return {
      requests: {
        total: this.metrics.requests.total,
        success: this.metrics.requests.success,
        errors: this.metrics.requests.errors,
        successRate: this.metrics.requests.total > 0
          ? ((this.metrics.requests.success / this.metrics.requests.total) * 100).toFixed(2) + '%'
          : 'N/A',
        byEndpoint: Object.fromEntries(
          Array.from(this.metrics.requests.byEndpoint.entries()).map(([endpoint, stats]) => [
            endpoint,
            {
              count: stats.count,
              avgTime: (stats.totalTime / stats.count).toFixed(2) + 'ms'
            }
          ])
        ),
        byMethod: Object.fromEntries(this.metrics.requests.byMethod),
        byStatusCode: Object.fromEntries(this.metrics.requests.byStatusCode)
      },
      response: {
        avgResponseTime: this.metrics.response.avgResponseTime.toFixed(2) + 'ms',
        minResponseTime: this.metrics.response.minResponseTime === Infinity 
          ? 'N/A' 
          : this.metrics.response.minResponseTime + 'ms',
        maxResponseTime: this.metrics.response.maxResponseTime === 0 
          ? 'N/A' 
          : this.metrics.response.maxResponseTime + 'ms'
      },
      system: {
        uptime: this.formatUptime(this.metrics.system.uptime),
        memory: {
          heapUsed: this.formatBytes(this.metrics.system.memory.heapUsed),
          heapTotal: this.formatBytes(this.metrics.system.memory.heapTotal),
          external: this.formatBytes(this.metrics.system.memory.external),
          rss: this.formatBytes(this.metrics.system.memory.rss)
        },
        cpu: {
          user: (this.metrics.system.cpu.user / 1000000).toFixed(2) + 's',
          system: (this.metrics.system.cpu.system / 1000000).toFixed(2) + 's'
        },
        platform: {
          type: os.type(),
          platform: os.platform(),
          arch: os.arch(),
          cpus: os.cpus().length,
          totalMemory: this.formatBytes(os.totalmem()),
          freeMemory: this.formatBytes(os.freemem())
        }
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Format uptime to human readable
   */
  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  /**
   * Reset metrics
   */
  reset() {
    this.metrics.requests = {
      total: 0,
      success: 0,
      errors: 0,
      byEndpoint: new Map(),
      byMethod: new Map(),
      byStatusCode: new Map()
    };
    this.metrics.response = {
      times: [],
      avgResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0
    };
  }

  /**
   * Create monitoring middleware
   */
  middleware() {
    return (req, res, next) => {
      const requestId = `${Date.now()}-${Math.random()}`;
      this.startRequest(requestId);

      // Capture response
      const originalSend = res.send;
      res.send = function(data) {
        res.send = originalSend;
        performanceMonitor.endRequest(requestId, req, res);
        return res.send(data);
      };

      next();
    };
  }
}

/**
 * Error Tracking
 */
class ErrorTracker {
  constructor() {
    this.errors = [];
    this.maxErrors = 100; // Keep last 100 errors
    this.errorCounts = new Map();
  }

  /**
   * Track error
   */
  trackError(error, context = {}) {
    const errorEntry = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      context,
      timestamp: new Date().toISOString()
    };

    this.errors.push(errorEntry);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Count error types
    const errorKey = `${error.name}: ${error.message}`;
    const count = this.errorCounts.get(errorKey) || 0;
    this.errorCounts.set(errorKey, count + 1);

    // Log error
    logger.error(error.message, {
      name: error.name,
      stack: error.stack,
      ...context
    });
  }

  /**
   * Get error statistics
   */
  getStats() {
    const errorsByType = {};
    this.errorCounts.forEach((count, error) => {
      errorsByType[error] = count;
    });

    return {
      totalErrors: this.errors.length,
      recentErrors: this.errors.slice(-10),
      errorsByType,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Clear errors
   */
  clear() {
    this.errors = [];
    this.errorCounts.clear();
  }
}

/**
 * Feature Usage Analytics
 */
class FeatureAnalytics {
  constructor() {
    this.features = new Map();
  }

  /**
   * Track feature usage
   */
  trackFeature(featureName, userId = null, metadata = {}) {
    const feature = this.features.get(featureName) || {
      name: featureName,
      usageCount: 0,
      uniqueUsers: new Set(),
      lastUsed: null,
      metadata: []
    };

    feature.usageCount++;
    if (userId) {
      feature.uniqueUsers.add(userId);
    }
    feature.lastUsed = new Date().toISOString();
    feature.metadata.push({
      timestamp: new Date().toISOString(),
      userId,
      ...metadata
    });

    // Keep only last 100 metadata entries
    if (feature.metadata.length > 100) {
      feature.metadata.shift();
    }

    this.features.set(featureName, feature);
  }

  /**
   * Get feature statistics
   */
  getStats() {
    const stats = {};
    
    this.features.forEach((feature, name) => {
      stats[name] = {
        usageCount: feature.usageCount,
        uniqueUsers: feature.uniqueUsers.size,
        lastUsed: feature.lastUsed
      };
    });

    return {
      features: stats,
      totalFeatures: this.features.size,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get detailed feature data
   */
  getFeatureDetails(featureName) {
    const feature = this.features.get(featureName);
    if (!feature) return null;

    return {
      name: feature.name,
      usageCount: feature.usageCount,
      uniqueUsers: feature.uniqueUsers.size,
      lastUsed: feature.lastUsed,
      recentUsage: feature.metadata.slice(-20)
    };
  }
}

/**
 * User Engagement Analytics
 */
class UserEngagementAnalytics {
  constructor() {
    this.sessions = new Map();
    this.dailyActiveUsers = new Set();
    this.monthlyActiveUsers = new Set();
  }

  /**
   * Track user session
   */
  trackSession(userId, action) {
    const session = this.sessions.get(userId) || {
      userId,
      actions: [],
      firstSeen: new Date().toISOString(),
      lastSeen: null
    };

    session.actions.push({
      action,
      timestamp: new Date().toISOString()
    });
    session.lastSeen = new Date().toISOString();

    this.sessions.set(userId, session);
    this.dailyActiveUsers.add(userId);
    this.monthlyActiveUsers.add(userId);
  }

  /**
   * Get engagement statistics
   */
  getStats() {
    return {
      activeSessions: this.sessions.size,
      dailyActiveUsers: this.dailyActiveUsers.size,
      monthlyActiveUsers: this.monthlyActiveUsers.size,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Reset daily counters
   */
  resetDaily() {
    this.dailyActiveUsers.clear();
  }

  /**
   * Reset monthly counters
   */
  resetMonthly() {
    this.monthlyActiveUsers.clear();
  }
}

/**
 * Monitoring Manager
 */
class MonitoringManager {
  constructor() {
    this.performance = new PerformanceMonitor();
    this.errors = new ErrorTracker();
    this.features = new FeatureAnalytics();
    this.engagement = new UserEngagementAnalytics();
    this.alerts = [];
  }

  /**
   * Get comprehensive dashboard data
   */
  getDashboard() {
    return {
      performance: this.performance.getMetrics(),
      errors: this.errors.getStats(),
      features: this.features.getStats(),
      engagement: this.engagement.getStats(),
      alerts: this.alerts.slice(-10),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Add alert
   */
  addAlert(level, message, details = {}) {
    const alert = {
      level, // 'info', 'warning', 'error', 'critical'
      message,
      details,
      timestamp: new Date().toISOString()
    };

    this.alerts.push(alert);
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }

    // Log alert
    const logLevel = level === 'critical' ? 'error' : level;
    if (logger[logLevel]) {
      logger[logLevel](message, details);
    } else {
      logger.info(message, details);
    }
  }

  /**
   * Health check
   */
  healthCheck() {
    const metrics = this.performance.getMetrics();
    const errorStats = this.errors.getStats();

    const health = {
      status: 'healthy',
      checks: {
        memory: 'healthy',
        errors: 'healthy',
        performance: 'healthy'
      },
      details: {}
    };

    // Check memory usage
    const memoryUsage = process.memoryUsage();
    const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    if (memoryUsagePercent > 90) {
      health.checks.memory = 'critical';
      health.status = 'unhealthy';
    } else if (memoryUsagePercent > 75) {
      health.checks.memory = 'warning';
      health.status = 'degraded';
    }
    health.details.memoryUsage = memoryUsagePercent.toFixed(2) + '%';

    // Check error rate
    const errorRate = metrics.requests.total > 0
      ? (metrics.requests.errors / metrics.requests.total) * 100
      : 0;
    if (errorRate > 10) {
      health.checks.errors = 'critical';
      health.status = 'unhealthy';
    } else if (errorRate > 5) {
      health.checks.errors = 'warning';
      health.status = 'degraded';
    }
    health.details.errorRate = errorRate.toFixed(2) + '%';

    // Check response time
    const avgResponseTime = parseFloat(metrics.response.avgResponseTime);
    if (avgResponseTime > 5000) {
      health.checks.performance = 'critical';
      health.status = 'unhealthy';
    } else if (avgResponseTime > 2000) {
      health.checks.performance = 'warning';
      health.status = 'degraded';
    }
    health.details.avgResponseTime = metrics.response.avgResponseTime;

    return health;
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();
const monitoring = new MonitoringManager();

module.exports = {
  monitoring,
  performanceMonitor,
  PerformanceMonitor,
  ErrorTracker,
  FeatureAnalytics,
  UserEngagementAnalytics
};
