const express = require('express');
// Important: mergeParams allows us to access :batchId from the parent router
const router = express.Router({ mergeParams: true }); 

const {
  addLab,
  getLabsByBatch,
  removeLab,
} = require('../controllers/lab.controller');
const { authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createLabValidation } = require('../validators/lab.validator');
const { ROLES } = require('../config/constants');

// Base route here is /api/batches/:batchId/labs
// All routes are already protected by the parent router, but we add specific authorize guards

router.get('/', getLabsByBatch);

router.post(
  '/',
  authorize(ROLES.MANAGER, ROLES.ADMIN),
  createLabValidation,
  validate,
  addLab
);

router.delete(
  '/:labId',
  authorize(ROLES.MANAGER, ROLES.ADMIN),
  removeLab
);

module.exports = router;
