const Queue = require('bull');

// Create Redis connection for Bull with fallback
const redisConfig = {
  host: process.env.BULL_REDIS_HOST || process.env.REDIS_HOST || 'localhost',
  port: process.env.BULL_REDIS_PORT || process.env.REDIS_PORT || 6379,
  password: process.env.BULL_REDIS_PASSWORD || process.env.REDIS_PASSWORD || undefined,
  db: 1, // Use different DB for Bull queues
  connectTimeout: 5000,
  lazyConnect: true
};

let queuesEnabled = process.env.REDIS_ENABLED !== 'false';
let notificationQueue, emailQueue, smsQueue, reportQueue;

// In-memory fallback for when Redis is not available
const inMemoryJobs = {
  notification: [],
  email: [],
  sms: [],
  report: []
};

if (queuesEnabled) {
  try {
    // Create queues for different job types
    notificationQueue = new Queue('notification processing', {
    redis: redisConfig,
    defaultJobOptions: {
      removeOnComplete: 100, // Keep last 100 completed jobs
      removeOnFail: 50,      // Keep last 50 failed jobs
      attempts: parseInt(process.env.NOTIFICATION_RETRY_ATTEMPTS) || 3,
      backoff: {
        type: 'exponential',
        delay: parseInt(process.env.NOTIFICATION_RETRY_DELAY) || 5000
      }
    }
  });

    // Test queue connection
    notificationQueue.on('error', (error) => {
      console.warn('⚠️  Queue connection failed, using in-memory fallback:', error.message);
      queuesEnabled = false;
    });
  } catch (error) {
    console.warn('⚠️  Failed to initialize queues, using in-memory processing:', error.message);
    queuesEnabled = false;
  }
} else {
  console.log('ℹ️  Redis queues disabled, using in-memory processing');
}

if (queuesEnabled) {
  try {
    emailQueue = new Queue('email processing', {
      redis: redisConfig,
      defaultJobOptions: {
        removeOnComplete: 50,
        removeOnFail: 25,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      }
    });

    smsQueue = new Queue('sms processing', {
      redis: redisConfig,
      defaultJobOptions: {
        removeOnComplete: 50,
        removeOnFail: 25,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 3000
        }
      }
    });

    reportQueue = new Queue('report generation', {
      redis: redisConfig,
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 10,
        attempts: 2,
        backoff: {
          type: 'fixed',
          delay: 10000
        }
      }
    });
  } catch (error) {
    console.warn('⚠️  Failed to initialize additional queues:', error.message);
    queuesEnabled = false;
  }
}

// Fallback processing functions
async function processNotificationFallback(jobData) {
  console.log('Processing notification in fallback mode');
  const { userId, notification, channels } = jobData;
  
  const results = [];
  
  for (const channel of channels) {
    switch (channel) {
      case 'email':
        if (notification.email) {
          await processEmailFallback({
            to: notification.email,
            subject: notification.title,
            html: notification.message,
            userId
          });
          results.push({ channel: 'email', status: 'processed' });
        }
        break;
        
      case 'sms':
        if (notification.phone) {
          await processSMSFallback({
            to: notification.phone,
            message: `${notification.title}: ${notification.message}`,
            userId
          });
          results.push({ channel: 'sms', status: 'processed' });
        }
        break;
        
      case 'push':
        // Handle push notifications through Socket.IO
        try {
          const socketManager = require('./socket');
          const sent = await socketManager.sendToUser(userId, 'notification', notification);
          results.push({ channel: 'push', sent });
        } catch (error) {
          console.warn('Push notification fallback failed:', error.message);
          results.push({ channel: 'push', sent: false, error: error.message });
        }
        break;
    }
  }
  
  return { success: true, results };
}

async function processEmailFallback(jobData) {
  const { to, subject, html, text, userId } = jobData;
  
  try {
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
      text
    });
    
    console.log(`Email sent to ${to}: ${result.messageId}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}

async function processSMSFallback(jobData) {
  const { to, message, userId } = jobData;
  
  try {
    const twilio = require('twilio');
    
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });
    
    console.log(`SMS sent to ${to}: ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('SMS sending error:', error);
    throw error;
  }
}

