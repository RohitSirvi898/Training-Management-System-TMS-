const { body } = require('express-validator');
const { EXAM_TYPES } = require('../config/constants');

const createExamValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Exam title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('type')
    .notEmpty()
    .withMessage('Exam type is required')
    .isIn(Object.values(EXAM_TYPES))
    .withMessage(`Exam type must be one of: ${Object.values(EXAM_TYPES).join(', ')}`),
  body('date')
    .notEmpty()
    .withMessage('Exam date is required')
    .isISO8601()
    .withMessage('Please provide a valid date format (YYYY-MM-DD)')
    .toDate(),
  body('startTime')
    .notEmpty()
    .withMessage('Start time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('endTime')
    .notEmpty()
    .withMessage('End time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),
  body('totalMarks')
    .notEmpty()
    .withMessage('Total marks is required')
    .isInt({ min: 1 })
    .withMessage('Total marks must be at least 1')
    .toInt(),
  body('passingMarks')
    .notEmpty()
    .withMessage('Passing marks is required')
    .isInt({ min: 0 })
    .withMessage('Passing marks cannot be negative')
    .custom((val, { req }) => {
      if (val > req.body.totalMarks) {
        throw new Error('Passing marks cannot be greater than total marks');
      }
      return true;
    })
    .toInt(),
  body('assignedLabs')
    .optional()
    .isArray()
    .withMessage('Assigned labs must be an array of Object IDs'),
  body('assignedLabs.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid Lab ID format'),
  body('assignedStudents')
    .optional()
    .isArray()
    .withMessage('Assigned students must be an array of Object IDs'),
  body('assignedStudents.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid Student ID format'),
  body('instructions')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Instructions cannot exceed 1000 characters'),
];

module.exports = {
  createExamValidation,
};
