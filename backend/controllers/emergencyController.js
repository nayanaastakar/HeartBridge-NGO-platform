const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const EmergencyIncident = require('../models/EmergencyIncident');
const NGO = require('../models/NGO');

const createIncident = asyncHandler(async (req, res) => {
  const { title, description, category, severity, affectedArea, state, estimatedAffected, radiusKm } = req.body;
  const incident = await EmergencyIncident.create({
    title, description, category, severity: severity || 'high',
    affectedArea, state, estimatedAffected: estimatedAffected || 0,
    radiusKm: radiusKm || 10,
    reportedBy: req.user._id,
    status: 'reported'
  });
  res.status(201).json({ success: true, data: incident });
});

const listIncidents = asyncHandler(async (req, res) => {
  const { status, severity, category, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (severity) filter.severity = severity;
  if (category) filter.category = category;

  const total = await EmergencyIncident.countDocuments(filter);
  const incidents = await EmergencyIncident.find(filter)
    .populate('coordinatingNGO', 'name category')
    .populate('reportedBy', 'name')
    .sort({ severity: 1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ success: true, total, page: Number(page), data: incidents });
});

const getIncident = asyncHandler(async (req, res) => {
  const incident = await EmergencyIncident.findById(req.params.id)
    .populate('coordinatingNGO', 'name category phone email')
    .populate('participatingNGOs', 'name category')
    .populate('reportedBy', 'name email');
  if (!incident) throw new ApiError(404, 'Incident not found');
  res.json({ success: true, data: incident });
});

const updateIncident = asyncHandler(async (req, res) => {
  const allowedFields = ['status', 'severity', 'coordinatingNGO', 'estimatedAffected',
    'actualBeneficiariesHelped', 'containedAt', 'resolvedAt'];
  const updates = {};
  allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  if (req.body.status === 'contained') updates.containedAt = new Date();
  if (req.body.status === 'resolved') updates.resolvedAt = new Date();

  const incident = await EmergencyIncident.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!incident) throw new ApiError(404, 'Incident not found');
  res.json({ success: true, data: incident });
});

const addIncidentUpdate = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const incident = await EmergencyIncident.findByIdAndUpdate(
    req.params.id,
    { $push: { updates: { text, postedBy: req.user._id } } },
    { new: true }
  );
  if (!incident) throw new ApiError(404, 'Incident not found');
  res.json({ success: true, data: incident });
});

const joinIncident = asyncHandler(async (req, res) => {
  const ngoId = req.user.ngoId;
  const incident = await EmergencyIncident.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { participatingNGOs: ngoId } },
    { new: true }
  );
  if (!incident) throw new ApiError(404, 'Incident not found');
  res.json({ success: true, message: 'NGO joined incident response', data: incident });
});

const getEmergencyDashboard = asyncHandler(async (req, res) => {
  const [active, critical, resolved, recent] = await Promise.all([
    EmergencyIncident.countDocuments({ status: 'active' }),
    EmergencyIncident.countDocuments({ status: 'active', severity: 'critical' }),
    EmergencyIncident.countDocuments({ status: 'resolved' }),
    EmergencyIncident.find({ status: { $in: ['reported', 'active'] } })
      .populate('coordinatingNGO', 'name')
      .sort({ severity: 1, createdAt: -1 })
      .limit(5)
  ]);
  res.json({ success: true, data: { active, critical, resolved, recent } });
});

module.exports = { createIncident, listIncidents, getIncident, updateIncident, addIncidentUpdate, joinIncident, getEmergencyDashboard };
