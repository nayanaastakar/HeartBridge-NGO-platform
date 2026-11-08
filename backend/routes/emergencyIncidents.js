const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { createIncident, listIncidents, getIncident, updateIncident, addIncidentUpdate, joinIncident, getEmergencyDashboard } = require('../controllers/emergencyController');

router.get('/dashboard', protect, authorize('system_admin', 'ngo_admin'), getEmergencyDashboard);
router.post('/', protect, createIncident);
router.get('/', listIncidents);
router.get('/:id', getIncident);
router.put('/:id', protect, authorize('system_admin', 'ngo_admin'), updateIncident);
router.post('/:id/updates', protect, addIncidentUpdate);
router.post('/:id/join', protect, authorize('ngo_admin'), joinIncident);

module.exports = router;
