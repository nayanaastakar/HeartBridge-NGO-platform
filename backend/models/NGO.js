const mongoose = require('mongoose');

const ngoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide NGO name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide description'],
    trim: true
  },
  category: {
    type: String,
    enum: [
      'Children Welfare',
      'Children Welfare NGOs',
      'Old Age Homes',
      'Education',
      'Healthcare',
      'Emergency Funds',
      'Women Empowerment',
      'Environment',
      'Animal Welfare',
      'Social Welfare',
      'Disaster Relief',
      'Physically Disabled Care NGOs',
      'Food and Basic Needs NGOs',
      'Mentally Challenged Care NGOs'
    ],
    required: [true, 'Please select a category']
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  fundingRequirement: {
    type: Number,
    required: true,
    default: 0
  },
  totalReceived: {
    type: Number,
    default: 0
  },
  totalUtilized: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    title: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  logo: {
    type: String,
    default: ''
  },
  banner: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.NGO || mongoose.model('NGO', ngoSchema);

