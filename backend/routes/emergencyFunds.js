const express = require('express');
const router = express.Router();
const emergencyFundController = require('../controllers/emergencyFundController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const upload = require('../middleware/upload');

// Public routes
router.get('/', emergencyFundController.getEmergencyFunds);
router.get('/active', emergencyFundController.getActiveEmergencyFunds);
router.get('/:id/proof-document', emergencyFundController.getProofDocument);
router.get('/:id', emergencyFundController.getEmergencyFundById);

// Protected routes
router.use(protect);
router.use(require('../middleware/attachNGO'));

// NGO Admin + System Admin routes
router.post('/', authorize('ngo_admin', 'system_admin'), emergencyFundController.createEmergencyFund);
router.put('/:id', authorize('ngo_admin', 'system_admin'), emergencyFundController.updateEmergencyFund);
router.delete('/:id', authorize('ngo_admin', 'system_admin'), emergencyFundController.deleteEmergencyFund);

// Proof document routes
router.post('/:id/proof-document', authorize('ngo_admin', 'system_admin'), upload.single('proof-document'), emergencyFundController.uploadProofDocument);
router.delete('/:id/proof-document', authorize('ngo_admin', 'system_admin'), emergencyFundController.removeProofDocument);
// (GET proof-document is public — moved above protect middleware)

module.exports = router;

