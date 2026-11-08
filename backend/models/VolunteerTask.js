const mongoose = require('mongoose');

const volunteerTaskSchema = new mongoose.Schema({
  ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  requiredSkills: [{ type: String }],
  location: { type: String, trim: true },
  date: { type: Date, required: true },
  durationHours: { type: Number, default: 4 },
  volunteersNeeded: { type: Number, default: 1 },
  status: {
    type: String,
    enum: ['open', 'full', 'in_progress', 'completed', 'cancelled'],
    default: 'open'
  },
  assignedVolunteers: [{
    volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer' },
    status: { type: String, enum: ['assigned', 'confirmed', 'attended', 'absent'], default: 'assigned' },
    hoursLogged: { type: Number, default: 0 },
    checkInTime: Date,
    checkOutTime: Date,
    attendanceQR: String
  }],
  isEmergency: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

volunteerTaskSchema.index({ ngo: 1, status: 1 });
volunteerTaskSchema.index({ date: 1 });
volunteerTaskSchema.index({ requiredSkills: 1 });

module.exports = mongoose.models.VolunteerTask || mongoose.model('VolunteerTask', volunteerTaskSchema);