// Job processors (only if queues are enabled)
if (queuesEnabled && notificationQueue) {
  notificationQueue.process('send-notification', async (job) => {
  const { userId, notification, channels } = job.data;
  
  try {
    const results = [];
    
    // Process each notification channel
    for (const channel of channels) {
      switch (channel) {
        case 'email':
          if (notification.email) {
            const emailJob = await emailQueue.add('send-email', {
              to: notification.email,
              subject: notification.title,
              html: notification.message,
              userId
            });
            results.push({ channel: 'email', jobId: emailJob.id });
          }
          break;
          
        case 'sms':
          if (notification.phone) {
            const smsJob = await smsQueue.add('send-sms', {
              to: notification.phone,
              message: `${notification.title}: ${notification.message}`,
              userId
            });
            results.push({ channel: 'sms', jobId: smsJob.id });
          }
          break;
          
        case 'push':
          // Handle push notifications through Socket.IO
          const socketManager = require('./socket');
          const sent = await socketManager.sendToUser(userId, 'notification', notification);
          results.push({ channel: 'push', sent });
          break;
          
        default:
          console.warn(`Unknown notification channel: ${channel}`);
      }
    }
    
    return { success: true, results };
  } catch (error) {
    console.error('Notification processing error:', error);
    throw error;
  }
});
}

if (queuesEnabled && emailQueue) {
  emailQueue.process('send-email', async (job) => {
  const { to, subject, html, text, userId } = job.data;
  
  try {
    const nodemailer = require('nodemailer');
    
    // Create transporter
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    // Send email
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
      text
    });
    
    console.log(`Email sent to ${to}: ${result.messageId}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
});
}

if (queuesEnabled && smsQueue) {
  smsQueue.process('send-sms', async (job) => {
  const { to, message, userId } = job.data;
  
  try {
    const twilio = require('twilio');
    
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });
    
    console.log(`SMS sent to ${to}: ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('SMS sending error:', error);
    throw error;
  }
});
}

if (queuesEnabled && reportQueue) {
  reportQueue.process('generate-analytics-report', async (job) => {
  const { reportType, dateRange, userId } = job.data;
  
  try {
    // This would contain the actual report generation logic
    console.log(`Generating ${reportType} report for user ${userId}`);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    return { 
      success: true, 
      reportPath: `/reports/${reportType}_${Date.now()}.pdf`,
      generatedAt: new Date()
    };
  } catch (error) {
    console.error('Report generation error:', error);
    throw error;
  }
});
}

// Queue event handlers (only if queues are enabled)
if (queuesEnabled && notificationQueue) {
  notificationQueue.on('completed', (job, result) => {
  console.log(`Notification job ${job.id} completed:`, result);
});

notificationQueue.on('failed', (job, err) => {
  console.error(`Notification job ${job.id} failed:`, err.message);
});

emailQueue.on('completed', (job, result) => {
  console.log(`Email job ${job.id} completed:`, result);
});

emailQueue.on('failed', (job, err) => {
  console.error(`Email job ${job.id} failed:`, err.message);
});

smsQueue.on('completed', (job, result) => {
  console.log(`SMS job ${job.id} completed:`, result);
});

  if (smsQueue) {
    smsQueue.on('completed', (job, result) => {
      console.log(`SMS job ${job.id} completed:`, result);
    });

    smsQueue.on('failed', (job, err) => {
      console.error(`SMS job ${job.id} failed:`, err.message);
    });
  }
}

// Queue management functions with fallback
const addNotificationJob = async (userId, notification, channels = ['push']) => {
  try {
    if (queuesEnabled && notificationQueue) {
      const job = await notificationQueue.add('send-notification', {
        userId,
        notification,
        channels
      }, {
        priority: notification.priority === 'urgent' ? 1 : 
                  notification.priority === 'high' ? 2 : 
                  notification.priority === 'medium' ? 3 : 4
      });
      
      return job;
    } else {
      // Fallback: process immediately
      console.log('Processing notification job in fallback mode');
      const result = await processNotificationFallback({
        userId,
        notification,
        channels
      });
      
      return {
        id: `fallback_${Date.now()}`,
        data: { userId, notification, channels },
        result,
        processedAt: new Date()
      };
    }
  } catch (error) {
    console.error('Error adding notification job:', error);
    // Try fallback processing
    try {
      const result = await processNotificationFallback({
        userId,
        notification,
        channels
      });
      return {
        id: `fallback_${Date.now()}`,
        data: { userId, notification, channels },
        result,
        processedAt: new Date()
      };
    } catch (fallbackError) {
      console.error('Fallback processing also failed:', fallbackError);
      throw error;
    }
  }
};

const addEmailJob = async (emailData) => {
  try {
    if (queuesEnabled && emailQueue) {
      const job = await emailQueue.add('send-email', emailData);
      return job;
    } else {
      // Fallback: process immediately
      console.log('Processing email job in fallback mode');
      const result = await processEmailFallback(emailData);
      return {
        id: `fallback_${Date.now()}`,
        data: emailData,
        result,
        processedAt: new Date()
      };
    }
  } catch (error) {
    console.error('Error adding email job:', error);
    // Try fallback
    try {
      const result = await processEmailFallback(emailData);
      return {
        id: `fallback_${Date.now()}`,
        data: emailData,
        result,
        processedAt: new Date()
      };
    } catch (fallbackError) {
      console.error('Email fallback processing failed:', fallbackError);
      throw error;
    }
  }
};

