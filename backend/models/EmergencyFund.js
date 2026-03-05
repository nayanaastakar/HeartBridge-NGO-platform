const mongoose = require('mongoose');

const emergencyFundSchema = new mongoose.Schema({
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide description'],
    trim: true
  },
  emergencyType: {
    type: String,
    enum: [
      'medical', 'disaster_relief', 'urgent_need', 'other',
      'Natural Disaster', 'Medical Emergency', 'Food Crisis',
      'Shelter Emergency', 'Infrastructure Damage', 'Other'
    ],
    required: true
  },
  requiredAmount: {
    type: Number,
    required: [true, 'Please provide required amount'],
    min: [1, 'Amount must be at least 1']
  },
  collectedAmount: {
    type: Number,
    default: 0
  },
  deadline: {
    type: Date,
    required: [true, 'Please provide deadline']
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'high'
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'FULFILLED', 'EXPIRED'],
    default: 'ACTIVE'
  },
  proofDocument: {
    filename: {
      type: String
    },
    originalName: {
      type: String
    },
    fileSize: {
      type: Number
    },
    mimeType: {
      type: String
    },
    uploadedAt: {
      type: Date
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  fulfilledAt: {
    type: Date
  }
});

emergencyFundSchema.index({ ngoId: 1, status: 1 });
emergencyFundSchema.index({ priority: 1, deadline: 1 });

module.exports = mongoose.models.EmergencyFund || mongoose.model('EmergencyFund', emergencyFundSchema);

