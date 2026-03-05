const Donation = require('../models/Donation');
const NGO = require('../models/NGO');
const Wish = require('../models/Wish');
const EmergencyFund = require('../models/EmergencyFund');
const AdoptADay = require('../models/AdoptADay');
const ApiError = require('../utils/ApiError');

class DonationService {
  async createDonation(donationData) {
    let { donorId, ngoId, amount, isAnonymous, donationType, relatedId } = donationData;

    // If ngoId not provided, get it from related entity
    if (!ngoId && relatedId) {
      ngoId = await this.getNgoIdFromRelated(donationType, relatedId);
    }

    // Verify NGO exists
    const ngo = await NGO.findById(ngoId);
    if (!ngo) {
      throw new ApiError(404, 'NGO not found');
    }

    // Create donation
    const donation = await Donation.create({
      donorId,
      ngoId,
      amount,
      isAnonymous,
      donationType,
      relatedId,
      relatedModel: this.getRelatedModel(donationType),
      status: 'completed'
    });

    // Update NGO total received
    ngo.totalReceived += amount;
    await ngo.save();

    // Update related entity if applicable
    if (relatedId && donationType !== 'general') {
      await this.updateRelatedEntity(donationType, relatedId, amount);
    }

    return donation;
  }

  getRelatedModel(donationType) {
    const modelMap = {
      'wish': 'Wish',
      'emergency': 'EmergencyFund',
      'adopt_a_day': 'AdoptADay'
    };
    return modelMap[donationType] || null;
  }

  async getNgoIdFromRelated(donationType, relatedId) {
    let entity;
    switch (donationType) {
      case 'wish':
        entity = await Wish.findById(relatedId);
        break;
      case 'emergency':
        entity = await EmergencyFund.findById(relatedId);
        break;
      case 'adopt_a_day':
        entity = await AdoptADay.findById(relatedId);
        break;
      default:
        throw new ApiError(400, 'Invalid donation type');
    }
    if (!entity) {
      throw new ApiError(404, 'Related entity not found');
    }
    return entity.ngoId;
  }

  async updateRelatedEntity(donationType, relatedId, amount) {
    switch (donationType) {
      case 'wish':
        const wish = await Wish.findById(relatedId);
        if (wish) {
          wish.collectedAmount = (wish.collectedAmount || 0) + Number(amount);
          wish.updateStatus();
          await Wish.findByIdAndUpdate(relatedId, {
            collectedAmount: wish.collectedAmount,
            status: wish.status,
            ...(wish.fulfilledAt ? { fulfilledAt: wish.fulfilledAt } : {})
          });
        }
        break;
      case 'emergency':
        const emergency = await EmergencyFund.findById(relatedId);
        if (emergency) {
          const newCollected = (emergency.collectedAmount || 0) + Number(amount);
          const isFulfilled = newCollected >= emergency.requiredAmount;
          await EmergencyFund.findByIdAndUpdate(relatedId, {
            collectedAmount: newCollected,
            ...(isFulfilled ? { status: 'fulfilled', fulfilledAt: new Date() } : {})
          });
        }
        break;
      case 'adopt_a_day':
        const adoptDay = await AdoptADay.findById(relatedId);
        if (adoptDay) {
          const newCollected = (adoptDay.collectedAmount || 0) + Number(amount);
          const isFulfilled = newCollected >= adoptDay.requiredAmount;
          await AdoptADay.findByIdAndUpdate(relatedId, {
            collectedAmount: newCollected,
            ...(isFulfilled ? { status: 'fulfilled', fulfilledAt: new Date() } : {})
          });
        }
        break;
    }
  }

  async getDonorDonations(donorId) {
    return await Donation.find({ donorId })
      .populate('ngoId', 'name category logo')
      .populate('donorId', 'name email')
      .sort({ createdAt: -1 });
  }

  async getNGODonations(ngoId) {
    return await Donation.find({ ngoId })
      .populate('donorId', 'name email')
      .sort({ createdAt: -1 });
  }

  async getAllDonations(filters = {}) {
    const query = {};
    if (filters.ngoId) query.ngoId = filters.ngoId;
    if (filters.donorId) query.donorId = filters.donorId;
    if (filters.status) query.status = filters.status;
    if (filters.donationType) query.donationType = filters.donationType;

    return await Donation.find(query)
      .populate('donorId', 'name email')
      .populate('ngoId', 'name category')
      .sort({ createdAt: -1 });
  }

  async getDonationStats(ngoId = null) {
    const matchStage = ngoId ? { ngoId: new (require('mongoose').Types.ObjectId)(ngoId) } : {};

    const stats = await Donation.aggregate([
      { $match: { ...matchStage, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalCount: { $sum: 1 },
          averageAmount: { $avg: '$amount' }
        }
      }
    ]);

    return stats[0] || { totalAmount: 0, totalCount: 0, averageAmount: 0 };
  }

  async getMonthlyDonations(ngoId = null) {
    const matchStage = ngoId ? { ngoId: new (require('mongoose').Types.ObjectId)(ngoId) } : {};

    return await Donation.aggregate([
      { $match: { ...matchStage, status: 'completed' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);
  }

  async getCategoryWiseDonations() {
    return await Donation.aggregate([
      { $match: { status: 'completed' } },
      {
        $lookup: {
          from: 'ngos',
          localField: 'ngoId',
          foreignField: '_id',
          as: 'ngo'
        }
      },
      { $unwind: '$ngo' },
      {
        $group: {
          _id: '$ngo.category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
  }
}

module.exports = new DonationService();

