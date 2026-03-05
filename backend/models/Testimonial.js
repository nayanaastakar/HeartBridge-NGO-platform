const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide name']
  },
  role: {
    type: String,
    enum: ['beneficiary', 'donor', 'volunteer', 'staff'],
    required: true
  },
  message: {
    type: String,
    required: [true, 'Please provide testimonial message'],
    minlength: 20,
    maxlength: 1000
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  photoUrl: {
    type: String,
    default: ''
  },
  impact: {
    type: String,
    enum: ['personal_growth', 'family_support', 'community_impact', 'life_changing', 'educational'],
    default: 'community_impact'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  likes: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.Testimonial || mongoose.model('Testimonial', testimonialSchema);
