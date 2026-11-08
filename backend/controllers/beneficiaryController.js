const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const Beneficiary = require('../models/Beneficiary');
const AssistanceCase = require('../models/AssistanceCase');

// --- BENEFICIARY CRUD ---
const registerBeneficiary = asyncHandler(async (req, res) => {
  const { fullName, email, phone, dateOfBirth, gender, address, city, state, pincode,
    householdSize, householdIncome, dependents, consentGiven } = req.body;

  if (!consentGiven) throw new ApiError(400, 'Consent is required to register a beneficiary');

  const beneficiary = await Beneficiary.create({
    fullName, email, phone, dateOfBirth, gender, address, city, state, pincode,
    householdSize, householdIncome, dependents, consentGiven,
    consentDate: new Date(),
    registeredBy: req.user.ngoId || null,
    status: 'pending_verification'
  });

  res.status(201).json({ success: true, data: beneficiary });
});

const listBeneficiaries = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20, search } = req.query;
  const filter = {};

  // NGO admins only see their own registrations
  if (req.user.role === 'ngo_admin') {
    filter.registeredBy = req.user.ngoId;
  }
  if (status) filter.status = status;
  if (search) filter.$or = [
    { fullName: { $regex: search, $options: 'i' } },
    { phone: { $regex: search, $options: 'i' } }
  ];

  const total = await Beneficiary.countDocuments(filter);
  const beneficiaries = await Beneficiary.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .select('-nationalId -location -documents'); // Safe projection

  res.json({ success: true, total, page: Number(page), data: beneficiaries });
});

const getBeneficiary = asyncHandler(async (req, res) => {
  const b = await Beneficiary.findById(req.params.id).select('-nationalId');
  if (!b) throw new ApiError(404, 'Beneficiary not found');
  res.json({ success: true, data: b });
});

const updateBeneficiary = asyncHandler(async (req, res) => {
  const allowedFields = ['fullName', 'phone', 'email', 'address', 'city', 'state', 'pincode',
    'householdSize', 'householdIncome', 'dependents', 'status'];
  const updates = {};
  allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  const b = await Beneficiary.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-nationalId');
  if (!b) throw new ApiError(404, 'Beneficiary not found');
  res.json({ success: true, data: b });
});

const verifyBeneficiary = asyncHandler(async (req, res) => {
  const b = await Beneficiary.findByIdAndUpdate(
    req.params.id,
    { isVerified: true, status: 'active', verifiedBy: req.user._id, verifiedAt: new Date() },
    { new: true }
  ).select('-nationalId');
  if (!b) throw new ApiError(404, 'Beneficiary not found');
  res.json({ success: true, data: b, message: 'Beneficiary verified successfully' });
});

// --- ASSISTANCE CASES ---
const createCase = asyncHandler(async (req, res) => {
  const { beneficiaryId, category, priority, title, description, requestedAssistance, amountRequested, targetResolutionDate } = req.body;
  const ngo = req.user.ngoId;

  const beneficiary = await Beneficiary.findById(beneficiaryId);
  if (!beneficiary) throw new ApiError(404, 'Beneficiary not found');

  const assistanceCase = await AssistanceCase.create({
    beneficiary: beneficiaryId,
    ngo,
    category, priority, title, description, requestedAssistance,
    amountRequested: amountRequested || 0,
    targetResolutionDate: targetResolutionDate ? new Date(targetResolutionDate) : undefined
  });

  res.status(201).json({ success: true, data: assistanceCase });
});

const listCases = asyncHandler(async (req, res) => {
  const { status, priority, page = 1, limit = 20, caseworker } = req.query;
  const filter = {};

  if (req.user.role === 'ngo_admin') filter.ngo = req.user.ngoId;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (caseworker) filter.caseworker = caseworker;

  const total = await AssistanceCase.countDocuments(filter);
  const cases = await AssistanceCase.find(filter)
    .populate('beneficiary', 'fullName phone city status')
    .populate('caseworker', 'name email')
    .sort({ priority: 1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ success: true, total, page: Number(page), data: cases });
});

const getCase = asyncHandler(async (req, res) => {
  const c = await AssistanceCase.findById(req.params.id)
    .populate('beneficiary')
    .populate('caseworker', 'name email phone')
    .populate('ngo', 'name');
  if (!c) throw new ApiError(404, 'Case not found');
  res.json({ success: true, data: c });
});

const updateCase = asyncHandler(async (req, res) => {
  const allowedFields = ['status', 'priority', 'caseworker', 'amountApproved', 'amountDisbursed',
    'targetResolutionDate', 'outcomeRating', 'outcomeNotes', 'beneficiaryFeedback'];
  const updates = {};
  allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  // Set date stamps based on status transitions
  if (req.body.status === 'assigned' && req.body.caseworker) updates.assignedAt = new Date();
  if (req.body.status === 'assistance_approved') updates.approvedAt = new Date();
  if (['closed', 'rejected'].includes(req.body.status)) updates.resolvedAt = new Date();

  const c = await AssistanceCase.findByIdAndUpdate(req.params.id, updates, { new: true })
    .populate('beneficiary', 'fullName phone city')
    .populate('caseworker', 'name email');
  if (!c) throw new ApiError(404, 'Case not found');
  res.json({ success: true, data: c });
});

const addCaseNote = asyncHandler(async (req, res) => {
  const { text, isInternal } = req.body;
  const c = await AssistanceCase.findByIdAndUpdate(
    req.params.id,
    { $push: { notes: { author: req.user._id, text, isInternal: !!isInternal } } },
    { new: true }
  );
  if (!c) throw new ApiError(404, 'Case not found');
  res.json({ success: true, data: c });
});

const getCaseworkerDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const [assigned, pending, critical] = await Promise.all([
    AssistanceCase.countDocuments({ caseworker: userId, status: { $nin: ['closed', 'rejected'] } }),
    AssistanceCase.countDocuments({ caseworker: userId, status: 'assigned' }),
    AssistanceCase.countDocuments({ caseworker: userId, priority: 'critical', status: { $nin: ['closed', 'rejected'] } })
  ]);
  const recentCases = await AssistanceCase.find({ caseworker: userId, status: { $nin: ['closed', 'rejected'] } })
    .populate('beneficiary', 'fullName city')
    .sort({ priority: 1, updatedAt: -1 })
    .limit(10);
  res.json({ success: true, data: { assigned, pending, critical, recentCases } });
});

module.exports = {
  registerBeneficiary, listBeneficiaries, getBeneficiary, updateBeneficiary, verifyBeneficiary,
  createCase, listCases, getCase, updateCase, addCaseNote, getCaseworkerDashboard
};
