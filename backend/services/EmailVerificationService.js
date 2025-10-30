const crypto = require('crypto');
const EmailVerification = require('../models/EmailVerification');
const User = require('../models/User');

class EmailVerificationService {
  /**
   * Generate a secure verification token and OTP
   * @param {string} userId - User ID
   * @param {string} email - Email address
   * @param {string} type - Verification type ('registration' or 'email-change')
   * @returns {Promise<{token: string, otp: string}>}
   */
  async generateVerificationToken(userId, email, type = 'registration') {
    // Generate secure random token (32 bytes = 64 hex characters)
    const token = crypto.randomBytes(32).toString('hex');
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration to 24 hours from now
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    // Invalidate any existing verification tokens for this user and type
    await EmailVerification.updateMany(
      { userId, type, verified: false },
      { $set: { verified: false, expiresAt: new Date() } }
    );
    
    // Create new verification record
    await EmailVerification.create({
      userId,
      email: email.toLowerCase().trim(),
      type,
      token,
      otp,
      expiresAt,
      verified: false,
      attempts: 0
    });
    
    return { token, otp };
  }

  /**
   * Verify a token and mark user as verified
   * @param {string} token - Verification token
   * @param {string} ipAddress - IP address of requester
   * @param {string} userAgent - User agent string
   * @returns {Promise<{success: boolean, userId?: string, message?: string}>}
   */
  async verifyToken(token, ipAddress = null, userAgent = null) {
    const verification = await EmailVerification.findOne({ token, verified: false });
    
    if (!verification) {
      return { success: false, message: 'Invalid or already used verification token' };
    }
    
    // Check if token is expired
    if (verification.expiresAt < new Date()) {
      return { success: false, message: 'Verification token has expired', expired: true };
    }
    
    // Mark verification as complete
    verification.verified = true;
    verification.verifiedAt = new Date();
    if (ipAddress) verification.ipAddress = ipAddress;
    if (userAgent) verification.userAgent = userAgent;
    await verification.save();
    
    // Update user's email verification status
    const user = await User.findById(verification.userId);
    if (user) {
      user.emailVerified = true;
      user.emailVerifiedAt = new Date();
      await user.save();
    }
    
    return { success: true, userId: verification.userId.toString() };
  }

  /**
   * Verify an OTP code
   * @param {string} email - Email address
   * @param {string} otp - OTP code
   * @param {string} ipAddress - IP address of requester
   * @param {string} userAgent - User agent string
   * @returns {Promise<{success: boolean, userId?: string, message?: string}>}
   */
  async verifyOTP(email, otp, ipAddress = null, userAgent = null) {
    const verification = await EmailVerification.findOne({
      email: email.toLowerCase().trim(),
      otp,
      verified: false
    }).sort({ createdAt: -1 });
    
    if (!verification) {
      // Increment attempts for the most recent verification
      const latestVerification = await EmailVerification.findOne({
        email: email.toLowerCase().trim(),
        verified: false
      }).sort({ createdAt: -1 });
      
      if (latestVerification) {
        latestVerification.attempts += 1;
        await latestVerification.save();
      }
      
      return { success: false, message: 'Invalid OTP code' };
    }
    
    // Check if token is expired
    if (verification.expiresAt < new Date()) {
      return { success: false, message: 'OTP code has expired', expired: true };
    }
    
    // Mark verification as complete
    verification.verified = true;
    verification.verifiedAt = new Date();
    if (ipAddress) verification.ipAddress = ipAddress;
    if (userAgent) verification.userAgent = userAgent;
    await verification.save();
    
    // Update user's email verification status
    const user = await User.findById(verification.userId);
    if (user) {
      user.emailVerified = true;
      user.emailVerifiedAt = new Date();
      await user.save();
    }
    
    return { success: true, userId: verification.userId.toString() };
  }

  /**
   * Resend verification email by invalidating old tokens and generating new ones
   * @param {string} userId - User ID
   * @returns {Promise<{token: string, otp: string, email: string}>}
   */
  async resendVerification(userId) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (user.emailVerified) {
      throw new Error('Email already verified');
    }
    
    // Generate new token and OTP
    const { token, otp } = await this.generateVerificationToken(
      userId,
      user.email,
      'registration'
    );
    
    return { token, otp, email: user.email };
  }

  /**
   * Check if a user's email is verified
   * @param {string} userId - User ID
   * @returns {Promise<boolean>}
   */
  async isEmailVerified(userId) {
    const user = await User.findById(userId);
    return user ? user.emailVerified : false;
  }

  /**
   * Get verification status for a user
   * @param {string} userId - User ID
   * @returns {Promise<object>}
   */
  async getVerificationStatus(userId) {
    const user = await User.findById(userId);
    
    if (!user) {
      return null;
    }
    
    const latestVerification = await EmailVerification.findOne({
      userId,
      verified: false
    }).sort({ createdAt: -1 });
    
    return {
      emailVerified: user.emailVerified,
      emailVerifiedAt: user.emailVerifiedAt,
      hasPendingVerification: !!latestVerification,
      pendingVerificationExpires: latestVerification?.expiresAt
    };
  }

  /**
   * Clean up expired verification tokens
   * @returns {Promise<number>} Number of deleted records
   */
  async cleanupExpiredTokens() {
    const result = await EmailVerification.deleteMany({
      expiresAt: { $lt: new Date() },
      verified: false
    });
    
    return result.deletedCount;
  }
}

module.exports = new EmailVerificationService();
