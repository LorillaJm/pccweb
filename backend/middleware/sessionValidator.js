const validateSession = (req, res, next) => {
  // Check if user is authenticated via Passport session
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated',
      sessionStatus: 'invalid'
    });
  }

  // Check if session exists and is valid
  if (!req.session || !req.session.passport || !req.session.passport.user) {
    return res.status(401).json({
      success: false,
      message: 'Session invalid or expired',
      sessionStatus: 'expired'
    });
  }

  // Session is valid, continue
  next();
};

module.exports = { validateSession };