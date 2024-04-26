const request = require('supertest');
const httpStatus = require('http-status');
const moment = require('moment');
const bcrypt = require('bcryptjs');
const app = require('../../src/app'); // Express app
const config = require('../../src/config/config'); // Configuration
const auth = require('../../src/middlewares/auth'); // Auth middleware
const { tokenService, emailService, userService } = require('../../src/services'); // Services
const { User, Token } = require('../../src/models'); // Sequelize models
const { tokenTypes } = require('../../src/config/tokens'); // Token types
const { userOne, userTwo, insertUsers } = require('../fixtures/user.fixture'); // Test fixtures

// Set up test database (assumed setup function, implement as needed)
const setupTestDB = require('../utils/setupTestDB');
setupTestDB(); // Ensure a clean state before tests

describe('User API Tests', () => {
  describe('User Registration', () => {
    let newUser;

    beforeEach(() => {
      newUser = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'Password1',
      };
    });

    test('should return 201 and create user if registration data is valid', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(newUser)
        .expect(httpStatus.CREATED);

      expect(response.body.user).toMatchObject({
        name: newUser.name,
        email: newUser.email,
      });

      // Validate that user is created in the database
      const dbUser = await User.findOne({ where: { email: newUser.email } });
      expect(dbUser).toBeDefined();
    });

    test('should return 400 error if email is invalid', async () => {
      newUser.email = 'invalidEmail';

      await request(app).post('/api/v1/auth/register').send(newUser).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if email is already used', async () => {
      await insertUsers([userOne]);
      newUser.email = userOne.email;

      await request(app).post('/api/v1/auth/register').send(newUser).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if password does not meet requirements', async () => {
      newUser.password = 'short';

      await request(app).post('/api/v1/auth/register').send(newUser).expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('User Login', () => {
    test('should return 200 and authenticate user if email and password match', async () => {
      await insertUsers([userOne]);

      const loginCredentials = {
        email: userOne.email,
        password: 'password1',
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginCredentials)
        .expect(httpStatus.OK);

      expect(response.body.user).toMatchObject({
        email: userOne.email,
        name: userOne.name,
      });

      expect(response.body.tokens).toBeDefined(); // Validate that tokens are returned
    });

    test('should return 401 error if email is not found', async () => {
      const loginCredentials = {
        email: 'unknown@example.com',
        password: 'password1',
      };

      await request(app).post('/api/v1/auth/login').send(loginCredentials).expect(httpStatus.NOT_FOUND);
    });

    test('should return 401 error if password is wrong', async () => {
      await insertUsers([userOne]);

      const loginCredentials = {
        email: userOne.email,
        password: 'wrongPassword1',
      };

      await request(app).post('/api/v1/auth/login').send(loginCredentials).expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('Logout', () => {
    test('should return 204 if refresh token is valid', async () => {
      await insertUsers([userOne]);
      const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
      const user = await userService.getUserByEmail(userOne.email);
      const refreshToken = tokenService.generateToken(user.id, expires, tokenTypes.REFRESH);
      await tokenService.saveToken(refreshToken, user.id, expires, tokenTypes.REFRESH);
      await request(app).post('/api/v1/auth/logout').send({ refreshToken }).expect(httpStatus.NO_CONTENT);

      const dbRefreshTokenDoc = await Token.findOne({ where: { token: refreshToken } });
      expect(dbRefreshTokenDoc).toBeNull(); // Validate that the refresh token is removed
    });

    test('should return 400 error if refresh token is missing', async () => {
      await request(app).post('/api/v1/auth/logout').send().expect(httpStatus.BAD_REQUEST);
    });
  });
});
