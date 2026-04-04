const { body } = require('express-validator');

const createStudentValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Student name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .trim(),
  body('collegeName')
    .optional()
    .trim(),
  body('enrollmentNo')
    .optional()
    .trim(),
  body('labId')
    .optional()
    .isMongoId()
    .withMessage('Invalid Lab ID'),
];

module.exports = {
  createStudentValidation,
};
