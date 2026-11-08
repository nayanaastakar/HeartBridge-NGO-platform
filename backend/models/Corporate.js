const mongoose = require('mongoose');

const corporateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  registrationNumber: { type: String, trim: true },
  industry: { type: String, trim: true },
  website: { type: String, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true, unique: true },
  phone: { type: String, trim: true },
  address: { type: String, trim: true },
  adminUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  logo: { type: String, default: '' },
  description: { type: String },

  // Verification
  status: {
    type: String,
    enum: ['pending', 'verified', 'suspended', 'rejected'],
    default: 'pending'
  },
  isVerified: { type: Boolean, default: false },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: { type: Date },

  // CSR Budget
  annualCsrBudget: { type: Number, default: 0 },
  currentYearAllocated: { type: Number, default: 0 },
  currentYearDisbursed: { type: Number, default: 0 },

  // Focus areas
  csrFocusAreas: [{ type: String }], // education, health, environment, etc.

  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const grantSchema = new mongoose.Schema({
  corporate: { type: mongoose.Schema.Types.ObjectId, ref: 'Corporate', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, enum: ['education', 'health', 'environment', 'livelihood', 'disaster_relief', 'women_empowerment', 'other'], required: true },
  deadline: { type: Date, required: true },
  status: {
    type: String,
    enum: ['open', 'closed', 'evaluation', 'awarded', 'cancelled'],
    default: 'open'
  },
  eligibilityCriteria: { type: String },
  requiredDocuments: [{ type: String }],
  maxApplicants: { type: Number },
  applicationCount: { type: Number, default: 0 },
  awardedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const grantApplicationSchema = new mongoose.Schema({
  grant: { type: mongoose.Schema.Types.ObjectId, ref: 'Grant', required: true },
  ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO', required: true },
  applicantUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  projectTitle: { type: String, required: true },
  projectDescription: { type: String, required: true },
  expectedImpact: { type: String },
  budgetBreakdown: { type: String },
  implementationTimeline: { type: String },
  milestones: [{
    title: String,
    targetDate: Date,
    status: { type: String, enum: ['pending', 'completed', 'missed'], default: 'pending' }
  }],

  status: {
    type: String,
    enum: ['submitted', 'under_review', 'shortlisted', 'approved', 'rejected', 'funds_disbursed'],
    default: 'submitted'
  },
  reviewNotes: { type: String },
  amountApproved: { type: Number },
  amountDisbursed: { type: Number, default: 0 },

  documents: [{
    docType: String,
    filePath: String,
    uploadedAt: { type: Date, default: Date.now }
  }],

  submittedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date }
}, { timestamps: true });

grantSchema.index({ corporate: 1, status: 1 });
grantSchema.index({ deadline: 1 });
grantApplicationSchema.index({ grant: 1, status: 1 });
grantApplicationSchema.index({ ngo: 1 });

const Corporate = mongoose.models.Corporate || mongoose.model('Corporate', corporateSchema);
const Grant = mongoose.models.Grant || mongoose.model('Grant', grantSchema);
const GrantApplication = mongoose.models.GrantApplication || mongoose.model('GrantApplication', grantApplicationSchema);

module.exports = { Corporate, Grant, GrantApplication };
