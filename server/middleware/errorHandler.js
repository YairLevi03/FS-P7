export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  
  // Hide internal server and DB errors from the client for security
  const message = statusCode === 500 
    ? 'An unexpected error occurred on the server. Please try again later.' 
    : (err.message || 'Internal Server Error');

  res.status(statusCode).json({
    message,
    remaining: err.remaining,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};
