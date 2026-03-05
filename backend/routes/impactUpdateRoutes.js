const express = require('express');
const router = express.Router();
const impactUpdateController = require('../controllers/impactUpdateController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', impactUpdateController.getImpactUpdates);
router.get('/featured', impactUpdateController.getFeaturedImpactUpdates);
router.get('/ngo/:ngoId', impactUpdateController.getNGOImpactUpdates);
router.get('/stats', impactUpdateController.getImpactStats);

// Protected routes
router.use(protect);

// Donor routes
router.get('/my-impacts', impactUpdateController.getDonorImpactUpdates);
router.post('/:id/like', impactUpdateController.likeImpactUpdate);
router.post('/:id/comment', impactUpdateController.commentOnImpactUpdate);
router.post('/:id/share', impactUpdateController.shareImpactUpdate);

// NGO routes (NGO admin only)
router.post('/', impactUpdateController.createImpactUpdate);
router.post('/:id/publish', impactUpdateController.publishImpactUpdate);
router.post('/:id/upload-images', upload.array('images', 5), impactUpdateController.uploadImpactImages);
router.post('/:id/tag-donors', impactUpdateController.tagDonors);
router.delete('/:id', impactUpdateController.deleteImpactUpdate);

module.exports = router;
