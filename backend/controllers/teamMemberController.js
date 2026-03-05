const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const TeamMember = require('../models/TeamMember');

// Get all team members for an NGO
const getTeamMembers = asyncHandler(async (req, res) => {
  const { ngoId } = req.params;
  const teamMembers = await TeamMember.find({ ngoId }).populate('ngoId', 'name');
  res.json({ success: true, data: teamMembers });
});

// Get single team member
const getTeamMember = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const teamMember = await TeamMember.findById(id).populate('ngoId', 'name');
  if (!teamMember) throw new ApiError(404, 'Team member not found');
  res.json({ success: true, data: teamMember });
});

// Create team member (NGO Admin only)
const createTeamMember = asyncHandler(async (req, res) => {
  const { ngoId, name, role, email, phone, experience, bio } = req.body;
  const teamMember = await TeamMember.create({
    ngoId,
    name,
    role,
    email,
    phone,
    experience,
    bio
  });
  res.status(201).json({ success: true, data: teamMember });
});

// Update team member
const updateTeamMember = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const teamMember = await TeamMember.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  if (!teamMember) throw new ApiError(404, 'Team member not found');
  res.json({ success: true, data: teamMember });
});

// Delete team member
const deleteTeamMember = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const teamMember = await TeamMember.findByIdAndDelete(id);
  if (!teamMember) throw new ApiError(404, 'Team member not found');
  res.json({ success: true, message: 'Team member deleted successfully' });
});

module.exports = {
  getTeamMembers,
  getTeamMember,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember
};
