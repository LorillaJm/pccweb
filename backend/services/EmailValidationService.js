const dns = require('dns').promises;

class EmailValidationService {
  constructor() {
    // Comprehensive list of disposable email domains
    this.disposableDomains = new Set([
      // Popular disposable email services
      'tempmail.com', 'temp-mail.org', 'temp-mail.io', 'temp-mail.de',
      'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org',
      'mailinator.com', 'mailinator2.com', 'mailinator.net',
      '10minutemail.com', '10minutemail.net', '10minutemail.org',
      'throwaway.email', 'throwawaymail.com',
      'getnada.com', 'getairmail.com',
      'maildrop.cc', 'mailnesia.com', 'mailcatch.com',
      'trashmail.com', 'trashmail.net', 'trash-mail.com',
      'yopmail.com', 'yopmail.net', 'yopmail.fr',
      'fakeinbox.com', 'fakemail.net',
      'dispostable.com', 'disposablemail.com',
      'mintemail.com', 'mytemp.email', 'mytempmail.com',
      'sharklasers.com', 'grr.la',
      'emailondeck.com', 'spamgourmet.com',
      'mohmal.com', 'emailfake.com',
      'tempinbox.com', 'tempmail.net',
      'burnermail.io', 'anonymousemail.me',
      'hidemail.de', 'spambox.us',
      'mailtemp.net', 'mailtemp.info',
      'emailtemporanea.com', 'emailtemporanea.net',
      'crazymailing.com', 'mailexpire.com',
      'tempsky.com', 'tempr.email',
      'dropmail.me', 'inboxbear.com',
      'spambox.xyz', 'spambox.info',
      'emailna.co', 'emailsensei.com',
      'tmail.ws', 'tmailinator.com',
      'incognitomail.com', 'incognitomail.net',
      'fakeemailgenerator.com', 'fakemailgenerator.com',
      'mailsac.com', 'mailsac.net',
      'gettempmail.com', 'tempemailaddress.com',
      'emailfake.ml', 'emailfake.ga',
      'mvrht.com', 'mvrht.net',
      'zetmail.com', 'zetmail.net',
      'luxusmail.org', 'spamfree24.org',
      'wegwerfmail.de', 'wegwerfemail.de',
      'trashmail.ws', 'trashmail.me',
      'emaildrop.io', 'emaildrop.net'
    ]);

    // RFC 5322 compliant email regex (simplified but robust)
    this.emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  }

  /**
   * Validate email format using RFC 5322 standards
   * @param {string} email - Email address to validate
   * @returns {boolean}
   */
  validateFormat(email) {
    if (!email || typeof email !== 'string') {
      return false;
    }

    const trimmedEmail = email.trim();
    
    // Check length constraints
    if (trimmedEmail.length > 254) {
      return false;
    }

    // Check format with regex
    if (!this.emailRegex.test(trimmedEmail)) {
      return false;
    }

    // Additional checks
    const [localPart, domain] = trimmedEmail.split('@');
    
    // Local part (before @) should not exceed 64 characters
    if (localPart.length > 64) {
      return false;
    }

    // Domain should not exceed 253 characters
    if (domain.length > 253) {
      return false;
    }

    return true;
  }

  /**
   * Check if email domain is in disposable email blacklist
   * @param {string} email - Email address to check
   * @returns {boolean}
   */
  isDisposableEmail(email) {
    if (!email || typeof email !== 'string') {
      return false;
    }

    const domain = email.split('@')[1]?.toLowerCase().trim();
    
    if (!domain) {
      return false;
    }

    return this.disposableDomains.has(domain);
  }

  /**
   * Verify MX records exist for email domain
   * @param {string} email - Email address to check
   * @returns {Promise<{valid: boolean, mxRecords?: Array}>}
   */
  async verifyMXRecords(email) {
    if (!email || typeof email !== 'string') {
      return { valid: false };
    }

    const domain = email.split('@')[1]?.toLowerCase().trim();
    
    if (!domain) {
      return { valid: false };
    }

    try {
      const addresses = await dns.resolveMx(domain);
      
      if (!addresses || addresses.length === 0) {
        return { valid: false };
      }

      return { valid: true, mxRecords: addresses };
    } catch (error) {
      // DNS lookup failed - could be network issue or invalid domain
      // We'll be lenient and not block the email, but return false
      return { valid: false, error: error.code };
    }
  }

  /**
   * Normalize email address (lowercase, trim)
   * @param {string} email - Email address to normalize
   * @returns {string}
   */
  normalizeEmail(email) {
    if (!email || typeof email !== 'string') {
      return '';
    }

    return email.toLowerCase().trim();
  }

  /**
   * Comprehensive email validation
   * @param {string} email - Email address to validate
   * @param {object} options - Validation options
   * @param {boolean} options.checkMX - Whether to check MX records (default: false)
   * @param {boolean} options.allowDisposable - Whether to allow disposable emails (default: false)
   * @returns {Promise<{valid: boolean, reason?: string, details?: object}>}
   */
  async validateEmail(email, options = {}) {
    const { checkMX = false, allowDisposable = false } = options;

    // Step 1: Format validation
    if (!this.validateFormat(email)) {
      return {
        valid: false,
        reason: 'invalid_format',
        message: 'Email format is invalid'
      };
    }

    // Step 2: Normalize email
    const normalizedEmail = this.normalizeEmail(email);

    // Step 3: Disposable email check
    if (!allowDisposable && this.isDisposableEmail(normalizedEmail)) {
      return {
        valid: false,
        reason: 'disposable_email',
        message: 'Disposable email addresses are not allowed'
      };
    }

    // Step 4: MX record verification (optional, can be slow)
    if (checkMX) {
      const mxResult = await this.verifyMXRecords(normalizedEmail);
      
      if (!mxResult.valid) {
        return {
          valid: false,
          reason: 'no_mx_records',
          message: 'Email domain has no valid mail servers',
          details: { error: mxResult.error }
        };
      }
    }

    return {
      valid: true,
      normalizedEmail
    };
  }

  /**
   * Add a domain to the disposable email blacklist
   * @param {string} domain - Domain to add
   */
  addDisposableDomain(domain) {
    if (domain && typeof domain === 'string') {
      this.disposableDomains.add(domain.toLowerCase().trim());
    }
  }

  /**
   * Remove a domain from the disposable email blacklist
   * @param {string} domain - Domain to remove
   */
  removeDisposableDomain(domain) {
    if (domain && typeof domain === 'string') {
      this.disposableDomains.delete(domain.toLowerCase().trim());
    }
  }

  /**
   * Get the list of disposable domains
   * @returns {Array<string>}
   */
  getDisposableDomains() {
    return Array.from(this.disposableDomains);
  }
}

module.exports = new EmailValidationService();
