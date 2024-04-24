const express = require('express');
const auth = require('../../middlewares/auth'); // Middleware for authentication and authorization
const validate = require('../../middlewares/validate'); // Middleware for request validation
const transferController = require('../../controllers/transfer.controller'); // Transfer controller
const transferValidation = require('../../validations/transfer.validation'); // Transfer validation

const router = express.Router();

// Create a new transfer
router
  .route('/')
  .post(
    auth('transferPoints'), // Only authenticated users with specific permissions can create transfers
    validate(transferValidation.createTransfer), // Validate the input data
    transferController.createTransfer // Controller function to create a transfer
  );

// Confirm a transfer
router
  .route('/:transferId/confirm')
  .post(
    auth('transferPoints'), // Only authenticated users can confirm transfers
    validate(transferValidation.confirmTransfer), // Validate the input data
    transferController.confirmTransfer // Controller function to confirm a transfer
  );

// Get a specific transfer
router
  .route('/:transferId')
  .get(
    auth('viewTransfers'), // Only authorized users can view transfers
    validate(transferValidation.getTransfer), // Validate the input data
    transferController.getTransferById // Controller function to get a specific transfer
  );

// Get all transfers for a user
router
  .route('/')
  .get(
    auth('viewTransfers'), // Only authorized users can view their transfers
    transferController.getTransfersByUser // Controller function to get all transfers for a user
  );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Transfers
 *   description: Operations related to point transfers between users
 */

/**
 * @swagger
 * /transfers:
 *   post:
 *     summary: Create a transfer
 *     description: Create a new transfer of loyalty points to another user.
 *     tags: [Transfers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverEmail
 *               - points
 *             properties:
 *               receiverEmail:
 *                 type: string
 *                 format: email
 *                 description: Email of the receiver
 *               points:
 *                 type: integer
 *                 minimum: 1
 *                 description: Number of points to transfer
 *     responses:
 *       "201":
 *         description: Transfer created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transfer'
 *       "400":
 *         description: Invalid input
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 * /transfers/{transferId}/confirm:
 *   post:
 *     summary: Confirm a transfer
 *     description: Confirm a transfer created earlier.
 *     tags: [Transfers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transferId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the transfer to confirm
 *     responses:
 *       "200":
 *         description: Transfer confirmed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transfer'
 *       "400":
 *         description: Invalid input
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 * /transfers/{transferId}:
 *   get:
 *     summary: Get a specific transfer
 *     description: Retrieve a transfer by its ID.
 *     tags: [Transfers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transferId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the transfer
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transfer'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 * /transfers:
 *   get:
 *     summary: Get all transfers for a user
 *     description: Retrieve all transfers where the logged-in user is either the sender or receiver.
 *     tags: [Transfers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transfer'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

