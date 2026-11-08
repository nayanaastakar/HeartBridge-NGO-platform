const mongoose = require('mongoose');

const assistanceCaseSchema = new mongoose.Schema({
  beneficiary: { type: mongoose.Schema.Types.ObjectId, ref: 'Beneficiary', required: true },
  ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO', required: true },
  caseworker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Case details
  caseNumber: { type: String, unique: true }, // Auto-generated: HB-2025-00001
  category: {
    type: String,
    enum: ['food_nutrition', 'medical', 'education', 'shelter', 'emergency_relief', 'skill_training', 'elderly_care', 'disability_support', 'other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'assigned', 'assistance_approved', 'in_progress', 'assistance_delivered', 'follow_up', 'closed', 'rejected'],
    default: 'submitted'
  },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  requestedAssistance: { type: String }, // What they specifically need

  // Financial assistance
  amountRequested: { type: Number, default: 0 },
  amountApproved: { type: Number, default: 0 },
  amountDisbursed: { type: Number, default: 0 },

  // Timeline
  submittedAt: { type: Date, default: Date.now },
  assignedAt: { type: Date },
  approvedAt: { type: Date },
  resolvedAt: { type: Date },
  targetResolutionDate: { type: Date },

  // Case notes
  notes: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    isInternal: { type: Boolean, default: false }, // Internal notes hidden from beneficiary
    createdAt: { type: Date, default: Date.now }
  }],

  // Outcome
  outcomeRating: { type: Number, min: 1, max: 5 },
  outcomeNotes: String,
  beneficiaryFeedback: String,

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Auto-generate case number
assistanceCaseSchema.pre('save', async function(next) {
  if (!this.caseNumber) {
    const count = await this.constructor.countDocuments();
    this.caseNumber = `HB-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

assistanceCaseSchema.index({ beneficiary: 1 });
assistanceCaseSchema.index({ ngo: 1, status: 1 });
assistanceCaseSchema.index({ caseworker: 1, status: 1 });
assistanceCaseSchema.index({ priority: 1, status: 1 });

module.exports = mongoose.models.AssistanceCase || mongoose.model('AssistanceCase', assistanceCaseSchema);
