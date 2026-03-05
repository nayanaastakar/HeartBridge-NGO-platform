const ImpactStory = require('../models/ImpactStory');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all impact stories
// @route   GET /api/v1/impact-stories
// @access  Public
exports.getAllImpactStories = asyncHandler(async (req, res, next) => {
  const { ngoId, priority, sortBy = '-publishedAt', page = 1, limit = 10 } = req.query;

  let filter = { status: 'published' };

  if (ngoId) filter.ngoId = ngoId;
  if (priority) filter.priority = priority;

  const skip = (page - 1) * limit;

  const stories = await ImpactStory.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('ngoId', 'name category logo')
    .lean();

  const total = await ImpactStory.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: stories.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    data: stories
  });
});

// @desc    Get impact stories by NGO
// @route   GET /api/v1/impact-stories/ngo/:ngoId
// @access  Public
exports.getImpactStoriesByNGO = asyncHandler(async (req, res, next) => {
  const { ngoId } = req.params;
  const { limit = 10 } = req.query;

  const stories = await ImpactStory.find({
    ngoId,
    status: 'published'
  })
    .sort('-publishedAt')
    .limit(parseInt(limit))
    .populate('ngoId', 'name category logo')
    .lean();

  res.status(200).json({
    success: true,
    count: stories.length,
    data: stories
  });
});

// @desc    Get single impact story
// @route   GET /api/v1/impact-stories/:id
// @access  Public
exports.getImpactStory = asyncHandler(async (req, res, next) => {
  const story = await ImpactStory.findByIdAndUpdate(
    req.params.id,
    { $inc: { 'engagement.views': 1 } },
    { new: true }
  ).populate('ngoId', 'name description category logo address phone email');

  if (!story) {
    return res.status(404).json({ success: false, message: 'Impact story not found' });
  }

  res.status(200).json({
    success: true,
    data: story
  });
});

// @desc    Create impact story (NGO Admin only)
// @route   POST /api/v1/impact-stories
// @access  Private (NGO Admin)
exports.createImpactStory = asyncHandler(async (req, res, next) => {
  const { ngoId } = req.body;

  // Verify NGO admin owns this NGO
  const userNGO = await require('../models/NGO').findOne({
    _id: ngoId,
    adminId: req.user.id
  });

  if (!userNGO) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to create stories for this NGO'
    });
  }

  const story = await ImpactStory.create(req.body);

  res.status(201).json({
    success: true,
    data: story
  });
});

// @desc    Update impact story (NGO Admin only)
// @route   PUT /api/v1/impact-stories/:id
// @access  Private (NGO Admin)
exports.updateImpactStory = asyncHandler(async (req, res, next) => {
  const story = await ImpactStory.findById(req.params.id);

  if (!story) {
    return res.status(404).json({ success: false, message: 'Impact story not found' });
  }

  // Verify ownership
  const userNGO = await require('../models/NGO').findOne({
    _id: story.ngoId,
    adminId: req.user.id
  });

  if (!userNGO) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this story'
    });
  }

  const updatedStory = await ImpactStory.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: updatedStory
  });
});

// @desc    Delete impact story (NGO Admin only)
// @route   DELETE /api/v1/impact-stories/:id
// @access  Private (NGO Admin)
exports.deleteImpactStory = asyncHandler(async (req, res, next) => {
  const story = await ImpactStory.findById(req.params.id);

  if (!story) {
    return res.status(404).json({ success: false, message: 'Impact story not found' });
  }

  // Verify ownership
  const userNGO = await require('../models/NGO').findOne({
    _id: story.ngoId,
    adminId: req.user.id
  });

  if (!userNGO) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this story'
    });
  }

  await ImpactStory.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Impact story deleted successfully'
  });
});

// @desc    Like impact story
// @route   POST /api/v1/impact-stories/:id/like
// @access  Private
exports.likeImpactStory = asyncHandler(async (req, res, next) => {
  const story = await ImpactStory.findById(req.params.id);
  if (!story) {
    return res.status(404).json({ success: false, message: 'Impact story not found' });
  }

  const userLiked = story.engagement.likes.some(
    like => like.userId.toString() === req.user.id
  );

  let updatedStory;
  if (userLiked) {
    updatedStory = await ImpactStory.findByIdAndUpdate(
      req.params.id,
      { $pull: { 'engagement.likes': { userId: req.user.id } } },
      { new: true }
    );
  } else {
    updatedStory = await ImpactStory.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          'engagement.likes': {
            userId: req.user.id,
            likedAt: new Date()
          }
        }
      },
      { new: true }
    );
  }

  res.status(200).json({
    success: true,
    data: {
      likes: updatedStory.engagement.likes.length,
      liked: !userLiked
    }
  });
});

// @desc    Share impact story
// @route   POST /api/v1/impact-stories/:id/share
// @access  Private
exports.shareImpactStory = asyncHandler(async (req, res, next) => {
  const updatedStory = await ImpactStory.findByIdAndUpdate(
    req.params.id,
    {
      $push: {
        'engagement.shares': {
          userId: req.user.id,
          sharedAt: new Date()
        }
      }
    },
    { new: true }
  );

  if (!updatedStory) {
    return res.status(404).json({ success: false, message: 'Impact story not found' });
  }

  res.status(200).json({
    success: true,
    data: {
      shares: updatedStory.engagement.shares.length
    }
  });
});

// @desc    Get impact stats (featured stories)
// @route   GET /api/v1/impact-stories/stats/featured
// @access  Public
exports.getFeaturedImpactStories = asyncHandler(async (req, res, next) => {
  const stories = await ImpactStory.find({
    status: 'published',
    priority: 'featured'
  })
    .sort('-engagement.views')
    .limit(6)
    .populate('ngoId', 'name category logo')
    .lean();

  res.status(200).json({
    success: true,
    count: stories.length,
    data: stories
  });
});

// @desc    Upload before photo for impact story
// @route   POST /api/v1/impact-stories/:id/upload-before-photo
// @access  Private (NGO Admin)
exports.uploadBeforePhoto = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { caption } = req.body;

  const story = await ImpactStory.findById(id);
  if (!story) {
    return res.status(404).json({ success: false, message: 'Impact story not found' });
  }

  // Verify ownership
  const userNGO = await require('../models/NGO').findOne({
    _id: story.ngoId,
    adminId: req.user.id
  });

  if (!userNGO) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this story'
    });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file provided' });
  }

  const updatedStory = await ImpactStory.findByIdAndUpdate(
    id,
    {
      beforePhoto: {
        url: `/uploads/impact-updates/${req.file.filename}`,
        caption: caption || 'Before Photo',
        uploadedAt: new Date()
      }
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Before photo uploaded successfully',
    data: updatedStory.beforePhoto
  });
});

// @desc    Upload after photo for impact story
// @route   POST /api/v1/impact-stories/:id/upload-after-photo
// @access  Private (NGO Admin)
exports.uploadAfterPhoto = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { caption } = req.body;

  const story = await ImpactStory.findById(id);
  if (!story) {
    return res.status(404).json({ success: false, message: 'Impact story not found' });
  }

  // Verify ownership
  const userNGO = await require('../models/NGO').findOne({
    _id: story.ngoId,
    adminId: req.user.id
  });

  if (!userNGO) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this story'
    });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file provided' });
  }

  const updatedStory = await ImpactStory.findByIdAndUpdate(
    id,
    {
      afterPhoto: {
        url: `/uploads/impact-updates/${req.file.filename}`,
        caption: caption || 'After Photo',
        uploadedAt: new Date()
      }
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'After photo uploaded successfully',
    data: updatedStory.afterPhoto
  });
});
