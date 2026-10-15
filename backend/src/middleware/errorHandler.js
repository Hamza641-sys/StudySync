function errorHandler(err, req, res, next) {
  // Privacy conscious logging: never log sensitive headers or passwords
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message);

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.status || err.statusCode || 500;
  
  // Safe user-facing error message without leaking stack traces or internal secrets
  const clientMessage = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'An unexpected internal server error occurred. Please try again later.'
    : err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: clientMessage,
    code: err.code || 'INTERNAL_ERROR'
  });
}

module.exports = errorHandler;
