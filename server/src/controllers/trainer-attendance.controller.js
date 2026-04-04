const TrainerAttendance = require('../models/TrainerAttendance');
const Holiday = require('../models/Holiday');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @desc    Bulk mark/upsert trainer attendance for a specific date
 * @route   POST /api/batches/:batchId/attendance/trainers/bulk
 * @access  Manager, Admin
 */
const bulkUpsertTrainerAttendance = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { date, records } = req.body; // records: [{ trainerId, status, remarks }]

    // Normalize date
    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    // Check if it's a holiday
    const isHoliday = await Holiday.findOne({
      batchId,
      date: {
        $gte: targetDate,
        $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (isHoliday) {
      return ApiResponse.badRequest(res, 'Cannot mark attendance on a declared holiday.');
    }

    const markedBy = req.user._id;

    // Execute bulk upsert operations
    const bulkOps = records.map((record) => {
      // Create the query block safely, avoid undefined remarks
      const updateData = {
        status: record.status,
        markedBy,
      };
      if (record.remarks !== undefined) {
        updateData.remarks = record.remarks;
      }

      return {
        updateOne: {
          filter: {
            batchId,
            trainerId: record.trainerId,
            date: targetDate,
          },
          update: {
            $set: updateData
          },
          upsert: true, // Upsert allowed for historical edits as requested
        },
      };
    });

    const result = await TrainerAttendance.bulkWrite(bulkOps);

    return ApiResponse.success(res, { result }, 'Trainer attendance saved successfully.');
  } catch (error) {
    console.error('BulkTrainerAttendance error:', error.message);
    return ApiResponse.error(res, 'Failed to save trainer attendance.');
  }
};

/**
 * @desc    Get trainer attendance for a specific date
 * @route   GET /api/batches/:batchId/attendance/trainers?date=YYYY-MM-DD
 * @access  Protected
 */
const getTrainerAttendanceByDate = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { date } = req.query;

    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    const attendanceRecords = await TrainerAttendance.find({
      batchId,
      date: {
        $gte: targetDate,
        $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
      }
    }).populate('markedBy', 'name');

    return ApiResponse.success(res, { attendance: attendanceRecords });
  } catch (error) {
    console.error('GetTrainerAttendance error:', error.message);
    return ApiResponse.error(res, 'Failed to fetch trainer attendance.');
  }
};

module.exports = {
  bulkUpsertTrainerAttendance,
  getTrainerAttendanceByDate,
};
