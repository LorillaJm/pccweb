const { addNotificationJob } = require('../config/queue');
const redisConnection = require('../config/redis');
const socketManager = require('../config/socket');
const Notification = require('../models/Notification');
const NotificationPreferences = require('../models/NotificationPreferences');
const User = require('../models/User');

class NotificationService {
  constructor() {
    this.defaultChannels = ['web', 'push'];
    this.batchSize = parseInt(process.env.NOTIFICATION_BATCH_SIZE) || 100;
  }

  // Send notification to a single user
  async sendToUser(userId, notification, channels = this.defaultChannels) {
    try {
      // Get user preferences
      const preferences = await this.getUserPreferences(userId);
      
      // Filter channels based on user preferences
      const enabledChannels = preferences.getEnabledChannels(notification.category);
      const requestedChannels = channels.filter(channel => enabledChannels.includes(channel));

      if (requestedChannels.length === 0) {
        console.log(`No enabled channels for user ${userId}, category ${notification.category}`);
        return { success: true, skipped: true };
      }

      // Get user contact information
      const userInfo = await this.getUserContactInfo(userId);
      
      // Create notification channels array
      const notificationChannels = requestedChannels.map(channel => ({
        type: channel,
        status: 'pending'
      }));

      // Create notification document
      const notificationDoc = new Notification({
        userId: userId,
        title: notification.title,
        message: notification.message,
        type: notification.type || 'info',
        category: notification.category || 'system',
        priority: notification.priority || 'medium',
        channels: notificationChannels,
        data: notification.data || {},
        actionUrl: notification.actionUrl,
        expiresAt: notification.expiresAt,
        scheduledFor: notification.scheduledFor
      });

      // Save notification to database
      const savedNotification = await notificationDoc.save();

      // Enhance notification with user contact info for delivery
      const enhancedNotification = {
        ...notification,
        id: savedNotification._id,
        email: userInfo.email,
        phone: userInfo.phone,
        userId: userId,
        timestamp: new Date()
      };

      // Queue notification job
      const job = await addNotificationJob(userId, enhancedNotification, requestedChannels);

      return {
        success: true,
        notificationId: savedNotification._id,
        jobId: job.id,
        channels: requestedChannels
      };
    } catch (error) {
      console.error('Error sending notification to user:', error);
      throw error;
    }
  }

  // Send notification to multiple users
  async sendToUsers(userIds, notification, channels = this.defaultChannels) {
    try {
      const results = [];
      
      // Process in batches to avoid overwhelming the system
      for (let i = 0; i < userIds.length; i += this.batchSize) {
        const batch = userIds.slice(i, i + this.batchSize);
        
        const batchPromises = batch.map(userId => 
          this.sendToUser(userId, notification, channels)
            .catch(error => ({ success: false, userId, error: error.message }))
        );
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }

      return {
        success: true,
        totalSent: results.filter(r => r.success).length,
        totalFailed: results.filter(r => !r.success).length,
        results
      };
    } catch (error) {
      console.error('Error sending notifications to users:', error);
      throw error;
    }
  }

  // Send notification to users by role
  async sendToRole(role, notification, channels = this.defaultChannels) {
    try {
      const users = await User.find({ 
        role: role, 
        isActive: true 
      }).select('_id');

      const userIds = users.map(user => user._id);
      
      if (userIds.length === 0) {
        return { success: true, message: 'No users found for role', totalSent: 0 };
      }

      return await this.sendToUsers(userIds, notification, channels);
    } catch (error) {
      console.error('Error sending notifications to role:', error);
      throw error;
    }
  }

  // Broadcast notification to all users
  async broadcast(notification, channels = this.defaultChannels) {
    try {
      const users = await User.find({ isActive: true }).select('_id');
      const userIds = users.map(user => user._id);
      
      if (userIds.length === 0) {
        return { success: true, message: 'No active users found', totalSent: 0 };
      }

      return await this.sendToUsers(userIds, notification, channels);
    } catch (error) {
      console.error('Error broadcasting notification:', error);
      throw error;
    }
  }

