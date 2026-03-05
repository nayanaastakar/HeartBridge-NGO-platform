const mongoose = require('mongoose');

const gratitudeSchema = new mongoose.Schema({
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Please provide title'],
    trim: true,
  },
  message: {
    type: String,
    required: [true, 'Please provide message'],
    trim: true,
  },
  // Optional linkage to a successful module entry
  relatedType: {
    type: String,
    enum: ['wish', 'emergency', 'adopt_a_day', 'general', 'other'],
    default: 'general',
    index: true,
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    index: true,
  },
  isPublic: { type: Boolean, default: true, index: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.models.Gratitude || mongoose.model('Gratitude', gratitudeSchema);


