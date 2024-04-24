const { Sequelize } = require('sequelize');
const config = require('./config'); // Ensure you're getting your config setup

// Create the Sequelize instance with PostgreSQL
const sequelize = new Sequelize(
  config.sequelize.database, // Database name
  config.sequelize.username, // Username
  config.sequelize.password, // Password
  {
    host: config.sequelize.host, // Host
    port: config.sequelize.port, // Port
    dialect: config.sequelize.dialect, // 'postgres' for PostgreSQL
    logging: config.sequelize.logging, // Logging depending on the environment
  }
);

// Export the Sequelize instance for use in other files
module.exports = sequelize;
