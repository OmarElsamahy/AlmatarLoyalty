const Joi = require('joi');

// Validation for creating a transfer
const createTransfer = {
  body: Joi.object().keys({
    receiverEmail: Joi.string().required().email().description('Email of the user to whom points are being transferred'),
    points: Joi.number().required().integer().min(1).description('Number of points to transfer'),
  }),
};

// Validation for confirming a transfer
const confirmTransfer = {
  params: Joi.object().keys({
    transferId: Joi.string().required().description('ID of the transfer to confirm'),
  }),
};

// Validation for getting a specific transfer by ID
const getTransfer = {
  params: Joi.object().keys({
    transferId: Joi.string().required().description('ID of the transfer to retrieve'),
  }),
};

// Validation for getting all transfers for a user
const getTransfersByUser = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1).description('Page number for pagination'),
    limit: Joi.number().integer().min(1).description('Maximum number of transfers per page'),
  }),
};

module.exports = {
  createTransfer,
  confirmTransfer,
  getTransfer,
  getTransfersByUser,
};
