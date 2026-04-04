const express = require('express');
const router = express.Router();
const {
  createBatch,
  getBatches,
  getBatchById,
  updateBatch,
  updateBatchStatus,
} = require('../controllers/batch.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  createBatchValidation,
  updateBatchStatusValidation,
} = require('../validators/batch.validator');
const { ROLES } = require('../config/constants');

// Apply protection to all batch routes
router.use(protect);

// ─── Protected Routes (Read access for all logged in roles) ──
router.get('/', getBatches);
router.get('/:id', getBatchById);

// ─── Manager & Admin Routes ──────────────────────────────────
router.post(
  '/',
  authorize(ROLES.MANAGER, ROLES.ADMIN),
  createBatchValidation,
  validate,
  createBatch
);

router.put(
  '/:id',
  authorize(ROLES.MANAGER, ROLES.ADMIN),
  createBatchValidation, // Can reuse create validation for full updates
  validate,
  updateBatch
);

router.patch(
  '/:id/status',
  authorize(ROLES.MANAGER, ROLES.ADMIN),
  updateBatchStatusValidation,
  validate,
  updateBatchStatus
);

module.exports = router;
