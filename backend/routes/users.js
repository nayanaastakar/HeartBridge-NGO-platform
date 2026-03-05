const express = require('express');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const userController = require('../controllers/userController');

const router = express.Router();

// All routes here are restricted to System Admin
router.use(protect, authorize('system_admin'));

router.get('/', userController.listUsers);
router.put('/role', userController.updateRole);
router.delete('/:id', userController.deleteUser);

module.exports = router;
