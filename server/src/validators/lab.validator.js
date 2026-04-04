const { body } = require('express-validator');

const createLabValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Lab name is required')
    .isLength({ max: 100 })
    .withMessage('Lab name cannot exceed 100 characters'),
  body('capacity')
    .notEmpty()
    .withMessage('Capacity is required')
    .isInt({ min: 1 })
    .withMessage('Capacity must be at least 1')
    .toInt(),
  body('location')
    .optional()
    .trim(),
  body('facilities')
    .optional()
    .isArray()
    .withMessage('Facilities must be an array of strings'),
];

module.exports = {
  createLabValidation,
};
