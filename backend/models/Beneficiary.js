const mongoose = require('mongoose');

const beneficiarySchema = new mongoose.Schema({
  // Identity
  fullName: { type: String, required: true, trim: true },
  email: { type: String, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
  nationalId: { type: String, trim: true }, // masked in API responses

  // Address & Location
  address: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  pincode: { type: String, trim: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [lng, lat] — aggregated only, never exposed publicly
  },

  // Household
  householdSize: { type: Number, default: 1 },
  householdIncome: { type: String, enum: ['below_5000', '5000_15000', '15000_30000', 'above_30000'] },
  dependents: { type: Number, default: 0 },

  // Status
  status: {
    type: String,
    enum: ['pending_verification', 'active', 'suspended', 'closed'],
    default: 'pending_verification'
  },
  isVerified: { type: Boolean, default: false },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: { type: Date },

  // Documents (file paths — access controlled)
  documents: [{
    docType: { type: String, enum: ['id_proof', 'income_proof', 'address_proof', 'medical', 'other'] },
    fileName: String,
    filePath: String,
    uploadedAt: { type: Date, default: Date.now },
    isVerified: { type: Boolean, default: false }
  }],

  // Registration
  registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO' }, // Which NGO registered them
  registeredAt: { type: Date, default: Date.now },

  // Privacy
  consentGiven: { type: Boolean, default: false },
  consentDate: { type: Date },
  dataRetentionDays: { type: Number, default: 1095 }, // 3 years

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

beneficiarySchema.index({ location: '2dsphere' });
beneficiarySchema.index({ status: 1, isVerified: 1 });
beneficiarySchema.index({ registeredBy: 1 });
beneficiarySchema.index({ phone: 1 }, { sparse: true });

// Never expose nationalId or exact location in default queries
beneficiarySchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.nationalId;
    delete ret.location;
    return ret;
  }
});

module.exports = mongoose.models.Beneficiary || mongoose.model('Beneficiary', beneficiarySchema);
