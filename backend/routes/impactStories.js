const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const upload = require('../middleware/upload');
const {
  getAllImpactStories,
  getImpactStoriesByNGO,
  getImpactStory,
  createImpactStory,
  updateImpactStory,
  deleteImpactStory,
  likeImpactStory,
  shareImpactStory,
  getFeaturedImpactStories,
  uploadBeforePhoto,
  uploadAfterPhoto
} = require('../controllers/impactStoryController');

// Public routes
router.get('/', getAllImpactStories);
router.get('/stats/featured', getFeaturedImpactStories);
router.get('/ngo/:ngoId', getImpactStoriesByNGO);
router.get('/:id', getImpactStory);

// Protected routes (NGO Admins only)
router.post('/', protect, authorize('ngo_admin'), createImpactStory);
router.put('/:id', protect, authorize('ngo_admin'), updateImpactStory);
router.delete('/:id', protect, authorize('ngo_admin'), deleteImpactStory);

// Image upload routes (NGO Admins only)
router.post('/:id/upload-before-photo', protect, authorize('ngo_admin'), upload.single('beforePhoto'), uploadBeforePhoto);
router.post('/:id/upload-after-photo', protect, authorize('ngo_admin'), upload.single('afterPhoto'), uploadAfterPhoto);

// User engagement routes (Protected)
router.post('/:id/like', protect, likeImpactStory);
router.post('/:id/share', protect, shareImpactStory);

module.exports = router;