const addSMSJob = async (smsData) => {
  try {
    if (queuesEnabled && smsQueue) {
      const job = await smsQueue.add('send-sms', smsData);
      return job;
    } else {
      // Fallback: process immediately
      console.log('Processing SMS job in fallback mode');
      const result = await processSMSFallback(smsData);
      return {
        id: `fallback_${Date.now()}`,
        data: smsData,
        result,
        processedAt: new Date()
      };
    }
  } catch (error) {
    console.error('Error adding SMS job:', error);
    // Try fallback
    try {
      const result = await processSMSFallback(smsData);
      return {
        id: `fallback_${Date.now()}`,
        data: smsData,
        result,
        processedAt: new Date()
      };
    } catch (fallbackError) {
      console.error('SMS fallback processing failed:', fallbackError);
      throw error;
    }
  }
};

const addReportJob = async (reportData) => {
  try {
    if (queuesEnabled && reportQueue) {
      const job = await reportQueue.add('generate-analytics-report', reportData);
      return job;
    } else {
      // Fallback: add to in-memory queue for later processing
      console.log('Adding report job to in-memory queue');
      inMemoryJobs.report.push({
        id: `fallback_${Date.now()}`,
        data: reportData,
        addedAt: new Date()
      });
      return {
        id: `fallback_${Date.now()}`,
        data: reportData,
        status: 'queued_in_memory'
      };
    }
  } catch (error) {
    console.error('Error adding report job:', error);
    // Add to in-memory queue as fallback
    inMemoryJobs.report.push({
      id: `fallback_${Date.now()}`,
      data: reportData,
      addedAt: new Date()
    });
    return {
      id: `fallback_${Date.now()}`,
      data: reportData,
      status: 'queued_in_memory'
    };
  }
};

// Queue statistics with fallback
const getQueueStats = async () => {
  try {
    if (queuesEnabled) {
      const stats = {
        enabled: true,
        notification: notificationQueue ? {
          waiting: await notificationQueue.getWaiting().then(jobs => jobs.length),
          active: await notificationQueue.getActive().then(jobs => jobs.length),
          completed: await notificationQueue.getCompleted().then(jobs => jobs.length),
          failed: await notificationQueue.getFailed().then(jobs => jobs.length)
        } : { error: 'Queue not initialized' },
        email: emailQueue ? {
          waiting: await emailQueue.getWaiting().then(jobs => jobs.length),
          active: await emailQueue.getActive().then(jobs => jobs.length),
          completed: await emailQueue.getCompleted().then(jobs => jobs.length),
          failed: await emailQueue.getFailed().then(jobs => jobs.length)
        } : { error: 'Queue not initialized' },
        sms: smsQueue ? {
          waiting: await smsQueue.getWaiting().then(jobs => jobs.length),
          active: await smsQueue.getActive().then(jobs => jobs.length),
          completed: await smsQueue.getCompleted().then(jobs => jobs.length),
          failed: await smsQueue.getFailed().then(jobs => jobs.length)
        } : { error: 'Queue not initialized' },
        report: reportQueue ? {
          waiting: await reportQueue.getWaiting().then(jobs => jobs.length),
          active: await reportQueue.getActive().then(jobs => jobs.length),
          completed: await reportQueue.getCompleted().then(jobs => jobs.length),
          failed: await reportQueue.getFailed().then(jobs => jobs.length)
        } : { error: 'Queue not initialized' }
      };
      
      return stats;
    } else {
      // Return in-memory stats
      return {
        enabled: false,
        fallbackMode: true,
        notification: { inMemory: inMemoryJobs.notification.length },
        email: { inMemory: inMemoryJobs.email.length },
        sms: { inMemory: inMemoryJobs.sms.length },
        report: { inMemory: inMemoryJobs.report.length }
      };
    }
  } catch (error) {
    console.error('Error getting queue stats:', error);
    return {
      enabled: false,
      error: error.message,
      fallbackMode: true,
      notification: { inMemory: inMemoryJobs.notification.length },
      email: { inMemory: inMemoryJobs.email.length },
      sms: { inMemory: inMemoryJobs.sms.length },
      report: { inMemory: inMemoryJobs.report.length }
    };
  }
};

module.exports = {
  notificationQueue,
  emailQueue,
  smsQueue,
  reportQueue,
  addNotificationJob,
  addEmailJob,
  addSMSJob,
  addReportJob,
  getQueueStats
};