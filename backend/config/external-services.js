/**
 * External Services Configuration Module
 * 
 * Centralized configuration and initialization for all external service integrations
 * including OpenAI, Email, SMS, and Push Notifications.
 */

const nodemailer = require('nodemailer');
const twilio = require('twilio');
const OpenAI = require('openai');

/**
 * OpenAI Service Configuration
 */
class OpenAIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    this.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS || '150');
    this.client = null;
    this.enabled = !!this.apiKey;
    this.requestCount = 0;
    this.errorCount = 0;
  }

  /**
   * Initialize OpenAI client
   */
  initialize() {
    if (!this.enabled) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('ℹ️  OpenAI API key not configured (development mode - using fallback responses)');
      } else {
        console.warn('⚠️  OpenAI API key not configured. Chatbot will use fallback responses.');
      }
      return false;
    }

    try {
      this.client = new OpenAI({
        apiKey: this.apiKey
      });
      console.log('✅ OpenAI service initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize OpenAI:', error.message);
      this.enabled = false;
      return false;
    }
  }

  /**
   * Get completion from OpenAI
   */
  async getCompletion(messages, options = {}) {
    if (!this.enabled || !this.client) {
      throw new Error('OpenAI service not available');
    }

    try {
      this.requestCount++;
      
      const response = await this.client.chat.completions.create({
        model: options.model || this.model,
        messages,
        max_tokens: options.maxTokens || this.maxTokens,
        temperature: options.temperature || 0.7,
        ...options
      });

      return response.choices[0].message.content;
    } catch (error) {
      this.errorCount++;
      console.error('OpenAI API error:', error.message);
      throw error;
    }
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      enabled: this.enabled,
      model: this.model,
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      successRate: this.requestCount > 0 
        ? ((this.requestCount - this.errorCount) / this.requestCount * 100).toFixed(2) + '%'
        : 'N/A'
    };
  }

  /**
   * Health check
   */
  async healthCheck() {
    if (!this.enabled) {
      return { status: 'disabled', message: 'OpenAI API key not configured' };
    }

    try {
      await this.getCompletion([
        { role: 'user', content: 'Hello' }
      ], { maxTokens: 5 });
      
      return { status: 'healthy', message: 'OpenAI API is responding' };
    } catch (error) {
      return { status: 'unhealthy', message: error.message };
    }
  }
}

/**
 * Email Service Configuration
 */
class EmailService {
  constructor() {
    this.host = process.env.EMAIL_HOST;
    this.port = parseInt(process.env.EMAIL_PORT || '587');
    this.secure = process.env.EMAIL_SECURE === 'true';
    this.user = process.env.EMAIL_USER;
    this.pass = process.env.EMAIL_PASS;
    this.from = process.env.EMAIL_FROM || this.user;
    this.transporter = null;
    this.enabled = !!(this.host && this.user && this.pass);
    this.sentCount = 0;
    this.errorCount = 0;
  }

