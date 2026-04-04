const express = require('express');
const router = express.Router({ mergeParams: true });

const {
  assignTrainer,
  getTrainersByBatch,
  removeTrainer,
} = require('../controllers/trainer.controller');
const { authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { assignTrainerValidation } = require('../validators/trainer.validator');
const { ROLES } = require('../config/constants');

// Base route here is /api/batches/:batchId/trainers

router.get('/', getTrainersByBatch);

router.post(
  '/',
  authorize(ROLES.MANAGER, ROLES.ADMIN),
  assignTrainerValidation,
  validate,
  assignTrainer
);

router.delete(
  '/:trainerId',
  authorize(ROLES.MANAGER, ROLES.ADMIN),
  removeTrainer
);

module.exports = router;
