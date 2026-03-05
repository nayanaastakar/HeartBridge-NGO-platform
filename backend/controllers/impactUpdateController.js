const asyncHandler = require('../middleware/asyncHandler');
const ImpactUpdate = require('../models/ImpactUpdate');
const NGO = require('../models/NGO');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

// Create impact update (NGO only)
exports.createImpactUpdate = asyncHandler(async (req, res) => {
  const { title, description, images, impactMetrics, priority } = req.body;
  
  const ngo = await NGO.findById(req.user.id);
  if (!ngo) {
    throw new ApiError(404, 'NGO not found');
  }

  const impactUpdate = await ImpactUpdate.create({
    ngoId: req.user.id,
    title,
    description,
    images: images || [],
    impactMetrics: impactMetrics || {},
    priority: priority || 'medium',
    status: 'draft'
  });

  res.status(201).json({
    success: true,
    message: 'Impact update created successfully',
    data: impactUpdate
  });
});

// Publish impact update (NGO only)
exports.publishImpactUpdate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const impactUpdate = await ImpactUpdate.findOne({ _id: id, ngoId: req.user.id });
  if (!impactUpdate) {
    throw new ApiError(404, 'Impact update not found');
  }

  impactUpdate.status = 'published';
  impactUpdate.date = new Date();
  await impactUpdate.save();

  res.status(200).json({
    success: true,
    message: 'Impact update published successfully',
    data: impactUpdate
  });
});

