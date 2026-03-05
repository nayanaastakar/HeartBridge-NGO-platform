const express = require('express');
const router = express.Router();
const gratitudeController = require('../controllers/gratitudeController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// Public routes
router.get('/wall', gratitudeController.getGratitudeWall);
router.get('/', gratitudeController.getGratitudeMessages);
router.get('/:id', gratitudeController.getGratitudeById);

// Protected routes
router.use(protect);
router.use(require('../middleware/attachNGO'));

// NGO Admin routes
router.post('/', authorize('ngo_admin'), gratitudeController.createGratitude);
router.put('/:id', authorize('ngo_admin'), gratitudeController.updateGratitude);
router.delete('/:id', authorize('ngo_admin'), gratitudeController.deleteGratitude);

module.exports = router;

