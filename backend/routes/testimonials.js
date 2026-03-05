const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getTestimonials,
  getTestimonial,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  likeTestimonial
} = require('../controllers/testimonialController');

// Public routes
router.get('/ngo/:ngoId', getTestimonials);
router.get('/:id', getTestimonial);

// Protected routes
router.post('/', protect, createTestimonial);
router.put('/:id', protect, updateTestimonial);
router.delete('/:id', protect, deleteTestimonial);
router.patch('/:id/like', protect, likeTestimonial);

module.exports = router;
