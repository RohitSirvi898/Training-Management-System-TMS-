const Holiday = require('../models/Holiday');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @desc    Declare a new holiday for a batch
 * @route   POST /api/batches/:batchId/holidays
 * @access  Manager, Admin
 */
const addHoliday = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { date, reason } = req.body;

    // Check if a holiday already exists for this exact date in the batch
    // We normalize to start of day for comparison
    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    const existingHoliday = await Holiday.findOne({ 
      batchId, 
      date: {
        $gte: targetDate,
        $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
      } 
    });

    if (existingHoliday) {
      return ApiResponse.badRequest(res, 'A holiday is already declared for this date.');
    }

    const holiday = await Holiday.create({
      batchId,
      date: targetDate,
      reason,
      declaredBy: req.user._id,
    });

    await holiday.populate('declaredBy', 'name');

    return ApiResponse.created(res, { holiday }, 'Holiday declared successfully.');
  } catch (error) {
    if (error.code === 11000) {
      return ApiResponse.badRequest(res, 'A holiday is already declared for this date.');
    }
    console.error('AddHoliday error:', error.message);
    return ApiResponse.error(res, 'Failed to declare holiday.');
  }
};

/**
 * @desc    Get all holidays for a batch
 * @route   GET /api/batches/:batchId/holidays
 * @access  Protected
 */
const getHolidaysByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const holidays = await Holiday.find({ batchId })
      .populate('declaredBy', 'name')
      .sort({ date: 1 }); // Sort chronologically

    return ApiResponse.success(res, { holidays });
  } catch (error) {
    console.error('GetHolidays error:', error.message);
    return ApiResponse.error(res, 'Failed to fetch holidays.');
  }
};

/**
 * @desc    Remove a declared holiday
 * @route   DELETE /api/batches/:batchId/holidays/:id
 * @access  Manager, Admin
 */
const removeHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    
    const holiday = await Holiday.findByIdAndDelete(id);
    if (!holiday) {
      return ApiResponse.notFound(res, 'Holiday not found.');
    }

    return ApiResponse.success(res, null, 'Holiday removed successfully.');
  } catch (error) {
    console.error('RemoveHoliday error:', error.message);
    return ApiResponse.error(res, 'Failed to remove holiday.');
  }
};

module.exports = {
  addHoliday,
  getHolidaysByBatch,
  removeHoliday,
};
