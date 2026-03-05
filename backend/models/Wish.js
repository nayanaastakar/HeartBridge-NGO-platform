const mongoose = require('mongoose');

const wishSchema = new mongoose.Schema({
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide wish title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide wish description'],
    trim: true
  },
  occasion: {
    type: String,
    required: [true, 'Please specify the occasion'],
    trim: true
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
  status: {
    type: String,
    enum: ['ACTIVE', 'EXPIRED', 'FULFILLED'],
    default: 'ACTIVE'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  fulfilledAt: {
    type: Date
  }
});

// Index for efficient queries
wishSchema.index({ ngoId: 1, status: 1 });
wishSchema.index({ deadline: 1, status: 1 });

// Method to check and update status
wishSchema.methods.updateStatus = function () {
  const now = new Date();
  if (this.status === 'ACTIVE') {
    if (this.collectedAmount >= this.requiredAmount) {
      this.status = 'FULFILLED';
      this.fulfilledAt = now;
    } else if (this.deadline < now) {
      this.status = 'EXPIRED';
    }
  }
  return this.status;
};

module.exports = mongoose.models.Wish || mongoose.model('Wish', wishSchema);

