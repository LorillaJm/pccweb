const errorHandler = (err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    user: req.user?.id || 'anonymous'
  });

  // Default error
  let error = { ...err };
  error.message = err.message;

  // PostgreSQL errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        error.message = 'Duplicate entry. This record already exists.';
        error.statusCode = 400;
        break;
      case '23503': // Foreign key violation
        error.message = 'Referenced record does not exist.';
        error.statusCode = 400;
        break;
      case '23502': // Not null violation
        error.message = 'Required field is missing.';
        error.statusCode = 400;
        break;
      case '42P01': // Undefined table
        error.message = 'Database table not found. Please run migrations.';
        error.statusCode = 500;
        break;
      default:
        error.message = 'Database error occurred.';
        error.statusCode = 500;
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.statusCode = 401;
  } else if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    error.statusCode = 401;
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error.message = 'Validation failed';
    error.statusCode = 400;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err 
    })
  });
};

module.exports = { errorHandler };