const wishService = require('../services/wishService');
const asyncHandler = require('../middleware/asyncHandler');

class WishController {
  createWish = asyncHandler(async (req, res) => {
    const wish = await wishService.createWish({
      ...req.body,
      ngoId: req.user.ngoId || req.body.ngoId
    });
    res.status(201).json({
      success: true,
      data: wish
    });
  });

  getWishes = asyncHandler(async (req, res) => {
    const filters = {};
    if (req.query.ngoId) filters.ngoId = req.query.ngoId;
    if (req.query.status) filters.status = req.query.status;

    const wishes = await wishService.getWishes(filters);
    res.json({
      success: true,
      count: wishes.length,
      data: wishes
    });
  });

  getWishById = asyncHandler(async (req, res) => {
    const wish = await wishService.getWishById(req.params.id);
    res.json({
      success: true,
      data: wish
    });
  });

  updateWish = asyncHandler(async (req, res) => {
    const wish = await wishService.getWishById(req.params.id);

    // Authorization check: Only system_admin or the owning NGO admin can update
    if (req.user.role !== 'system_admin' && wish.ngoId._id.toString() !== req.user.ngoId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this wish'
      });
    }

    const updatedWish = await wishService.updateWish(req.params.id, req.body);
    res.json({
      success: true,
      data: updatedWish
    });
  });

  deleteWish = asyncHandler(async (req, res) => {
    const wish = await wishService.getWishById(req.params.id);

    // Authorization check: Only system_admin or the owning NGO admin can delete
    if (req.user.role !== 'system_admin' && wish.ngoId._id.toString() !== req.user.ngoId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this wish'
      });
    }

    await wishService.deleteWish(req.params.id);
    res.json({
      success: true,
      message: 'Wish deleted successfully'
    });
  });

  getActiveWishes = asyncHandler(async (req, res) => {
    const wishes = await wishService.getActiveWishes();
    res.json({
      success: true,
      count: wishes.length,
      data: wishes
    });
  });
}

module.exports = new WishController();

