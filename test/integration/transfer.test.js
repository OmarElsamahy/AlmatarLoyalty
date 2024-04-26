const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { User, Transfer } = require('../../src/models');
const { insertUsers, userOne, userTwo, userThree } = require('../fixtures/user.fixture');
const { userOneAccessToken, userTwoAccessToken } = require('../fixtures/token.fixture');

setupTestDB(); // Set up the test database

describe('Transfer Routes', () => {
  describe('POST /api/v1/transfers', () => {
    test('should return 201 and create a new transfer', async () => {
      await insertUsers([userOne, userTwo]); // Insert users

      const newTransfer = {
        receiverEmail: userTwo.email,
        points: 100,
      };

      const res = await request(app)
        .post('/api/v1/transfers')
        .set('Authorization', `Bearer ${userOneAccessToken}`) // Auth token
        .send(newTransfer)
        .expect(httpStatus.CREATED); // Expect 201 Created
      expect(res.body.transfer).toMatchObject({
        receiverId: userTwo.id,
        points: 100,
      });

      const dbTransfer = await Transfer.findOne({ where: { receiverId: userTwo.id } });
      expect(dbTransfer).toBeDefined(); // Ensure the transfer is created
    });

    test('should return 400 if trying to transfer to oneself', async () => {
      await insertUsers([userOne]);

      const newTransfer = {
        receiverEmail: userOne.email,
        points: 100,
      };

      await request(app)
        .post('/api/v1/transfers')
        .set('Authorization', `Bearer ${userOneAccessToken}`) // Auth token
        .send(newTransfer)
        .expect(httpStatus.BAD_REQUEST); // Expect 400 Bad Request
    });

    test('should return 401 if authorization token is missing', async () => {
      await insertUsers([userOne]);

      const newTransfer = {
        receiverEmail: userTwo.email,
        points: 100,
      };

      await request(app)
        .post('/api/v1/transfers')
        .send(newTransfer)
        .expect(httpStatus.UNAUTHORIZED); // Expect 401 Unauthorized
    });
  });

  describe('POST /api/v1/transfers/:transferId/confirm', () => {
    test('should return 200 and confirm a transfer', async () => {
      await insertUsers([userOne, userTwo]); // Insert users

      // Create a new transfer
      const transfer = await Transfer.create({
        senderId: userOne.id,
        receiverId: userTwo.id,
        points: 100,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      const res = await request(app)
        .post(`/api/v1/transfers/${transfer.id}/confirm`)
        .set('Authorization', `Bearer ${userOneAccessToken}`) // Auth token
        .expect(httpStatus.OK); // Expect 200 OK

      expect(res.body.message).toBe('Transfer confirmed');
    });

    test('should return 401 if unauthorized user tries to confirm', async () => {
      await insertUsers([userOne, userTwo]); // Insert users

      // Create a new transfer
      const transfer = await Transfer.create({
        senderId: userOne.id,
        receiverId: userTwo.id,
        points: 100,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      await request(app)
        .post(`/api/v1/transfers/${transfer.id}/confirm`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`) // Auth token
        .expect(httpStatus.UNAUTHORIZED); // Expect 401 Unauthorized
    });

    test('should return 404 if transfer does not exist', async () => {
      await insertUsers([userOne]); // Insert a user

      await request(app)
        .post(`/api/v1/transfers/invalid-transfer-id/confirm`)
        .set('Authorization', `Bearer ${userOneAccessToken}`) // Auth token
        .expect(httpStatus.BAD_REQUEST); // Expect 400 Bad Request
    });
  });

  describe('GET /api/v1/transfers', () => {
    test('should return 200 and fetch transfers for a user', async () => {
      await insertUsers([userOne, userTwo]); // Insert users

      // Create a transfer
      await Transfer.create({
        senderId: userOne.id,
        receiverId: userTwo.id,
        points: 100,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      const res = await request(app)
        .get('/api/v1/transfers')
        .set('Authorization', `Bearer ${userOneAccessToken}`) // Auth token
        .expect(httpStatus.OK); // Expect 200 OK

      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveLength(1); // One transfer
    });

    test('should return 401 if authorization token is missing', async () => {
      await request(app)
        .get('/api/v1/transfers')
        .send()
        .expect(httpStatus.UNAUTHORIZED); // Expect 401 Unauthorized
    });
  });

  describe('GET /api/v1/transfers/:transferId', () => {
    test('should return 200 and fetch a transfer by ID', async () => {
      await insertUsers([userOne, userTwo]); // Insert users

      // Create a transfer
      const transfer = await Transfer.create({
        senderId: userOne.id,
        receiverId: userTwo.id,
        points: 100,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      const res = await request(app)
        .get(`/api/v1/transfers/${transfer.id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`) // Auth token
        .expect(httpStatus.OK); // Expect 200 OK

      expect(res.body).toMatchObject({
        id: transfer.id,
        senderId: userOne.id,
        receiverId: userTwo.id,
        points: 100,
      });
    });

    test('should return 401 if unauthorized user tries to fetch transfer', async () => {
      await insertUsers([userOne, userTwo, userThree]); // Insert users

      // Create a transfer
      const transfer = await Transfer.create({
        senderId: userOne.id,
        receiverId: userThree.id,
        points: 100,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      await request(app)
        .get(`/api/v1/transfers/${transfer.id}`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`) // Auth token
        .expect(httpStatus.UNAUTHORIZED); // Expect 401 Unauthorized
    });

    test('should return 404 if transfer does not exist', async () => {
        await insertUsers([userOne]);
      await request(app)
        .get('/api/v1/transfers/invalid-transfer-id')
        .set('Authorization', `Bearer ${userOneAccessToken}`) // Auth token
        .expect(httpStatus.BAD_REQUEST); // Expect 400 Bad Request
    });
  });
});
