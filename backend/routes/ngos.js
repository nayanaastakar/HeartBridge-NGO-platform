const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const ngoController = require('../controllers/ngoController');
const upload = require('../middleware/upload');

const router = express.Router();

// Public browse
router.get('/', ngoController.list);

// NGO Admin
router.get('/me/mine', protect, authorize('ngo_admin', 'system_admin'), ngoController.mine);

// Public single NGO (keep after /me/*)
router.get('/:id', ngoController.get);

router.post(
  '/',
  protect,
  authorize('ngo_admin', 'system_admin'),
  [
    body('name').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('category')
      .isIn([
        'Children Welfare',
        'Children Welfare NGOs',
        'Old Age Homes',
        'Education',
        'Healthcare',
        'Emergency Funds',
        'Women Empowerment',
        'Environment',
        'Animal Welfare',
        'Social Welfare',
        'Disaster Relief',
        'Physically Disabled Care NGOs',
        'Food and Basic Needs NGOs',
        'Mentally Challenged Care NGOs'
      ])
      .withMessage('Invalid category'),
    body('registrationNumber').trim().notEmpty(),
    body('address').trim().notEmpty(),
    body('phone').trim().notEmpty(),
    body('email').isEmail(),
    body('fundingRequirement').isNumeric().optional(),
  ],
  ngoController.create
);

router.patch('/:id', protect, authorize('ngo_admin', 'system_admin'), ngoController.update);
router.put('/:id', protect, authorize('ngo_admin', 'system_admin'), ngoController.update);
router.delete('/:id', protect, authorize('system_admin'), ngoController.remove);

router.post(
  '/:id/utilizations',
  protect,
  authorize('ngo_admin', 'system_admin'),
  [body('amount').isNumeric(), body('purpose').trim().notEmpty()],
  ngoController.addUtilization
);

router.post('/:id/upload-logo', protect, authorize('ngo_admin', 'system_admin'), upload.single('logo'), ngoController.uploadLogo);
router.post('/:id/upload-banner', protect, authorize('ngo_admin', 'system_admin'), upload.single('banner'), ngoController.uploadBanner);
router.post('/:id/upload-document', protect, authorize('ngo_admin', 'system_admin'), upload.single('proof-document'), ngoController.uploadVerificationDocument);

router.get(
  '/:id/utilizations',
  protect,
  authorize('ngo_admin', 'system_admin'),
  ngoController.listUtilizations
);

module.exports = router;


