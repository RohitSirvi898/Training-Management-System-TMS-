const StudentAttendance = require('../models/StudentAttendance');
const Holiday = require('../models/Holiday');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @desc    Bulk mark/upsert student attendance for a specific date
 * @route   POST /api/batches/:batchId/attendance/students/bulk
 * @access  Trainer, Manager, Admin
 */
const bulkUpsertStudentAttendance = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { date, records } = req.body; 

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
            studentId: record.studentId,
            date: targetDate,
          },
          update: {
            $set: updateData
          },
          upsert: true,
        },
      };
    });

    const result = await StudentAttendance.bulkWrite(bulkOps);

    return ApiResponse.success(res, { result }, 'Student attendance saved successfully.');
  } catch (error) {
    console.error('BulkStudentAttendance error:', error.message);
    return ApiResponse.error(res, 'Failed to save student attendance.');
  }
};

/**
 * @desc    Get student attendance for a specific date
 * @route   GET /api/batches/:batchId/attendance/students?date=YYYY-MM-DD
 * @access  Protected
 */
const getStudentAttendanceByDate = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { date } = req.query;

    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    const attendanceRecords = await StudentAttendance.find({
      batchId,
      date: {
        $gte: targetDate,
        $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
      }
    }).populate('markedBy', 'name');

    return ApiResponse.success(res, { attendance: attendanceRecords });
  } catch (error) {
    console.error('GetStudentAttendance error:', error.message);
    return ApiResponse.error(res, 'Failed to fetch student attendance.');
  }
};

module.exports = {
  bulkUpsertStudentAttendance,
  getStudentAttendanceByDate,
};
