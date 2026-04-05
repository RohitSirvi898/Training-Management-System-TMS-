const Exam = require('../models/Exam');
const Result = require('../models/Result');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @desc    Schedule a new exam for a batch
 * @route   POST /api/batches/:batchId/exams
 * @access  Manager, Admin
 */
const createExam = async (req, res) => {
  try {
    const { batchId } = req.params;
    const {
      title,
      type,
      date,
      startTime,
      endTime,
      totalMarks,
      passingMarks,
      assignedLabs,
      assignedStudents,
      instructions,
    } = req.body;

    const exam = await Exam.create({
      batchId,
      title,
      type,
      date,
      startTime,
      endTime,
      totalMarks,
      passingMarks,
      assignedLabs,
      assignedStudents,
      scheduledBy: req.user._id,
      instructions,
    });

    return ApiResponse.created(res, { exam }, 'Exam scheduled successfully.');
  } catch (error) {
    console.error('CreateExam error:', error.message);
    return ApiResponse.error(res, 'Failed to schedule exam.');
  }
};

/**
 * @desc    Get all exams for a batch
 * @route   GET /api/batches/:batchId/exams
 * @access  Protected
 */
const getExamsByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const exams = await Exam.find({ batchId })
      .populate('scheduledBy', 'name')
      .populate('assignedLabs', 'name')
      .populate('assignedStudents', 'name enrollmentNo labId')
      .sort({ date: 1, startTime: 1 });

    return ApiResponse.success(res, { exams });
  } catch (error) {
    console.error('GetExamsByBatch error:', error.message);
    return ApiResponse.error(res, 'Failed to fetch exams.');
  }
};

/**
 * @desc    Delete an exam
 * @route   DELETE /api/batches/:batchId/exams/:examId
 * @access  Manager, Admin
 */
const deleteExam = async (req, res) => {
  try {
    const { batchId, examId } = req.params;

    const exam = await Exam.findOne({ _id: examId, batchId });
    if (!exam) {
      return ApiResponse.notFound(res, 'Exam not found.');
    }

    // Protection rule implementation
    const associatedResults = await Result.countDocuments({ examId });
    if (associatedResults > 0) {
      return ApiResponse.badRequest(
        res,
        'Cannot delete this exam because results have already been recorded.'
      );
    }

    await exam.deleteOne();
    return ApiResponse.success(res, null, 'Exam deleted successfully.');
  } catch (error) {
    console.error('DeleteExam error:', error.message);
    return ApiResponse.error(res, 'Failed to delete exam.');
  }
};

module.exports = {
  createExam,
  getExamsByBatch,
  deleteExam,
};
