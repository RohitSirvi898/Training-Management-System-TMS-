const Student = require('../models/Student');
const Batch = require('../models/Batch');
const Lab = require('../models/Lab');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @desc    Add a single student to a batch
 * @route   POST /api/batches/:batchId/students
 * @access  Manager, Admin
 */
const addStudentToBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { name, email, phone, collegeName, enrollmentNo, labId } = req.body;

    // Verify batch capacity
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return ApiResponse.notFound(res, 'Batch not found.');
    }

    const currentStudentCount = await Student.countDocuments({ batchId });
    if (batch.maxStudents && currentStudentCount >= batch.maxStudents) {
      return ApiResponse.badRequest(res, 'Batch has reached maximum student capacity.');
    }

    // Verify Lab exists within this batch if a labId is provided
    if (labId) {
      const lab = await Lab.findOne({ _id: labId, batchId });
      if (!lab) {
        return ApiResponse.badRequest(res, 'The selected Lab does not belong to this batch.');
      }

      // Check lab capacity
      const studentsInLab = await Student.countDocuments({ labId });
      if (studentsInLab >= lab.capacity) {
        return ApiResponse.badRequest(res, 'The selected Lab has reached its capacity.');
      }
    }

    // Email must be unique per batch (db index handles it, but we can catch friendly)
    const existingStudent = await Student.findOne({ batchId, email });
    if (existingStudent) {
      return ApiResponse.badRequest(res, 'A student with this email is already enrolled in this batch.');
    }

    const student = await Student.create({
      batchId,
      name,
      email,
      phone,
      collegeName,
      enrollmentNo,
      labId,
    });

    if (student.labId) {
      await student.populate('labId', 'name location');
    }

    return ApiResponse.created(res, { student }, 'Student registered successfully.');
  } catch (error) {
    if (error.code === 11000) {
      return ApiResponse.badRequest(res, 'A student with this email already exists in this batch.');
    }
    console.error('AddStudent error:', error.message);
    return ApiResponse.error(res, 'Failed to add student.');
  }
};

/**
 * @desc    Get all students in a batch
 * @route   GET /api/batches/:batchId/students
 * @access  Protected
 */
const getStudentsByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const students = await Student.find({ batchId })
      .populate('labId', 'name')
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, { students });
  } catch (error) {
    console.error('GetStudentsByBatch error:', error.message);
    return ApiResponse.error(res, 'Failed to fetch students.');
  }
};

/**
 * @desc    Remove/Unregister a student
 * @route   DELETE /api/batches/:batchId/students/:studentId
 * @access  Manager, Admin
 */
const removeStudent = async (req, res) => {
  try {
    // We only need studentId, but verify it belongs to batch as a sanity check
    const { batchId, studentId } = req.params;

    const student = await Student.findOneAndDelete({ _id: studentId, batchId });
    if (!student) {
      return ApiResponse.notFound(res, 'Student not found in this batch.');
    }

    return ApiResponse.success(res, null, 'Student removed successfully.');
  } catch (error) {
    console.error('RemoveStudent error:', error.message);
    return ApiResponse.error(res, 'Failed to remove student.');
  }
};

module.exports = {
  addStudentToBatch,
  getStudentsByBatch,
  removeStudent,
};
