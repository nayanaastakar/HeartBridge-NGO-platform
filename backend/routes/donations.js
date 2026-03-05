const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// All routes require authentication
router.use(protect);

// Create donation (donors only)
router.post('/', authorize('donor'), donationController.createDonation);

// Get my donations (donors only)
router.get('/my-donations', authorize('donor'), donationController.getMyDonations);

// Get donations for a specific NGO
router.get('/ngo/:ngoId', donationController.getNGODonations);

// Get all donations (system admin only)
router.get('/', authorize('system_admin'), donationController.getAllDonations);

// Analytics routes
router.get('/stats', donationController.getDonationStats);
router.get('/monthly', donationController.getMonthlyDonations);
router.get('/category-wise', donationController.getCategoryWiseDonations);

module.exports = router;

