const Lab = require('../models/Lab');
const Student = require('../models/Student');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @desc    Add a lab to a specific batch
 * @route   POST /api/batches/:batchId/labs
 * @access  Manager, Admin
 */
const addLab = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { name, capacity, location, facilities } = req.body;

    // Check for duplicate lab name in the same batch
    const existingLab = await Lab.findOne({ batchId, name });
    if (existingLab) {
      return ApiResponse.badRequest(res, 'A lab with this name already exists in the batch.');
    }

    const lab = await Lab.create({
      batchId,
      name,
      capacity,
      location,
      facilities,
    });

    return ApiResponse.created(res, { lab }, 'Lab created successfully.');
  } catch (error) {
    if (error.code === 11000) {
      return ApiResponse.badRequest(res, 'A lab with this name already exists in the batch.');
    }
    console.error('AddLab error:', error.message);
    return ApiResponse.error(res, 'Failed to add lab.');
  }
};

/**
 * @desc    Get all labs for a batch
 * @route   GET /api/batches/:batchId/labs
 * @access  Protected
 */
const getLabsByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const labs = await Lab.find({ batchId }).sort({ createdAt: -1 });
    
    // Quick pass to get student counts for each lab
    // For large scale, use aggregation. For simplicity here, Promise.all on lean models.
    const labData = await Promise.all(labs.map(async (lab) => {
      const studentCount = await Student.countDocuments({ labId: lab._id });
      return { ...lab.toObject(), currentStudents: studentCount };
    }));

    return ApiResponse.success(res, { labs: labData });
  } catch (error) {
    console.error('GetLabsByBatch error:', error.message);
    return ApiResponse.error(res, 'Failed to fetch labs.');
  }
};

/**
 * @desc    Remove a lab from a batch
 * @route   DELETE /api/batches/:batchId/labs/:labId
 * @access  Manager, Admin
 */
const removeLab = async (req, res) => {
  try {
    const { labId } = req.params;

    const lab = await Lab.findById(labId);
    if (!lab) {
      return ApiResponse.notFound(res, 'Lab not found.');
    }

    // Protection rule implementation
    const associatedStudents = await Student.countDocuments({ labId });
    if (associatedStudents > 0) {
      return ApiResponse.badRequest(
        res, 
        `Cannot delete this lab. There are ${associatedStudents} students currently assigned to it.`
      );
    }

    await lab.deleteOne();
    return ApiResponse.success(res, null, 'Lab removed successfully.');
  } catch (error) {
    console.error('RemoveLab error:', error.message);
    return ApiResponse.error(res, 'Failed to remove lab.');
  }
};

module.exports = {
  addLab,
  getLabsByBatch,
  removeLab,
};
