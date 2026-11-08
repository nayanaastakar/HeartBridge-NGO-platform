const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const {
  registerBeneficiary, listBeneficiaries, getBeneficiary, updateBeneficiary, verifyBeneficiary,
  createCase, listCases, getCase, updateCase, addCaseNote, getCaseworkerDashboard
} = require('../controllers/beneficiaryController');

// Beneficiaries - require auth; ngo_admin and system_admin access
router.post('/', protect, authorize('ngo_admin', 'system_admin'), registerBeneficiary);
router.get('/', protect, authorize('ngo_admin', 'system_admin'), listBeneficiaries);
router.get('/:id', protect, authorize('ngo_admin', 'system_admin'), getBeneficiary);
router.put('/:id', protect, authorize('ngo_admin', 'system_admin'), updateBeneficiary);
router.patch('/:id/verify', protect, authorize('ngo_admin', 'system_admin'), verifyBeneficiary);

// Cases
router.post('/cases', protect, authorize('ngo_admin', 'system_admin'), createCase);
router.get('/cases/all', protect, authorize('ngo_admin', 'system_admin'), listCases);
router.get('/cases/caseworker-dashboard', protect, getCaseworkerDashboard);
router.get('/cases/:id', protect, authorize('ngo_admin', 'system_admin'), getCase);
router.put('/cases/:id', protect, authorize('ngo_admin', 'system_admin'), updateCase);
router.post('/cases/:id/notes', protect, addCaseNote);

module.exports = router;
