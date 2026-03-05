const gratitudeService = require('../services/gratitudeService');
const asyncHandler = require('../middleware/asyncHandler');

class GratitudeController {
  createGratitude = asyncHandler(async (req, res) => {
    const gratitude = await gratitudeService.createGratitude({
      ...req.body,
      ngoId: req.user.ngoId || req.body.ngoId
    });
    res.status(201).json({
      success: true,
      data: gratitude
    });
  });

  getGratitudeMessages = asyncHandler(async (req, res) => {
    const filters = {
      ngoId: req.query.ngoId,
      relatedType: req.query.relatedType,
      limit: parseInt(req.query.limit) || 50
    };

    const messages = await gratitudeService.getGratitudeMessages(filters);
    res.json({
      success: true,
      count: messages.length,
      data: messages
    });
  });

  getGratitudeWall = asyncHandler(async (req, res) => {
    const messages = await gratitudeService.getPublicGratitudeWall(
      parseInt(req.query.limit) || 20
    );
    res.json({
      success: true,
      count: messages.length,
      data: messages
    });
  });

  getGratitudeById = asyncHandler(async (req, res) => {
    const gratitude = await gratitudeService.getGratitudeById(req.params.id);
    res.json({
      success: true,
      data: gratitude
    });
  });

  updateGratitude = asyncHandler(async (req, res) => {
    const gratitude = await gratitudeService.updateGratitude(req.params.id, req.body);
    res.json({
      success: true,
      data: gratitude
    });
  });

  deleteGratitude = asyncHandler(async (req, res) => {
    await gratitudeService.deleteGratitude(req.params.id);
    res.json({
      success: true,
      message: 'Gratitude message deleted successfully'
    });
  });
}

module.exports = new GratitudeController();

