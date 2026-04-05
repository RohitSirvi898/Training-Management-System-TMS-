const express = require('express');
const router = express.Router({ mergeParams: true });

const {
  bulkUpsertResults,
  getResultsByExam,
} = require('../controllers/result.controller');
const { authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  bulkResultValidation,
  getResultsValidation,
} = require('../validators/result.validator');
const { ROLES } = require('../config/constants');

// Base route is /api/batches/:batchId/results

router.get(
  '/',
  getResultsValidation,
  validate,
  getResultsByExam
);

router.post(
  '/bulk/:examId',
  authorize(ROLES.TRAINER, ROLES.MANAGER, ROLES.ADMIN),
  bulkResultValidation,
  validate,
  bulkUpsertResults
);

module.exports = router;
