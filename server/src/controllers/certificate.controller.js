const Certificate = require('../models/Certificate');
const Student = require('../models/Student');
const ApiResponse = require('../utils/ApiResponse');
const { CERTIFICATE_STATUS } = require('../config/constants');

/**
 * @desc    Assign a voucher code to a student
 * @route   POST /api/batches/:batchId/certificates
 * @access  Manager, Admin
 */
const assignCertificate = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { studentId, voucherCode } = req.body;

    // Verify student exists in this batch to prevent mismatch
    const student = await Student.findOne({ _id: studentId, batchId });
    if (!student) {
      return ApiResponse.badRequest(res, 'Student not found in this batch.');
    }

    // Single assignment logic: Has this student already received one?
    const existingCert = await Certificate.findOne({ batchId, studentId });
    if (existingCert) {
      return ApiResponse.badRequest(res, 'This student has already been assigned a certificate voucher.');
    }

    const certificate = await Certificate.create({
      batchId,
      studentId,
      voucherCode,
      assignedBy: req.user._id,
    });

    await certificate.populate('studentId', 'name email enrollmentNo');

    return ApiResponse.created(res, { certificate }, 'Certificate voucher assigned successfully.');
  } catch (error) {
    if (error.code === 11000) {
      // 11000 is thrown by the unique indexes 
      return ApiResponse.badRequest(res, 'Duplicate assignment or voucher code already in use.');
    }
    console.error('AssignCertificate error:', error.message);
    return ApiResponse.error(res, 'Failed to assign certificate.');
  }
};

/**
 * @desc    Get all certificates in a batch
 * @route   GET /api/batches/:batchId/certificates
 * @access  Protected
 */
const getCertificatesByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const certificates = await Certificate.find({ batchId })
      .populate('studentId', 'name email')
      .populate('assignedBy', 'name')
      .sort({ assignedDate: -1 });

    return ApiResponse.success(res, { certificates });
  } catch (error) {
    console.error('GetCertificates error:', error.message);
    return ApiResponse.error(res, 'Failed to fetch certificates.');
  }
};

/**
 * @desc    Mark a certificate voucher as redeemed
 * @route   PATCH /api/batches/:batchId/certificates/:certId/redeem
 * @access  Manager, Admin
 */
const markRedeemed = async (req, res) => {
  try {
    const { batchId, certId } = req.params;

    const certificate = await Certificate.findOne({ _id: certId, batchId });
    if (!certificate) {
      return ApiResponse.notFound(res, 'Certificate tracking not found.');
    }

    if (certificate.status === CERTIFICATE_STATUS.REDEEMED) {
      return ApiResponse.badRequest(res, 'Voucher is already marked as redeemed.');
    }

    certificate.status = CERTIFICATE_STATUS.REDEEMED;
    certificate.redeemedDate = new Date();
    await certificate.save();

    return ApiResponse.success(res, { certificate }, 'Voucher marked as redeemed.');
  } catch (error) {
    console.error('MarkRedeemed error:', error.message);
    return ApiResponse.error(res, 'Failed to update certificate status.');
  }
};

module.exports = {
  assignCertificate,
  getCertificatesByBatch,
  markRedeemed,
};
