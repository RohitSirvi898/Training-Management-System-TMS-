const express = require('express');
const router = express.Router({ mergeParams: true });

const {
  createExam,
  getExamsByBatch,
  deleteExam,
} = require('../controllers/exam.controller');
const { authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createExamValidation } = require('../validators/exam.validator');
const { ROLES } = require('../config/constants');

// Base route is /api/batches/:batchId/exams

router.get('/', getExamsByBatch);

router.post(
  '/',
  authorize(ROLES.MANAGER, ROLES.ADMIN),
  createExamValidation,
  validate,
  createExam
);

router.delete(
  '/:examId',
  authorize(ROLES.MANAGER, ROLES.ADMIN),
  deleteExam
);

module.exports = router;
