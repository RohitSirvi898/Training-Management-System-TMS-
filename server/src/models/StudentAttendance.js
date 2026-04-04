const mongoose = require('mongoose');
const { ATTENDANCE_STATUS } = require('../config/constants');

const studentAttendanceSchema = new mongoose.Schema(
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
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    status: {
      type: String,
      enum: Object.values(ATTENDANCE_STATUS),
      required: [true, 'Attendance status is required'],
    },
    // Who marked the attendance (Trainer)
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

// ─── One attendance record per student per day per batch ─────
studentAttendanceSchema.index(
  { batchId: 1, studentId: 1, date: 1 },
  { unique: true }
);

module.exports = mongoose.model('StudentAttendance', studentAttendanceSchema);
