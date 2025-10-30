const NotificationService = require('./NotificationService');
const socketManager = require('../config/socket');
const Announcement = require('../models/Announcement');
const User = require('../models/User');

class AnnouncementNotificationService {
  constructor() {
    this.soundTypes = {
      default: '/sounds/notification-default.mp3',
      urgent: '/sounds/notification-urgent.mp3',
      gentle: '/sounds/notification-gentle.mp3',
      announcement: '/sounds/notification-announcement.mp3'
    };
  }

  // Send real-time announcement notification
  async sendAnnouncementNotification(announcementId, options = {}) {
    try {
      const announcement = await Announcement.findById(announcementId)
        .populate('authorId', 'firstName lastName role');

      if (!announcement || !announcement.isPublished) {
        throw new Error('Announcement not found or not published');
      }

      // Get target users based on audience
      const targetUsers = await this.getTargetUsers(announcement.targetAudience);
      
      if (targetUsers.length === 0) {
        return { success: true, message: 'No target users found', delivered: 0 };
      }

      // Update delivery stats
      announcement.deliveryStats.totalTargeted = targetUsers.length;
      await announcement.save();

      // Prepare notification data
      const notificationData = {
        id: announcement._id,
        type: 'announcement',
        title: announcement.title,
        message: this.truncateContent(announcement.content, 150),
        fullContent: announcement.content,
        priority: announcement.priority,
        category: announcement.category,
        author: {
          name: `${announcement.authorId.firstName} ${announcement.authorId.lastName}`,
          role: announcement.authorId.role
        },
        timestamp: new Date(),
        actionUrl: `/announcements/${announcement._id}`,
        // Real-time specific data
        realTime: {
          enableSound: announcement.notificationSettings.enableSound,
          soundType: announcement.notificationSettings.soundType,
          soundUrl: this.getSoundUrl(announcement.notificationSettings),
          priority: announcement.priority,
          requireAck: announcement.priority === 'urgent',
          autoExpire: announcement.priority === 'low' ? 30000 : null // 30 seconds for low priority
        }
      };

      // Send real-time notifications
      const deliveryResults = await this.sendRealTimeToUsers(targetUsers, notificationData);

      // Send traditional notifications for offline users
      await this.sendTraditionalNotifications(targetUsers, announcement, notificationData);

      // Update delivery stats
      await this.updateDeliveryStats(announcement._id, deliveryResults);

      return {
        success: true,
        announcementId: announcement._id,
        totalTargeted: targetUsers.length,
        realTimeDelivered: deliveryResults.delivered,
        failed: deliveryResults.failed,
        deliveryResults
      };

    } catch (error) {
      console.error('Error sending announcement notification:', error);
      throw error;
    }
  }

  // Get target users based on audience type
  async getTargetUsers(targetAudience) {
    try {
      let query = { isActive: true };

      switch (targetAudience) {
        case 'students':
          query.role = 'student';
          break;
        case 'faculty':
          query.role = { $in: ['faculty', 'admin'] };
          break;
        case 'all':
        default:
          // No additional filter for 'all'
          break;
      }

      const users = await User.find(query).select('_id firstName lastName email role');
      return users;
    } catch (error) {
      console.error('Error getting target users:', error);
      return [];
    }
  }

  // Send real-time notifications to connected users
  async sendRealTimeToUsers(users, notificationData) {
    try {
      let delivered = 0;
      let failed = 0;
      const results = [];

      for (const user of users) {
        try {
          const isConnected = socketManager.isUserConnected(user._id.toString());
          
          if (isConnected) {
            // Send real-time notification
            const sent = await socketManager.sendNotificationToUser(
              user._id.toString(),
              notificationData,
              {
                requireAck: notificationData.realTime.requireAck,
                priority: notificationData.priority
              }
            );

            if (sent.success && sent.delivered) {
              delivered++;
              results.push({ userId: user._id, status: 'delivered', method: 'realtime' });
            } else {
              failed++;
              results.push({ userId: user._id, status: 'failed', method: 'realtime', reason: sent.reason });
            }
          } else {
            // User not connected, will be handled by traditional notifications
            results.push({ userId: user._id, status: 'offline', method: 'traditional' });
          }
        } catch (error) {
          failed++;
          results.push({ userId: user._id, status: 'error', method: 'realtime', error: error.message });
        }
      }

      return { delivered, failed, results };
    } catch (error) {
      console.error('Error sending real-time notifications:', error);
      return { delivered: 0, failed: users.length, results: [] };
    }
  }

