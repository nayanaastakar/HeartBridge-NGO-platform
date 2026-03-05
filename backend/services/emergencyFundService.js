const EmergencyFund = require('../models/EmergencyFund');
const NGO = require('../models/NGO');
const ApiError = require('../utils/ApiError');

class EmergencyFundService {
  async createEmergencyFund(fundData) {
    const { ngoId } = fundData;

    const ngo = await NGO.findById(ngoId);
    if (!ngo) {
      throw new ApiError(404, 'NGO not found');
    }

    const emergencyFund = await EmergencyFund.create(fundData);
    return emergencyFund;
  }

  async getEmergencyFunds(filters = {}) {
    const query = {};
    if (filters.ngoId) query.ngoId = filters.ngoId;
    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;

    return await EmergencyFund.find(query)
      .populate('ngoId', 'name category logo')
      .sort({ priority: -1, deadline: 1, createdAt: -1 });
  }

  async getEmergencyFundById(fundId) {
    const fund = await EmergencyFund.findById(fundId).populate('ngoId', 'name category logo address');
    if (!fund) {
      throw new ApiError(404, 'Emergency fund not found');
    }
    return fund;
  }

  async updateEmergencyFund(fundId, updateData) {
    const fund = await this.getEmergencyFundById(fundId);
    Object.assign(fund, updateData);

    // Auto-update status if fulfilled
    if (fund.collectedAmount >= fund.requiredAmount && fund.status === 'ACTIVE') {
      fund.status = 'FULFILLED';
      fund.fulfilledAt = new Date();
    }

    await fund.save();
    return fund;
  }

  async deleteEmergencyFund(fundId) {
    const fund = await this.getEmergencyFundById(fundId);
    await fund.deleteOne();
    return { message: 'Emergency fund deleted successfully' };
  }

  async getActiveEmergencyFunds() {
    return await this.getEmergencyFunds({ status: 'ACTIVE' });
  }

  async uploadProofDocument(fundId, file, userId) {
    const fund = await this.getEmergencyFundById(fundId);

    fund.proofDocument = {
      filename: file.filename,
      originalName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadedAt: new Date(),
      uploadedBy: userId
    };

    await fund.save();
    return fund;
  }

  async removeProofDocument(fundId) {
    const fund = await this.getEmergencyFundById(fundId);
    const fs = require('fs');
    const path = require('path');

    if (fund.proofDocument && fund.proofDocument.filename) {
      const filePath = path.join(__dirname, '../uploads/proof-documents', fund.proofDocument.filename);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error('Error deleting proof document file:', error);
      }
    }

    fund.proofDocument = undefined;
    await fund.save();
    return fund;
  }
}

module.exports = new EmergencyFundService();

