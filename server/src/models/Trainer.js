const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema(
  {
    // ⚡ CRITICAL: Batch-Centric — trainer assignment is per-batch
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: [true, 'Batch ID is required'],
      index: true,
    },
    // Reference to the User account (role: 'trainer')
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    // Labs this trainer is responsible for in this batch
    assignedLabs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lab',
      },
    ],
    specialization: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Compound index: a user can only be assigned once per batch
trainerSchema.index({ batchId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Trainer', trainerSchema);
