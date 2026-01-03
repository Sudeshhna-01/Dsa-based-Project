export const errorHandler = (err, req, res, next) => {
  // Log error details
  const errorDetails = {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  };

  if (process.env.NODE_ENV === 'development') {
    console.error('Error Details:', JSON.stringify(errorDetails, null, 2));
  } else {
    console.error('Error:', err.message, 'at', req.originalUrl);
  }

  // Handle specific error types
  if (err.code === 'ER_DUP_ENTRY' || err.code === '23505') {
    return res.status(409).json({
      code: 'DUPLICATE_ENTRY',
      message: 'Resource already exists',
      details: {}
    });
  }

  if (err.code === '23503') {
    return res.status(400).json({
      code: 'FOREIGN_KEY_VIOLATION',
      message: 'Invalid reference to related resource',
      details: {}
    });
  }

  if (err.name === 'ValidationError' || err.code === 'VALIDATION_ERROR') {
    return res.status(422).json({
      code: 'VALIDATION_ERROR',
      message: err.message || 'Validation failed',
      details: err.details || {}
    });
  }

  if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      code: 'SERVICE_UNAVAILABLE',
      message: 'Database connection failed. Please try again later.',
      details: {}
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    code: err.code || 'INTERNAL_ERROR',
    message: err.message || 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    code: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`,
    details: {}
  });
};

