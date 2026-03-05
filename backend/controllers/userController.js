const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');

const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 }).limit(500);
  res.json({ success: true, count: users.length, users });
});

const updateRole = asyncHandler(async (req, res) => {
  const { userId, role } = req.body;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  user.role = role;
  await user.save();
  res.json({ success: true, message: 'User role updated', user });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  await user.deleteOne();
  res.json({ success: true, message: 'User removed' });
});

module.exports = { listUsers, updateRole, deleteUser };
