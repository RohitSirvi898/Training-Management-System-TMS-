const mongoose = require('mongoose');
const { CERTIFICATE_STATUS } = require('../config/constants');

const certificateSchema = new mongoose.Schema(
  {
    // ⚡ CRITICAL: Batch-Centric
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: [true, 'Batch ID is required'],
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
    },
    voucherCode: {
      type: String,
      required: [true, 'Voucher code is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(CERTIFICATE_STATUS),
      default: CERTIFICATE_STATUS.ASSIGNED,
    },
    // Manager who assigned the voucher
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedDate: {
      type: Date,
      default: Date.now,
    },
    redeemedDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// ─── One voucher per student per batch ───────────────────────
certificateSchema.index({ batchId: 1, studentId: 1 }, { unique: true });
certificateSchema.index({ voucherCode: 1 });

module.exports = mongoose.model('Certificate', certificateSchema);
