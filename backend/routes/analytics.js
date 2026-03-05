const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// All routes require authentication
router.use(protect);

// Platform stats (system admin only)
router.get('/platform', authorize('system_admin'), analyticsController.getPlatformStats);

// NGO dashboard
router.get('/ngo/:ngoId', authorize('ngo_admin', 'system_admin'), analyticsController.getNGODashboard);

// Donor dashboard
router.get('/donor', authorize('donor'), analyticsController.getDonorDashboard);

// Comprehensive analytics (system admin only)
router.get('/detailed', authorize('system_admin'), analyticsController.getDetailedAnalytics);
router.get('/donation-trend', authorize('system_admin'), analyticsController.getDonationTrend);
router.get('/donation-size-breakdown', authorize('system_admin'), analyticsController.getDonationSizeBreakdown);
router.get('/user-growth', authorize('system_admin'), analyticsController.getUserGrowth);
router.get('/top-ngos', authorize('system_admin'), analyticsController.getTopNGOs);
router.get('/top-donors', authorize('system_admin'), analyticsController.getTopDonors);

module.exports = router;

