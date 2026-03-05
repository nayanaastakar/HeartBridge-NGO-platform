const NGO = require('../models/NGO');
const asyncHandler = require('./asyncHandler');

const attachNGO = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'ngo_admin') {
    const ngo = await NGO.findOne({ adminId: req.user._id });
    if (ngo) {
      req.user.ngoId = ngo._id;
    }
  }
  next();
});

module.exports = attachNGO;

