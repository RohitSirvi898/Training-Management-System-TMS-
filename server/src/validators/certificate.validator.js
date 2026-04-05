const { body } = require('express-validator');

const assignCertificateValidation = [
  body('studentId')
    .notEmpty()
    .withMessage('Student ID is required')
    .isMongoId()
    .withMessage('Invalid Student ID format'),
  body('voucherCode')
    .trim()
    .notEmpty()
    .withMessage('Voucher code is required'),
];

module.exports = {
  assignCertificateValidation,
};
