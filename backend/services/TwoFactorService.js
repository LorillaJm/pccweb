const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const TwoFactor = require('../models/TwoFactor');
const User = require('../models/User');

class TwoFactorService {
  /**
   * Generate a 6-digit 2FA code
   * @returns {string}
   */
  generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generate backup codes for account recovery
   * @param {number} count - Number of backup codes to generate
   * @returns {Array<string>}
   */
  generateBackupCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric code
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Hash a code using bcrypt
   * @param {string} code - Code to hash
   * @returns {Promise<string>}
   */
  async hashCode(code) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(code, salt);
  }

  /**
   * Verify a code against a hash
   * @param {string} code - Plain code
   * @param {string} hash - Hashed code
   * @returns {Promise<boolean>}
   */
  async verifyCode(code, hash) {
    return await bcrypt.compare(code, hash);
  }

  /**
   * Enable 2FA for a user
   * @param {string} userId - User ID
   * @param {string} method - 2FA method ('email', 'sms', 'totp')
   * @returns {Promise<{backupCodes: Array<string>}>}
   */
  async enable(userId, method = 'email') {
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();
    const hashedBackupCodes = await Promise.all(
      backupCodes.map(code => this.hashCode(code))
    );

    // Create or update 2FA record
    let twoFactor = await TwoFactor.findOne({ userId });

    if (twoFactor) {
      twoFactor.enabled = true;
      twoFactor.method = method;
      twoFactor.backupCodes = hashedBackupCodes;
      twoFactor.attempts = 0;
      twoFactor.lockedUntil = null;
      await twoFactor.save();
    } else {
      twoFactor = await TwoFactor.create({
        userId,
        enabled: true,
        method,
        backupCodes: hashedBackupCodes
      });
    }

    // Update user's 2FA status
    user.twoFactorEnabled = true;
    await user.save();

    // Return plain backup codes (only time they're shown)
    return { backupCodes };
  }

  /**
   * Disable 2FA for a user
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async disable(userId) {
    const twoFactor = await TwoFactor.findOne({ userId });

    if (twoFactor) {
      twoFactor.enabled = false;
      twoFactor.code = null;
      twoFactor.codeExpiresAt = null;
      twoFactor.attempts = 0;
      twoFactor.lockedUntil = null;
      await twoFactor.save();
    }

    // Update user's 2FA status
    const user = await User.findById(userId);
    if (user) {
      user.twoFactorEnabled = false;
      await user.save();
    }
  }

  /**
   * Generate and store a 2FA code
   * @param {string} userId - User ID
   * @returns {Promise<{code: string, expiresAt: Date}>}
   */
  async generateAndStoreCode(userId) {
    const twoFactor = await TwoFactor.findOne({ userId, enabled: true });

    if (!twoFactor) {
      throw new Error('2FA is not enabled for this user');
    }

    // Check if account is locked
    if (twoFactor.lockedUntil && twoFactor.lockedUntil > new Date()) {
      const remainingTime = Math.ceil((twoFactor.lockedUntil - new Date()) / 1000 / 60);
      throw new Error(`Account is locked. Try again in ${remainingTime} minutes.`);
    }

    // Generate code
    const code = this.generateCode();
    const hashedCode = await this.hashCode(code);

    // Set expiration (10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Store hashed code
    twoFactor.code = hashedCode;
    twoFactor.codeExpiresAt = expiresAt;
    twoFactor.attempts = 0; // Reset attempts when new code is generated
    await twoFactor.save();

    return { code, expiresAt };
  }

  /**
   * Verify a 2FA code
   * @param {string} userId - User ID
   * @param {string} code - Code to verify
   * @returns {Promise<{valid: boolean, locked?: boolean, remainingAttempts?: number}>}
   */
  async verifyUserCode(userId, code) {
    const twoFactor = await TwoFactor.findOne({ userId, enabled: true });

    if (!twoFactor) {
      return { valid: false, error: '2FA is not enabled' };
    }

    // Check if account is locked
    if (twoFactor.lockedUntil && twoFactor.lockedUntil > new Date()) {
      const remainingTime = Math.ceil((twoFactor.lockedUntil - new Date()) / 1000 / 60);
      return {
        valid: false,
        locked: true,
        error: `Account is locked. Try again in ${remainingTime} minutes.`
      };
    }

    // Check if code exists and hasn't expired
    if (!twoFactor.code || !twoFactor.codeExpiresAt) {
      return { valid: false, error: 'No active 2FA code' };
    }

    if (twoFactor.codeExpiresAt < new Date()) {
      return { valid: false, error: '2FA code has expired' };
    }

    // Verify code
    const isValid = await this.verifyCode(code, twoFactor.code);

    if (!isValid) {
      // Increment failed attempts
      twoFactor.attempts += 1;

      // Lock account after 3 failed attempts
      if (twoFactor.attempts >= 3) {
        twoFactor.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await twoFactor.save();

        return {
          valid: false,
          locked: true,
          error: 'Too many failed attempts. Account locked for 15 minutes.'
        };
      }

      await twoFactor.save();

      return {
        valid: false,
        remainingAttempts: 3 - twoFactor.attempts,
        error: 'Invalid 2FA code'
      };
    }

    // Code is valid - clear it and reset attempts
    twoFactor.code = null;
    twoFactor.codeExpiresAt = null;
    twoFactor.attempts = 0;
    twoFactor.lockedUntil = null;
    twoFactor.lastUsedAt = new Date();
    await twoFactor.save();

    return { valid: true };
  }

  /**
   * Verify a backup code
   * @param {string} userId - User ID
   * @param {string} backupCode - Backup code to verify
   * @returns {Promise<{valid: boolean}>}
   */
  async verifyBackupCode(userId, backupCode) {
    const twoFactor = await TwoFactor.findOne({ userId, enabled: true });

    if (!twoFactor || !twoFactor.backupCodes || twoFactor.backupCodes.length === 0) {
      return { valid: false, error: 'No backup codes available' };
    }

    // Check each backup code
    for (let i = 0; i < twoFactor.backupCodes.length; i++) {
      const isValid = await this.verifyCode(backupCode, twoFactor.backupCodes[i]);

      if (isValid) {
        // Remove used backup code
        twoFactor.backupCodes.splice(i, 1);
        twoFactor.lastUsedAt = new Date();
        await twoFactor.save();

        return {
          valid: true,
          remainingBackupCodes: twoFactor.backupCodes.length
        };
      }
    }

    return { valid: false, error: 'Invalid backup code' };
  }

  /**
   * Check if 2FA is enabled for a user
   * @param {string} userId - User ID
   * @returns {Promise<boolean>}
   */
  async isEnabled(userId) {
    const twoFactor = await TwoFactor.findOne({ userId, enabled: true });
    return !!twoFactor;
  }

  /**
   * Get 2FA status for a user
   * @param {string} userId - User ID
   * @returns {Promise<object>}
   */
  async getStatus(userId) {
    const twoFactor = await TwoFactor.findOne({ userId });

    if (!twoFactor) {
      return {
        enabled: false,
        method: null,
        backupCodesCount: 0
      };
    }

    return {
      enabled: twoFactor.enabled,
      method: twoFactor.method,
      backupCodesCount: twoFactor.backupCodes?.length || 0,
      lastUsedAt: twoFactor.lastUsedAt,
      isLocked: twoFactor.lockedUntil && twoFactor.lockedUntil > new Date()
    };
  }
}

module.exports = new TwoFactorService();
