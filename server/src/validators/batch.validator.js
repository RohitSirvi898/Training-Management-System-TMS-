const { body } = require('express-validator');
const { BATCH_STATUS } = require('../config/constants');

const createBatchValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Batch name is required')
    .isLength({ max: 150 })
    .withMessage('Batch name cannot exceed 150 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('technology')
    .trim()
    .notEmpty()
    .withMessage('Technology/Course is required'),

  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid date'),

  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after the start date');
      }
      return true;
    }),

  body('maxStudents')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max students must be at least 1')
    .toInt(),
];

const updateBatchStatusValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(Object.values(BATCH_STATUS))
    .withMessage(`Status must be one of: ${Object.values(BATCH_STATUS).join(', ')}`),
];

module.exports = {
  createBatchValidation,
  updateBatchStatusValidation,
};