  // Schedule notification for future delivery
  async scheduleNotification(userId, notification, scheduleTime, channels = this.defaultChannels) {
    try {
      const delay = new Date(scheduleTime).getTime() - Date.now();
      
      if (delay <= 0) {
        throw new Error('Schedule time must be in the future');
      }

      // Get user preferences
      const preferences = await this.getUserPreferences(userId);
      const enabledChannels = preferences.getEnabledChannels(notification.category);
      const requestedChannels = channels.filter(channel => enabledChannels.includes(channel));

      // Create notification channels array
      const notificationChannels = requestedChannels.map(channel => ({
        type: channel,
        status: 'pending'
      }));

      // Create scheduled notification document
      const notificationDoc = new Notification({
        userId: userId,
        title: notification.title,
        message: notification.message,
        type: notification.type || 'info',
        category: notification.category || 'system',
        priority: notification.priority || 'medium',
        channels: notificationChannels,
        data: notification.data || {},
        actionUrl: notification.actionUrl,
        expiresAt: notification.expiresAt,
        scheduledFor: scheduleTime
      });

      // Save scheduled notification
      const savedNotification = await notificationDoc.save();

      // Queue with delay
      const job = await addNotificationJob(
        userId, 
        { ...notification, id: savedNotification._id }, 
        requestedChannels,
        { delay }
      );

      return {
        success: true,
        scheduledId: savedNotification._id,
        jobId: job.id,
        scheduleTime
      };
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  // Get user notification preferences
  async getUserPreferences(userId) {
    try {
      const cacheKey = `notification_prefs:${userId}`;
      let preferences = await redisConnection.get(cacheKey);
      
      if (!preferences) {
        preferences = await NotificationPreferences.findByUserId(userId);
        
        if (!preferences) {
          // Create default preferences if none exist
          preferences = await NotificationPreferences.createDefault(userId);
        }
        
        // Cache for 1 hour
        await redisConnection.set(cacheKey, preferences, 3600);
      }
      
      return preferences;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      // Return default preferences object on error
      return await NotificationPreferences.createDefault(userId);
    }
  }

  // Get user contact information
  async getUserContactInfo(userId) {
    try {
      const cacheKey = `user_contact:${userId}`;
      let userInfo = await redisConnection.get(cacheKey);
      
      if (!userInfo) {
        const user = await User.findById(userId).select('email firstName lastName');
        
        userInfo = {
          email: user?.email || '',
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          fullName: user ? `${user.firstName} ${user.lastName}` : ''
        };
        
        // Cache for 30 minutes
        await redisConnection.set(cacheKey, userInfo, 1800);
      }
      
      return userInfo;
    } catch (error) {
      console.error('Error getting user contact info:', error);
      return {};
    }
  }

  // Update notification channel status
  async updateChannelStatus(notificationId, channelType, status, errorMessage = null) {
    try {
      const notification = await Notification.findById(notificationId);
      if (notification) {
        await notification.updateChannelStatus(channelType, status, errorMessage);
        return { success: true };
      }
      return { success: false, error: 'Notification not found' };
    } catch (error) {
      console.error('Error updating channel status:', error);
      throw error;
    }
  }

  // Process scheduled notifications
  async processScheduledNotifications() {
    try {
      const readyNotifications = await Notification.findScheduledReady();
      
      for (const notification of readyNotifications) {
        const channels = notification.channels
          .filter(ch => ch.status === 'pending')
          .map(ch => ch.type);
        
        if (channels.length > 0) {
          await addNotificationJob(notification.userId, {
            id: notification._id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            category: notification.category,
            data: notification.data
          }, channels);
        }
      }
      
      return { success: true, processed: readyNotifications.length };
    } catch (error) {
      console.error('Error processing scheduled notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(userId, notificationId) {
    try {
      const notification = await Notification.findOne({ 
        _id: notificationId, 
        userId: userId 
      });
      
      if (notification) {
        await notification.markAsRead();
        return { success: true };
      }
      
      return { success: false, error: 'Notification not found' };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId) {
    try {
      await Notification.updateMany(
        { userId: userId, isRead: false },
        { 
          isRead: true, 
          readAt: new Date() 
        }
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Get user notifications
  async getUserNotifications(userId, options = {}) {
    try {
      const {
        unreadOnly = false,
        category = null,
        limit = 50,
        offset = 0
      } = options;
      
      let query = { 
        userId: userId,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } }
        ]
      };
      
      if (unreadOnly) {
        query.isRead = false;
      }
      
      if (category) {
        query.category = category;
      }
      
      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .lean();
      
      const total = await Notification.countDocuments(query);
      
      return {
        success: true,
        notifications: notifications,
        total: total,
        hasMore: (offset + limit) < total
      };
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  // Get unread notification count
  async getUnreadCount(userId) {
    try {
      const count = await Notification.countDocuments({
        userId: userId,
        isRead: false,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } }
        ]
      });
      
      return { success: true, count };
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  // Update user notification preferences
  async updateUserPreferences(userId, preferences) {
    try {
      // Find existing preferences or create new ones
      let userPrefs = await NotificationPreferences.findByUserId(userId);
      
      if (!userPrefs) {
        userPrefs = new NotificationPreferences({
          userId: userId,
          preferences: preferences
        });
      } else {
        userPrefs.preferences = { ...userPrefs.preferences, ...preferences };
      }
      
      await userPrefs.save();
      
      // Update cache
      const cacheKey = `notification_prefs:${userId}`;
      await redisConnection.set(cacheKey, userPrefs, 3600);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  // Add device token for push notifications
  async addDeviceToken(userId, token, platform) {
    try {
      let preferences = await NotificationPreferences.findByUserId(userId);
      
      if (!preferences) {
        preferences = await NotificationPreferences.createDefault(userId);
      }
      
      await preferences.addDeviceToken(token, platform);
      
      // Update cache
      const cacheKey = `notification_prefs:${userId}`;
      await redisConnection.set(cacheKey, preferences, 3600);
      
      return { success: true };
    } catch (error) {
      console.error('Error adding device token:', error);
      throw error;
    }
  }

  // Remove device token
  async removeDeviceToken(userId, token) {
    try {
      const preferences = await NotificationPreferences.findByUserId(userId);
      
      if (preferences) {
        await preferences.removeDeviceToken(token);
        
        // Update cache
        const cacheKey = `notification_prefs:${userId}`;
        await redisConnection.set(cacheKey, preferences, 3600);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error removing device token:', error);
      throw error;
    }
  }

  // Send real-time notification via Socket.IO
  async sendRealTimeNotification(userId, notification) {
    try {
      const sent = await socketManager.sendToUser(userId, 'notification', notification);
      return { success: sent };
    } catch (error) {
      console.error('Error sending real-time notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Cleanup expired notifications
  async cleanupExpiredNotifications() {
    try {
      const result = await Notification.cleanupExpired();
      return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
      throw error;
    }
  }

  // Get notification statistics
  async getNotificationStats(userId = null) {
    try {
      const stats = {};
      
      if (userId) {
        // User-specific stats
        const totalNotifications = await Notification.countDocuments({ userId });
        const unreadNotifications = await Notification.countDocuments({ 
          userId, 
          isRead: false 
        });
        const notificationsByCategory = await Notification.aggregate([
          { $match: { userId: userId } },
          { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);
        
        stats.user = {
          total: totalNotifications,
          unread: unreadNotifications,
          byCategory: notificationsByCategory
        };
      } else {
        // System-wide stats
        const totalNotifications = await Notification.countDocuments();
        const totalUsers = await User.countDocuments({ isActive: true });
        const notificationsByType = await Notification.aggregate([
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);
        
        stats.system = {
          totalNotifications,
          totalUsers,
          byType: notificationsByType
        };
      }
      
      return { success: true, stats };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      throw error;
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

module.exports = notificationService;