const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    // ⚡ CRITICAL: Batch-Centric — every student belongs to a batch
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: [true, 'Batch ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
    },
    collegeName: {
      type: String,
      trim: true,
    },
    enrollmentNo: {
      type: String,
      trim: true,
    },
    // Lab allocation within this batch
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lab',
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

// ─── Compound index: unique email per batch ──────────────────
studentSchema.index({ batchId: 1, email: 1 }, { unique: true });
studentSchema.index({ batchId: 1, labId: 1 });

module.exports = mongoose.model('Student', studentSchema);
