const mongoose = require('mongoose');

const emergencyIncidentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['flood', 'earthquake', 'fire', 'drought', 'epidemic', 'industrial_accident', 'communal', 'cyclone', 'other'],
    required: true
  },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'high'
  },
  status: {
    type: String,
    enum: ['reported', 'active', 'contained', 'resolved', 'closed'],
    default: 'reported'
  },

  // Location
  affectedArea: { type: String, required: true },
  state: { type: String },
  coordinates: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  radiusKm: { type: Number, default: 10 },

  // Coordination
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coordinatingNGO: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO' },
  participatingNGOs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'NGO' }],
  assignedVolunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer' }],

  // People affected
  estimatedAffected: { type: Number, default: 0 },
  actualBeneficiariesHelped: { type: Number, default: 0 },

  // Resources
  resourcesNeeded: [{
    category: String,
    item: String,
    quantity: Number,
    unit: String,
    priority: { type: String, enum: ['critical', 'high', 'medium'], default: 'high' }
  }],
  resourcesAllocated: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
    quantity: Number,
    fromNGO: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO' },
    allocatedAt: Date,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],

  // Timeline
  incidentDate: { type: Date, default: Date.now },
  containedAt: { type: Date },
  resolvedAt: { type: Date },

  // Updates
  updates: [{
    text: String,
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    postedAt: { type: Date, default: Date.now }
  }],

  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

emergencyIncidentSchema.index({ coordinates: '2dsphere' });
emergencyIncidentSchema.index({ status: 1, severity: 1 });
emergencyIncidentSchema.index({ incidentDate: -1 });

module.exports = mongoose.models.EmergencyIncident || mongoose.model('EmergencyIncident', emergencyIncidentSchema);
