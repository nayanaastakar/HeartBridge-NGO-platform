const mongoose = require('mongoose');

const utilizationSchema = new mongoose.Schema({
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO',
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: [true, 'Please provide utilized amount'],
    min: [1, 'Amount must be at least 1'],
  },
  purpose: {
    type: String,
    required: [true, 'Please provide purpose'],
    trim: true,
  },
  utilizedAt: { type: Date, default: Date.now, index: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

utilizationSchema.index({ ngoId: 1, utilizedAt: -1 });

module.exports = mongoose.models.Utilization || mongoose.model('Utilization', utilizationSchema);


