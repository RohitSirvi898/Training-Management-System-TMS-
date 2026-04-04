const express = require('express');
const router = express.Router({ mergeParams: true });

const {
  bulkUpsertTrainerAttendance,
  getTrainerAttendanceByDate,
} = require('../controllers/trainer-attendance.controller');
const { authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { 
  bulkTrainerAttendanceValidation, 
  getTrainerAttendanceValidation 
} = require('../validators/trainer-attendance.validator');
const { ROLES } = require('../config/constants');

// Base route here is /api/batches/:batchId/attendance/trainers

router.get(
  '/',
  getTrainerAttendanceValidation,
  validate,
  getTrainerAttendanceByDate
);

router.post(
  '/bulk',
  authorize(ROLES.MANAGER, ROLES.ADMIN),
  bulkTrainerAttendanceValidation,
  validate,
  bulkUpsertTrainerAttendance
);

module.exports = router;
