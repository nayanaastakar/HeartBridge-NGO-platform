const AdoptADay = require('../models/AdoptADay');
const NGO = require('../models/NGO');
const ApiError = require('../utils/ApiError');

class AdoptADayService {
  async createAdoptADay(adoptData) {
    const { ngoId } = adoptData;

    const ngo = await NGO.findById(ngoId);
    if (!ngo) {
      throw new ApiError(404, 'NGO not found');
    }

    const adoptDay = await AdoptADay.create(adoptData);
    return adoptDay;
  }

  async getAdoptADays(filters = {}) {
    const query = {};
    if (filters.ngoId) query.ngoId = filters.ngoId;
    if (filters.status) query.status = filters.status;
    if (filters.date) query.date = filters.date;

    return await AdoptADay.find(query)
      .populate('ngoId', 'name category logo')
      .populate('donorId', 'name email')
      .sort({ date: 1, createdAt: -1 });
  }

  async getAdoptADayById(adoptId) {
    const adoptDay = await AdoptADay.findById(adoptId)
      .populate('ngoId', 'name category logo address')
      .populate('donorId', 'name email');
    if (!adoptDay) {
      throw new ApiError(404, 'Adopt-a-Day not found');
    }
    return adoptDay;
  }

  async updateAdoptADay(adoptId, updateData) {
    const adoptDay = await this.getAdoptADayById(adoptId);
    Object.assign(adoptDay, updateData);

    if (adoptDay.collectedAmount >= adoptDay.requiredAmount && adoptDay.status === 'AVAILABLE') {
      adoptDay.status = 'FULFILLED';
      adoptDay.fulfilledAt = new Date();
    }

    await adoptDay.save();
    return adoptDay;
  }

  async deleteAdoptADay(adoptId) {
    const adoptDay = await this.getAdoptADayById(adoptId);
    await adoptDay.deleteOne();
    return { message: 'Adopt-a-Day deleted successfully' };
  }

  async getAvailableDays() {
    return await this.getAdoptADays({ status: 'AVAILABLE' });
  }

  async adoptDay(adoptId, donorId, amount) {
    const adoptDay = await this.getAdoptADayById(adoptId);

    if (adoptDay.status !== 'AVAILABLE') {
      throw new ApiError(400, 'This day is not available for adoption');
    }

    adoptDay.donorId = donorId;
    adoptDay.collectedAmount += amount;

    if (adoptDay.collectedAmount >= adoptDay.requiredAmount) {
      adoptDay.status = 'FULFILLED';
      adoptDay.fulfilledAt = new Date();
    } else {
      adoptDay.status = 'ADOPTED';
    }

    await adoptDay.save();
    return adoptDay;
  }
}

module.exports = new AdoptADayService();