  // Send traditional notifications for offline users
  async sendTraditionalNotifications(users, announcement, notificationData) {
    try {
      const offlineUsers = users.filter(user => 
        !socketManager.isUserConnected(user._id.toString())
      );

      if (offlineUsers.length === 0) {
        return { success: true, sent: 0 };
      }

      // Prepare notification for traditional channels
      const traditionalNotification = {
        title: announcement.title,
        message: notificationData.message,
        type: 'info',
        category: 'announcement',
        priority: announcement.priority,
        data: {
          announcementId: announcement._id,
          fullContent: announcement.fullContent,
          author: notificationData.author
        },
        actionUrl: notificationData.actionUrl
      };

      // Determine channels based on priority
      let channels = ['web'];
      if (announcement.notificationSettings.pushToMobile) {
        channels.push('push');
      }
      if (announcement.notificationSettings.emailNotification || announcement.priority === 'urgent') {
        channels.push('email');
      }

      // Send to offline users
      const userIds = offlineUsers.map(user => user._id.toString());
      const result = await NotificationService.sendToUsers(userIds, traditionalNotification, channels);

      return result;
    } catch (error) {
      console.error('Error sending traditional notifications:', error);
      return { success: false, error: error.message };
    }
  }

  // Get sound URL based on notification settings
  getSoundUrl(notificationSettings) {
    if (!notificationSettings.enableSound) {
      return null;
    }

    if (notificationSettings.soundType === 'custom' && notificationSettings.customSoundUrl) {
      return notificationSettings.customSoundUrl;
    }

    return this.soundTypes[notificationSettings.soundType] || this.soundTypes.default;
  }

  // Truncate content for notification preview
  truncateContent(content, maxLength = 150) {
    if (content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength).trim() + '...';
  }

