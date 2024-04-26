const moment = require('moment');
const config = require('../../src/config/config');
const { tokenTypes } = require('../../src/config/tokens');
const tokenService = require('../../src/services/token.service');
const { userOne, userTwo } = require('./user.fixture');

const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');

/**
 * Generate an access token for a given user.
 * @param {number} userId - The ID of the user for whom to generate a token.
 * @returns {string} - The generated access token.
 */
const generateAccessToken = (userId) => {
  return tokenService.generateToken(userId, accessTokenExpires, tokenTypes.ACCESS);
};

const userOneAccessToken = generateAccessToken(userOne.id);
const userTwoAccessToken = generateAccessToken(userTwo.id);

module.exports = {
  userOneAccessToken,
  userTwoAccessToken,
};
