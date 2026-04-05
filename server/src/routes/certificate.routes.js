const express = require('express');
const router = express.Router({ mergeParams: true });

const {
  assignCertificate,
  getCertificatesByBatch,
  markRedeemed,
} = require('../controllers/certificate.controller');
const { authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { assignCertificateValidation } = require('../validators/certificate.validator');
const { ROLES } = require('../config/constants');

// Base route is /api/batches/:batchId/certificates

router.get('/', getCertificatesByBatch);

router.post(
  '/',
  authorize(ROLES.MANAGER, ROLES.ADMIN),
  assignCertificateValidation,
  validate,
  assignCertificate
);

router.patch(
  '/:certId/redeem',
  authorize(ROLES.MANAGER, ROLES.ADMIN),
  markRedeemed
);

module.exports = router;