  // Update delivery statistics
  async updateDeliveryStats(announcementId, deliveryResults) {
    try {
      const delivered = deliveryResults.delivered || 0;
      const failed = deliveryResults.failed || 0;

      await Announcement.findByIdAndUpdate(announcementId, {
        $inc: {
          'deliveryStats.delivered': delivered,
          'deliveryStats.failed': failed
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating delivery stats:', error);
      return { success: false, error: error.message };
    }
  }

  // Mark announcement as read by user
  async markAsRead(announcementId, userId, deviceInfo = null) {
    try {
      const announcement = await Announcement.findById(announcementId);
      
      if (!announcement) {
        return { success: false, error: 'Announcement not found' };
      }

      // Check if already read by this user
      const existingRead = announcement.readBy.find(
        read => read.userId.toString() === userId.toString()
      );

      if (!existingRead) {
        announcement.readBy.push({
          userId,
          readAt: new Date(),
          deviceInfo
        });

        // Update read count
        announcement.deliveryStats.read = (announcement.deliveryStats.read || 0) + 1;
        
        await announcement.save();

        // Send read receipt via socket
        await socketManager.sendToUser(userId, 'announcement:read-receipt', {
          announcementId,
          readAt: new Date()
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error marking announcement as read:', error);
      return { success: false, error: error.message };
    }
  }

  // Get announcement delivery statistics
  async getDeliveryStats(announcementId) {
    try {
      const announcement = await Announcement.findById(announcementId)
        .select('deliveryStats readBy targetAudience');

      if (!announcement) {
        return { success: false, error: 'Announcement not found' };
      }

      const stats = {
        totalTargeted: announcement.deliveryStats.totalTargeted || 0,
        delivered: announcement.deliveryStats.delivered || 0,
        read: announcement.deliveryStats.read || 0,
        failed: announcement.deliveryStats.failed || 0,
        readRate: 0,
        deliveryRate: 0
      };

      // Calculate rates
      if (stats.totalTargeted > 0) {
        stats.deliveryRate = ((stats.delivered / stats.totalTargeted) * 100).toFixed(2);
        stats.readRate = ((stats.read / stats.totalTargeted) * 100).toFixed(2);
      }

      // Get read timeline
      const readTimeline = announcement.readBy.map(read => ({
        userId: read.userId,
        readAt: read.readAt,
        deviceInfo: read.deviceInfo
      }));

      return {
        success: true,
        stats,
        readTimeline,
        targetAudience: announcement.targetAudience
      };
    } catch (error) {
      console.error('Error getting delivery stats:', error);
      return { success: false, error: error.message };
    }
  }

  // Send urgent announcement with immediate delivery
  async sendUrgentAnnouncement(announcementId, options = {}) {
    try {
      const announcement = await Announcement.findById(announcementId);
      
      if (!announcement) {
        throw new Error('Announcement not found');
      }

      // Force urgent settings
      announcement.priority = 'urgent';
      announcement.notificationSettings.enableRealTime = true;
      announcement.notificationSettings.enableSound = true;
      announcement.notificationSettings.soundType = 'urgent';
      announcement.notificationSettings.pushToMobile = true;
      announcement.notificationSettings.emailNotification = true;

      await announcement.save();

      // Send with urgent options
      const result = await this.sendAnnouncementNotification(announcementId, {
        ...options,
        urgent: true,
        requireAck: true
      });

      // Also broadcast to all connected users immediately
      await socketManager.broadcast('announcement:urgent', {
        id: announcement._id,
        title: announcement.title,
        message: this.truncateContent(announcement.content, 100),
        priority: 'urgent',
        timestamp: new Date(),
        requireAck: true,
        soundUrl: this.soundTypes.urgent
      });

      return result;
    } catch (error) {
      console.error('Error sending urgent announcement:', error);
      throw error;
    }
  }

  // Broadcast system-wide announcement
  async broadcastSystemAnnouncement(title, message, options = {}) {
    try {
      const {
        priority = 'high',
        enableSound = true,
        soundType = 'announcement',
        requireAck = false
      } = options;

      const notificationData = {
        id: `system-${Date.now()}`,
        type: 'system-announcement',
        title,
        message,
        priority,
        timestamp: new Date(),
        realTime: {
          enableSound,
          soundType,
          soundUrl: this.getSoundUrl({ enableSound, soundType }),
          requireAck,
          autoExpire: priority === 'low' ? 30000 : null
        }
      };

      // Broadcast to all connected users
      const broadcastResult = await socketManager.broadcast('announcement:system', notificationData);

      // Also send traditional notifications
      const users = await User.find({ isActive: true }).select('_id');
      const userIds = users.map(user => user._id.toString());

      const traditionalNotification = {
        title,
        message,
        type: 'info',
        category: 'system',
        priority,
        data: { systemAnnouncement: true }
      };

      await NotificationService.sendToUsers(userIds, traditionalNotification, ['web', 'push']);

      return {
        success: true,
        broadcastSent: broadcastResult,
        totalUsers: users.length,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error broadcasting system announcement:', error);
      throw error;
    }
  }

  // Schedule announcement for future delivery
  async scheduleAnnouncement(announcementId, scheduleTime, options = {}) {
    try {
      const announcement = await Announcement.findById(announcementId);
      
      if (!announcement) {
        throw new Error('Announcement not found');
      }

      const delay = new Date(scheduleTime).getTime() - Date.now();
      
      if (delay <= 0) {
        throw new Error('Schedule time must be in the future');
      }

      // Schedule the notification
      setTimeout(async () => {
        try {
          await this.sendAnnouncementNotification(announcementId, options);
          console.log(`Scheduled announcement ${announcementId} sent successfully`);
        } catch (error) {
          console.error(`Error sending scheduled announcement ${announcementId}:`, error);
        }
      }, delay);

      return {
        success: true,
        announcementId,
        scheduledFor: scheduleTime,
        delay
      };
    } catch (error) {
      console.error('Error scheduling announcement:', error);
      throw error;
    }
  }
}

// Create singleton instance
const announcementNotificationService = new AnnouncementNotificationService();

module.exports = announcementNotificationService;