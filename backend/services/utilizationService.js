const ApiError = require('../utils/ApiError');
const NGO = require('../models/NGO');
const Utilization = require('../models/Utilization');

async function addUtilization({ ngoId, userId, amount, purpose }) {
  const ngo = await NGO.findById(ngoId);
  if (!ngo) throw new ApiError(404, 'NGO not found');

  const utilization = await Utilization.create({
    ngoId,
    amount,
    purpose,
    createdBy: userId,
  });

  ngo.totalUtilized = (ngo.totalUtilized || 0) + amount;
  await ngo.save();

  return utilization;
}

async function listUtilizations({ ngoId }) {
  return Utilization.find({ ngoId }).sort({ utilizedAt: -1 }).limit(200);
}

module.exports = { addUtilization, listUtilizations };


