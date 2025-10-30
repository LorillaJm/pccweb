const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const redisConnection = require('./redis');

class SocketManager {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map();
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.SOCKET_IO_CORS_ORIGIN || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: (process.env.SOCKET_IO_TRANSPORTS || 'websocket,polling').split(',')
    });

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        
        // Store user connection info in Redis
        await redisConnection.set(`socket:${socket.userId}`, socket.id, 3600);
        
        next();
      } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`User ${socket.userId} connected with socket ${socket.id}`);
      
      // Store connection with enhanced session info
      this.connectedUsers.set(socket.userId, {
        socketId: socket.id,
        connectedAt: new Date(),
        role: socket.userRole,
        lastActivity: new Date(),
        reconnectCount: 0
      });

      // Join user-specific room
      socket.join(`user:${socket.userId}`);
      
      // Join role-specific rooms
      socket.join(`role:${socket.userRole}`);

      // Send initial connection data
      this.sendInitialData(socket);

      // Handle heartbeat for connection monitoring
      socket.on('heartbeat', () => {
        const userConnection = this.connectedUsers.get(socket.userId);
        if (userConnection) {
          userConnection.lastActivity = new Date();
          this.connectedUsers.set(socket.userId, userConnection);
        }
        socket.emit('heartbeat-ack');
      });

      // Handle reconnection
      socket.on('reconnect', () => {
        const userConnection = this.connectedUsers.get(socket.userId);
        if (userConnection) {
          userConnection.reconnectCount += 1;
          userConnection.lastActivity = new Date();
          this.connectedUsers.set(socket.userId, userConnection);
        }
        
        // Resend any missed notifications
        this.sendMissedNotifications(socket);
      });

      // Handle chatbot conversations
      socket.on('chatbot:message', async (data) => {
        try {
          const { message, sessionId } = data;
          
          // Emit typing indicator
          socket.emit('chatbot:typing', { isTyping: true });
          
          // Process message (this would integrate with your chatbot service)
          // For now, we'll emit a simple response
          setTimeout(() => {
            socket.emit('chatbot:typing', { isTyping: false });
            socket.emit('chatbot:response', {
              message: 'This is a real-time chatbot response',
              sessionId,
              timestamp: new Date()
            });
          }, 1000);
          
        } catch (error) {
          console.error('Chatbot message error:', error);
          socket.emit('chatbot:error', { error: 'Failed to process message' });
        }
      });

      // Handle notification acknowledgments
      socket.on('notification:acknowledge', async (data) => {
        try {
          const { notificationId } = data;
          // Mark notification as acknowledged
          await redisConnection.set(`notification:ack:${notificationId}:${socket.userId}`, true, 86400);
          
          socket.emit('notification:acknowledged', { notificationId });
        } catch (error) {
          console.error('Notification acknowledgment error:', error);
        }
      });

      // Handle announcement-specific events
      socket.on('announcement:acknowledge', async (data) => {
        try {
          const { announcementId, timestamp } = data;
          const AnnouncementNotificationService = require('../services/AnnouncementNotificationService');
          
          // Mark announcement as acknowledged
          await redisConnection.set(`announcement:ack:${announcementId}:${socket.userId}`, timestamp, 86400);
          
          socket.emit('announcement:acknowledged', { 
            announcementId, 
            acknowledgedAt: timestamp 
          });
          
          console.log(`User ${socket.userId} acknowledged announcement ${announcementId}`);
        } catch (error) {
          console.error('Announcement acknowledgment error:', error);
          socket.emit('announcement:error', { error: 'Failed to acknowledge announcement' });
        }
      });

      // Handle announcement read events
      socket.on('announcement:mark-read', async (data) => {
        try {
          const { announcementId, deviceInfo } = data;
          const AnnouncementNotificationService = require('../services/AnnouncementNotificationService');
          
          const result = await AnnouncementNotificationService.markAsRead(
            announcementId, 
            socket.userId, 
            deviceInfo
          );
          
          if (result.success) {
            socket.emit('announcement:marked-read', { 
              announcementId,
              readAt: new Date()
            });
          } else {
            socket.emit('announcement:error', { error: result.error });
          }
        } catch (error) {
          console.error('Mark announcement read error:', error);
          socket.emit('announcement:error', { error: 'Failed to mark announcement as read' });
        }
      });

      // Handle sound notification preferences
      socket.on('notification:sound-preference', async (data) => {
        try {
          const { enableSound, soundType } = data;
          
          // Store user sound preferences in Redis
          await redisConnection.set(
            `user:sound_prefs:${socket.userId}`, 
            JSON.stringify({ enableSound, soundType }), 
            86400
          );
          
          socket.emit('notification:sound-preference-updated', { enableSound, soundType });
        } catch (error) {
          console.error('Sound preference update error:', error);
          socket.emit('notification:error', { error: 'Failed to update sound preferences' });
        }
      });

      // Handle real-time typing indicators for announcements
      socket.on('announcement:typing', (data) => {
        const { announcementId, isTyping } = data;
        socket.to(`announcement:${announcementId}`).emit('announcement:user-typing', {
          userId: socket.userId,
          isTyping,
          timestamp: new Date()
        });
      });

      // Join announcement room for real-time updates
      socket.on('announcement:join', (announcementId) => {
        socket.join(`announcement:${announcementId}`);
        console.log(`User ${socket.userId} joined announcement room ${announcementId}`);
      });

      // Leave announcement room
      socket.on('announcement:leave', (announcementId) => {
        socket.leave(`announcement:${announcementId}`);
        console.log(`User ${socket.userId} left announcement room ${announcementId}`);
      });

      // Handle notification read status
      socket.on('notification:mark-read', async (data) => {
        try {
          const { notificationId } = data;
          const NotificationService = require('../services/NotificationService');
          
          const result = await NotificationService.markAsRead(socket.userId, notificationId);
          
          if (result.success) {
            socket.emit('notification:marked-read', { notificationId });
            
            // Broadcast updated unread count to user's other sessions
            const unreadCount = await NotificationService.getUnreadCount(socket.userId);
            socket.emit('notification:unread-count', unreadCount);
          }
        } catch (error) {
          console.error('Mark notification read error:', error);
          socket.emit('notification:error', { error: 'Failed to mark notification as read' });
        }
      });

      // Handle mark all notifications as read
      socket.on('notification:mark-all-read', async () => {
        try {
          const NotificationService = require('../services/NotificationService');
          
          const result = await NotificationService.markAllAsRead(socket.userId);
          
          if (result.success) {
            socket.emit('notification:all-marked-read');
            socket.emit('notification:unread-count', { success: true, count: 0 });
          }
        } catch (error) {
          console.error('Mark all notifications read error:', error);
          socket.emit('notification:error', { error: 'Failed to mark all notifications as read' });
        }
      });

      // Handle notification preferences update
      socket.on('notification:update-preferences', async (data) => {
        try {
          const { preferences } = data;
          const NotificationService = require('../services/NotificationService');
          
          const result = await NotificationService.updateUserPreferences(socket.userId, preferences);
          
          if (result.success) {
            socket.emit('notification:preferences-updated', { preferences });
          }
        } catch (error) {
          console.error('Update notification preferences error:', error);
          socket.emit('notification:error', { error: 'Failed to update preferences' });
        }
      });

      // Handle device token registration for push notifications
      socket.on('notification:register-device', async (data) => {
        try {
          const { token, platform } = data;
          const NotificationService = require('../services/NotificationService');
          
          const result = await NotificationService.addDeviceToken(socket.userId, token, platform);
          
          if (result.success) {
            socket.emit('notification:device-registered', { platform });
          }
        } catch (error) {
          console.error('Register device token error:', error);
          socket.emit('notification:error', { error: 'Failed to register device' });
        }
      });

      // Handle event updates
      socket.on('event:join', (eventId) => {
        socket.join(`event:${eventId}`);
        console.log(`User ${socket.userId} joined event room ${eventId}`);
      });

      socket.on('event:leave', (eventId) => {
        socket.leave(`event:${eventId}`);
        console.log(`User ${socket.userId} left event room ${eventId}`);
      });

      // Handle QR scanning sessions
      socket.on('qr:scan-session', (data) => {
        const { sessionType, location } = data;
        socket.join(`qr:${sessionType}:${location}`);
        console.log(`User ${socket.userId} joined QR scan session for ${sessionType} at ${location}`);
      });

      // Handle disconnection
      socket.on('disconnect', async (reason) => {
        console.log(`User ${socket.userId} disconnected: ${reason}`);
        
        // Remove from connected users
        this.connectedUsers.delete(socket.userId);
        
        // Remove from Redis
        await redisConnection.del(`socket:${socket.userId}`);
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error(`Socket error for user ${socket.userId}:`, error);
      });
    });

    console.log('Socket.IO server initialized');
    return this.io;
  }

  // Send notification to specific user
  async sendToUser(userId, event, data) {
    try {
      const socketId = await redisConnection.get(`socket:${userId}`);
      
      if (socketId && this.io) {
        this.io.to(`user:${userId}`).emit(event, data);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error sending to user:', error);
      return false;
    }
  }

  // Send notification to all users with specific role
  async sendToRole(role, event, data) {
    try {
      if (this.io) {
        this.io.to(`role:${role}`).emit(event, data);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error sending to role:', error);
      return false;
    }
  }

  // Send notification to event participants
  async sendToEvent(eventId, event, data) {
    try {
      if (this.io) {
        this.io.to(`event:${eventId}`).emit(event, data);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error sending to event:', error);
      return false;
    }
  }

  // Broadcast to all connected users
  async broadcast(event, data) {
    try {
      if (this.io) {
        this.io.emit(event, data);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error broadcasting:', error);
      return false;
    }
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Get connected users by role
  getConnectedUsersByRole(role) {
    return Array.from(this.connectedUsers.entries())
      .filter(([userId, userData]) => userData.role === role)
      .map(([userId, userData]) => ({ userId, ...userData }));
  }

  // Check if user is connected
  isUserConnected(userId) {
    return this.connectedUsers.has(userId);
  }

  // Send initial data when user connects
  async sendInitialData(socket) {
    try {
      const NotificationService = require('../services/NotificationService');
      
      // Send unread notification count
      const unreadCount = await NotificationService.getUnreadCount(socket.userId);
      socket.emit('notification:unread-count', unreadCount);
      
      // Send recent notifications
      const recentNotifications = await NotificationService.getUserNotifications(socket.userId, {
        limit: 10,
        unreadOnly: false
      });
      
      if (recentNotifications.success) {
        socket.emit('notification:initial-data', {
          notifications: recentNotifications.notifications,
          unreadCount: unreadCount.count
        });
      }
      
      // Send connection status
      socket.emit('connection:status', {
        connected: true,
        userId: socket.userId,
        timestamp: new Date()
      });
      
    } catch (error) {
      console.error('Error sending initial data:', error);
      socket.emit('connection:error', { error: 'Failed to load initial data' });
    }
  }

  // Send missed notifications during reconnection
  async sendMissedNotifications(socket) {
    try {
      const userConnection = this.connectedUsers.get(socket.userId);
      if (!userConnection) return;
      
      const NotificationService = require('../services/NotificationService');
      
      // Get notifications since last activity
      const missedNotifications = await NotificationService.getUserNotifications(socket.userId, {
        limit: 50,
        unreadOnly: true
      });
      
      if (missedNotifications.success && missedNotifications.notifications.length > 0) {
        // Filter notifications created after last activity
        const lastActivity = userConnection.lastActivity || userConnection.connectedAt;
        const newNotifications = missedNotifications.notifications.filter(
          notification => new Date(notification.createdAt) > lastActivity
        );
        
        if (newNotifications.length > 0) {
          socket.emit('notification:missed', {
            notifications: newNotifications,
            count: newNotifications.length
          });
        }
      }
      
    } catch (error) {
      console.error('Error sending missed notifications:', error);
    }
  }

  // Enhanced notification sending with delivery confirmation
  async sendNotificationToUser(userId, notification, options = {}) {
    try {
      const { requireAck = false, priority = 'medium', retryCount = 0 } = options;
      
      const socketId = await redisConnection.get(`socket:${userId}`);
      
      if (socketId && this.io) {
        const notificationData = {
          ...notification,
          id: notification.id || notification._id,
          timestamp: new Date(),
          priority,
          requireAck
        };
        
        // Send notification
        this.io.to(`user:${userId}`).emit('notification:new', notificationData);
        
        // Store for delivery tracking if acknowledgment required
        if (requireAck) {
          await redisConnection.set(
            `notification:pending:${notification.id}:${userId}`,
            JSON.stringify({ ...notificationData, retryCount }),
            300 // 5 minutes expiry
          );
        }
        
        return { success: true, delivered: true };
      }
      
      return { success: true, delivered: false, reason: 'User not connected' };
    } catch (error) {
      console.error('Error sending notification to user:', error);
      return { success: false, error: error.message };
    }
  }

  // Batch notification sending
  async sendNotificationToUsers(userIds, notification, options = {}) {
    try {
      const results = [];
      
      for (const userId of userIds) {
        const result = await this.sendNotificationToUser(userId, notification, options);
        results.push({ userId, ...result });
      }
      
      return {
        success: true,
        results,
        delivered: results.filter(r => r.delivered).length,
        failed: results.filter(r => !r.delivered).length
      };
    } catch (error) {
      console.error('Error sending batch notifications:', error);
      return { success: false, error: error.message };
    }
  }

  // Connection health monitoring
  startHealthMonitoring() {
    setInterval(() => {
      const now = new Date();
      const staleConnections = [];
      
      this.connectedUsers.forEach((connection, userId) => {
        const timeSinceActivity = now - connection.lastActivity;
        
        // Mark connections as stale if no activity for 5 minutes
        if (timeSinceActivity > 5 * 60 * 1000) {
          staleConnections.push(userId);
        }
      });
      
      // Clean up stale connections
      staleConnections.forEach(userId => {
        console.log(`Cleaning up stale connection for user ${userId}`);
        this.connectedUsers.delete(userId);
        redisConnection.del(`socket:${userId}`);
      });
      
    }, 60000); // Check every minute
  }

  // Get connection statistics
  getConnectionStats() {
    const connections = Array.from(this.connectedUsers.values());
    const now = new Date();
    
    return {
      total: connections.length,
      byRole: connections.reduce((acc, conn) => {
        acc[conn.role] = (acc[conn.role] || 0) + 1;
        return acc;
      }, {}),
      averageConnectionTime: connections.reduce((acc, conn) => {
        return acc + (now - conn.connectedAt);
      }, 0) / connections.length || 0,
      activeInLastMinute: connections.filter(conn => 
        (now - conn.lastActivity) < 60000
      ).length
    };
  }
}

// Create singleton instance
const socketManager = new SocketManager();

module.exports = socketManager;