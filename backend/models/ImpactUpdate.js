const mongoose = require('mongoose');

const impactUpdateSchema = new mongoose.Schema({
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  images: [{
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  taggedDonors: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    amount: Number,
    message: String,
    taggedAt: {
      type: Date,
      default: Date.now
    }
  }],
  impactMetrics: {
    beneficiariesReached: Number,
    amountUtilized: Number,
    itemsProvided: Number,
    locationsCovered: [String],
    categories: [String]
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'featured'],
    default: 'medium'
  },
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    comment: String,
    commentedAt: {
      type: Date,
      default: Date.now
    }
  }],
  shares: {
    count: {
      type: Number,
      default: 0
    },
    lastShared: Date
  }
}, {
  timestamps: true
});

// Index for better performance
impactUpdateSchema.index({ ngoId: 1, status: 1, date: -1 });
impactUpdateSchema.index({ taggedDonors: 1 });
impactUpdateSchema.index({ priority: 1, status: 1 });
impactUpdateSchema.index({ date: -1 });

module.exports = mongoose.models.ImpactUpdate || mongoose.model('ImpactUpdate', impactUpdateSchema);
