const httpStatus = require('http-status');
const { User, Transfer } = require('../models');
const sequelize = require('../config/database'); // Sequelize instance
const ApiError = require('../utils/ApiError');
const userService = require('./user.service');
const { Op } = require('sequelize');

/**
 * Create a new transfer
 * @param {Object} transferData - { senderId, receiverEmail, points }
 * @returns {Promise<Transfer>}
 */
const createTransfer = async (transferData) => {
  const { senderId, receiverEmail, points } = transferData;

  // Ensure the sender has sufficient points
  const sender = await userService.getUserById(senderId);

  if (receiverEmail === sender.email) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot transfer to yourself');
  }

  if (sender.loyaltyPoints < points) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Insufficient points');
  }

  // Verify the receiver exists
  const receiver = await userService.getUserByEmail(receiverEmail);
  if (!receiver) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Receiver not found');
  }

  // Create a new transfer with a 10-minute expiration time
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const transfer = await Transfer.create({
    senderId,
    receiverId: receiver.id,
    points,
    expiresAt,
  });

  return transfer;
};

/**
 * Confirm a transfer and update points
 * @param {string} transferId - id of the transfer
 * @param {User} user - User object (usually the logged-in user)
 * @returns {Promise<Transfer>}
 */
const confirmTransfer = async (transferId, user) => {
  try {
    await sequelize.transaction(async t => {
        const transfer = await Transfer.findByPk(transferId);

        if (!transfer || transfer.confirmed) {
          throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or already confirmed transfer');
        }

        if (new Date() > transfer.expiresAt) {
          throw new ApiError(httpStatus.BAD_REQUEST, 'Transfer has expired');
        }
        // Confirm the transfer
        transfer.confirmed = true;
        await transfer.save({  transaction: t });

        // Deduct points from the sender
        if (user.id !== transfer.senderId) {
          throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not the sender');
        }

        const sender = await userService.getUserById(transfer.senderId);
        sender.loyaltyPoints -= transfer.points;
        await sender.save({  transaction: t });

        // Add points to the receiver
        const receiver = await userService.getUserById(transfer.receiverId);
        if (receiver) {
          receiver.loyaltyPoints += transfer.points;
          await receiver.save({ transaction: t });
        } else {
          throw new ApiError(httpStatus.NOT_FOUND, 'Receiver not found');
        }

        return transfer;
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get a transfer by ID
 * @param {string} transferId
 * @param {User} user - User object (to check ownership)
 * @returns {Promise<Transfer>}
 */
const getTransferById = async (transferId, user) => {
  const transfer = await Transfer.findByPk(transferId);
  if (!transfer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Transfer not found');
  }

  if (user.id !== transfer.senderId && user.id !== transfer.receiverId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'You do not have permission to view this transfer');
  }

  return transfer;
};

/**
 * Get multiple transfers for a user
 * @param {User} user - User object (usually the logged-in user)
 * @returns {Promise<Array<Transfer>>}
 */
const getTransfersByUser = async (user, options = {}) => {
    const { page = 1, limit = 10, sortBy = '', ...restOptions } = options;

    let order = [];
    if (sortBy) {
      const [field, direction] = sortBy.split(':');
      order = [[field, direction.toUpperCase()]];
    }
    const paginatedResults = await Transfer.paginate({
      page_number: page,
      page_size: limit,
      order,
      where: {
        [Op.or]: [
          { senderId: user.id },
          { receiverId: user.id },
        ],
      },
      ...restOptions,
    });

    return paginatedResults;
  };
module.exports = {
  createTransfer,
  confirmTransfer,
  getTransferById,
  getTransfersByUser,
};
