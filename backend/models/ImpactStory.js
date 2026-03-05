const mongoose = require('mongoose');

const impactStorySchema = new mongoose.Schema({
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    example: "School Building Project Completed"
  },
  category: {
    type: String,
    enum: [
      'Children Welfare',
      'Old Age Homes',
      'Education',
      'Healthcare',
      'Emergency Funds',
      'Women Empowerment',
      'Environment',
      'Animal Welfare',
      'Social Welfare',
      'Disaster Relief',
      'Physically Disabled Care NGOs',
      'Food and Basic Needs NGOs',
      'Mentally Challenged Care NGOs'
    ],
    default: 'Social Welfare'
  },
  problemStatement: {
    type: String,
    required: true,
    trim: true,
    example: "Children were studying without proper classroom"
  },
  solutionDescription: {
    type: String,
    required: true,
    trim: true,
    example: "Community members and donors came together to build a proper classroom"
  },
  beforePhoto: {
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  afterPhoto: {
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  fundingDetails: {
    amountRequired: {
      type: Number,
      required: true,
      example: 250000
    },
    amountRaised: {
      type: Number,
      required: true,
      example: 250000
    },
    fundingSource: {
      type: String,
      enum: ['emergency_fund', 'wish_box', 'donation', 'grant', 'mixed'],
      default: 'donation'
    },
    relatedEmergencyFundId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmergencyFund'
    },
    donorCount: {
      type: Number,
      default: 0
    },
    donorsInfo: [{
      donorName: String,
      donationAmount: Number,
      message: String,
      donatedAt: Date
    }]
  },
  impact: {
    beneficiariesReached: {
      type: Number,
      required: true,
      example: 80
    },
    beneficiariesCategory: {
      type: String,
      example: "Children students"
    },
    servicesProvided: [String],
    implementationTimeline: {
      startDate: Date,
      completionDate: Date,
      durationMonths: Number
    }
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'featured'],
    default: 'high'
  },
  engagement: {
    views: {
      type: Number,
      default: 0
    },
    shares: [{
      userId: mongoose.Schema.Types.ObjectId,
      sharedAt: {
        type: Date,
        default: Date.now
      }
    }],
    likes: [{
      userId: mongoose.Schema.Types.ObjectId,
      likedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
impactStorySchema.index({ ngoId: 1, status: 1, publishedAt: -1 });
impactStorySchema.index({ priority: 1, status: 1 });
impactStorySchema.index({ publishedAt: -1 });
impactStorySchema.index({ 'engagement.views': -1 });

module.exports = mongoose.models.ImpactStory || mongoose.model('ImpactStory', impactStorySchema);
