const sequelize = require('../../src/config/database'); // Import the Sequelize instance

const setupTestDB = () => {
  // Connect to the database before all tests
  beforeAll(async () => {
    await sequelize.authenticate(); // Ensure connection is established
    await sequelize.sync({ force: true }); // Drop and recreate tables
  });

  // Reset the database before each test to ensure a clean state
  beforeEach(async () => {
    await sequelize.sync({ force: true }); // Clear all data by forcing re-sync
  });

  // Disconnect from the database after all tests
  afterAll(async () => {
    await sequelize.close(); // Close the connection
  });
};

module.exports = setupTestDB;

