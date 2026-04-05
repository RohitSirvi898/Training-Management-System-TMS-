const { body, query } = require('express-validator');

const bulkResultValidation = [
  body('records')
    .isArray({ min: 1 })
    .withMessage('Records must be a non-empty array'),
  body('records.*.studentId')
    .notEmpty()
    .withMessage('Student ID is required')
    .isMongoId()
    .withMessage('Invalid Student ID format'),
  body('records.*.marksObtained')
    .notEmpty()
    .withMessage('Marks obtained is required')
    .isNumeric()
    .withMessage('Marks must be a number')
    .custom((val) => {
      if (val < 0) throw new Error('Marks cannot be negative');
      return true;
    }),
  body('records.*.remarks')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Remarks cannot exceed 500 characters'),
];

const getResultsValidation = [
  query('examId')
    .notEmpty()
    .withMessage('Exam ID is required')
    .isMongoId()
    .withMessage('Invalid Exam ID format'),
];

module.exports = {
  bulkResultValidation,
  getResultsValidation,
};
