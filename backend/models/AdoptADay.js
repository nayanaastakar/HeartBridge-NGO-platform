const mongoose = require('mongoose');

const adoptADaySchema = new mongoose.Schema({
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO',
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: [true, 'Please provide the date to adopt'],
    index: true,
  },
  purpose: {
    type: String,
    required: [true, 'Please provide purpose'],
    trim: true,
  },
  requiredAmount: {
    type: Number,
    required: [true, 'Please provide required amount'],
    min: [1, 'Amount must be at least 1'],
  },
  collectedAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['AVAILABLE', 'ADOPTED', 'FULFILLED', 'CANCELLED'],
    default: 'AVAILABLE',
    index: true,
  },
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  },
  fulfilledAt: {
    type: Date,
    default: null
  },
  notes: { type: String, trim: true, default: '' },
  createdAt: { type: Date, default: Date.now },
});

adoptADaySchema.index({ ngoId: 1, date: 1 }, { unique: true });

module.exports = mongoose.models.AdoptADay || mongoose.model('AdoptADay', adoptADaySchema);


