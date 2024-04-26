const bcrypt = require('bcryptjs');
const { faker }= require('@faker-js/faker'); // Importing faker
const { User } = require('../../src/models'); // Assuming you have initialized Sequelize models in this path

const password = 'password1';
const salt = bcrypt.genSaltSync(8);
const hashedPassword = bcrypt.hashSync(password, salt);

const userOne = {
  id: 1,
  name: faker.string.sample(),
  email: faker.internet.email().toLowerCase(),
  password: hashedPassword, // Store the hashed password
  isEmailVerified: false,
};

const userTwo = {
  id: 2,
  name: faker.string.sample(),
  email: faker.internet.email().toLowerCase(),
  password: hashedPassword, // Store the hashed password
  isEmailVerified: false,
};

const userThree = {
  id: 3,
  name: faker.string.sample(),
  email: faker.internet.email().toLowerCase(),
  password: hashedPassword, // Store the hashed password
  isEmailVerified: false,
};

/**
 * Inserts an array of users into the database using Sequelize's bulkCreate.
 * @param {Array} users - Array of user objects to insert.
 */
const insertUsers = async (users) => {
  await User.bulkCreate(users, { validate: true }); // Ensure validation is applied
};

module.exports = {
  userOne,
  userTwo,
  userThree,
  insertUsers,
};
