/**
 * Global Error Handler Middleware
 * Catches API timeouts, malformed requests, and LLM rate limits gracefully.
 */

const errorHandler = (err, req, res, next) => {
  console.error(`💥 [Error]: ${err.message}`, {
    path: req.originalUrl,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Handle Timeout
  if (err.name === 'TimeoutError' || err.code === 'ETIMEDOUT') {
    return res.status(504).json({
      success: false,
      error: 'Gateway Timeout',
      message: 'The AI model or service took too long to respond. The system will activate fast fallback routing.',
      timestamp: new Date().toISOString()
    });
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      messages,
      timestamp: new Date().toISOString()
    });
  }

  // Handle JSON Syntax Error in request body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Invalid JSON payload received in request body.',
      timestamp: new Date().toISOString()
    });
  }

  // Fallback 500
  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;
  return res.status(statusCode).json({
    success: false,
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected error occurred while processing the pedagogical diagnosis.',
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;
