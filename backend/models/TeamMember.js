const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide team member name'],
    trim: true
  },
  role: {
    type: String,
    required: [true, 'Please provide role'],
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  experience: {
    type: String,
    default: '0 years'
  },
  bio: {
    type: String,
    trim: true
  },
  photoUrl: {
    type: String,
    default: ''
  },
  expertise: [{
    type: String
  }],
  qualifications: [{
    type: String
  }],
  socialLinks: {
    linkedin: String,
    twitter: String,
    facebook: String
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.TeamMember || mongoose.model('TeamMember', teamMemberSchema);
