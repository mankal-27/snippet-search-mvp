const errorHandler = (err, req, res, next) => {
  // Log the error for your own debugging
  console.error('🔥 Global Error Caught:', err.message);
  
  // Set default values if the error doesn't have them
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Send a standardized JSON response to the client
  res.status(statusCode).json({
    status: 'error',
    message: message
  });
};

module.exports = errorHandler;