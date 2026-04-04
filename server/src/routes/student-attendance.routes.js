const express = require('express');
const router = express.Router({ mergeParams: true });

const {
  bulkUpsertStudentAttendance,
  getStudentAttendanceByDate,
} = require('../controllers/student-attendance.controller');
const { authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { 
  bulkStudentAttendanceValidation, 
  getStudentAttendanceValidation 
} = require('../validators/student-attendance.validator');
const { ROLES } = require('../config/constants');

// Base route here is /api/batches/:batchId/attendance/students

router.get(
  '/',
  getStudentAttendanceValidation,
  validate,
  getStudentAttendanceByDate
);

router.post(
  '/bulk',
  authorize(ROLES.TRAINER, ROLES.MANAGER, ROLES.ADMIN),
  bulkStudentAttendanceValidation,
  validate,
  bulkUpsertStudentAttendance
);

module.exports = router;
