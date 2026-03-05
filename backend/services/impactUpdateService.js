const ImpactUpdate = require('../models/ImpactUpdate');
const NGO = require('../models/NGO');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

class ImpactUpdateService {
  async createImpactUpdate(ngoId, updateData) {
    const ngo = await NGO.findById(ngoId);
    if (!ngo) {
      throw new ApiError(404, 'NGO not found');
    }

    const impactUpdate = await ImpactUpdate.create({
      ngoId,
      ...updateData,
      status: 'draft'
    });

    return impactUpdate;
  }

  async publishImpactUpdate(ngoId, updateId) {
    const impactUpdate = await ImpactUpdate.findOne({ 
      _id: updateId, 
      ngoId 
    });
    
    if (!impactUpdate) {
      throw new ApiError(404, 'Impact update not found');
    }

    impactUpdate.status = 'published';
    impactUpdate.date = new Date();
    await impactUpdate.save();

    // Send notifications to tagged donors
    await this.notifyTaggedDonors(impactUpdate);

    return impactUpdate;
  }

  async getImpactUpdates(filters = {}) {
    const query = { status: 'published' };
    
    if (filters.ngoId) query.ngoId = filters.ngoId;
    if (filters.priority) query.priority = filters.priority;
    if (filters.featured) query.priority = 'featured';

    return await ImpactUpdate.find(query)
      .populate('ngoId', 'name logo category')
      .populate('taggedDonors.userId', 'name email')
      .sort({ priority: -1, date: -1 })
      .limit(filters.limit || 10);
  }

  async getDonorImpactUpdates(donorId) {
    return await ImpactUpdate.find({ 
      'taggedDonors.userId': donorId,
      status: 'published'
    })
      .populate('ngoId', 'name logo category')
      .populate('taggedDonors.userId', 'name email')
      .sort({ date: -1 });
  }

  async getNGOImpactUpdates(ngoId) {
    return await ImpactUpdate.find({ 
      ngoId, 
      status: 'published' 
    })
      .populate('ngoId', 'name logo category')
      .populate('taggedDonors.userId', 'name email')
      .sort({ date: -1 });
  }

  async uploadImages(ngoId, updateId, images) {
    const impactUpdate = await ImpactUpdate.findOne({ 
      _id: updateId, 
      ngoId 
    });
    
    if (!impactUpdate) {
      throw new ApiError(404, 'Impact update not found');
    }

    const imageObjects = images.map(image => ({
      url: image.url,
      caption: image.caption || '',
      uploadedAt: new Date()
    }));

    impactUpdate.images.push(...imageObjects);
    await impactUpdate.save();

    return imageObjects;
  }

  async tagDonors(ngoId, updateId, donorTags) {
    const impactUpdate = await ImpactUpdate.findOne({ 
      _id: updateId, 
      ngoId 
    });
    
    if (!impactUpdate) {
      throw new ApiError(404, 'Impact update not found');
    }

    // Verify donors exist
    const donorIds = donorTags.map(tag => tag.userId);
    const donors = await User.find({ 
      _id: { $in: donorIds }, 
      role: 'donor' 
    });
    
    if (donors.length !== donorTags.length) {
      throw new ApiError(400, 'Some donors not found or not valid donors');
    }

    // Add tagged donors
    donorTags.forEach(tag => {
      impactUpdate.taggedDonors.push({
        userId: tag.userId,
        amount: tag.amount,
        message: tag.message,
        taggedAt: new Date()
      });
    });

    await impactUpdate.save();
    return impactUpdate;
  }

  async likeImpactUpdate(updateId, userId) {
    const impactUpdate = await ImpactUpdate.findById(updateId);
    if (!impactUpdate) {
      throw new ApiError(404, 'Impact update not found');
    }

    const existingLike = impactUpdate.likes.find(
      like => like.userId.toString() === userId
    );

    if (existingLike) {
      // Remove like
      impactUpdate.likes = impactUpdate.likes.filter(
        like => like.userId.toString() !== userId
      );
    } else {
      // Add like
      impactUpdate.likes.push({
        userId,
        likedAt: new Date()
      });
    }

    await impactUpdate.save();
    return impactUpdate;
  }

  async commentOnImpactUpdate(updateId, userId, comment) {
    const impactUpdate = await ImpactUpdate.findById(updateId);
    if (!impactUpdate) {
      throw new ApiError(404, 'Impact update not found');
    }

    impactUpdate.comments.push({
      userId,
      comment,
      commentedAt: new Date()
    });

    await impactUpdate.save();
    return impactUpdate;
  }

  async shareImpactUpdate(updateId) {
    const impactUpdate = await ImpactUpdate.findById(updateId);
    if (!impactUpdate) {
      throw new ApiError(404, 'Impact update not found');
    }

    impactUpdate.shares.count += 1;
    impactUpdate.shares.lastShared = new Date();
    await impactUpdate.save();

    return impactUpdate;
  }

  async getImpactStats(ngoId = null) {
    const matchStage = ngoId ? 
      { ngoId: require('mongoose').Types.ObjectId(ngoId) } : {};

    const stats = await ImpactUpdate.aggregate([
      { $match: { status: 'published', ...matchStage } },
      {
        $group: {
          _id: null,
          totalUpdates: { $sum: 1 },
          totalLikes: { $sum: { $size: '$likes' } },
          totalComments: { $sum: { $size: '$comments' } },
          totalShares: { $sum: '$shares.count' },
          totalBeneficiaries: { $sum: '$impactMetrics.beneficiariesReached' },
          totalAmountUtilized: { $sum: '$impactMetrics.amountUtilized' },
          totalItemsProvided: { $sum: '$impactMetrics.itemsProvided' }
        }
      }
    ]);

    return stats[0] || {
      totalUpdates: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      totalBeneficiaries: 0,
      totalAmountUtilized: 0,
      totalItemsProvided: 0
    };
  }

  async notifyTaggedDonors(impactUpdate) {
    // This would integrate with a notification service
    const taggedDonors = impactUpdate.taggedDonors;
    
    for (const tag of taggedDonors) {
      console.log(`Notification sent to donor ${tag.userId}: You've been tagged in "${impactUpdate.title}"`);
      console.log(`Message: ${tag.message}`);
      console.log(`Amount contributed: ₹${tag.amount}`);
    }
  }

  async getFeaturedImpactUpdates(limit = 5) {
    return await ImpactUpdate.find({ 
      status: 'published',
      priority: 'featured'
    })
      .populate('ngoId', 'name logo category')
      .populate('taggedDonors.userId', 'name email')
      .sort({ date: -1 })
      .limit(limit);
  }
}

module.exports = new ImpactUpdateService();
