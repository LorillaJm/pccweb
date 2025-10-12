/**
 * Performance Monitoring API Routes
 * Provides endpoints for accessing performance metrics
 */

const express = require('express');
const router = express.Router();
const { performanceMonitor } = require('../services/PerformanceMonitor');
const { authenticateToken, requireRole } = require('../middleware/auth');

/**
 * Get performance summary
 * GET /api/performance/summary
 */
router.get('/summary', authenticateToken, requireRole(['admin']), (req, res) => {
  try {
    const summary = performanceMonitor.getSummary();
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error getting performance summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get performance summary'
    });
  }
});

/**
 * Get detailed metrics
 * GET /api/performance/metrics
 */
router.get('/metrics', authenticateToken, requireRole(['admin']), (req, res) => {
  try {
    const metrics = performanceMonitor.getDetailedMetrics();
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error getting detailed metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get detailed metrics'
    });
  }
});

/**
 * Get system health status
 * GET /api/performance/health
 */
router.get('/health', (req, res) => {
  try {
    const summary = performanceMonitor.getSummary();
    
    // Determine health status
    const health = {
      status: 'healthy',
      checks: {
        uptime: {
          status: summary.uptime > 0 ? 'pass' : 'fail',
          value: summary.uptime
        },
        errorRate: {
          status: parseFloat(summary.requests.errorRate) < 5 ? 'pass' : 'warn',
          value: summary.requests.errorRate
        },
        responseTime: {
          status: parseFloat(summary.requests.avgResponseTime) < 1000 ? 'pass' : 'warn',
          value: summary.requests.avgResponseTime
        },
        memory: {
          status: parseFloat(summary.system.memoryUsage) < 85 ? 'pass' : 'warn',
          value: summary.system.memoryUsage
        }
      },
      timestamp: new Date().toISOString()
    };
    
    // Set overall status
    const hasFailures = Object.values(health.checks).some(check => check.status === 'fail');
    const hasWarnings = Object.values(health.checks).some(check => check.status === 'warn');
    
    if (hasFailures) {
      health.status = 'unhealthy';
    } else if (hasWarnings) {
      health.status = 'degraded';
    }
    
    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json({
      success: true,
      data: health
    });
  } catch (error) {
    console.error('Error checking health:', error);
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      message: 'Health check failed'
    });
  }
});

/**
 * Reset performance metrics
 * POST /api/performance/reset
 */
router.post('/reset', authenticateToken, requireRole(['admin']), (req, res) => {
  try {
    performanceMonitor.reset();
    res.json({
      success: true,
      message: 'Performance metrics reset successfully'
    });
  } catch (error) {
    console.error('Error resetting metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset metrics'
    });
  }
});

/**
 * Get slow operations
 * GET /api/performance/slow-operations
 */
router.get('/slow-operations', authenticateToken, requireRole(['admin']), (req, res) => {
  try {
    const metrics = performanceMonitor.getDetailedMetrics();
    res.json({
      success: true,
      data: metrics.slowOperations
    });
  } catch (error) {
    console.error('Error getting slow operations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get slow operations'
    });
  }
});

/**
 * Get error logs
 * GET /api/performance/errors
 */
router.get('/errors', authenticateToken, requireRole(['admin']), (req, res) => {
  try {
    const metrics = performanceMonitor.getDetailedMetrics();
    res.json({
      success: true,
      data: metrics.errors
    });
  } catch (error) {
    console.error('Error getting error logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get error logs'
    });
  }
});

module.exports = router;
