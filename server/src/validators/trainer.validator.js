const { body } = require('express-validator');

const assignTrainerValidation = [
  body('userId')
    .notEmpty()
    .withMessage('Trainer User ID is required')
    .isMongoId()
    .withMessage('Invalid User ID format'),
  body('assignedLabs')
    .optional()
    .isArray()
    .withMessage('Labs must be an array of lab IDs'),
  body('specialization')
    .optional()
    .trim(),
];

module.exports = {
  assignTrainerValidation,
};
