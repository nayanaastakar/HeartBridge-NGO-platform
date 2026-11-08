const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const Volunteer = require('../models/Volunteer');
const VolunteerTask = require('../models/VolunteerTask');
const User = require('../models/User');

// --- VOLUNTEER PROFILE ---
const registerVolunteer = asyncHandler(async (req, res) => {
  const existing = await Volunteer.findOne({ userId: req.user._id });
  if (existing) throw new ApiError(409, 'You already have a volunteer profile');

  const { skills, languages, bio, city, state, availableDays, availableTimeSlots,
    maxHoursPerWeek, emergencyVolunteer } = req.body;

  const volunteer = await Volunteer.create({
    userId: req.user._id,
    skills, languages, bio, city, state,
    availableDays, availableTimeSlots,
    maxHoursPerWeek: maxHoursPerWeek || 10,
    emergencyVolunteer: !!emergencyVolunteer
  });

  res.status(201).json({ success: true, data: volunteer });
});

const getMyVolunteerProfile = asyncHandler(async (req, res) => {
  const volunteer = await Volunteer.findOne({ userId: req.user._id }).populate('userId', 'name email');
  if (!volunteer) throw new ApiError(404, 'Volunteer profile not found');
  res.json({ success: true, data: volunteer });
});

const updateVolunteerProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['skills', 'languages', 'bio', 'city', 'state',
    'availableDays', 'availableTimeSlots', 'maxHoursPerWeek', 'emergencyVolunteer'];
  const updates = {};
  allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  const volunteer = await Volunteer.findOneAndUpdate({ userId: req.user._id }, updates, { new: true });
  if (!volunteer) throw new ApiError(404, 'Volunteer profile not found');
  res.json({ success: true, data: volunteer });
});

const listVolunteers = asyncHandler(async (req, res) => {
  const { skills, city, status = 'active', page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (city) filter.city = { $regex: city, $options: 'i' };
  if (skills) filter.skills = { $in: skills.split(',') };

  const total = await Volunteer.countDocuments(filter);
  const volunteers = await Volunteer.find(filter)
    .populate('userId', 'name email profilePicture')
    .sort({ rating: -1, totalHours: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ success: true, total, page: Number(page), data: volunteers });
});

// --- VOLUNTEER TASKS ---
const createTask = asyncHandler(async (req, res) => {
  const { title, description, requiredSkills, location, date, durationHours,
    volunteersNeeded, isEmergency } = req.body;

  const task = await VolunteerTask.create({
    ngo: req.user.ngoId,
    title, description, requiredSkills,
    location, date: new Date(date),
    durationHours: durationHours || 4,
    volunteersNeeded: volunteersNeeded || 1,
    isEmergency: !!isEmergency
  });

  res.status(201).json({ success: true, data: task });
});

const listTasks = asyncHandler(async (req, res) => {
  const { ngo, status, skills, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (ngo) filter.ngo = ngo;
  if (status) filter.status = status;
  if (skills) filter.requiredSkills = { $in: skills.split(',') };

  const total = await VolunteerTask.countDocuments(filter);
  const tasks = await VolunteerTask.find(filter)
    .populate('ngo', 'name category')
    .sort({ date: 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ success: true, total, page: Number(page), data: tasks });
});

const applyForTask = asyncHandler(async (req, res) => {
  const task = await VolunteerTask.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');
  if (task.status === 'full') throw new ApiError(400, 'Task is already full');

  const volunteer = await Volunteer.findOne({ userId: req.user._id });
  if (!volunteer) throw new ApiError(400, 'You need a volunteer profile to apply');

  const alreadyApplied = task.assignedVolunteers.some(
    v => v.volunteer.toString() === volunteer._id.toString()
  );
  if (alreadyApplied) throw new ApiError(409, 'Already applied to this task');

  task.assignedVolunteers.push({ volunteer: volunteer._id, status: 'assigned' });
  if (task.assignedVolunteers.length >= task.volunteersNeeded) task.status = 'full';
  await task.save();

  res.json({ success: true, message: 'Successfully applied for task', data: task });
});

const logAttendance = asyncHandler(async (req, res) => {
  const { hoursLogged } = req.body;
  const volunteer = await Volunteer.findOne({ userId: req.user._id });
  if (!volunteer) throw new ApiError(404, 'Volunteer profile not found');

  const task = await VolunteerTask.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');

  const assignment = task.assignedVolunteers.find(
    v => v.volunteer.toString() === volunteer._id.toString()
  );
  if (!assignment) throw new ApiError(403, 'You are not assigned to this task');

  assignment.status = 'attended';
  assignment.hoursLogged = hoursLogged || task.durationHours;
  assignment.checkInTime = new Date();
  await task.save();

  // Update volunteer stats
  await Volunteer.findByIdAndUpdate(volunteer._id, {
    $inc: { totalHours: assignment.hoursLogged, tasksCompleted: 1 }
  });

  res.json({ success: true, message: 'Attendance logged', hoursLogged: assignment.hoursLogged });
});

const getVolunteerDashboard = asyncHandler(async (req, res) => {
  const volunteer = await Volunteer.findOne({ userId: req.user._id });
  if (!volunteer) return res.json({ success: true, data: null, message: 'No volunteer profile found' });

  const [upcomingTasks, completedTasks] = await Promise.all([
    VolunteerTask.find({
      'assignedVolunteers.volunteer': volunteer._id,
      date: { $gte: new Date() },
      status: { $in: ['open', 'full', 'in_progress'] }
    }).populate('ngo', 'name').sort({ date: 1 }).limit(5),
    VolunteerTask.find({
      'assignedVolunteers.volunteer': volunteer._id,
      status: 'completed'
    }).sort({ date: -1 }).limit(5)
  ]);

  res.json({
    success: true,
    data: {
      profile: volunteer,
      stats: {
        totalHours: volunteer.totalHours,
        tasksCompleted: volunteer.tasksCompleted,
        rating: volunteer.rating
      },
      upcomingTasks,
      completedTasks
    }
  });
});

// Skill-based matching engine
const matchOpportunities = asyncHandler(async (req, res) => {
  const volunteer = await Volunteer.findOne({ userId: req.user._id });
  if (!volunteer) throw new ApiError(400, 'Volunteer profile required for matching');

  const tasks = await VolunteerTask.find({
    status: 'open',
    date: { $gte: new Date() },
    requiredSkills: { $in: volunteer.skills.length ? volunteer.skills : [/.*/] }
  })
    .populate('ngo', 'name category')
    .sort({ isEmergency: -1, date: 1 })
    .limit(10);

  res.json({ success: true, data: tasks, matchedOn: volunteer.skills });
});

module.exports = {
  registerVolunteer, getMyVolunteerProfile, updateVolunteerProfile, listVolunteers,
  createTask, listTasks, applyForTask, logAttendance, getVolunteerDashboard, matchOpportunities
};