  /**
   * Initialize email transporter
   */
  initialize() {
    if (!this.enabled) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('ℹ️  Email service not configured (development mode)');
      } else {
        console.warn('⚠️  Email service not configured. Email notifications will be disabled.');
      }
      return false;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: this.host,
        port: this.port,
        secure: this.secure,
        auth: {
          user: this.user,
          pass: this.pass
        }
      });
      
      console.log('✅ Email service initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error.message);
      this.enabled = false;
      return false;
    }
  }

  /**
   * Send email
   */
  async sendEmail(to, subject, html, options = {}) {
    if (!this.enabled || !this.transporter) {
      throw new Error('Email service not available');
    }

    try {
      this.sentCount++;
      
      const mailOptions = {
        from: options.from || this.from,
        to,
        subject,
        html,
        ...options
      };

      const info = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      this.errorCount++;
      console.error('Email sending error:', error.message);
      throw error;
    }
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmails(recipients, subject, html, options = {}) {
    const results = [];
    
    for (const recipient of recipients) {
      try {
        const result = await this.sendEmail(recipient, subject, html, options);
        results.push({ recipient, success: true, ...result });
      } catch (error) {
        results.push({ recipient, success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      enabled: this.enabled,
      host: this.host,
      sentCount: this.sentCount,
      errorCount: this.errorCount,
      successRate: this.sentCount > 0 
        ? ((this.sentCount - this.errorCount) / this.sentCount * 100).toFixed(2) + '%'
        : 'N/A'
    };
  }

  /**
   * Health check
   */
  async healthCheck() {
    if (!this.enabled) {
      return { status: 'disabled', message: 'Email service not configured' };
    }

    try {
      await this.transporter.verify();
      return { status: 'healthy', message: 'Email service is ready' };
    } catch (error) {
      return { status: 'unhealthy', message: error.message };
    }
  }
}

/**
 * SMS Service Configuration (Twilio)
 */
class SMSService {
  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER;
    this.client = null;
    this.enabled = !!(this.accountSid && this.authToken && this.phoneNumber);
    this.sentCount = 0;
    this.errorCount = 0;
  }

  /**
   * Initialize Twilio client
   */
  initialize() {
    if (!this.enabled) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('ℹ️  SMS service not configured (development mode)');
      } else {
        console.warn('⚠️  SMS service not configured. SMS notifications will be disabled.');
      }
      return false;
    }

    try {
      this.client = twilio(this.accountSid, this.authToken);
      console.log('✅ SMS service initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize SMS service:', error.message);
      this.enabled = false;
      return false;
    }
  }

  /**
   * Send SMS
   */
  async sendSMS(to, message) {
    if (!this.enabled || !this.client) {
      throw new Error('SMS service not available');
    }

    try {
      this.sentCount++;
      
      const result = await this.client.messages.create({
        body: message,
        from: this.phoneNumber,
        to
      });

      return {
        success: true,
        sid: result.sid,
        status: result.status
      };
    } catch (error) {
      this.errorCount++;
      console.error('SMS sending error:', error.message);
      throw error;
    }
  }

  /**
   * Send bulk SMS
   */
  async sendBulkSMS(recipients, message) {
    const results = [];
    
    for (const recipient of recipients) {
      try {
        const result = await this.sendSMS(recipient, message);
        results.push({ recipient, success: true, ...result });
      } catch (error) {
        results.push({ recipient, success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      enabled: this.enabled,
      phoneNumber: this.phoneNumber,
      sentCount: this.sentCount,
      errorCount: this.errorCount,
      successRate: this.sentCount > 0 
        ? ((this.sentCount - this.errorCount) / this.sentCount * 100).toFixed(2) + '%'
        : 'N/A'
    };
  }

  /**
   * Health check
   */
  async healthCheck() {
    if (!this.enabled) {
      return { status: 'disabled', message: 'SMS service not configured' };
    }

    try {
      // Verify account by fetching account details
      await this.client.api.accounts(this.accountSid).fetch();
      return { status: 'healthy', message: 'SMS service is ready' };
    } catch (error) {
      return { status: 'unhealthy', message: error.message };
    }
  }
}

/**
 * Push Notification Service Configuration
 */
class PushNotificationService {
  constructor() {
    this.enabled = false; // Will be enabled when web push is configured
    this.sentCount = 0;
    this.errorCount = 0;
  }

  /**
   * Initialize push notification service
   */
  initialize() {
    // Web Push notifications will be handled by service workers
    // This is a placeholder for future implementation
    console.log('ℹ️  Push notification service ready (handled by service workers)');
    return true;
  }

  /**
   * Send push notification
   */
  async sendPushNotification(subscription, payload) {
    // Placeholder for web push implementation
    // In production, use web-push library
    console.log('Push notification would be sent:', { subscription, payload });
    return { success: true };
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      enabled: this.enabled,
      sentCount: this.sentCount,
      errorCount: this.errorCount
    };
  }

  /**
   * Health check
   */
  async healthCheck() {
    return { status: 'ready', message: 'Push notification service ready' };
  }
}

/**
 * External Services Manager
 */
class ExternalServicesManager {
  constructor() {
    this.openai = new OpenAIService();
    this.email = new EmailService();
    this.sms = new SMSService();
    this.push = new PushNotificationService();
  }

  /**
   * Initialize all services
   */
  async initialize() {
    console.log('\n🔧 Initializing external services...\n');

    const results = {
      openai: this.openai.initialize(),
      email: this.email.initialize(),
      sms: this.sms.initialize(),
      push: this.push.initialize()
    };

    const enabledCount = Object.values(results).filter(Boolean).length;
    console.log(`\n✅ ${enabledCount}/4 external services initialized\n`);

    return results;
  }

  /**
   * Get all service statistics
   */
  getAllStats() {
    return {
      openai: this.openai.getStats(),
      email: this.email.getStats(),
      sms: this.sms.getStats(),
      push: this.push.getStats()
    };
  }

  /**
   * Health check for all services
   */
  async healthCheckAll() {
    const checks = await Promise.all([
      this.openai.healthCheck(),
      this.email.healthCheck(),
      this.sms.healthCheck(),
      this.push.healthCheck()
    ]);

    return {
      openai: checks[0],
      email: checks[1],
      sms: checks[2],
      push: checks[3],
      overall: checks.every(c => c.status === 'healthy' || c.status === 'ready' || c.status === 'disabled')
        ? 'healthy'
        : 'degraded'
    };
  }
}

// Create singleton instance
const externalServices = new ExternalServicesManager();

module.exports = externalServices;
