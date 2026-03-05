const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: String,
  userRole: String,
  isNgoAdmin: Boolean,
  content: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 2000
  },
  isHelpful: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const DiscussionSchema = new mongoose.Schema({
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO',
    default: null // Can be null for general platform discussions
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  creatorName: String,
  creatorRole: String,
  isNgoAdmin: Boolean,
  title: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    minlength: 20,
    maxlength: 5000
  },
  category: {
    type: String,
    enum: ['Fundraising', 'Volunteering', 'Impact', 'Resources', 'General', 'Questions'],
    default: 'General'
  },
  // Legacy fields support
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userName: String,
  userRole: String,

  replies: [ReplySchema],
  views: {
    type: Number,
    default: 0
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  isSolved: {
    type: Boolean,
    default: false
  },
  solvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['Active', 'Closed', 'Archived'],
    default: 'Active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for search functionality
DiscussionSchema.index({ title: 'text', content: 'text' });
DiscussionSchema.index({ category: 1, createdAt: -1 });
DiscussionSchema.index({ ngoId: 1 });

module.exports = mongoose.models.Discussion || mongoose.model('Discussion', DiscussionSchema);
