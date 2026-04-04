const mongoose = require('mongoose');
const { ATTENDANCE_STATUS } = require('../config/constants');

const trainerAttendanceSchema = new mongoose.Schema(
  {
    // ⚡ CRITICAL: Batch-Centric
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: [true, 'Batch ID is required'],
      index: true,
    },
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainer',
      required: [true, 'Trainer ID is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    status: {
      type: String,
      enum: Object.values(ATTENDANCE_STATUS),
      required: [true, 'Attendance status is required'],
    },
    // Manager marks trainer attendance
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [250, 'Remarks cannot exceed 250 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// ─── One attendance record per trainer per day per batch ─────
trainerAttendanceSchema.index(
  { batchId: 1, trainerId: 1, date: 1 },
  { unique: true }
);

module.exports = mongoose.model('TrainerAttendance', trainerAttendanceSchema);
