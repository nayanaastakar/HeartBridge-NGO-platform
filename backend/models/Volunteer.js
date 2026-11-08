const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  // Profile
  skills: [{ type: String, trim: true }],
  languages: [{ type: String, trim: true }],
  bio: { type: String, maxlength: 600 },
  profilePicture: { type: String, default: '' },

  // Location & availability
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  availableDays: [{ type: String, enum: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] }],
  availableTimeSlots: [{ type: String, enum: ['morning','afternoon','evening','full_day'] }],
  maxHoursPerWeek: { type: Number, default: 10 },

  // Verification
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'inactive'],
    default: 'pending'
  },
  isVerified: { type: Boolean, default: false },
  documents: [{
    docType: String,
    filePath: String,
    uploadedAt: { type: Date, default: Date.now }
  }],

  // Stats
  totalHours: { type: Number, default: 0 },
  tasksCompleted: { type: Number, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0 },

  // Emergency availability
  emergencyVolunteer: { type: Boolean, default: false },
  emergencyContact: { type: String },

  registeredAt: { type: Date, default: Date.now }
}, { timestamps: true });

volunteerSchema.index({ location: '2dsphere' });
volunteerSchema.index({ skills: 1 });
volunteerSchema.index({ status: 1, isVerified: 1 });

module.exports = mongoose.models.Volunteer || mongoose.model('Volunteer', volunteerSchema);
