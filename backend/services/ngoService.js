const ApiError = require('../utils/ApiError');
const NGO = require('../models/NGO');

async function createNgo({ adminId, payload }) {
  const ngo = await NGO.create({ ...payload, adminId });
  return ngo;
}

async function listNgos({ category, q }) {
  const filter = {};
  if (category) filter.category = category;
  if (q) filter.$or = [
    { name: { $regex: q, $options: 'i' } },
    { description: { $regex: q, $options: 'i' } }
  ];
  return NGO.find(filter).populate('adminId', 'name email').sort({ createdAt: -1 });
}

async function getNgoById(id) {
  const ngo = await NGO.findById(id).populate('adminId', 'name email');
  if (!ngo) throw new ApiError(404, 'NGO not found');
  return ngo;
}

async function getNgoForAdmin(adminId) {
  return NGO.findOne({ adminId }).populate('adminId', 'name email');
}

async function updateNgo({ ngoId, user, payload }) {
  // 1. Permission Check
  const ngo = await NGO.findById(ngoId);
  if (!ngo) throw new ApiError(404, 'NGO not found');

  const adminIdStr = ngo.adminId ? String(ngo.adminId._id || ngo.adminId) : '';
  const userIdStr = user._id ? String(user._id._id || user._id) : '';

  const isOwner = adminIdStr === userIdStr;
  const isSysAdmin = user.role === 'system_admin';

  if (!isOwner && !isSysAdmin) {
    throw new ApiError(403, 'Access denied');
  }

  // 2. Prepare Update Data
  const updateData = {};
  const allowed = [
    'name', 'description', 'category', 'registrationNumber',
    'address', 'phone', 'email', 'website',
    'fundingRequirement', 'logo', 'banner', 'isVerified', 'totalUtilized', 'verificationDocuments'
  ];

  allowed.forEach((k) => {
    if (payload[k] !== undefined) {
      if (k === 'isVerified' && !isSysAdmin) return;
      updateData[k] = payload[k];
    }
  });

  // 3. Apply Update via findOneAndUpdate
  try {
    const updatedNgo = await NGO.findByIdAndUpdate(
      ngoId,
      { $set: updateData },
      { new: true, runValidators: false }
    ).populate('adminId', 'name email');

    return updatedNgo;
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(400, 'Duplicate value error');
    }
    throw new ApiError(400, error.message || 'Failed to update NGO');
  }
}

async function deleteNgo(id) {
  const ngo = await NGO.findByIdAndDelete(id);
  if (!ngo) throw new ApiError(404, 'NGO not found');
  return ngo;
}

module.exports = { createNgo, listNgos, getNgoById, getNgoForAdmin, updateNgo, deleteNgo };


