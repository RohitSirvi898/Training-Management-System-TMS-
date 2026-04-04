const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Protect routes — verifies JWT and attaches user to req
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return ApiResponse.unauthorized(res, 'No token provided. Please log in.');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user and attach to request
    const user = await User.findById(decoded.id);
    if (!user) {
      return ApiResponse.unauthorized(res, 'User no longer exists.');
    }

    if (!user.isActive) {
      return ApiResponse.forbidden(res, 'Your account has been deactivated.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return ApiResponse.unauthorized(res, 'Invalid token.');
    }
    if (error.name === 'TokenExpiredError') {
      return ApiResponse.unauthorized(res, 'Token has expired. Please log in again.');
    }
    return ApiResponse.error(res, 'Authentication failed.');
  }
};

/**
 * Restrict to specific roles
 * Usage: authorize('admin', 'manager')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Please log in first.');
    }
    if (!roles.includes(req.user.role)) {
      return ApiResponse.forbidden(
        res,
        `Role '${req.user.role}' is not authorized to access this resource.`
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
