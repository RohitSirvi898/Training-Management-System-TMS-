const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema(
  {
    // ⚡ CRITICAL: Batch-Centric — holidays are per-batch
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: [true, 'Batch ID is required'],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Holiday date is required'],
    },
    reason: {
      type: String,
      required: [true, 'Holiday reason is required'],
      trim: true,
      maxlength: [200, 'Reason cannot exceed 200 characters'],
    },
    // Manager who declared the holiday
    declaredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─── One holiday per date per batch ──────────────────────────
holidaySchema.index({ batchId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Holiday', holidaySchema);
