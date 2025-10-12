/**
 * Monitoring and Analytics Routes
 * 
 * Provides endpoints for accessing monitoring data, analytics, and system health.
 */

const express = require('express');
const router = express.Router();
const { monitoring } = require('../config/monitoring');
const externalServices = require('../config/external-services');
const { verifyToken, requireAdmin } = require('../middleware/auth');

/**
 * @route   GET /api/monitoring/dashboard
 * @desc    Get comprehensive monitoring dashboard
 * @access  Admin only
 */
router.get('/dashboard', verifyToken, requireAdmin, (req, res) => {
  try {
    const dashboard = monitoring.getDashboard();
    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard data',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/monitoring/performance
 * @desc    Get performance metrics
 * @access  Admin only
 */
router.get('/performance', verifyToken, requireAdmin, (req, res) => {
  try {
    const metrics = monitoring.performance.getMetrics();
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve performance metrics',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/monitoring/errors
 * @desc    Get error statistics
 * @access  Admin only
 */
router.get('/errors', verifyToken, requireAdmin, (req, res) => {
  try {
    const errorStats = monitoring.errors.getStats();
    res.json({
      success: true,
      data: errorStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve error statistics',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/monitoring/features
 * @desc    Get feature usage analytics
 * @access  Admin only
 */
router.get('/features', verifyToken, requireAdmin, (req, res) => {
  try {
    const featureStats = monitoring.features.getStats();
    res.json({
      success: true,
      data: featureStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve feature analytics',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/monitoring/features/:featureName
 * @desc    Get detailed feature analytics
 * @access  Admin only
 */
router.get('/features/:featureName', verifyToken, requireAdmin, (req, res) => {
  try {
    const { featureName } = req.params;
    const featureDetails = monitoring.features.getFeatureDetails(featureName);
    
    if (!featureDetails) {
      return res.status(404).json({
        success: false,
        message: 'Feature not found'
      });
    }

    res.json({
      success: true,
      data: featureDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve feature details',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/monitoring/engagement
 * @desc    Get user engagement analytics
 * @access  Admin only
 */
router.get('/engagement', verifyToken, requireAdmin, (req, res) => {
  try {
    const engagementStats = monitoring.engagement.getStats();
    res.json({
      success: true,
      data: engagementStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve engagement analytics',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/monitoring/health
 * @desc    Get system health status
 * @access  Public
 */
router.get('/health', (req, res) => {
  try {
    const health = monitoring.healthCheck();
    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json({
      success: true,
      data: health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/monitoring/health/detailed
 * @desc    Get detailed health status including external services
 * @access  Admin only
 */
router.get('/health/detailed', verifyToken, requireAdmin, async (req, res) => {
  try {
    const systemHealth = monitoring.healthCheck();
    const servicesHealth = await externalServices.healthCheckAll();
    
    res.json({
      success: true,
      data: {
        system: systemHealth,
        services: servicesHealth,
        overall: systemHealth.status === 'healthy' && servicesHealth.overall === 'healthy'
          ? 'healthy'
          : 'degraded'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Detailed health check failed',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/monitoring/services
 * @desc    Get external services statistics
 * @access  Admin only
 */
router.get('/services', verifyToken, requireAdmin, (req, res) => {
  try {
    const serviceStats = externalServices.getAllStats();
    res.json({
      success: true,
      data: serviceStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve service statistics',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/monitoring/alerts
 * @desc    Get recent alerts
 * @access  Admin only
 */
router.get('/alerts', verifyToken, requireAdmin, (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const alerts = monitoring.alerts.slice(-parseInt(limit));
    
    res.json({
      success: true,
      data: {
        alerts,
        total: monitoring.alerts.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve alerts',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/monitoring/reset
 * @desc    Reset monitoring metrics
 * @access  Admin only
 */
router.post('/reset', verifyToken, requireAdmin, (req, res) => {
  try {
    const { type } = req.body;

    switch (type) {
      case 'performance':
        monitoring.performance.reset();
        break;
      case 'errors':
        monitoring.errors.clear();
        break;
      case 'all':
        monitoring.performance.reset();
        monitoring.errors.clear();
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid reset type. Use: performance, errors, or all'
        });
    }

    res.json({
      success: true,
      message: `${type} metrics reset successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reset metrics',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/monitoring/track-feature
 * @desc    Track feature usage (for client-side tracking)
 * @access  Authenticated users
 */
router.post('/track-feature', verifyToken, (req, res) => {
  try {
    const { featureName, metadata } = req.body;
    
    if (!featureName) {
      return res.status(400).json({
        success: false,
        message: 'Feature name is required'
      });
    }

    monitoring.features.trackFeature(featureName, req.user.id, metadata);
    
    res.json({
      success: true,
      message: 'Feature usage tracked'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to track feature usage',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/monitoring/export
 * @desc    Export monitoring data
 * @access  Admin only
 */
router.get('/export', verifyToken, requireAdmin, (req, res) => {
  try {
    const { format = 'json' } = req.query;
    const dashboard = monitoring.getDashboard();

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=monitoring-${Date.now()}.json`);
      res.json(dashboard);
    } else if (format === 'csv') {
      // Simple CSV export for performance metrics
      const metrics = monitoring.performance.getMetrics();
      let csv = 'Metric,Value\n';
      csv += `Total Requests,${metrics.requests.total}\n`;
      csv += `Success Rate,${metrics.requests.successRate}\n`;
      csv += `Avg Response Time,${metrics.response.avgResponseTime}\n`;
      csv += `Min Response Time,${metrics.response.minResponseTime}\n`;
      csv += `Max Response Time,${metrics.response.maxResponseTime}\n`;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=monitoring-${Date.now()}.csv`);
      res.send(csv);
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid format. Use: json or csv'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to export monitoring data',
      error: error.message
    });
  }
});

module.exports = router;
