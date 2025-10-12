const express = require('express');
const router = express.Router();
const redisConnection = require('../config/redis');
const { getQueueStats } = require('../config/queue');
const socketManager = require('../config/socket');
const taskScheduler = require('../config/scheduler');
const db = require('../config/database-adapter');

// Basic health check
router.get('/', async (req, res) => {
  try {
    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      services: {
        api: true,
        database: false,
        redis: false,
        queues: false,
        websocket: false,
        scheduler: false
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };

    // Check database
    try {
      await db.query('SELECT 1');
      health.services.database = true;
    } catch (error) {
      console.error('Database health check failed:', error.message);
    }

    // Check Redis
    try {
      await redisConnection.set('health_check', Date.now(), 60);
      health.services.redis = true;
    } catch (error) {
      console.error('Redis health check failed:', error.message);
    }

    // Check queues
    try {
      const queueStats = await getQueueStats();
      health.services.queues = queueStats !== null;
      health.queueStats = queueStats;
    } catch (error) {
      console.error('Queue health check failed:', error.message);
    }

    // Check WebSocket
    try {
      const connectedUsers = socketManager.getConnectedUsersCount();
      health.services.websocket = true;
      health.connectedUsers = connectedUsers;
    } catch (error) {
      console.error('WebSocket health check failed:', error.message);
    }

    // Check scheduler
    try {
      const taskStatus = taskScheduler.getTaskStatus();
      health.services.scheduler = Object.keys(taskStatus).length > 0;
      health.scheduledTasks = taskStatus;
    } catch (error) {
      console.error('Scheduler health check failed:', error.message);
    }

    // Determine overall status
    const failedServices = Object.entries(health.services)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (failedServices.length > 0) {
      health.status = 'DEGRADED';
      health.failedServices = failedServices;
    }

    // Set appropriate HTTP status
    const httpStatus = health.status === 'OK' ? 200 : 503;
    
    res.status(httpStatus).json(health);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Detailed system information (admin only)
router.get('/detailed', async (req, res) => {
  try {
    // This would typically require admin authentication
    // For now, we'll provide basic system info
    
    const systemInfo = {
      timestamp: new Date().toISOString(),
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        port: process.env.PORT,
        redisHost: process.env.REDIS_HOST,
        frontendUrl: process.env.FRONTEND_URL
      }
    };

    // Get Redis info
    try {
      const redisClient = redisConnection.getClient();
      const redisInfo = await redisClient.info();
      systemInfo.redis = {
        connected: redisConnection.isConnected,
        info: redisInfo
      };
    } catch (error) {
      systemInfo.redis = { connected: false, error: error.message };
    }

    // Get queue statistics
    try {
      const queueStats = await getQueueStats();
      systemInfo.queues = queueStats;
    } catch (error) {
      systemInfo.queues = { error: error.message };
    }

    // Get WebSocket statistics
    try {
      systemInfo.websocket = {
        connectedUsers: socketManager.getConnectedUsersCount(),
        usersByRole: {
          students: socketManager.getConnectedUsersByRole('student').length,
          faculty: socketManager.getConnectedUsersByRole('faculty').length,
          admin: socketManager.getConnectedUsersByRole('admin').length
        }
      };
    } catch (error) {
      systemInfo.websocket = { error: error.message };
    }

    res.json(systemInfo);
  } catch (error) {
    console.error('Detailed health check error:', error);
    res.status(500).json({
      error: 'Failed to get system information',
      message: error.message
    });
  }
});

// Test Redis connection
router.post('/test/redis', async (req, res) => {
  try {
    const testKey = `test:${Date.now()}`;
    const testValue = { message: 'Redis test', timestamp: new Date() };
    
    // Set value
    await redisConnection.set(testKey, testValue, 60);
    
    // Get value
    const retrieved = await redisConnection.get(testKey);
    
    // Clean up
    await redisConnection.del(testKey);
    
    res.json({
      success: true,
      message: 'Redis connection test successful',
      testData: { sent: testValue, received: retrieved }
    });
  } catch (error) {
    console.error('Redis test error:', error);
    res.status(500).json({
      success: false,
      error: 'Redis connection test failed',
      message: error.message
    });
  }
});

// Test WebSocket connection
router.post('/test/websocket', async (req, res) => {
  try {
    const testMessage = {
      type: 'test',
      message: 'WebSocket test message',
      timestamp: new Date()
    };
    
    // Broadcast test message
    await socketManager.broadcast('system:test', testMessage);
    
    res.json({
      success: true,
      message: 'WebSocket test message broadcasted',
      connectedUsers: socketManager.getConnectedUsersCount()
    });
  } catch (error) {
    console.error('WebSocket test error:', error);
    res.status(500).json({
      success: false,
      error: 'WebSocket test failed',
      message: error.message
    });
  }
});

module.exports = router;