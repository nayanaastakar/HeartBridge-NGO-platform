const express = require('express');
const router = express.Router();
const wishController = require('../controllers/wishController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// Public routes
router.get('/', wishController.getWishes);
router.get('/active', wishController.getActiveWishes);
router.get('/:id', wishController.getWishById);

// Protected routes
router.use(protect);
router.use(require('../middleware/attachNGO'));

// NGO Admin + System Admin routes
router.post('/', authorize('ngo_admin', 'system_admin'), wishController.createWish);
router.put('/:id', authorize('ngo_admin', 'system_admin'), wishController.updateWish);
router.delete('/:id', authorize('ngo_admin', 'system_admin'), wishController.deleteWish);

module.exports = router;

