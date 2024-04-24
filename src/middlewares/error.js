const httpStatus = require('http-status');
const config = require('../config/config');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');
const { BaseError } = require('sequelize');

// Converts various error types into a standard ApiError object
const errorConverter = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode ||
      (error instanceof BaseError ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR);
    const message = error.message || httpStatus[statusCode];

    // Convert to ApiError for consistent error handling
    error = new ApiError(statusCode, message, false, err.stack);
  }

  next(error); // Pass the converted error to the next middleware
};

// Handles the final error response to the client
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  // Handle production environment: obscure sensitive information
  if (config.env === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[statusCode];
  }

  res.locals.errorMessage = message; // Store the error message for potential use in the response

  const response = {
    code: statusCode,
    message,
    ...(config.env === 'development' && { stack: err.stack }), // Include stack trace in development
  };

  // Log the error in development for troubleshooting
  if (config.env === 'development') {
    logger.error(err); // Log the full error with stack trace
  }

  // Respond with the status code and the response object
  res.status(statusCode).send(response);
};

module.exports = {
  errorConverter,
  errorHandler,
};
