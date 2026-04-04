const mongoose = require('mongoose');
const { RESULT_STATUS } = require('../config/constants');

const resultSchema = new mongoose.Schema(
  {
    // ⚡ CRITICAL: Batch-Centric
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: [true, 'Batch ID is required'],
      index: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: [true, 'Exam ID is required'],
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
    },
    marksObtained: {
      type: Number,
      required: [true, 'Marks obtained is required'],
      min: [0, 'Marks cannot be negative'],
    },
    // Auto-calculated based on exam's passingMarks
    status: {
      type: String,
      enum: Object.values(RESULT_STATUS),
      default: RESULT_STATUS.PENDING,
    },
    // Trainer who input the result
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [500, 'Remarks cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// ─── Auto-calculate pass/fail before saving ──────────────────
resultSchema.pre('save', async function (next) {
  if (this.isModified('marksObtained')) {
    try {
      const Exam = mongoose.model('Exam');
      const exam = await Exam.findById(this.examId);
      if (exam) {
        this.status =
          this.marksObtained >= exam.passingMarks
            ? RESULT_STATUS.PASS
            : RESULT_STATUS.FAIL;
      }
    } catch (err) {
      // If exam lookup fails, leave as pending
      console.error('Error auto-calculating result status:', err.message);
    }
  }
  next();
});

// ─── One result per student per exam ─────────────────────────
resultSchema.index({ batchId: 1, examId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Result', resultSchema);
