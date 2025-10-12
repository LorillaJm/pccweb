const notificationService = require('./NotificationService');
const User = require('../models/User');
const Facility = require('../models/Facility');
const AccessLog = require('../models/AccessLog');

/**
 * AccessNotificationService - Handles notifications for campus access and security
 * Integrates with NotificationService to send targeted notifications for:
 * - Access attempts (granted/denied)
 * - Security alerts
 * - Digital ID updates
 * - Emergency lockdowns
 */
class AccessNotificationService {
  constructor() {
    this.notificationService = notificationService;
    this.securityTeamRole = 'admin'; // Role that receives security alerts
  }

  /**
   * Send access attempt notification
   * @param {string} userId - User ID
   * @param {Object} accessData - Access attempt data
   * @returns {Promise<Object>} Notification result
   */
  async sendAccessAttemptNotification(userId, accessData) {
    try {
      const { facilityName, accessResult, timestamp, denialReason } = accessData;

      // Only send notifications for denied access or if user has opted in for access notifications
      if (accessResult === 'denied') {
        const notificationData = {
          title: 'Access Denied',
          message: `Access to ${facilityName} was denied. ${denialReason || ''}`,
          type: 'warning',
          category: 'access',
          priority: 'medium',
          actionUrl: '/campus-access/history',
          data: {
            facilityName,
            accessResult,
            timestamp,
            denialReason
          }
        };

        const result = await this.notificationService.sendToUser(
          userId,
          notificationData,
          ['web', 'push']
        );

        return {
          success: true,
          notificationId: result.notificationId,
          message: 'Access attempt notification sent successfully'
        };
      }

      return {
        success: true,
        message: 'No notification sent for granted access'
      };
    } catch (error) {
      console.error('Error sending access attempt notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send security alert notification
   * @param {string} userId - User ID involved in security incident
   * @param {string} alertType - Type of security alert
   * @param {Object} alertData - Alert details
   * @returns {Promise<Object>} Notification result
   */
  async sendSecurityAlertNotification(userId, alertType, alertData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const alertMessages = {
        multiple_failed_attempts: {
          title: 'Security Alert: Multiple Failed Access Attempts',
          message: `Multiple failed access attempts detected at ${alertData.facilityName}. Your account may be temporarily locked.`,
          type: 'error',
          priority: 'urgent'
        },
        suspicious_timing: {
          title: 'Security Alert: Unusual Access Time',
          message: `Access attempt detected at unusual time for ${alertData.facilityName}`,
          type: 'warning',
          priority: 'high'
        },
        unauthorized_facility: {
          title: 'Security Alert: Unauthorized Access Attempt',
          message: `Attempted access to restricted facility: ${alertData.facilityName}`,
          type: 'warning',
          priority: 'high'
        },
        expired_id: {
          title: 'Digital ID Expired',
          message: 'Your digital ID has expired. Please renew it to continue accessing campus facilities.',
          type: 'warning',
          priority: 'high'
        },
        id_suspended: {
          title: 'Digital ID Suspended',
          message: `Your digital ID has been suspended. ${alertData.reason || 'Please contact administration.'}`,
          type: 'error',
          priority: 'urgent'
        },
        tamper_detected: {
          title: 'Security Alert: Tampering Detected',
          message: 'Possible tampering detected with your digital ID. Please contact security immediately.',
          type: 'error',
          priority: 'urgent'
        }
      };

      const alertConfig = alertMessages[alertType] || {
        title: 'Security Alert',
        message: 'A security incident has been detected',
        type: 'warning',
        priority: 'high'
      };

      const notificationData = {
        ...alertConfig,
        category: 'access',
        actionUrl: '/campus-access/security',
        data: {
          alertType,
          ...alertData
        }
      };

      // Send to user
      const userResult = await this.notificationService.sendToUser(
        userId,
        notificationData,
        ['web', 'email', 'sms', 'push']
      );

      // Also send to security team for high priority alerts
      if (['urgent', 'high'].includes(alertConfig.priority)) {
        await this.sendSecurityTeamAlert(userId, alertType, alertData);
      }

      return {
        success: true,
        notificationId: userResult.notificationId,
        message: 'Security alert notification sent successfully'
      };
    } catch (error) {
      console.error('Error sending security alert notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send notification to security team
   * @param {string} userId - User ID involved in incident
   * @param {string} alertType - Type of security alert
   * @param {Object} alertData - Alert details
   * @returns {Promise<Object>} Notification result
   */
  async sendSecurityTeamAlert(userId, alertType, alertData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Find all security team members (admins)
      const securityTeam = await User.find({ 
        role: this.securityTeamRole, 
        isActive: true 
      }).select('_id');

      const securityTeamIds = securityTeam.map(member => member._id);

      if (securityTeamIds.length === 0) {
        console.warn('No security team members found');
        return {
          success: false,
          message: 'No security team members found'
        };
      }

      const notificationData = {
        title: `Security Alert: ${alertType.replace(/_/g, ' ').toUpperCase()}`,
        message: `Security incident detected for ${user.firstName} ${user.lastName} (${user.studentId || user.email})`,
        type: 'error',
        category: 'access',
        priority: 'urgent',
        actionUrl: `/admin/security/incidents`,
        data: {
          userId,
          userName: `${user.firstName} ${user.lastName}`,
          userEmail: user.email,
          studentId: user.studentId,
          alertType,
          ...alertData
        }
      };

      const result = await this.notificationService.sendToUsers(
        securityTeamIds,
        notificationData,
        ['web', 'email', 'push']
      );

      return {
        success: true,
        sentCount: result.totalSent,
        message: `Security team alert sent to ${result.totalSent} members`
      };
    } catch (error) {
      console.error('Error sending security team alert:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send digital ID update notification
   * @param {string} userId - User ID
   * @param {string} updateType - Type of update
   * @param {Object} updateData - Update details
   * @returns {Promise<Object>} Notification result
   */
  async sendDigitalIDUpdateNotification(userId, updateType, updateData = {}) {
    try {
      const updateMessages = {
        generated: {
          title: 'Digital ID Generated',
          message: 'Your digital ID has been generated successfully. You can now access campus facilities.',
          type: 'success',
          priority: 'high'
        },
        renewed: {
          title: 'Digital ID Renewed',
          message: 'Your digital ID has been renewed successfully.',
          type: 'success',
          priority: 'medium'
        },
        updated: {
          title: 'Digital ID Updated',
          message: 'Your digital ID permissions have been updated.',
          type: 'info',
          priority: 'medium'
        },
        expiring_soon: {
          title: 'Digital ID Expiring Soon',
          message: `Your digital ID will expire in ${updateData.daysUntilExpiry} days. Please renew it to avoid access interruption.`,
          type: 'warning',
          priority: 'high'
        },
        expired: {
          title: 'Digital ID Expired',
          message: 'Your digital ID has expired. Please renew it to continue accessing campus facilities.',
          type: 'error',
          priority: 'urgent'
        },
        suspended: {
          title: 'Digital ID Suspended',
          message: `Your digital ID has been suspended. ${updateData.reason || 'Please contact administration.'}`,
          type: 'error',
          priority: 'urgent'
        },
        reactivated: {
          title: 'Digital ID Reactivated',
          message: 'Your digital ID has been reactivated. You can now access campus facilities.',
          type: 'success',
          priority: 'high'
        },
        permission_added: {
          title: 'New Facility Access Granted',
          message: `You now have access to ${updateData.facilityName}`,
          type: 'success',
          priority: 'medium'
        },
        permission_removed: {
          title: 'Facility Access Removed',
          message: `Your access to ${updateData.facilityName} has been removed`,
          type: 'warning',
          priority: 'medium'
        }
      };

      const updateConfig = updateMessages[updateType] || {
        title: 'Digital ID Update',
        message: 'Your digital ID has been updated',
        type: 'info',
        priority: 'medium'
      };

      const notificationData = {
        ...updateConfig,
        category: 'access',
        actionUrl: '/campus-access/digital-id',
        data: {
          updateType,
          ...updateData
        }
      };

      const channels = ['web', 'push'];
      if (['urgent', 'high'].includes(updateConfig.priority)) {
        channels.push('email');
      }

      const result = await this.notificationService.sendToUser(
        userId,
        notificationData,
        channels
      );

      return {
        success: true,
        notificationId: result.notificationId,
        message: 'Digital ID update notification sent successfully'
      };
    } catch (error) {
      console.error('Error sending digital ID update notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send emergency lockdown notification
   * @param {string} facilityId - Facility ID or 'all' for campus-wide
   * @param {string} reason - Lockdown reason
   * @param {Object} lockdownData - Lockdown details
   * @returns {Promise<Object>} Notification result
   */
  async sendEmergencyLockdownNotification(facilityId, reason, lockdownData = {}) {
    try {
      let targetUsers;
      let facilityName;

      if (facilityId === 'all') {
        // Campus-wide lockdown - notify all active users
        targetUsers = await User.find({ isActive: true }).select('_id');
        facilityName = 'All Campus Facilities';
      } else {
        // Specific facility lockdown - notify users with access to that facility
        const facility = await Facility.findOne({ facilityId });
        if (!facility) {
          throw new Error('Facility not found');
        }
        facilityName = facility.name;

        // Find users who have access to this facility
        const DigitalID = require('../models/DigitalID');
        const digitalIDs = await DigitalID.find({
          'permissions.facilityId': facilityId,
          isActive: true
        }).select('userId');

        targetUsers = digitalIDs.map(digitalID => ({ _id: digitalID.userId }));
      }

      const userIds = targetUsers.map(user => user._id);

      if (userIds.length === 0) {
        return {
          success: true,
          message: 'No users to notify',
          sentCount: 0
        };
      }

      const notificationData = {
        title: '🚨 EMERGENCY LOCKDOWN ACTIVATED',
        message: `Emergency lockdown activated for ${facilityName}. ${reason}`,
        type: 'error',
        category: 'access',
        priority: 'urgent',
        actionUrl: '/campus-access/emergency',
        data: {
          facilityId,
          facilityName,
          reason,
          lockdownType: facilityId === 'all' ? 'campus_wide' : 'facility_specific',
          activatedAt: new Date(),
          ...lockdownData
        }
      };

      const result = await this.notificationService.sendToUsers(
        userIds,
        notificationData,
        ['web', 'email', 'sms', 'push']
      );

      return {
        success: true,
        sentCount: result.totalSent,
        failedCount: result.totalFailed,
        message: `Emergency lockdown notification sent to ${result.totalSent} users`
      };
    } catch (error) {
      console.error('Error sending emergency lockdown notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send lockdown deactivation notification
   * @param {string} facilityId - Facility ID or 'all' for campus-wide
   * @param {Object} deactivationData - Deactivation details
   * @returns {Promise<Object>} Notification result
   */
  async sendLockdownDeactivationNotification(facilityId, deactivationData = {}) {
    try {
      let targetUsers;
      let facilityName;

      if (facilityId === 'all') {
        targetUsers = await User.find({ isActive: true }).select('_id');
        facilityName = 'All Campus Facilities';
      } else {
        const facility = await Facility.findOne({ facilityId });
        if (!facility) {
          throw new Error('Facility not found');
        }
        facilityName = facility.name;

        const DigitalID = require('../models/DigitalID');
        const digitalIDs = await DigitalID.find({
          'permissions.facilityId': facilityId,
          isActive: true
        }).select('userId');

        targetUsers = digitalIDs.map(digitalID => ({ _id: digitalID.userId }));
      }

      const userIds = targetUsers.map(user => user._id);

      if (userIds.length === 0) {
        return {
          success: true,
          message: 'No users to notify',
          sentCount: 0
        };
      }

      const notificationData = {
        title: 'Emergency Lockdown Deactivated',
        message: `Emergency lockdown has been deactivated for ${facilityName}. Normal operations have resumed.`,
        type: 'success',
        category: 'access',
        priority: 'high',
        actionUrl: '/campus-access',
        data: {
          facilityId,
          facilityName,
          deactivatedAt: new Date(),
          ...deactivationData
        }
      };

      const result = await this.notificationService.sendToUsers(
        userIds,
        notificationData,
        ['web', 'push']
      );

      return {
        success: true,
        sentCount: result.totalSent,
        failedCount: result.totalFailed,
        message: `Lockdown deactivation notification sent to ${result.totalSent} users`
      };
    } catch (error) {
      console.error('Error sending lockdown deactivation notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send facility access report notification
   * @param {string} userId - User ID
   * @param {string} reportType - Type of report (daily/weekly/monthly)
   * @param {Object} reportData - Report data
   * @returns {Promise<Object>} Notification result
   */
  async sendAccessReportNotification(userId, reportType, reportData) {
    try {
      const notificationData = {
        title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Access Report`,
        message: `Your ${reportType} campus access report is ready`,
        type: 'info',
        category: 'access',
        priority: 'low',
        actionUrl: '/campus-access/reports',
        data: {
          reportType,
          totalAccesses: reportData.totalAccesses || 0,
          facilitiesVisited: reportData.facilitiesVisited || 0,
          period: reportData.period
        }
      };

      const result = await this.notificationService.sendToUser(
        userId,
        notificationData,
        ['web', 'email']
      );

      return {
        success: true,
        notificationId: result.notificationId,
        message: 'Access report notification sent successfully'
      };
    } catch (error) {
      console.error('Error sending access report notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send bulk digital ID expiry reminders
   * @param {number} daysBeforeExpiry - Days before expiry to send reminder
   * @returns {Promise<Object>} Notification result
   */
  async sendBulkExpiryReminders(daysBeforeExpiry = 30) {
    try {
      const DigitalID = require('../models/DigitalID');
      
      // Find digital IDs expiring soon
      const expiringDate = new Date();
      expiringDate.setDate(expiringDate.getDate() + daysBeforeExpiry);

      const expiringIDs = await DigitalID.find({
        isActive: true,
        expiresAt: {
          $gte: new Date(),
          $lte: expiringDate
        }
      }).populate('userId', '_id firstName lastName email');

      if (expiringIDs.length === 0) {
        return {
          success: true,
          message: 'No expiring digital IDs found',
          sentCount: 0
        };
      }

      let sentCount = 0;
      let failedCount = 0;

      for (const digitalID of expiringIDs) {
        const daysUntilExpiry = Math.ceil(
          (digitalID.expiresAt - new Date()) / (1000 * 60 * 60 * 24)
        );

        const result = await this.sendDigitalIDUpdateNotification(
          digitalID.userId._id,
          'expiring_soon',
          { daysUntilExpiry }
        );

        if (result.success) {
          sentCount++;
        } else {
          failedCount++;
        }
      }

      return {
        success: true,
        sentCount,
        failedCount,
        message: `Expiry reminders sent to ${sentCount} users`
      };
    } catch (error) {
      console.error('Error sending bulk expiry reminders:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send access pattern anomaly notification
   * @param {string} userId - User ID
   * @param {Object} anomalyData - Anomaly details
   * @returns {Promise<Object>} Notification result
   */
  async sendAccessAnomalyNotification(userId, anomalyData) {
    try {
      const notificationData = {
        title: 'Unusual Access Pattern Detected',
        message: `We detected unusual access patterns on your account. If this wasn't you, please contact security immediately.`,
        type: 'warning',
        category: 'access',
        priority: 'high',
        actionUrl: '/campus-access/security',
        data: {
          anomalyType: anomalyData.type,
          detectedAt: new Date(),
          details: anomalyData.details
        }
      };

      const result = await this.notificationService.sendToUser(
        userId,
        notificationData,
        ['web', 'email', 'push']
      );

      // Also alert security team
      await this.sendSecurityTeamAlert(userId, 'access_anomaly', anomalyData);

      return {
        success: true,
        notificationId: result.notificationId,
        message: 'Access anomaly notification sent successfully'
      };
    } catch (error) {
      console.error('Error sending access anomaly notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new AccessNotificationService();
