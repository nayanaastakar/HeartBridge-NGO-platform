const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const {
  registerVolunteer, getMyVolunteerProfile, updateVolunteerProfile, listVolunteers,
  createTask, listTasks, applyForTask, logAttendance, getVolunteerDashboard, matchOpportunities
} = require('../controllers/volunteerController');

// Volunteer profiles
router.post('/register', protect, registerVolunteer);
router.get('/me', protect, getVolunteerDashboard);
router.get('/profile', protect, getMyVolunteerProfile);
router.put('/profile', protect, updateVolunteerProfile);
router.get('/match-opportunities', protect, matchOpportunities);
router.get('/', protect, authorize('ngo_admin', 'system_admin'), listVolunteers);

// Tasks
router.post('/tasks', protect, authorize('ngo_admin'), createTask);
router.get('/tasks', listTasks);
router.post('/tasks/:id/apply', protect, applyForTask);
router.post('/tasks/:id/attendance', protect, logAttendance);

module.exports = router;
