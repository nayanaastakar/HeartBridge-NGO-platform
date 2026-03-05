const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../middleware/asyncHandler');
const authService = require('../services/authService');

const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { name, email, password, role, ngoName, registrationNumber, phone, address } = req.body;
  const result = await authService.register({ name, email, password, role, ngoName, registrationNumber, phone, address });
  res.status(201).json({ success: true, ...result });
});

const registerAdmin = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { name, email, password, adminKey } = req.body;

  // Normal admin registration with key validation
  const result = await authService.registerAdmin({ name, email, password, adminKey });
  res.status(201).json({ success: true, ...result });
});

const login = asyncHandler(async (req, res) => {
  console.log(`[AUTH-CTRL] Login request body:`, { ...req.body, password: '***' });
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(`[AUTH-CTRL] Validation failed:`, errors.array());
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  res.json({ success: true, ...result });
});

const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: await authService.sanitizeUser(req.user) });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user._id, req.body);
  res.json({ success: true, user });
});

const uploadProfilePicture = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Please upload a profile picture');
  }

  const user = await authService.updateProfile(req.user._id, {
    profilePicture: `/uploads/profile-pictures/${req.file.filename}`
  });

  res.json({ success: true, user });
});

const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await authService.verifyOTP(email, otp);
  res.json({ success: true, message: 'OTP verified successfully', user });
});

module.exports = { register, registerAdmin, login, me, updateProfile, uploadProfilePicture, verifyOTP };
