const redisConnection = require('../config/redis');

// Rate limiting middleware for AI chatbot
const chatbotRateLimit = (maxRequests = 30, windowMs = 60000) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id || req.ip;
      const key = `chatbot_rate_limit:${userId}`;
      
      const current = await redisConnection.get(key);
      
      if (current && current >= maxRequests) {
        return res.status(429).json({
          error: 'Too many requests. Please wait before sending another message.',
          retryAfter: Math.ceil(windowMs / 1000)
        });
      }
      
      // Increment counter
      const newCount = (current || 0) + 1;
      await redisConnection.set(key, newCount, Math.ceil(windowMs / 1000));
      
      next();
    } catch (error) {
      console.error('Rate limiting error:', error);
      // Continue without rate limiting if Redis fails
      next();
    }
  };
};

// Cache middleware for frequently accessed data
const cacheMiddleware = (keyPrefix, ttl = 300) => {
  return async (req, res, next) => {
    try {
      const cacheKey = `${keyPrefix}:${JSON.stringify(req.query)}:${req.params.id || ''}`;
      const cached = await redisConnection.get(cacheKey);
      
      if (cached) {
        return res.json(cached);
      }
      
      // Store original res.json to intercept response
      const originalJson = res.json;
      res.json = function(data) {
        // Cache the response
        redisConnection.set(cacheKey, data, ttl).catch(console.error);
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// Notification preferences middleware
const checkNotificationPreferences = async (req, res, next) => {
  try {
    if (!req.user) {
      return next();
    }
    
    const userId = req.user.id;
    const prefsKey = `notification_prefs:${userId}`;
    
    let preferences = await redisConnection.get(prefsKey);
    
    if (!preferences) {
      // Load from database and cache
      const db = require('../config/database-adapter');
      const result = await db.query(`
        SELECT preferences FROM notification_preferences 
        WHERE user_id = $1
      `, [userId]);
      
      preferences = result.rows[0]?.preferences || {
        academic: { web: true, email: true, sms: false, push: true },
        event: { web: true, email: true, sms: false, push: true },
        payment: { web: true, email: true, sms: true, push: true },
        system: { web: true, email: false, sms: false, push: true },
        social: { web: true, email: false, sms: false, push: false }
      };
      
      await redisConnection.set(prefsKey, preferences, 3600); // Cache for 1 hour
    }
    
    req.notificationPreferences = preferences;
    next();
  } catch (error) {
    console.error('Notification preferences middleware error:', error);
    next();
  }
};

// QR code validation middleware
const validateQRCode = (req, res, next) => {
  try {
    const { qrData } = req.body;
    
    if (!qrData) {
      return res.status(400).json({ error: 'QR code data is required' });
    }
    
    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid QR code format' });
    }
    
    // Basic validation
    if (!parsedData.userId || !parsedData.timestamp) {
      return res.status(400).json({ error: 'Invalid QR code data' });
    }
    
    // Check if QR code is not too old (24 hours)
    const qrAge = Date.now() - parsedData.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    if (qrAge > maxAge) {
      return res.status(400).json({ error: 'QR code has expired' });
    }
    
    req.qrData = parsedData;
    next();
  } catch (error) {
    console.error('QR validation error:', error);
    res.status(500).json({ error: 'QR code validation failed' });
  }
};

// Event capacity check middleware
const checkEventCapacity = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const db = require('../config/database-adapter');
    
    const result = await db.query(`
      SELECT current_attendees, max_attendees, 
      (max_attendees - current_attendees) as available_slots
      FROM events 
      WHERE id = $1 AND is_active = true
    `, [eventId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const event = result.rows[0];
    
    if (event.available_slots <= 0) {
      return res.status(400).json({ 
        error: 'Event is fully booked',
        waitlistAvailable: true 
      });
    }
    
    req.eventCapacity = event;
    next();
  } catch (error) {
    console.error('Event capacity check error:', error);
    res.status(500).json({ error: 'Failed to check event capacity' });
  }
};

// Alumni verification middleware
const requireAlumniOrAdmin = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const db = require('../config/database-adapter');
    
    const result = await db.query(`
      SELECT u.role, ap.id as alumni_profile_id
      FROM users u
      LEFT JOIN alumni_profiles ap ON u.id = ap.user_id
      WHERE u.id = $1 AND (u.role IN ('admin', 'super_admin') OR ap.id IS NOT NULL)
    `, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(403).json({ 
        error: 'Access denied. Alumni verification required.' 
      });
    }
    
    req.isAlumni = result.rows[0].alumni_profile_id !== null;
    next();
  } catch (error) {
    console.error('Alumni verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
};

// File upload validation middleware
const validateFileUpload = (allowedTypes = [], maxSize = 5 * 1024 * 1024) => {
  return (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      return next();
    }
    
    for (const fieldName in req.files) {
      const files = Array.isArray(req.files[fieldName]) 
        ? req.files[fieldName] 
        : [req.files[fieldName]];
      
      for (const file of files) {
        // Check file size
        if (file.size > maxSize) {
          return res.status(400).json({
            error: `File ${file.originalname} is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`
          });
        }
        
        // Check file type
        if (allowedTypes.length > 0) {
          const fileExtension = file.originalname.split('.').pop().toLowerCase();
          const mimeTypeValid = allowedTypes.some(type => file.mimetype.includes(type));
          const extensionValid = allowedTypes.includes(fileExtension);
          
          if (!mimeTypeValid && !extensionValid) {
            return res.status(400).json({
              error: `File type not allowed for ${file.originalname}. Allowed types: ${allowedTypes.join(', ')}`
            });
          }
        }
      }
    }
    
    next();
  };
};

// Session validation for real-time features
const validateRealtimeSession = async (req, res, next) => {
  try {
    const sessionId = req.headers['x-session-id'] || req.query.sessionId;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required for real-time features' });
    }
    
    // Validate session exists and is active
    const sessionKey = `session:${sessionId}`;
    const sessionData = await redisConnection.get(sessionKey);
    
    if (!sessionData) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }
    
    req.sessionData = sessionData;
    next();
  } catch (error) {
    console.error('Real-time session validation error:', error);
    res.status(500).json({ error: 'Session validation failed' });
  }
};

module.exports = {
  chatbotRateLimit,
  cacheMiddleware,
  checkNotificationPreferences,
  validateQRCode,
  checkEventCapacity,
  requireAlumniOrAdmin,
  validateFileUpload,
  validateRealtimeSession
};