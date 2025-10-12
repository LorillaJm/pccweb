const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists and is active
    const user = await User.findById(decoded.userId).select('email role firstName lastName isActive');

    if (!user) {
      return res.status(401).json({ message: 'Invalid token. User not found.' });
    }
    
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated.' });
    }

    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error during authentication.' });
  }
};

// Check user role
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const userRole = req.user.role;
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${roles.join(' or ')}, but user has role: ${userRole}` 
      });
    }

    next();
  };
};

// Specific role checks - updated
const requireStudent = checkRole(['student']);
const requireFaculty = checkRole(['faculty']);
const requireAdmin = checkRole(['admin']);
const requireSuperAdmin = checkRole(['super_admin']);
const requireStudentOrFaculty = checkRole(['student', 'faculty']);
const requireFacultyOrAdmin = checkRole(['faculty', 'admin']);
const requireAdminOrSuperAdmin = checkRole(['admin', 'super_admin']);
const requireAnyRole = checkRole(['student', 'faculty', 'admin', 'super_admin']);

module.exports = {
  authenticateToken: verifyToken,
  verifyToken,
  checkRole,
  requireStudent,
  requireFaculty,
  requireAdmin,
  requireSuperAdmin,
  requireStudentOrFaculty,
  requireFacultyOrAdmin,
  requireAdminOrSuperAdmin,
  requireAnyRole
};