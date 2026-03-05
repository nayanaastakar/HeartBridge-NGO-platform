const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getTeamMembers,
  getTeamMember,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember
} = require('../controllers/teamMemberController');

// Public routes
router.get('/ngo/:ngoId', getTeamMembers);
router.get('/:id', getTeamMember);

// Protected routes (NGO Admin only)
router.post('/', protect, createTeamMember);
router.put('/:id', protect, updateTeamMember);
router.delete('/:id', protect, deleteTeamMember);

module.exports = router;