// Get all impact updates (public)
exports.getImpactUpdates = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, ngoId, priority } = req.query;
  const skip = (page - 1) * limit;

  const query = { status: 'published' };
  if (ngoId) query.ngoId = ngoId;
  if (priority) query.priority = priority;

  const impactUpdates = await ImpactUpdate.find(query)
    .populate('ngoId', 'name logo category')
    .populate('taggedDonors.userId', 'name email')
    .sort({ priority: -1, date: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await ImpactUpdate.countDocuments(query);

  res.status(200).json({
    success: true,
    data: impactUpdates,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// Get impact updates for specific NGO
exports.getNGOImpactUpdates = asyncHandler(async (req, res) => {
  const { ngoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const impactUpdates = await ImpactUpdate.find({ 
    ngoId, 
    status: 'published' 
  })
    .populate('ngoId', 'name logo category')
    .populate('taggedDonors.userId', 'name email')
    .sort({ date: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await ImpactUpdate.countDocuments({ 
    ngoId, 
    status: 'published' 
  });

  res.status(200).json({
    success: true,
    data: impactUpdates,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// Get impact updates for donor (where they are tagged)
exports.getDonorImpactUpdates = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const impactUpdates = await ImpactUpdate.find({ 
    'taggedDonors.userId': req.user.id,
    status: 'published'
  })
    .populate('ngoId', 'name logo category')
    .populate('taggedDonors.userId', 'name email')
    .sort({ date: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await ImpactUpdate.countDocuments({ 
    'taggedDonors.userId': req.user.id,
    status: 'published'
  });

  res.status(200).json({
    success: true,
    data: impactUpdates,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// Get featured impact updates
exports.getFeaturedImpactUpdates = asyncHandler(async (req, res) => {
  const { limit = 5 } = req.query;

  const impactUpdates = await ImpactUpdate.find({ 
    status: 'published',
    priority: 'featured'
  })
    .populate('ngoId', 'name logo category')
    .populate('taggedDonors.userId', 'name email')
    .sort({ date: -1 })
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: impactUpdates
  });
});

// Upload images for impact update
exports.uploadImpactImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const impactUpdate = await ImpactUpdate.findOne({ _id: id, ngoId: req.user.id });
  if (!impactUpdate) {
    throw new ApiError(404, 'Impact update not found');
  }

  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, 'No images uploaded');
  }

  const images = req.files.map(file => ({
    url: `/uploads/impact-updates/${file.filename}`,
    caption: req.body.caption || '',
    uploadedAt: new Date()
  }));

  impactUpdate.images.push(...images);
  await impactUpdate.save();

  res.status(200).json({
    success: true,
    message: 'Images uploaded successfully',
    data: images
  });
});

// Tag donors in impact update
exports.tagDonors = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { donorTags } = req.body; // Array of { userId, amount, message }

  const impactUpdate = await ImpactUpdate.findOne({ _id: id, ngoId: req.user.id });
  if (!impactUpdate) {
    throw new ApiError(404, 'Impact update not found');
  }

  // Verify donors exist
  const donorIds = donorTags.map(tag => tag.userId);
  const donors = await User.find({ _id: { $in: donorIds }, role: 'donor' });
  
  if (donors.length !== donorTags.length) {
    throw new ApiError(400, 'Some donors not found or not valid donors');
  }

  // Add tagged donors
  donorTags.forEach(tag => {
    impactUpdate.taggedDonors.push({
      userId: tag.userId,
      amount: tag.amount,
      message: tag.message,
      taggedAt: new Date()
    });
  });

  await impactUpdate.save();

  res.status(200).json({
    success: true,
    message: 'Donors tagged successfully',
    data: impactUpdate
  });
});

// Like impact update
exports.likeImpactUpdate = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const impactUpdate = await ImpactUpdate.findById(id);
  if (!impactUpdate) {
    throw new ApiError(404, 'Impact update not found');
  }

  // Check if already liked
  const existingLike = impactUpdate.likes.find(
    like => like.userId.toString() === req.user.id
  );

  if (existingLike) {
    // Remove like
    impactUpdate.likes = impactUpdate.likes.filter(
      like => like.userId.toString() !== req.user.id
    );
    await impactUpdate.save();

    res.status(200).json({
      success: true,
      message: 'Like removed',
      liked: false,
      likesCount: impactUpdate.likes.length
    });
  } else {
    // Add like
    impactUpdate.likes.push({
      userId: req.user.id,
      likedAt: new Date()
    });
    await impactUpdate.save();

    res.status(200).json({
      success: true,
      message: 'Impact update liked',
      liked: true,
      likesCount: impactUpdate.likes.length
    });
  }
});

// Comment on impact update
exports.commentOnImpactUpdate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  const impactUpdate = await ImpactUpdate.findById(id);
  if (!impactUpdate) {
    throw new ApiError(404, 'Impact update not found');
  }

  impactUpdate.comments.push({
    userId: req.user.id,
    comment,
    commentedAt: new Date()
  });

  await impactUpdate.save();

  // Populate the new comment
  const updatedImpactUpdate = await ImpactUpdate.findById(id)
    .populate('comments.userId', 'name email');

  const newComment = updatedImpactUpdate.comments[updatedImpactUpdate.comments.length - 1];

  res.status(200).json({
    success: true,
    message: 'Comment added successfully',
    data: newComment
  });
});

// Share impact update
exports.shareImpactUpdate = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const impactUpdate = await ImpactUpdate.findById(id);
  if (!impactUpdate) {
    throw new ApiError(404, 'Impact update not found');
  }

  impactUpdate.shares.count += 1;
  impactUpdate.shares.lastShared = new Date();
  await impactUpdate.save();

  res.status(200).json({
    success: true,
    message: 'Impact update shared successfully',
    sharesCount: impactUpdate.shares.count
  });
});

// Get impact update statistics
exports.getImpactStats = asyncHandler(async (req, res) => {
  const { ngoId } = req.query;

  const matchStage = ngoId ? { ngoId: mongoose.Types.ObjectId(ngoId) } : {};

  const stats = await ImpactUpdate.aggregate([
    { $match: { status: 'published', ...matchStage } },
    {
      $group: {
        _id: null,
        totalUpdates: { $sum: 1 },
        totalLikes: { $sum: { $size: '$likes' } },
        totalComments: { $sum: { $size: '$comments' } },
        totalShares: { $sum: '$shares.count' },
        totalBeneficiaries: { $sum: '$impactMetrics.beneficiariesReached' },
        totalAmountUtilized: { $sum: '$impactMetrics.amountUtilized' },
        totalItemsProvided: { $sum: '$impactMetrics.itemsProvided' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: stats[0] || {
      totalUpdates: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      totalBeneficiaries: 0,
      totalAmountUtilized: 0,
      totalItemsProvided: 0
    }
  });
});

// Delete impact update (NGO only)
exports.deleteImpactUpdate = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const impactUpdate = await ImpactUpdate.findOne({ _id: id, ngoId: req.user.id });
  if (!impactUpdate) {
    throw new ApiError(404, 'Impact update not found');
  }

  await impactUpdate.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Impact update deleted successfully'
  });
});
