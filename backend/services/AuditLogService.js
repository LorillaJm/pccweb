const AuditLog = require('../models/AuditLog');

class AuditLogService {
  /**
   * Create an audit log entry
   * @param {object} data - Log data
   * @returns {Promise<object>}
   */
  async log(data) {
    const {
      userId = null,
      action,
      category,
      status,
      ipAddress = null,
      userAgent = null,
      metadata = {}
    } = data;

    try {
      const log = await AuditLog.create({
        userId,
        action,
        category,
        status,
        ipAddress,
        userAgent,
        metadata
      });

      return log;
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw - logging failures shouldn't break the application
      return null;
    }
  }

  /**
   * Log registration event
   */
  async logRegistration(userId, email, role, status, ipAddress, userAgent, reason = null) {
    return await this.log({
      userId,
      action: status === 'success' ? 'registration_success' : 'registration_failed',
      category: 'auth',
      status,
      ipAddress,
      userAgent,
      metadata: { email, role, authProvider: 'local', ...(reason && { reason }) }
    });
  }

  /**
   * Log verification attempt
   */
  async logVerification(userId, method, status, ipAddress, userAgent, metadata = {}) {
    return await this.log({
      userId,
      action: 'email_verification',
      category: 'verification',
      status,
      ipAddress,
      userAgent,
      metadata: { method, ...metadata }
    });
  }

  /**
   * Log login attempt
   */
  async logLogin(userId, email, status, ipAddress, userAgent, reason = null) {
    return await this.log({
      userId,
      action: status === 'success' ? 'login_success' : 'login_failed',
      category: 'auth',
      status,
      ipAddress,
      userAgent,
      metadata: { email, ...(reason && { reason }) }
    });
  }

  /**
   * Log 2FA event
   */
  async log2FA(userId, action, status, ipAddress, userAgent, metadata = {}) {
    return await this.log({
      userId,
      action,
      category: '2fa',
      status,
      ipAddress,
      userAgent,
      metadata
    });
  }

  /**
   * Log rate limit trigger
   */
  async logRateLimit(action, identifier, ipAddress, userAgent) {
    return await this.log({
      userId: null,
      action: 'rate_limit_exceeded',
      category: 'security',
      status: 'failure',
      ipAddress,
      userAgent,
      metadata: { action, identifier }
    });
  }

  /**
   * Log admin action
   */
  async logAdminAction(adminId, action, targetUserId, status, ipAddress, userAgent, metadata = {}) {
    return await this.log({
      userId: adminId,
      action,
      category: 'admin',
      status,
      ipAddress,
      userAgent,
      metadata: { targetUserId, ...metadata }
    });
  }

  /**
   * Get logs by user
   */
  async getLogsByUser(userId, options = {}) {
    const {
      limit = 50,
      skip = 0,
      category = null,
      action = null,
      startDate = null,
      endDate = null
    } = options;

    const query = { userId };

    if (category) query.category = category;
    if (action) query.action = action;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await AuditLog.countDocuments(query);

    return {
      logs,
      total,
      limit,
      skip,
      hasMore: total > skip + limit
    };
  }

  /**
   * Get logs by action
   */
  async getLogsByAction(action, options = {}) {
    const {
      limit = 50,
      skip = 0,
      startDate = null,
      endDate = null
    } = options;

    const query = { action };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('userId', 'email firstName lastName')
      .lean();

    const total = await AuditLog.countDocuments(query);

    return {
      logs,
      total,
      limit,
      skip,
      hasMore: total > skip + limit
    };
  }

  /**
   * Get logs by category
   */
  async getLogsByCategory(category, options = {}) {
    const {
      limit = 50,
      skip = 0,
      startDate = null,
      endDate = null
    } = options;

    const query = { category };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('userId', 'email firstName lastName')
      .lean();

    const total = await AuditLog.countDocuments(query);

    return {
      logs,
      total,
      limit,
      skip,
      hasMore: total > skip + limit
    };
  }

  /**
   * Flag suspicious activity
   */
  async flagSuspiciousActivity(userId, reason, ipAddress, userAgent, metadata = {}) {
    return await this.log({
      userId,
      action: 'suspicious_activity',
      category: 'security',
      status: 'failure',
      ipAddress,
      userAgent,
      metadata: { reason, flagged: true, ...metadata }
    });
  }

  /**
   * Get security summary for a user
   */
  async getUserSecuritySummary(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await AuditLog.find({
      userId,
      createdAt: { $gte: startDate }
    }).lean();

    const summary = {
      totalEvents: logs.length,
      loginAttempts: logs.filter(l => l.action.includes('login')).length,
      failedLogins: logs.filter(l => l.action === 'login_failed').length,
      verificationAttempts: logs.filter(l => l.category === 'verification').length,
      twoFactorEvents: logs.filter(l => l.category === '2fa').length,
      suspiciousActivity: logs.filter(l => l.action === 'suspicious_activity').length,
      lastLogin: logs.find(l => l.action === 'login_success')?.createdAt || null,
      uniqueIPs: [...new Set(logs.map(l => l.ipAddress).filter(Boolean))].length
    };

    return summary;
  }

  /**
   * Clean up old logs
   */
  async cleanupOldLogs(daysToKeep = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await AuditLog.deleteMany({
      createdAt: { $lt: cutoffDate }
    });

    return result.deletedCount;
  }
}

module.exports = new AuditLogService();
