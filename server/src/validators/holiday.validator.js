const { body } = require('express-validator');

const createHolidayValidation = [
  body('date')
    .notEmpty()
    .withMessage('Holiday date is required')
    .isISO8601()
    .withMessage('Please provide a valid date format (YYYY-MM-DD)')
    .toDate(),
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Holiday reason is required')
    .isLength({ max: 200 })
    .withMessage('Reason cannot exceed 200 characters'),
];

module.exports = {
  createHolidayValidation,
};
