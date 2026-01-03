export const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err.message);
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      code: 'DUPLICATE_ENTRY',
      message: 'Resource already exists',
      details: {}
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(422).json({
      code: 'VALIDATION_ERROR',
      message: err.message,
      details: {}
    });
  }

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

