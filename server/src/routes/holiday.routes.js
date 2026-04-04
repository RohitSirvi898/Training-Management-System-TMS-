const express = require('express');
const router = express.Router({ mergeParams: true });

const {
  addHoliday,
  getHolidaysByBatch,
  removeHoliday,
} = require('../controllers/holiday.controller');
const { authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createHolidayValidation } = require('../validators/holiday.validator');
const { ROLES } = require('../config/constants');

// Base route here is /api/batches/:batchId/holidays

router.get('/', getHolidaysByBatch);

router.post(
  '/',
  authorize(ROLES.MANAGER, ROLES.ADMIN),
  createHolidayValidation,
  validate,
  addHoliday
);

router.delete(
  '/:id',
  authorize(ROLES.MANAGER, ROLES.ADMIN),
  removeHoliday
);

module.exports = router;
