const adoptADayService = require('../services/adoptADayService');
const asyncHandler = require('../middleware/asyncHandler');

class AdoptADayController {
  createAdoptADay = asyncHandler(async (req, res) => {
    const adoptDay = await adoptADayService.createAdoptADay({
      ...req.body,
      ngoId: req.user.ngoId || req.body.ngoId
    });
    res.status(201).json({
      success: true,
      data: adoptDay
    });
  });

  getAdoptADays = asyncHandler(async (req, res) => {
    const filters = {};
    if (req.query.ngoId) filters.ngoId = req.query.ngoId;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.date) filters.date = req.query.date;

    const adoptDays = await adoptADayService.getAdoptADays(filters);
    res.json({
      success: true,
      count: adoptDays.length,
      data: adoptDays
    });
  });

  getAdoptADayById = asyncHandler(async (req, res) => {
    const adoptDay = await adoptADayService.getAdoptADayById(req.params.id);
    res.json({
      success: true,
      data: adoptDay
    });
  });

  updateAdoptADay = asyncHandler(async (req, res) => {
    const adoptDay = await adoptADayService.getAdoptADayById(req.params.id);

    // Authorization check: Only system_admin or the owning NGO admin can update
    if (req.user.role !== 'system_admin' && adoptDay.ngoId._id.toString() !== req.user.ngoId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this Adopt-a-Day program'
      });
    }

    const updatedAdoptDay = await adoptADayService.updateAdoptADay(req.params.id, req.body);
    res.json({
      success: true,
      data: updatedAdoptDay
    });
  });

  deleteAdoptADay = asyncHandler(async (req, res) => {
    const adoptDay = await adoptADayService.getAdoptADayById(req.params.id);

    // Authorization check: Only system_admin or the owning NGO admin can delete
    if (req.user.role !== 'system_admin' && adoptDay.ngoId._id.toString() !== req.user.ngoId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this Adopt-a-Day program'
      });
    }

    await adoptADayService.deleteAdoptADay(req.params.id);
    res.json({
      success: true,
      message: 'Adopt-a-Day deleted successfully'
    });
  });

  getAvailableDays = asyncHandler(async (req, res) => {
    const adoptDays = await adoptADayService.getAvailableDays();
    res.json({
      success: true,
      count: adoptDays.length,
      data: adoptDays
    });
  });

  adoptDay = asyncHandler(async (req, res) => {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid donation amount'
      });
    }
    const adoptDay = await adoptADayService.adoptDay(req.params.id, req.user.id, amount);
    res.json({
      success: true,
      data: adoptDay
    });
  });
}

module.exports = new AdoptADayController();

