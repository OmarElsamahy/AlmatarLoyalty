const httpStatus = require('http-status');
const { transferService } = require('../services');

const createTransfer = async (req, res, next) => {
  try {
    const { receiverEmail, points } = req.body;
    const sender = req.user;

    const transfer = await transferService.createTransfer({
      senderId: sender.id,
      receiverEmail,
      points,
    });

    res.status(httpStatus.CREATED).json({ message: 'Transfer created', transfer });
  } catch (error) {
    next(error);
  }
};

const confirmTransfer = async (req, res, next) => {
  try {
    const transferId = req.params.transferId;
    const user = req.user;

    const transfer = await transferService.confirmTransfer(transferId, user);

    res.status(httpStatus.OK).json({ message: 'Transfer confirmed', transfer });
  } catch (error) {
    next(error);
  }
};

// Get transfer by ID
const getTransferById = async (req, res, next) => {
  try {
    const transferId = req.params.transferId;
    const user = req.user;

    const transfer = await transferService.getTransferById(transferId, user);

    res.status(httpStatus.OK).json(transfer);
  } catch (error) {
    next(error);
  }
};


const getTransfersByUser = async (req, res, next) => {
  try {
    const user = req.user;

    const transfers = await transferService.getTransfersByUser(user);

    res.status(httpStatus.OK).json(transfers);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransfer,
  confirmTransfer,
  getTransferById,
  getTransfersByUser,
};
