const ApiError = require('../utils/ApiError');
const { signToken } = require('../utils/jwt');
const User = require('../models/User');
const NGO = require('../models/NGO');
const sendEmail = require('../utils/sendEmail');

async function register({ name, email, password, role, ngoName, registrationNumber, phone, address }) {
  const allowedRoles = ['donor', 'ngo_admin', 'system_admin'];
  const finalRole = role && allowedRoles.includes(role) ? role : 'donor';
  const cleanEmail = email.trim().toLowerCase();
  let user = await User.findOne({ email: cleanEmail });

  if (user && user.isEmailVerified) {
    throw new ApiError(409, 'Email already registered and verified');
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  if (user) {
    // Update existing unverified user
    user.name = name;
    user.password = password; // Will be hashed by pre-save hook
    user.role = finalRole;
    user.phone = phone;
    user.address = address;
    user.emailOTP = otp;
    user.emailOTPExpires = otpExpires;
    await user.save();
  } else {
    // Create new user
    user = await User.create({
      name,
      email: cleanEmail,
      password,
      role: finalRole,
      phone,
      address,
      isEmailVerified: false,
      emailOTP: otp,
      emailOTPExpires: otpExpires
    });
  }

  // LOG THE OTP (For terminal testing)
  console.log('-----------------------------------------');
  console.log(`NEW USER REGISTERED: ${cleanEmail}`);
  console.log(`VERIFICATION OTP: ${otp}`);
  console.log('-----------------------------------------');

  // SEND REAL EMAIL (Optional: wrapper in try-catch so registration doesn't fail if mail fails)
  try {
    await sendEmail({
      email: cleanEmail,
      subject: 'Verify Your HeartBridge Account - OTP',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #3b82f6;">Welcome to HeartBridge!</h2>
          <p>Thank you for joining our community. To complete your registration, please use the following One-Time Password (OTP):</p>
          <div style="background: #f0f7ff; padding: 20px; text-align: center; border-radius: 12px; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e40af;">${otp}</span>
          </div>
          <p>This code is valid for 10 minutes. If you didn't create an account, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">HeartBridge Platform - Connecting Hearts Through Kindness</p>
        </div>
      `
    });
    console.log(`[AUTH] Real email sent to: ${cleanEmail}`);
  } catch (error) {
    console.error(`[AUTH] Error sending email:`, error);
  }

  // If registering as NGO, create the profile
  if (finalRole === 'ngo_admin') {
    await NGO.create({
      name: ngoName || `${name}'s NGO`,
      registrationNumber: registrationNumber || `REG-${Date.now()}`,
      adminId: user._id,
      email: email.toLowerCase(),
      phone: phone || 'Not provided',
      address: address || 'Not provided',
      description: 'Profile under registration. Please update details.',
      category: 'Social Welfare', // Default category
      isVerified: false
    });
  }

  const token = signToken(user._id);
  return { token, user: await sanitizeUser(user) };
}

async function registerAdmin({ name, email, password, adminKey }) {
  const expectedKey = process.env.ADMIN_REGISTRATION_KEY || '123456';

  console.log('[ADMIN-REG] Received adminKey:', adminKey);
  console.log('[ADMIN-REG] Expected key:', expectedKey);
  console.log('[ADMIN-REG] Received length:', adminKey?.length);
  console.log('[ADMIN-REG] Expected length:', expectedKey?.length);
  console.log('[ADMIN-REG] Exact match:', adminKey === expectedKey);
  console.log('[ADMIN-REG] Trimmed match:', adminKey?.trim() === expectedKey?.trim());

  if (!expectedKey) {
    throw new ApiError(500, 'Admin registration not configured');
  }

  // Try exact match and trimmed match
  if (adminKey !== expectedKey && adminKey.trim() !== expectedKey.trim()) {
    console.log('[ADMIN-REG] ❌ Key validation failed');
    throw new ApiError(403, 'Invalid admin registration key');
  }

  console.log('[ADMIN-REG] ✅ Key validation passed');

  const cleanEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: cleanEmail });
  if (existing) {
    throw new ApiError(409, 'Email already registered');
  }

  const user = await User.create({
    name,
    email: cleanEmail,
    password,
    role: 'system_admin',
    isEmailVerified: true
  });
  const token = signToken(user._id);
  return { token, user: await sanitizeUser(user) };
}

async function login({ email, password }) {
  const lowercaseEmail = email.trim().toLowerCase();
  console.log(`[AUTH] Login attempt for: "${lowercaseEmail}"`);
  const user = await User.findOne({ email: lowercaseEmail }).select('+password');

  if (!user) {
    console.log(`[AUTH] User not found for: ${lowercaseEmail}`);
    throw new ApiError(401, 'Invalid credentials');
  }

  console.log(`[AUTH] Comparing passwords for ${lowercaseEmail}.`);
  console.log(`[AUTH] Input length: ${password?.length}, Hash length: ${user.password?.length}`);

  // Direct comparison for better debugging
  const bcrypt = require('bcryptjs');
  const ok = await bcrypt.compare(password, user.password);
  console.log(`[AUTH] Password check for ${lowercaseEmail}: ${ok}`);

  if (!ok) {
    // Log first and last char of password (safely)
    console.log(`[AUTH] DEBUG: Input starts with "${password?.[0]}" and ends with "${password?.[password?.length - 1]}"`);
    throw new ApiError(401, 'Invalid credentials');
  }

  // CHECK IF EMAIL IS VERIFIED
  if (!user.isEmailVerified) {
    throw new ApiError(403, 'Please verify your email address to log in');
  }

  const token = signToken(user._id);
  user.password = undefined;
  return { token, user: await sanitizeUser(user) };
}

async function updateProfile(userId, payload) {
  const allowed = ['name', 'phone', 'address', 'profilePicture', 'bio'];
  const updateData = {};

  allowed.forEach(k => {
    if (payload[k] !== undefined) updateData[k] = payload[k];
  });

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!user) throw new ApiError(404, 'User not found');
  return await sanitizeUser(user);
}

async function sanitizeUser(user) {
  const sanitized = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || '',
    address: user.address || '',
    profilePicture: user.profilePicture || '',
    bio: user.bio || '',
    isAnonymous: user.isAnonymous || false,
    createdAt: user.createdAt,
  };

  if (user.role === 'ngo_admin') {
    const ngo = await NGO.findOne({ adminId: user._id });
    if (ngo) {
      sanitized.ngoId = ngo._id;
    }
  }

  return sanitized;
}

async function verifyOTP(email, otp) {
  const lowercaseEmail = email.trim().toLowerCase();
  const user = await User.findOne({
    email: lowercaseEmail,
    emailOTP: otp,
    emailOTPExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired OTP');
  }

  user.isEmailVerified = true;
  user.emailOTP = undefined;
  user.emailOTPExpires = undefined;
  await user.save();

  return await sanitizeUser(user);
}

module.exports = { register, registerAdmin, login, updateProfile, sanitizeUser, verifyOTP };


