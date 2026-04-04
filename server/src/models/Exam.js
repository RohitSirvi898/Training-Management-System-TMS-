const mongoose = require('mongoose');
const { EXAM_TYPES } = require('../config/constants');

const examSchema = new mongoose.Schema(
  {
    // ⚡ CRITICAL: Batch-Centric
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: [true, 'Batch ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Exam title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    type: {
      type: String,
      enum: Object.values(EXAM_TYPES),
      required: [true, 'Exam type is required'],
    },
    date: {
      type: Date,
      required: [true, 'Exam date is required'],
    },
    startTime: {
      type: String, // e.g. "10:00"
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String, // e.g. "12:00"
      required: [true, 'End time is required'],
    },
    totalMarks: {
      type: Number,
      required: [true, 'Total marks is required'],
      min: [1, 'Total marks must be at least 1'],
    },
    passingMarks: {
      type: Number,
      required: [true, 'Passing marks is required'],
      min: [0, 'Passing marks cannot be negative'],
    },
    // Labs where this exam will be conducted
    assignedLabs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lab',
      },
    ],
    // Students assigned to this exam
    assignedStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
    // Manager who scheduled this exam
    scheduledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    instructions: {
      type: String,
      trim: true,
      maxlength: [1000, 'Instructions cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ─────────────────────────────────────────────────
examSchema.index({ batchId: 1, type: 1 });
examSchema.index({ batchId: 1, date: 1 });

module.exports = mongoose.model('Exam', examSchema);
