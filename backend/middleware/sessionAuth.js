// Session-based authentication middleware for Passport
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
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

  // Check if user is active
  if (!req.user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Account is deactivated. Please contact administration.',
      sessionStatus: 'invalid'
    });
  }

  next();
};

// Check user role for session-based auth
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        sessionStatus: 'invalid'
      });
    }

    const userRole = req.user.role;
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}, but user has role: ${userRole}`
      });
    }

    next();
  };
};

// Specific role checks for session-based auth
const requireStudent = [requireAuth, requireRole(['student'])];
const requireFaculty = [requireAuth, requireRole(['faculty'])];
const requireAdmin = [requireAuth, requireRole(['admin'])];
const requireSuperAdmin = [requireAuth, requireRole(['super_admin'])];
const requireStudentOrFaculty = [requireAuth, requireRole(['student', 'faculty'])];
const requireFacultyOrAdmin = [requireAuth, requireRole(['faculty', 'admin'])];
const requireAdminOrSuperAdmin = [requireAuth, requireRole(['admin', 'super_admin'])];
const requireAnyRole = [requireAuth, requireRole(['student', 'faculty', 'admin', 'super_admin'])];

module.exports = {
  requireAuth,
  requireRole,
  requireStudent,
  requireFaculty,
  requireAdmin,
  requireSuperAdmin,
  requireStudentOrFaculty,
  requireFacultyOrAdmin,
  requireAdminOrSuperAdmin,
  requireAnyRole
};