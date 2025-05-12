const errorHandler = (err, req, res, next) => {
  // Log the error
  console.error('Error details:', {
    path: req.path,
    method: req.method,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Handle mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: messages
    });
  }

  // Handle mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      status: 'error',
      message: `${field} already exists`
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token expired'
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (process.env.NODE_ENV === 'development') {
    res.status(statusCode).json({
      status: 'error',
      message,
      stack: err.stack,
      error: err
    });
  } else {
    res.status(statusCode).json({
      status: 'error',
      message: statusCode === 500 ? 'Internal server error' : message
    });
  }
};

module.exports = { errorHandler }; 