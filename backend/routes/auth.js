const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

router.post(
  '/register-admin',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
    body('adminKey').notEmpty().withMessage('Admin registration key is required'),
  ],
  authController.registerAdmin
);

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
    body('role').optional().isIn(['donor', 'ngo_admin']).withMessage('Invalid role'),
  ],
  authController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  authController.login
);

const upload = require('../middleware/upload');

router.get('/me', protect, authController.me);
router.put('/profile', protect, authController.updateProfile);
router.post('/upload-profile-picture', protect, upload.single('profilePicture'), authController.uploadProfilePicture);
router.post('/verify-otp', authController.verifyOTP);

module.exports = router;


