const emergencyFundService = require('../services/emergencyFundService');
const asyncHandler = require('../middleware/asyncHandler');

class EmergencyFundController {
  createEmergencyFund = asyncHandler(async (req, res) => {
    const fund = await emergencyFundService.createEmergencyFund({
      ...req.body,
      ngoId: req.user.ngoId || req.body.ngoId
    });
    res.status(201).json({
      success: true,
      data: fund
    });
  });

  getEmergencyFunds = asyncHandler(async (req, res) => {
    const filters = {};
    if (req.query.ngoId) filters.ngoId = req.query.ngoId;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.priority) filters.priority = req.query.priority;

    const funds = await emergencyFundService.getEmergencyFunds(filters);
    res.json({
      success: true,
      count: funds.length,
      data: funds
    });
  });

  getEmergencyFundById = asyncHandler(async (req, res) => {
    const fund = await emergencyFundService.getEmergencyFundById(req.params.id);
    res.json({
      success: true,
      data: fund
    });
  });

  updateEmergencyFund = asyncHandler(async (req, res) => {
    const fund = await emergencyFundService.getEmergencyFundById(req.params.id);

    // Authorization check: Only system_admin or the owning NGO admin can update
    if (req.user.role !== 'system_admin' && fund.ngoId._id.toString() !== req.user.ngoId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this emergency fund'
      });
    }

    const updatedFund = await emergencyFundService.updateEmergencyFund(req.params.id, req.body);
    res.json({
      success: true,
      data: updatedFund
    });
  });

  deleteEmergencyFund = asyncHandler(async (req, res) => {
    const fund = await emergencyFundService.getEmergencyFundById(req.params.id);

    // Authorization check: Only system_admin or the owning NGO admin can delete
    if (req.user.role !== 'system_admin' && fund.ngoId._id.toString() !== req.user.ngoId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this emergency fund'
      });
    }

    await emergencyFundService.deleteEmergencyFund(req.params.id);
    res.json({
      success: true,
      message: 'Emergency fund deleted successfully'
    });
  });

  getActiveEmergencyFunds = asyncHandler(async (req, res) => {
    const funds = await emergencyFundService.getActiveEmergencyFunds();
    res.json({
      success: true,
      count: funds.length,
      data: funds
    });
  });

  uploadProofDocument = asyncHandler(async (req, res) => {
    const fund = await emergencyFundService.getEmergencyFundById(req.params.id);

    // Authorization check: Only system_admin or the owning NGO admin can upload proof
    if (req.user.role !== 'system_admin' && fund.ngoId._id.toString() !== req.user.ngoId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to upload proof for this emergency fund'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const updatedFund = await emergencyFundService.uploadProofDocument(
      req.params.id,
      req.file,
      req.user.id
    );

    res.json({
      success: true,
      message: 'Proof document uploaded successfully',
      data: updatedFund
    });
  });

  removeProofDocument = asyncHandler(async (req, res) => {
    const fund = await emergencyFundService.getEmergencyFundById(req.params.id);

    // Authorization check: Only system_admin or the owning NGO admin can remove proof
    if (req.user.role !== 'system_admin' && fund.ngoId._id.toString() !== req.user.ngoId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to remove proof for this emergency fund'
      });
    }

    const updatedFund = await emergencyFundService.removeProofDocument(req.params.id);
    res.json({
      success: true,
      message: 'Proof document removed successfully',
      data: updatedFund
    });
  });

  getProofDocument = asyncHandler(async (req, res) => {
    const fund = await emergencyFundService.getEmergencyFundById(req.params.id);
    if (!fund || !fund.proofDocument || !fund.proofDocument.filename) {
      return res.status(404).json({
        success: false,
        message: 'Proof document not found'
      });
    }

    const path = require('path');
    const filePath = path.join(__dirname, '../uploads/proof-documents', fund.proofDocument.filename);

    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Document file not found on server'
      });
    }

    const mimeType = fund.proofDocument.mimeType || 'application/pdf';
    const originalName = fund.proofDocument.originalName || fund.proofDocument.filename;

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${originalName}"`);
    res.sendFile(filePath);
  });
}

module.exports = new EmergencyFundController();

