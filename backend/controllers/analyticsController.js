const analyticsService = require('../services/analyticsService');
const asyncHandler = require('../middleware/asyncHandler');

class AnalyticsController {
  getPlatformStats = asyncHandler(async (req, res) => {
    const stats = await analyticsService.getPlatformStats();
    res.json({
      success: true,
      data: stats
    });
  });

  getNGODashboard = asyncHandler(async (req, res) => {
    const dashboard = await analyticsService.getNGODashboard(req.params.ngoId);
    res.json({
      success: true,
      data: dashboard
    });
  });

  getDonorDashboard = asyncHandler(async (req, res) => {
    const dashboard = await analyticsService.getDonorDashboard(req.user.id);
    console.log('Donor Dashboard Data:', dashboard);
    res.json({
      success: true,
      data: dashboard
    });
  });

  // New comprehensive analytics endpoints
  getDetailedAnalytics = asyncHandler(async (req, res) => {
    const [
      donationTrend,
      donationSizeBreakdown,
      userGrowth,
      topNGOs,
      topDonors
    ] = await Promise.all([
      analyticsService.getDonationTrend(),
      analyticsService.getDonationSizeBreakdown(),
      analyticsService.getUserGrowth(),
      analyticsService.getTopNGOs(),
      analyticsService.getTopDonors()
    ]);

    res.json({
      success: true,
      data: {
        donationTrend,
        donationSizeBreakdown,
        userGrowth,
        topNGOs,
        topDonors
      }
    });
  });

  getDonationTrend = asyncHandler(async (req, res) => {
    const trend = await analyticsService.getDonationTrend();
    res.json({
      success: true,
      data: trend
    });
  });

  getDonationSizeBreakdown = asyncHandler(async (req, res) => {
    const breakdown = await analyticsService.getDonationSizeBreakdown();
    res.json({
      success: true,
      data: breakdown
    });
  });

  getUserGrowth = asyncHandler(async (req, res) => {
    const growth = await analyticsService.getUserGrowth();
    res.json({
      success: true,
      data: growth
    });
  });

  getTopNGOs = asyncHandler(async (req, res) => {
    const ngos = await analyticsService.getTopNGOs();
    res.json({
      success: true,
      data: ngos
    });
  });

  getTopDonors = asyncHandler(async (req, res) => {
    const donors = await analyticsService.getTopDonors();
    res.json({
      success: true,
      data: donors
    });
  });
}

module.exports = new AnalyticsController();

