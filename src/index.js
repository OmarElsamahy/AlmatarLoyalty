const sequelize = require('./config/database'); // This points to your new Sequelize setup
const {User} = require('./models/user.model'); // This points to your new Sequelize setup
const app = require('./app'); // Import your Express app
const config = require('./config/config'); // Configuration
const logger = require('./config/logger'); // Logger for logging information

let server;

// Function to start the server after successful database connection
const startServer = () => {
  server = app.listen(config.port, () => {
    logger.info(`Listening on port ${config.port}`); // Log when the server starts
  });
};

// Connect to PostgreSQL and start the server
sequelize
  .authenticate() // Check if the connection to the database is successful
  .then(() => {
    logger.info('Connected to PostgreSQL'); // Log successful connection
    return sequelize.sync(); // Sync Sequelize models to the database
  })
  .then(() => {
    startServer(); // Start the server if the database connection is successful
  })
  .catch((error) => {
    logger.error('Unable to connect to the database:', error); // Log error if connection fails
    process.exit(1); // Exit with an error code
  });

// Gracefully handle server shutdowns
const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

// Handle unexpected errors and server shutdown signals
const unexpectedErrorHandler = (error) => {
  logger.error('Unexpected error:', error);
  exitHandler(); // Close the server and exit
};

process.on('uncaughtException', unexpectedErrorHandler); // Handle uncaught exceptions
process.on('unhandledRejection', unexpectedErrorHandler); // Handle unhandled promise rejections

process.on('SIGTERM', () => { // Handle SIGTERM signal
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
