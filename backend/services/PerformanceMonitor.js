/**
 * Performance Monitoring Service
 * Provides real-time performance monitoring and metrics collection
 */

const { performance } = require('perf_hooks');
const os = require('os');

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: [],
      apiEndpoints: {},
      systemResources: [],
      errors: [],
      slowOperations: []
    };
    
    this.thresholds = {
      slowRequest: 1000, // 1 second
      slowQuery: 100, // 100ms
      highCPU: 80, // 80%
      highMemory: 85 // 85%
    };
    
    this.startTime = Date.now();
  }
  
  /**
   * Track API request performance
   */
  trackRequest(req, res, duration) {
    const metric = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      timestamp: Date.now(),
      userAgent: req.get('user-agent'),
      ip: req.ip
    };
    
    this.metrics.requests.push(metric);
    
    // Track by endpoint
    const endpoint = `${req.method} ${req.path}`;
    if (!this.metrics.apiEndpoints[endpoint]) {
      this.metrics.apiEndpoints[endpoint] = {
        count: 0,
        totalDuration: 0,
        errors: 0,
        durations: []
      };
    }
    
    this.metrics.apiEndpoints[endpoint].count++;
    this.metrics.apiEndpoints[endpoint].totalDuration += duration;
    this.metrics.apiEndpoints[endpoint].durations.push(duration);
    
    if (res.statusCode >= 400) {
      this.metrics.apiEndpoints[endpoint].errors++;
    }
    
    // Flag slow requests
    if (duration > this.thresholds.slowRequest) {
      this.metrics.slowOperations.push({
        type: 'request',
        endpoint,
        duration,
        timestamp: Date.now()
      });
    }
    
    // Keep only last 1000 requests
    if (this.metrics.requests.length > 1000) {
      this.metrics.requests.shift();
    }
  }
  
  /**
   * Track database query performance
   */
  trackQuery(queryName, duration, success = true) {
    const metric = {
      query: queryName,
      duration,
      success,
      timestamp: Date.now()
    };
    
    // Flag slow queries
    if (duration > this.thresholds.slowQuery) {
      this.metrics.slowOperations.push({
        type: 'query',
        query: queryName,
        duration,
        timestamp: Date.now()
      });
    }
  }
  
  /**
   * Track errors
   */
  trackError(error, context = {}) {
    this.metrics.errors.push({
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now()
    });
    
    // Keep only last 100 errors
    if (this.metrics.errors.length > 100) {
      this.metrics.errors.shift();
    }
  }
  
  /**
   * Collect system resource metrics
   */
  collectSystemMetrics() {
    const cpuUsage = process.cpuUsage();
    const memUsage = process.memoryUsage();
    const systemMem = {
      total: os.totalmem(),
      free: os.freemem()
    };
    
    const metric = {
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      memory: {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external,
        rss: memUsage.rss,
        systemTotal: systemMem.total,
        systemFree: systemMem.free,
        usagePercent: ((systemMem.total - systemMem.free) / systemMem.total) * 100
      },
      uptime: process.uptime(),
      timestamp: Date.now()
    };
    
    this.metrics.systemResources.push(metric);
    
    // Keep only last 100 samples
    if (this.metrics.systemResources.length > 100) {
      this.metrics.systemResources.shift();
    }
    
    // Check thresholds
    if (metric.memory.usagePercent > this.thresholds.highMemory) {
      console.warn(`⚠️  High memory usage: ${metric.memory.usagePercent.toFixed(2)}%`);
    }
    
    return metric;
  }
  
  /**
   * Get performance summary
   */
  getSummary() {
    const now = Date.now();
    const uptime = (now - this.startTime) / 1000; // seconds
    
    // Calculate request statistics
    const totalRequests = this.metrics.requests.length;
    const successfulRequests = this.metrics.requests.filter(r => r.statusCode < 400).length;
    const errorRate = totalRequests > 0 ? ((totalRequests - successfulRequests) / totalRequests) * 100 : 0;
    
    // Calculate average response time
    const avgResponseTime = totalRequests > 0
      ? this.metrics.requests.reduce((sum, r) => sum + r.duration, 0) / totalRequests
      : 0;
    
    // Get endpoint statistics
    const endpointStats = Object.entries(this.metrics.apiEndpoints).map(([endpoint, stats]) => {
      const durations = stats.durations.sort((a, b) => a - b);
      return {
        endpoint,
        count: stats.count,
        avgDuration: stats.totalDuration / stats.count,
        p95: durations[Math.floor(durations.length * 0.95)] || 0,
        errorRate: (stats.errors / stats.count) * 100
      };
    }).sort((a, b) => b.count - a.count).slice(0, 10);
    
    // Get latest system metrics
    const latestSystemMetrics = this.metrics.systemResources[this.metrics.systemResources.length - 1] || {};
    
    return {
      uptime,
      requests: {
        total: totalRequests,
        successful: successfulRequests,
        errorRate: errorRate.toFixed(2),
        avgResponseTime: avgResponseTime.toFixed(2),
        requestsPerSecond: (totalRequests / uptime).toFixed(2)
      },
      topEndpoints: endpointStats,
      slowOperations: this.metrics.slowOperations.slice(-10),
      recentErrors: this.metrics.errors.slice(-5),
      system: {
        memoryUsage: latestSystemMetrics.memory?.usagePercent?.toFixed(2) || 0,
        heapUsed: latestSystemMetrics.memory?.heapUsed || 0,
        uptime: latestSystemMetrics.uptime || 0
      }
    };
  }
  
  /**
   * Get detailed metrics
   */
  getDetailedMetrics() {
    return {
      requests: this.metrics.requests,
      apiEndpoints: this.metrics.apiEndpoints,
      systemResources: this.metrics.systemResources,
      errors: this.metrics.errors,
      slowOperations: this.metrics.slowOperations
    };
  }
  
  /**
   * Reset metrics
   */
  reset() {
    this.metrics = {
      requests: [],
      apiEndpoints: {},
      systemResources: [],
      errors: [],
      slowOperations: []
    };
    this.startTime = Date.now();
  }
  
  /**
   * Start periodic system monitoring
   */
  startMonitoring(interval = 60000) { // Default: 1 minute
    this.monitoringInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, interval);
    
    console.log(`✅ Performance monitoring started (interval: ${interval}ms)`);
  }
  
  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      console.log('✅ Performance monitoring stopped');
    }
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Express middleware for automatic request tracking
function performanceMiddleware(req, res, next) {
  const start = performance.now();
  
  // Capture response
  const originalSend = res.send;
  res.send = function(data) {
    const duration = performance.now() - start;
    performanceMonitor.trackRequest(req, res, duration);
    originalSend.call(this, data);
  };
  
  next();
}

module.exports = {
  PerformanceMonitor,
  performanceMonitor,
  performanceMiddleware
};
