const RecaptchaService = require('../services/RecaptchaService');

/**
 * Middleware to verify reCAPTCHA token
 * Expects token in request body as 'recaptchaToken'
 */
const verifyRecaptcha = async (req, res, next) => {
  // Skip if reCAPTCHA is disabled
  if (!RecaptchaService.isEnabled()) {
    return next();
  }

  const token = req.body.recaptchaToken;
  const remoteIp = req.ip || req.connection.remoteAddress;

  // Check if token is provided
  if (!token) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'RECAPTCHA_REQUIRED',
        message: 'reCAPTCHA verification is required'
      }
    });
  }

  try {
    // Verify the token
    const result = await RecaptchaService.verifyToken(token, remoteIp);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: result.error || 'RECAPTCHA_FAILED',
          message: result.message || 'reCAPTCHA verification failed',
          ...(result.score !== undefined && { score: result.score })
        }
      });
    }

    // Attach verification result to request for logging
    req.recaptchaResult = result;
    next();

  } catch (error) {
    console.error('reCAPTCHA middleware error:', error);
    
    // On error, we can either fail closed (block) or fail open (allow)
    // For better UX, we'll fail open but log the error
    console.warn('reCAPTCHA verification failed, allowing request');
    next();
  }
};

/**
 * Middleware to verify reCAPTCHA with custom minimum score
 * @param {number} minScore - Minimum score required (0.0 to 1.0)
 */
const verifyRecaptchaWithScore = (minScore) => {
  return async (req, res, next) => {
    // Skip if reCAPTCHA is disabled
    if (!RecaptchaService.isEnabled()) {
      return next();
    }

    const token = req.body.recaptchaToken;
    const remoteIp = req.ip || req.connection.remoteAddress;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'RECAPTCHA_REQUIRED',
          message: 'reCAPTCHA verification is required'
        }
      });
    }

    try {
      const result = await RecaptchaService.verifyToken(token, remoteIp);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: result.error || 'RECAPTCHA_FAILED',
            message: result.message || 'reCAPTCHA verification failed',
            ...(result.score !== undefined && { score: result.score })
          }
        });
      }

      // Check custom minimum score
      if (result.score !== undefined && result.score < minScore) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'LOW_SCORE',
            message: `reCAPTCHA score too low: ${result.score}`,
            score: result.score,
            required: minScore
          }
        });
      }

      req.recaptchaResult = result;
      next();

    } catch (error) {
      console.error('reCAPTCHA middleware error:', error);
      console.warn('reCAPTCHA verification failed, allowing request');
      next();
    }
  };
};

module.exports = {
  verifyRecaptcha,
  verifyRecaptchaWithScore
};
