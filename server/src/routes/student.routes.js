const express = require('express');
const router = express.Router({ mergeParams: true });

const {
  addStudentToBatch,
  getStudentsByBatch,
  removeStudent,
} = require('../controllers/student.controller');
const { authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createStudentValidation } = require('../validators/student.validator');
const { ROLES } = require('../config/constants');

// Base route here is /api/batches/:batchId/students

router.get('/', getStudentsByBatch);

router.post(
  '/',
  authorize(ROLES.MANAGER, ROLES.ADMIN),
  createStudentValidation,
  validate,
  addStudentToBatch
);

router.delete(
  '/:studentId',
  authorize(ROLES.MANAGER, ROLES.ADMIN),
  removeStudent
);

module.exports = router;
