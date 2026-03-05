const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide donation amount'],
    min: [1, 'Donation amount must be at least 1']
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  paymentMethod: {
    type: String,
    enum: ['online', 'bank_transfer', 'upi', 'card'],
    default: 'online'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  donationType: {
    type: String,
    enum: ['general', 'wish', 'emergency', 'adopt_a_day'],
    default: 'general'
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel'
  },
  relatedModel: {
    type: String,
    enum: ['Wish', 'EmergencyFund', 'AdoptADay', null],
    default: null
  },
  transactionId: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
donationSchema.index({ donorId: 1, createdAt: -1 });
donationSchema.index({ ngoId: 1, createdAt: -1 });

module.exports = mongoose.models.Donation || mongoose.model('Donation', donationSchema);

