const Gratitude = require('../models/Gratitude');
const NGO = require('../models/NGO');
const ApiError = require('../utils/ApiError');

class GratitudeService {
  async createGratitude(gratitudeData) {
    const { ngoId } = gratitudeData;
    
    const ngo = await NGO.findById(ngoId);
    if (!ngo) {
      throw new ApiError(404, 'NGO not found');
    }

    const gratitude = await Gratitude.create(gratitudeData);
    return gratitude;
  }

  async getGratitudeMessages(filters = {}) {
    const query = {};
    if (filters.ngoId) query.ngoId = filters.ngoId;
    if (filters.relatedType) query.relatedType = filters.relatedType;

    return await Gratitude.find(query)
      .populate('ngoId', 'name category logo')
      .sort({ createdAt: -1 })
      .limit(filters.limit || 50);
  }

  async getGratitudeById(gratitudeId) {
    const gratitude = await Gratitude.findById(gratitudeId)
      .populate('ngoId', 'name category logo');
    if (!gratitude) {
      throw new ApiError(404, 'Gratitude message not found');
    }
    return gratitude;
  }

  async updateGratitude(gratitudeId, updateData) {
    const gratitude = await this.getGratitudeById(gratitudeId);
    Object.assign(gratitude, updateData);
    await gratitude.save();
    return gratitude;
  }

  async deleteGratitude(gratitudeId) {
    const gratitude = await this.getGratitudeById(gratitudeId);
    await gratitude.deleteOne();
    return { message: 'Gratitude message deleted successfully' };
  }

  async getPublicGratitudeWall(limit = 20) {
    return await this.getGratitudeMessages({ limit });
  }
}

module.exports = new GratitudeService();

