const express = require('express');
const router = express.Router();
const adoptADayController = require('../controllers/adoptADayController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// Public routes
router.get('/', adoptADayController.getAdoptADays);
router.get('/available', adoptADayController.getAvailableDays);
router.get('/:id', adoptADayController.getAdoptADayById);

// Protected routes
router.use(protect);
router.use(require('../middleware/attachNGO'));

// NGO Admin + System Admin routes
router.post('/', authorize('ngo_admin', 'system_admin'), adoptADayController.createAdoptADay);
router.put('/:id', authorize('ngo_admin', 'system_admin'), adoptADayController.updateAdoptADay);
router.delete('/:id', authorize('ngo_admin', 'system_admin'), adoptADayController.deleteAdoptADay);

// Donor routes
router.post('/:id/adopt', authorize('donor'), adoptADayController.adoptDay);

module.exports = router;

