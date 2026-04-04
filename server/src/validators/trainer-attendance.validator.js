const { body, query } = require('express-validator');
const { ATTENDANCE_STATUS } = require('../config/constants');

const bulkTrainerAttendanceValidation = [
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Please provide a valid date format (YYYY-MM-DD)')
    .toDate(),
  body('records')
    .isArray({ min: 1 })
    .withMessage('Records must be a non-empty array'),
  body('records.*.trainerId')
    .notEmpty()
    .withMessage('Trainer ID is required')
    .isMongoId()
    .withMessage('Invalid Trainer ID format'),
  body('records.*.status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(Object.values(ATTENDANCE_STATUS))
    .withMessage(`Status must be one of: ${Object.values(ATTENDANCE_STATUS).join(', ')}`),
  body('records.*.remarks')
    .optional()
    .isLength({ max: 250 })
    .withMessage('Remarks cannot exceed 250 characters'),
];

const getTrainerAttendanceValidation = [
  query('date')
    .notEmpty()
    .withMessage('Date query parameter is required')
    .isISO8601()
    .withMessage('Please provide a valid date format (YYYY-MM-DD)'),
];

module.exports = {
  bulkTrainerAttendanceValidation,
  getTrainerAttendanceValidation,
};
