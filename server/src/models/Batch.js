const mongoose = require('mongoose');
const { BATCH_STATUS } = require('../config/constants');

const batchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Batch name is required'],
      trim: true,
      maxlength: [150, 'Batch name cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    technology: {
      type: String,
      required: [true, 'Technology/Course is required'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    status: {
      type: String,
      enum: Object.values(BATCH_STATUS),
      default: BATCH_STATUS.UPCOMING,
    },
    // Manager who created this batch
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Batch must have a creator (Manager)'],
    },
    // Total capacity for students in this batch
    maxStudents: {
      type: Number,
      default: 60,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtual: calculate batch duration in weeks ──────────────
batchSchema.virtual('durationWeeks').get(function () {
  if (!this.startDate || !this.endDate) return 0;
  const diffMs = this.endDate - this.startDate;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7));
});

// ─── Index for quick lookups ─────────────────────────────────
batchSchema.index({ status: 1 });
batchSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Batch', batchSchema);
