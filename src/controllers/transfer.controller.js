const httpStatus = require('http-status');
const { transferService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const createTransfer =  catchAsync(async (req, res) => {
  const { receiverEmail, points } = req.body;
  const sender = req.user;

  const transfer = await transferService.createTransfer({
    senderId: sender.id,
    receiverEmail,
    points,
  });

  res.status(httpStatus.CREATED).json({ message: 'Transfer created', transfer });
});

const confirmTransfer =  catchAsync(async (req, res) => {
  const transferId = req.params.transferId;
  const user = req.user;

  const transfer = await transferService.confirmTransfer(transferId, user);

  res.status(httpStatus.OK).json({ message: 'Transfer confirmed', transfer });
});

// Get transfer by ID
const getTransferById = catchAsync(async (req, res) => {
  const transferId = req.params.transferId;
  const user = req.user;

  const transfer = await transferService.getTransferById(transferId, user);

  res.status(httpStatus.OK).json(transfer);
});


const getTransfersByUser = catchAsync(async (req, res) => {
  const user = req.user;

  const transfers = await transferService.getTransfersByUser(user);

  res.status(httpStatus.OK).json(transfers);
});

module.exports = {
  createTransfer,
  confirmTransfer,
  getTransferById,
  getTransfersByUser,
};
