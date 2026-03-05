const donationService = require('../services/donationService');
const asyncHandler = require('../middleware/asyncHandler');

class DonationController {
  createDonation = asyncHandler(async (req, res) => {
    const donation = await donationService.createDonation({
      ...req.body,
      donorId: req.user.id
    });
    res.status(201).json({
      success: true,
      data: donation
    });
  });

  getMyDonations = asyncHandler(async (req, res) => {
    const donations = await donationService.getDonorDonations(req.user.id);
    res.json({
      success: true,
      count: donations.length,
      data: donations
    });
  });

  getNGODonations = asyncHandler(async (req, res) => {
    const donations = await donationService.getNGODonations(req.params.ngoId);
    res.json({
      success: true,
      count: donations.length,
      data: donations
    });
  });

  getAllDonations = asyncHandler(async (req, res) => {
    const donations = await donationService.getAllDonations(req.query);
    res.json({
      success: true,
      count: donations.length,
      data: donations
    });
  });

  getDonationStats = asyncHandler(async (req, res) => {
    const stats = await donationService.getDonationStats(req.query.ngoId);
    res.json({
      success: true,
      data: stats
    });
  });

  getMonthlyDonations = asyncHandler(async (req, res) => {
    const donations = await donationService.getMonthlyDonations(req.query.ngoId);
    res.json({
      success: true,
      data: donations
    });
  });

  getCategoryWiseDonations = asyncHandler(async (req, res) => {
    const donations = await donationService.getCategoryWiseDonations();
    res.json({
      success: true,
      data: donations
    });
  });
}

module.exports = new DonationController();

