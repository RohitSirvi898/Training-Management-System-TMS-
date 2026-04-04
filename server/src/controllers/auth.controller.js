const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiResponse = require('../utils/ApiResponse');
const { ROLES } = require('../config/constants');

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * @desc    Register a new user (Admin creates Manager/Staff, Manager creates Trainer accounts)
 * @route   POST /api/auth/register
 * @access  Admin, Manager
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, permissions } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return ApiResponse.badRequest(res, 'A user with this email already exists.');
    }

    // ─── Role-based creation rules ─────────────────────────
    // Admin can create: Manager, College Staff, Trainer
    // Manager can create: Trainer, College Staff
    if (req.user.role === ROLES.ADMIN) {
      if (role === ROLES.ADMIN) {
        return ApiResponse.forbidden(res, 'Cannot create another Admin account.');
      }
    } else if (req.user.role === ROLES.MANAGER) {
      if (role === ROLES.ADMIN || role === ROLES.MANAGER) {
        return ApiResponse.forbidden(res, 'Managers can only create Trainer and College Staff accounts.');
      }
    } else {
      return ApiResponse.forbidden(res, 'You are not authorized to create users.');
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      permissions: role === ROLES.COLLEGE_STAFF ? (permissions || []) : [],
      createdBy: req.user._id,
    });

    return ApiResponse.created(res, {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        permissions: user.permissions,
      },
    }, 'User registered successfully.');

  } catch (error) {
    console.error('Register error:', error.message);
    return ApiResponse.error(res, 'Failed to register user.');
  }
};

/**
 * @desc    Login user & return JWT
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with password field included
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return ApiResponse.unauthorized(res, 'Invalid email or password.');
    }

    // Check if the account is active
    if (!user.isActive) {
      return ApiResponse.forbidden(res, 'Your account has been deactivated. Contact admin.');
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return ApiResponse.unauthorized(res, 'Invalid email or password.');
    }

    // Generate token
    const token = generateToken(user._id);

    return ApiResponse.success(res, {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        permissions: user.permissions,
      },
    }, 'Login successful.');

  } catch (error) {
    console.error('Login error:', error.message);
    return ApiResponse.error(res, 'Failed to login.');
  }
};

/**
 * @desc    Get current logged-in user's profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return ApiResponse.notFound(res, 'User not found.');
    }
    return ApiResponse.success(res, { user });
  } catch (error) {
    console.error('GetMe error:', error.message);
    return ApiResponse.error(res, 'Failed to fetch profile.');
  }
};

/**
 * @desc    Update profile (name, phone)
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone },
      { new: true, runValidators: true }
    ).select('-password');

    return ApiResponse.success(res, { user }, 'Profile updated successfully.');
  } catch (error) {
    console.error('UpdateProfile error:', error.message);
    return ApiResponse.error(res, 'Failed to update profile.');
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return ApiResponse.notFound(res, 'User not found.');
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return ApiResponse.badRequest(res, 'Current password is incorrect.');
    }

    // Update password (hashing happens via pre-save hook)
    user.password = newPassword;
    await user.save();

    // Generate new token after password change
    const token = generateToken(user._id);

    return ApiResponse.success(res, { token }, 'Password changed successfully.');
  } catch (error) {
    console.error('ChangePassword error:', error.message);
    return ApiResponse.error(res, 'Failed to change password.');
  }
};

/**
 * @desc    Get all users (Admin only, with optional role filter)
 * @route   GET /api/auth/users?role=manager
 * @access  Admin
 */
const getAllUsers = async (req, res) => {
  try {
    const query = {};

    // Optional role filter
    if (req.query.role) {
      query.role = req.query.role;
    }

    // Never return other admins
    if (req.user.role !== ROLES.ADMIN) {
      query.role = { $ne: ROLES.ADMIN };
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, { users, count: users.length });
  } catch (error) {
    console.error('GetAllUsers error:', error.message);
    return ApiResponse.error(res, 'Failed to fetch users.');
  }
};

/**
 * @desc    Toggle user active status (Admin only)
 * @route   PATCH /api/auth/users/:id/toggle-status
 * @access  Admin
 */
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return ApiResponse.notFound(res, 'User not found.');
    }

    if (user.role === ROLES.ADMIN) {
      return ApiResponse.forbidden(res, 'Cannot deactivate an Admin account.');
    }

    user.isActive = !user.isActive;
    await user.save();

    return ApiResponse.success(
      res,
      { user },
      `User ${user.isActive ? 'activated' : 'deactivated'} successfully.`
    );
  } catch (error) {
    console.error('ToggleStatus error:', error.message);
    return ApiResponse.error(res, 'Failed to toggle user status.');
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getAllUsers,
  toggleUserStatus,
};
