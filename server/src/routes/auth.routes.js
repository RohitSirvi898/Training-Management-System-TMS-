const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getAllUsers,
  toggleUserStatus,
} = require('../controllers/auth.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
} = require('../validators/auth.validator');
const { ROLES } = require('../config/constants');

// ─── Public Routes ───────────────────────────────────────────
router.post('/login', loginValidation, validate, login);

// ─── Protected Routes (any logged-in user) ───────────────────
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfileValidation, validate, updateProfile);
router.put('/change-password', protect, changePasswordValidation, validate, changePassword);

// ─── Admin & Manager Routes ──────────────────────────────────
router.post(
  '/register',
  protect,
  authorize(ROLES.ADMIN, ROLES.MANAGER),
  registerValidation,
  validate,
  register
);

// ─── Admin Only Routes ───────────────────────────────────────
router.get(
  '/users',
  protect,
  authorize(ROLES.ADMIN, ROLES.MANAGER),
  getAllUsers
);

router.patch(
  '/users/:id/toggle-status',
  protect,
  authorize(ROLES.ADMIN),
  toggleUserStatus
);

module.exports = router;
