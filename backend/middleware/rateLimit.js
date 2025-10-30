const RateLimitService = require('../services/RateLimitService');

/**
 * Rate limit middleware for registration
 * Limits by IP address: 5 attempts per hour
 */
const rateLimitRegistration = RateLimitService.createMiddleware(
  'register',
  (req) => req.ip || req.connection.remoteAddress
);

/**
 * Rate limit middleware for login
 * Limits by email + IP: 5 attempts per 15 minutes
 */
const rateLimitLogin = RateLimitService.createMiddleware(
  'login',
  (req) => {
    const email = req.body.email || 'unknown';
    const ip = req.ip || req.connection.remoteAddress;
    return `${email}:${ip}`;
  }
);

/**
 * Rate limit middleware for email verification
 * Limits by user ID: 10 attempts per hour
 */
const rateLimitVerification = RateLimitService.createMiddleware(
  'verification',
  (req) => {
    // Use token or email from request
    return req.body.token || req.body.email || req.ip;
  }
);

/**
 * Rate limit middleware for resending verification email
 * Limits by user ID: 3 attempts per hour
 */
const rateLimitResendEmail = RateLimitService.createMiddleware(
  'resendEmail',
  (req) => {
    // Use user ID if authenticated, otherwise IP
    return req.user?.id || req.body.email || req.ip;
  }
);

/**
 * Rate limit middleware for 2FA verification
 * Limits by user ID: 3 attempts per 15 minutes
 */
const rateLimitTwoFactor = RateLimitService.createMiddleware(
  'twoFactor',
  (req) => {
    return req.user?.id || req.body.email || req.ip;
  }
);

module.exports = {
  rateLimitRegistration,
  rateLimitLogin,
  rateLimitVerification,
  rateLimitResendEmail,
  rateLimitTwoFactor
};
