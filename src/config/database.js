const { Sequelize } = require('sequelize');
const config = require('./config');

// Create the Sequelize instance with PostgreSQL
const sequelize = new Sequelize(
  config.sequelize.database,
  config.sequelize.username,
  config.sequelize.password,
  {
    host: config.sequelize.host,
    port: config.sequelize.port,
    dialect: config.sequelize.dialect,
    logging: config.sequelize.logging,
  }
);

module.exports = sequelize;
