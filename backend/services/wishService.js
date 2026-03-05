const Wish = require('../models/Wish');
const NGO = require('../models/NGO');
const ApiError = require('../utils/ApiError');

class WishService {
  async createWish(wishData) {
    const { ngoId } = wishData;
    
    // Verify NGO exists
    const ngo = await NGO.findById(ngoId);
    if (!ngo) {
      throw new ApiError(404, 'NGO not found');
    }

    const wish = await Wish.create(wishData);
    return wish;
  }

  async getWishes(filters = {}) {
    const query = {};
    if (filters.ngoId) query.ngoId = filters.ngoId;
    if (filters.status) query.status = filters.status;

    const wishes = await Wish.find(query)
      .populate('ngoId', 'name category logo')
      .sort({ createdAt: -1 });

    // Update status for active wishes
    for (const wish of wishes) {
      if (wish.status === 'ACTIVE') {
        wish.updateStatus();
        await wish.save();
      }
    }

    return await Wish.find(query)
      .populate('ngoId', 'name category logo')
      .sort({ createdAt: -1 });
  }

  async getWishById(wishId) {
    const wish = await Wish.findById(wishId).populate('ngoId', 'name category logo address');
    if (!wish) {
      throw new ApiError(404, 'Wish not found');
    }
    return wish;
  }

  async updateWish(wishId, updateData) {
    const wish = await this.getWishById(wishId);
    Object.assign(wish, updateData);
    wish.updateStatus();
    await wish.save();
    return wish;
  }

  async deleteWish(wishId) {
    const wish = await this.getWishById(wishId);
    await wish.deleteOne();
    return { message: 'Wish deleted successfully' };
  }

  async getActiveWishes() {
    return await this.getWishes({ status: 'ACTIVE' });
  }

  async getExpiredWishes() {
    return await this.getWishes({ status: 'EXPIRED' });
  }

  async getFulfilledWishes() {
    return await this.getWishes({ status: 'FULFILLED' });
  }
}

module.exports = new WishService();

