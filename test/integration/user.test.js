const request = require('supertest');
const faker = require('faker');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { User } = require('../../src/models');
const { userOne, userTwo, insertUsers } = require('../fixtures/user.fixture');
const { userOneAccessToken, userTwoAccessToken } = require('../fixtures/token.fixture');

setupTestDB(); // Ensures the database is set up before tests run

describe('User routes', () => {
  describe('POST /api/v1/users', () => {
    let newUser;

    beforeEach(() => {
      newUser = {
        name: faker.name.findName(),
        email: faker.internet.email().toLowerCase(),
        password: 'password1',
      };
    });

    test('should return 201 and successfully create a new user if data is ok', async () => {
      await insertUsers([userTwo]); // Insert any required users

      const res = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${userTwoAccessToken}`) // Set authentication token
        .send(newUser)
        .expect(httpStatus.CREATED); // Expected status code

      expect(res.body).not.toHaveProperty('password'); // Ensure password isn't exposed
      expect(res.body).toMatchObject({
        name: newUser.name,
        email: newUser.email,
      });

      const dbUser = await User.findOne({ where: { email: newUser.email } });
      expect(dbUser).toBeDefined(); // Ensure the user was created
      expect(dbUser.name).toBe(newUser.name);
    });

    test('should return 401 if no authorization token is provided', async () => {
      await request(app).post('/api/v1/users').send(newUser).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 if email is invalid', async () => {
      await insertUsers([userTwo]); // Insert any required users
      newUser.email = 'invalidEmail';

      await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${userTwoAccessToken}`) //  token
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST); // Expected status for invalid input
    });

    test('should return 400 if email is already used', async () => {
      await insertUsers([userTwo]); // Insert a user with a duplicate email
      newUser.email = userTwo.email;

      await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${userTwoAccessToken}`) //  token
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST); // Expected status for duplicate email
    });
  });

  describe('GET /api/v1/users', () => {
    test('should return 200 and all users', async () => {
      await insertUsers([userOne, userTwo]); // Insert users for query

      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${userTwoAccessToken}`) //  token
        .expect(httpStatus.OK); // Expected status code
      expect(res.body.data).toHaveLength(2); // Ensure we get two users
      expect(res.body.data[0].email).toBe(userOne.email);
      expect(res.body.data[1].email).toBe(userTwo.email);
    });

    test('should return 401 if no authorization token is provided', async () => {
      await insertUsers([userOne]); // Insert a user to check

      await request(app).get('/api/v1/users').send().expect(httpStatus.UNAUTHORIZED); // No token, expect unauthorized
    });

    test('should correctly apply sorting and pagination', async () => {
      await insertUsers([userOne, userTwo]); // Insert users for pagination test

      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .query({ sortBy: 'id:asc', limit: 1, page: 1 }) // Apply sorting and pagination
        .expect(httpStatus.OK); // Expected status code

      expect(res.body.data).toHaveLength(1); // Ensure only one result is returned
      expect(res.body.data[0].email).toBe(userOne.email);
    });
  });
});
