const mongoose = require('mongoose');

const labSchema = new mongoose.Schema(
  {
    // ⚡ CRITICAL: Batch-Centric — lab allocation is per-batch
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: [true, 'Batch ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Lab name is required'],
      trim: true,
      maxlength: [100, 'Lab name cannot exceed 100 characters'],
    },
    location: {
      type: String,
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Lab capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    // Equipment/software available in the lab
    facilities: {
      type: [String],
      default: [],
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

// ─── Compound index: unique lab name within a batch ──────────
labSchema.index({ batchId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Lab', labSchema);
