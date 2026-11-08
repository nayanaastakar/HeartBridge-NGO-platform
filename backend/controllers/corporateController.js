const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const { Corporate, Grant, GrantApplication } = require('../models/Corporate');
const NGO = require('../models/NGO');

// --- CORPORATE ---
const registerCorporate = asyncHandler(async (req, res) => {
  const existing = await Corporate.findOne({ adminUser: req.user._id });
  if (existing) throw new ApiError(409, 'You already have a corporate profile');

  const { name, registrationNumber, industry, website, email, phone, address,
    description, annualCsrBudget, csrFocusAreas } = req.body;

  const corporate = await Corporate.create({
    name, registrationNumber, industry, website, email, phone, address,
    description, annualCsrBudget: annualCsrBudget || 0,
    csrFocusAreas: csrFocusAreas || [],
    adminUser: req.user._id,
    status: 'pending'
  });

  res.status(201).json({ success: true, data: corporate });
});

const getMyCorporate = asyncHandler(async (req, res) => {
  const corporate = await Corporate.findOne({ adminUser: req.user._id });
  if (!corporate) throw new ApiError(404, 'Corporate profile not found');
  res.json({ success: true, data: corporate });
});

const updateCorporate = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'industry', 'website', 'phone', 'address',
    'description', 'annualCsrBudget', 'csrFocusAreas'];
  const updates = {};
  allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  const corporate = await Corporate.findOneAndUpdate({ adminUser: req.user._id }, updates, { new: true });
  if (!corporate) throw new ApiError(404, 'Corporate profile not found');
  res.json({ success: true, data: corporate });
});

const listCorporates = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const total = await Corporate.countDocuments(filter);
  const corporates = await Corporate.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ success: true, total, page: Number(page), data: corporates });
});

const verifyCorporate = asyncHandler(async (req, res) => {
  const { action } = req.body; // 'approve' or 'reject'
  const update = {
    status: action === 'approve' ? 'verified' : 'rejected',
    isVerified: action === 'approve',
    verifiedBy: req.user._id,
    verifiedAt: new Date()
  };
  const corporate = await Corporate.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!corporate) throw new ApiError(404, 'Corporate not found');
  res.json({ success: true, data: corporate });
});

// --- GRANTS ---
const createGrant = asyncHandler(async (req, res) => {
  const corporate = await Corporate.findOne({ adminUser: req.user._id, isVerified: true });
  if (!corporate) throw new ApiError(403, 'Only verified corporates can create grants');

  const { title, description, amount, category, deadline, eligibilityCriteria, requiredDocuments, maxApplicants } = req.body;
  const grant = await Grant.create({
    corporate: corporate._id,
    title, description, amount, category,
    deadline: new Date(deadline),
    eligibilityCriteria, requiredDocuments, maxApplicants
  });

  // Update CSR allocated amount
  await Corporate.findByIdAndUpdate(corporate._id, { $inc: { currentYearAllocated: amount } });

  res.status(201).json({ success: true, data: grant });
});

const listGrants = asyncHandler(async (req, res) => {
  const { status = 'open', category, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;

  const total = await Grant.countDocuments(filter);
  const grants = await Grant.find(filter)
    .populate('corporate', 'name industry logo')
    .sort({ deadline: 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ success: true, total, page: Number(page), data: grants });
});

const getGrant = asyncHandler(async (req, res) => {
  const grant = await Grant.findById(req.params.id).populate('corporate', 'name industry description');
  if (!grant) throw new ApiError(404, 'Grant not found');
  res.json({ success: true, data: grant });
});

// --- GRANT APPLICATIONS ---
const applyForGrant = asyncHandler(async (req, res) => {
  const { grantId, projectTitle, projectDescription, expectedImpact, budgetBreakdown, implementationTimeline, milestones } = req.body;

  const grant = await Grant.findById(grantId);
  if (!grant) throw new ApiError(404, 'Grant not found');
  if (grant.status !== 'open') throw new ApiError(400, 'This grant is no longer accepting applications');

  const ngoId = req.user.ngoId;
  const existing = await GrantApplication.findOne({ grant: grantId, ngo: ngoId });
  if (existing) throw new ApiError(409, 'You have already applied for this grant');

  const application = await GrantApplication.create({
    grant: grantId, ngo: ngoId, applicantUser: req.user._id,
    projectTitle, projectDescription, expectedImpact, budgetBreakdown,
    implementationTimeline, milestones: milestones || []
  });

  await Grant.findByIdAndUpdate(grantId, { $inc: { applicationCount: 1 } });

  res.status(201).json({ success: true, data: application });
});

const listMyApplications = asyncHandler(async (req, res) => {
  const applications = await GrantApplication.find({ ngo: req.user.ngoId })
    .populate('grant', 'title amount deadline category')
    .sort({ submittedAt: -1 });
  res.json({ success: true, data: applications });
});

const listGrantApplications = asyncHandler(async (req, res) => {
  // For corporate admin viewing applications to their grants
  const corporate = await Corporate.findOne({ adminUser: req.user._id });
  if (!corporate) throw new ApiError(403, 'Corporate profile required');

  const grants = await Grant.find({ corporate: corporate._id }).select('_id');
  const grantIds = grants.map(g => g._id);

  const applications = await GrantApplication.find({ grant: { $in: grantIds } })
    .populate('ngo', 'name category')
    .populate('grant', 'title amount')
    .sort({ submittedAt: -1 });

  res.json({ success: true, data: applications });
});

const reviewApplication = asyncHandler(async (req, res) => {
  const { action, reviewNotes, amountApproved } = req.body; // action: 'approve' | 'reject' | 'shortlist'
  const statusMap = { approve: 'approved', reject: 'rejected', shortlist: 'shortlisted' };

  const application = await GrantApplication.findByIdAndUpdate(
    req.params.id,
    {
      status: statusMap[action],
      reviewNotes,
      amountApproved: action === 'approve' ? (amountApproved || null) : undefined,
      reviewedAt: new Date()
    },
    { new: true }
  ).populate('ngo', 'name').populate('grant', 'title');

  if (!application) throw new ApiError(404, 'Application not found');
  res.json({ success: true, data: application });
});

const getCsrDashboard = asyncHandler(async (req, res) => {
  const corporate = await Corporate.findOne({ adminUser: req.user._id });
  if (!corporate) throw new ApiError(404, 'Corporate profile not found');

  const grants = await Grant.find({ corporate: corporate._id });
  const grantIds = grants.map(g => g._id);
  const applications = await GrantApplication.find({ grant: { $in: grantIds } });

  const totalBudget = corporate.annualCsrBudget;
  const allocated = corporate.currentYearAllocated;
  const disbursed = corporate.currentYearDisbursed;

  const statusBreakdown = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  res.json({
    success: true,
    data: {
      corporate,
      budget: { total: totalBudget, allocated, disbursed, remaining: totalBudget - allocated },
      grants: { total: grants.length, open: grants.filter(g => g.status === 'open').length },
      applications: { total: applications.length, ...statusBreakdown }
    }
  });
});

module.exports = {
  registerCorporate, getMyCorporate, updateCorporate, listCorporates, verifyCorporate,
  createGrant, listGrants, getGrant, applyForGrant, listMyApplications,
  listGrantApplications, reviewApplication, getCsrDashboard
};
