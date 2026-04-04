const Trainer = require('../models/Trainer');
const User = require('../models/User');
const ApiResponse = require('../utils/ApiResponse');
const { ROLES } = require('../config/constants');

/**
 * @desc    Assign a trainer to a batch
 * @route   POST /api/batches/:batchId/trainers
 * @access  Manager, Admin
 */
const assignTrainer = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { userId, assignedLabs, specialization } = req.body;

    // Verify user exists and is actually a trainer
    const authUser = await User.findById(userId);
    if (!authUser || authUser.role !== ROLES.TRAINER) {
      return ApiResponse.badRequest(res, 'User not found or is not a trainer.');
    }

    // Check for duplicate assignment
    const existingAssignment = await Trainer.findOne({ batchId, userId });
    if (existingAssignment) {
      return ApiResponse.badRequest(res, 'This trainer is already assigned to this batch.');
    }

    const trainer = await Trainer.create({
      batchId,
      userId,
      assignedLabs: assignedLabs || [],
      specialization,
    });

    // Populate user details before returning
    await trainer.populate('userId', 'name email phone');
    await trainer.populate('assignedLabs', 'name');

    return ApiResponse.created(res, { trainer }, 'Trainer assigned successfully.');
  } catch (error) {
    if (error.code === 11000) {
      return ApiResponse.badRequest(res, 'This trainer is already assigned to this batch.');
    }
    console.error('AssignTrainer error:', error.message);
    return ApiResponse.error(res, 'Failed to assign trainer.');
  }
};

/**
 * @desc    Get all trainers for a batch
 * @route   GET /api/batches/:batchId/trainers
 * @access  Protected
 */
const getTrainersByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const trainers = await Trainer.find({ batchId })
      .populate('userId', 'name email phone')
      .populate('assignedLabs', 'name location')
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, { trainers });
  } catch (error) {
    console.error('GetTrainersByBatch error:', error.message);
    return ApiResponse.error(res, 'Failed to fetch trainers.');
  }
};

/**
 * @desc    Remove a trainer from a batch
 * @route   DELETE /api/batches/:batchId/trainers/:trainerId
 * @access  Manager, Admin
 */
const removeTrainer = async (req, res) => {
  try {
    const { trainerId } = req.params;

    const trainer = await Trainer.findByIdAndDelete(trainerId);
    if (!trainer) {
      return ApiResponse.notFound(res, 'Trainer assignment not found.');
    }

    return ApiResponse.success(res, null, 'Trainer unassigned successfully.');
  } catch (error) {
    console.error('RemoveTrainer error:', error.message);
    return ApiResponse.error(res, 'Failed to unassign trainer.');
  }
};

module.exports = {
  assignTrainer,
  getTrainersByBatch,
  removeTrainer,
};
