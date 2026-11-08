const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const {
  registerCorporate, getMyCorporate, updateCorporate, listCorporates, verifyCorporate,
  createGrant, listGrants, getGrant, applyForGrant, listMyApplications,
  listGrantApplications, reviewApplication, getCsrDashboard
} = require('../controllers/corporateController');

// Corporate management
router.post('/register', protect, registerCorporate);
router.get('/me', protect, getMyCorporate);
router.put('/me', protect, updateCorporate);
router.get('/csr-dashboard', protect, getCsrDashboard);
router.get('/', protect, authorize('system_admin'), listCorporates);
router.patch('/:id/verify', protect, authorize('system_admin'), verifyCorporate);

// Grants
router.post('/grants', protect, createGrant);
router.get('/grants', listGrants);
router.get('/grants/:id', getGrant);

// Applications
router.post('/grants/apply', protect, authorize('ngo_admin'), applyForGrant);
router.get('/applications/mine', protect, authorize('ngo_admin'), listMyApplications);
router.get('/applications/received', protect, listGrantApplications);
router.patch('/applications/:id/review', protect, reviewApplication);

module.exports = router;
