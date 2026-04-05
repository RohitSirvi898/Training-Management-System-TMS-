const Result = require('../models/Result');
const Exam = require('../models/Exam');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @desc    Bulk input/upsert results for an exam
 * @route   POST /api/batches/:batchId/results/bulk/:examId
 * @access  Trainer, Manager, Admin
 */
const bulkUpsertResults = async (req, res) => {
  try {
    const { batchId, examId } = req.params;
    const { records } = req.body; // records: [{ studentId, marksObtained, remarks }]

    const exam = await Exam.findOne({ _id: examId, batchId });
    if (!exam) {
      return ApiResponse.notFound(res, 'Exam not found in this batch.');
    }

    const evaluatedBy = req.user._id;

    // We can't use standard bulkWrite easily if we want to trigger the Mongoose `pre('save')` hook.
    // bulkWrite bypasses Mongoose middleware. 
    // To utilize auto pass/fail logic inside the schema, we must use `save()` or evaluate it here.
    
    // Iterate and save to trigger hooks
    // For production with massive arrays, manual status calculation is preferred over loop-saving
    
    const resultsResponse = await Promise.all(
      records.map(async (record) => {
        // Find existing to update, or create new
        let resultData = await Result.findOne({
          batchId,
          examId,
          studentId: record.studentId,
        });

        if (resultData) {
          resultData.marksObtained = record.marksObtained;
          resultData.evaluatedBy = evaluatedBy;
          if (record.remarks !== undefined) resultData.remarks = record.remarks;
        } else {
          resultData = new Result({
            batchId,
            examId,
            studentId: record.studentId,
            marksObtained: record.marksObtained,
            evaluatedBy,
            remarks: record.remarks,
          });
        }
        
        // This save triggers the pre('save') hook to calculate status
        await resultData.save();
        return resultData;
      })
    );

    return ApiResponse.success(res, { results: resultsResponse.length }, 'Results processed successfully.');
  } catch (error) {
    console.error('BulkUpsertResults error:', error.message);
    return ApiResponse.error(res, 'Failed to process results.');
  }
};

/**
 * @desc    Get results for a specific exam in a batch
 * @route   GET /api/batches/:batchId/results?examId=YYY
 * @access  Protected
 */
const getResultsByExam = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { examId } = req.query;

    const results = await Result.find({ batchId, examId })
      .populate('studentId', 'name email enrollmentNo labId')
      .populate('evaluatedBy', 'name');

    return ApiResponse.success(res, { results });
  } catch (error) {
    console.error('GetResultsByExam error:', error.message);
    return ApiResponse.error(res, 'Failed to fetch results.');
  }
};

module.exports = {
  bulkUpsertResults,
  getResultsByExam,
};
