const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { addItem, listItems, updateStock, getItemTransactions, getLowStockAlerts, getInventorySummary } = require('../controllers/inventoryController');

router.get('/summary', protect, authorize('ngo_admin'), getInventorySummary);
router.get('/alerts', protect, authorize('ngo_admin'), getLowStockAlerts);
router.post('/', protect, authorize('ngo_admin'), addItem);
router.get('/', protect, authorize('ngo_admin', 'system_admin'), listItems);
router.post('/:id/stock', protect, authorize('ngo_admin'), updateStock);
router.get('/:id/transactions', protect, authorize('ngo_admin'), getItemTransactions);

module.exports = router;
