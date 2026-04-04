const Batch = require('../models/Batch');
const ApiResponse = require('../utils/ApiResponse');
const { ROLES } = require('../config/constants');

/**
 * @desc    Create a new batch
 * @route   POST /api/batches
 * @access  Manager
 */
const createBatch = async (req, res) => {
  try {
    const { name, description, technology, startDate, endDate, maxStudents } = req.body;

    // Only allow managers to act as the creator based on architectural rules
    if (req.user.role !== ROLES.MANAGER) {
      return ApiResponse.forbidden(res, 'Only Managers can create batches.');
    }

    const batch = await Batch.create({
      name,
      description,
      technology,
      startDate,
      endDate,
      maxStudents,
      createdBy: req.user._id,
    });

    return ApiResponse.created(res, { batch }, 'Batch created successfully.');
  } catch (error) {
    console.error('CreateBatch error:', error.message);
    return ApiResponse.error(res, 'Failed to create batch.');
  }
};

/**
 * @desc    Get all batches
 * @route   GET /api/batches
 * @access  Protected (All authenticated roles)
 */
const getBatches = async (req, res) => {
  try {
    const query = {};
    
    // Optional status filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Populate the creator's name
    const batches = await Batch.find(query)
      .populate('createdBy', 'name email')
      .sort({ startDate: -1 });

    return ApiResponse.success(res, { batches, count: batches.length });
  } catch (error) {
    console.error('GetBatches error:', error.message);
    return ApiResponse.error(res, 'Failed to retrieve batches.');
  }
};

/**
 * @desc    Get batch by ID
 * @route   GET /api/batches/:id
 * @access  Protected
 */
const getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!batch) {
      return ApiResponse.notFound(res, 'Batch not found.');
    }

    return ApiResponse.success(res, { batch });
  } catch (error) {
    console.error('GetBatchById error:', error.message);
    return ApiResponse.error(res, 'Failed to retrieve batch.');
  }
};

/**
 * @desc    Update batch details
 * @route   PUT /api/batches/:id
 * @access  Manager (only creator) or Admin
 */
const updateBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return ApiResponse.notFound(res, 'Batch not found.');
    }

    // Authorization: Only Admin or the Manager who created it can update
    if (
      req.user.role !== ROLES.ADMIN &&
      batch.createdBy.toString() !== req.user._id.toString()
    ) {
      return ApiResponse.forbidden(res, 'You are not authorized to update this batch.');
    }

    const updatedBatch = await Batch.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    return ApiResponse.success(res, { batch: updatedBatch }, 'Batch updated successfully.');
  } catch (error) {
    console.error('UpdateBatch error:', error.message);
    return ApiResponse.error(res, 'Failed to update batch.');
  }
};

/**
 * @desc    Update batch status (Active, Completed, Upcoming)
 * @route   PATCH /api/batches/:id/status
 * @access  Manager (Creator) or Admin
 */
const updateBatchStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return ApiResponse.notFound(res, 'Batch not found.');
    }

    if (
      req.user.role !== ROLES.ADMIN &&
      batch.createdBy.toString() !== req.user._id.toString()
    ) {
      return ApiResponse.forbidden(res, 'You are not authorized to update this batch status.');
    }

    batch.status = status;
    await batch.save();

    return ApiResponse.success(res, { batch }, `Batch status updated to ${status}.`);
  } catch (error) {
    console.error('UpdateBatchStatus error:', error.message);
    return ApiResponse.error(res, 'Failed to update batch status.');
  }
};

module.exports = {
  createBatch,
  getBatches,
  getBatchById,
  updateBatch,
  updateBatchStatus,
};
