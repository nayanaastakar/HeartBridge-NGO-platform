const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../middleware/asyncHandler');
const ngoService = require('../services/ngoService');
const utilizationService = require('../services/utilizationService');

const list = asyncHandler(async (req, res) => {
  const { category, q } = req.query;
  const ngos = await ngoService.listNgos({ category, q });
  res.json({ success: true, count: ngos.length, ngos });
});

const get = asyncHandler(async (req, res) => {
  const ngo = await ngoService.getNgoById(req.params.id);
  res.json({ success: true, ngo });
});

const mine = asyncHandler(async (req, res) => {
  const ngo = await ngoService.getNgoForAdmin(req.user._id);
  res.json({ success: true, ngo });
});

const create = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const payload = req.body;
  const ngo = await ngoService.createNgo({ adminId: req.user._id, payload });
  res.status(201).json({ success: true, ngo });
});

const update = asyncHandler(async (req, res) => {
  const ngo = await ngoService.updateNgo({
    ngoId: req.params.id,
    user: req.user,
    payload: req.body,
  });
  res.json({ success: true, ngo });
});

const addUtilization = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  // ownership check is enforced via updateNgo access rules: verify here too for utilization
  const ngo = await ngoService.getNgoById(req.params.id);
  // Robust check: compare ID strings whether populated or not
  const adminId = ngo.adminId._id ? ngo.adminId._id : ngo.adminId;
  const isOwner = String(adminId) === String(req.user._id);

  if (!isOwner && req.user.role !== 'system_admin') throw new ApiError(403, 'Access denied');

  const { amount, purpose } = req.body;
  const utilization = await utilizationService.addUtilization({
    ngoId: ngo._id,
    userId: req.user._id,
    amount,
    purpose,
  });
  res.status(201).json({ success: true, utilization });
});

const listUtilizations = asyncHandler(async (req, res) => {
  const ngo = await ngoService.getNgoById(req.params.id);
  const adminId = ngo.adminId._id ? ngo.adminId._id : ngo.adminId;
  const isOwner = String(adminId) === String(req.user._id);

  if (!isOwner && req.user.role !== 'system_admin') throw new ApiError(403, 'Access denied');

  const utilizations = await utilizationService.listUtilizations({ ngoId: ngo._id });
  res.json({ success: true, count: utilizations.length, utilizations });
});

const uploadLogo = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Please upload a logo');
  }

  const ngo = await ngoService.updateNgo({
    ngoId: req.params.id,
    user: req.user,
    payload: { logo: `/uploads/ngo-photos/${req.file.filename}` }
  });

  res.json({ success: true, ngo });
});

const uploadVerificationDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Please upload a file');
  }

  const { title } = req.body;
  if (!title) {
    throw new ApiError(400, 'Please provide a document title');
  }

  const ngo = await ngoService.getNgoById(req.params.id);
  const adminId = ngo.adminId._id ? ngo.adminId._id : ngo.adminId;
  if (String(adminId) !== String(req.user._id) && req.user.role !== 'system_admin') {
    throw new ApiError(403, 'Access denied');
  }

  const doc = {
    title,
    url: `/uploads/proof-documents/${req.file.filename}`,
    uploadedAt: new Date()
  };

  const updatedNgo = await ngoService.updateNgo({
    ngoId: req.params.id,
    user: req.user,
    payload: {
      verificationDocuments: [...(ngo.verificationDocuments || []), doc]
    }
  });

  res.json({ success: true, ngo: updatedNgo });
});

const remove = asyncHandler(async (req, res) => {
  await ngoService.deleteNgo(req.params.id);
  res.json({ success: true, message: 'NGO deleted successfully' });
});

const uploadBanner = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Please upload a banner image');
  }

  const ngo = await ngoService.updateNgo({
    ngoId: req.params.id,
    user: req.user,
    payload: { banner: `/uploads/ngo-photos/${req.file.filename}` }
  });

  res.json({ success: true, ngo });
});

module.exports = {
  list,
  get,
  mine,
  create,
  update,
  remove,
  addUtilization,
  listUtilizations,
  uploadLogo,
  uploadBanner,
  uploadVerificationDocument,
};


