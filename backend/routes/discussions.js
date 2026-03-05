const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAllDiscussions,
  getDiscussion,
  createDiscussion,
  updateDiscussion,
  addReply,
  updateReply,
  deleteReply,
  markHelpful,
  getByCategory,
  deleteDiscussion,
  updateStatus
} = require('../controllers/discussionController');

// Public routes
router.get('/', getAllDiscussions);
router.get('/category/:category', getByCategory);
router.get('/:id', getDiscussion);

// Protected routes
router.post('/', protect, createDiscussion);
router.put('/:id', protect, updateDiscussion);
router.post('/:id/reply', protect, addReply);
router.put('/:id/reply/:replyId', protect, updateReply);
router.delete('/:id/reply/:replyId', protect, deleteReply);
router.put('/:id/mark-helpful', protect, markHelpful);
router.put('/:id/status', protect, updateStatus);
router.delete('/:id', protect, deleteDiscussion);

module.exports = router;
