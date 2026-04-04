const { validationResult } = require('express-validator');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Middleware to check express-validator results.
 * Place after validation rules in the route chain.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return ApiResponse.validationError(res, formattedErrors);
  }
  next();
};

module.exports = validate;
