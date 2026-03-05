const express = require('express');
const router = express.Router();
const systemMaintenanceController = require('../controllers/systemMaintenanceController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// All system maintenance routes require authentication and system admin role
router.use(protect);
router.use(authorize('system_admin', 'ngo_admin'));

// System maintenance endpoints
router.post('/clear-cache', systemMaintenanceController.clearCache);
router.get('/check-database', systemMaintenanceController.checkDatabase);
router.get('/view-logs', systemMaintenanceController.viewLogs);
router.post('/backup-data', systemMaintenanceController.backupData);
router.post('/reset-stats', systemMaintenanceController.resetStats);
router.get('/health', systemMaintenanceController.getSystemHealth);

module.exports = router;
