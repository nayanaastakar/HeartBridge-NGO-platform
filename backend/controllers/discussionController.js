const Discussion = require('../models/Discussion');
const User = require('../models/User');

// @desc    Get all discussions with pagination
// @route   GET /api/v1/discussions
// @access  Public
exports.getAllDiscussions = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10, sort = '-createdAt' } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const discussions = await Discussion.find(query)
      .populate('createdBy', 'name email')
      .populate('ngoId', 'name logo')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Discussion.countDocuments(query);

    res.status(200).json({
      success: true,
      count: discussions.length,
      total,
      pages: Math.ceil(total / limit),
      data: discussions
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get single discussion with replies
// @route   GET /api/v1/discussions/:id
// @access  Public
exports.getDiscussion = async (req, res) => {
  try {
    console.log(`[DiscussionController] Fetching discussion with ID: ${req.params.id}`);

    // First just try to find it without updating (safer)
    const discussion = await Discussion.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('ngoId', 'name logo');

    if (!discussion) {
      console.log(`[DiscussionController] Discussion not found: ${req.params.id}`);
      return res.status(404).json({ success: false, error: 'Discussion not found' });
    }

    // specific try-catch for the view increment so it doesn't block loading
    try {
      discussion.views += 1;
      await discussion.save({ validateBeforeSave: false }); // Skip validation updates for just view count
    } catch (saveError) {
      console.error('[DiscussionController] Error incrementing view count:', saveError);
      // Continue anyway, we have the data
    }

    res.status(200).json({ success: true, data: discussion });
  } catch (err) {
    console.error('[DiscussionController] Error in getDiscussion:', err);
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Create new discussion
// @route   POST /api/v1/discussions
// @access  Private
exports.createDiscussion = async (req, res) => {
  try {
    const { title, content, category, ngoId } = req.body;
    const user = req.user;

    const discussion = await Discussion.create({
      title,
      content,
      category,
      ngoId,
      createdBy: user.id,
      creatorName: user.name,
      creatorRole: user.role,
      isNgoAdmin: user.role === 'ngo_admin'
    });

    res.status(201).json({ success: true, data: discussion });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Add reply to discussion
// @route   POST /api/v1/discussions/:id/reply
// @access  Private
exports.addReply = async (req, res) => {
  try {
    const { content } = req.body;
    const user = req.user;

    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ success: false, error: 'Discussion not found' });
    }

    discussion.replies.push({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      isNgoAdmin: user.role === 'ngo_admin',
      content
    });

    await discussion.save();

    // Fetch populated version
    const updatedDiscussion = await Discussion.findById(discussion._id)
      .populate('createdBy', 'name email')
      .populate('ngoId', 'name logo');

    res.status(201).json({ success: true, data: updatedDiscussion });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update discussion
// @route   PUT /api/v1/discussions/:id
// @access  Private (own discussion or admin)
exports.updateDiscussion = async (req, res) => {
  try {
    let discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ success: false, error: 'Discussion not found' });
    }

    // Check authorization: only the creator can update
    const creatorId = discussion.createdBy || discussion.userId;
    const isOwner = creatorId && creatorId.toString() === req.user.id;

    if (!isOwner) {
      return res.status(403).json({ success: false, error: 'Not authorized to update' });
    }

    discussion = await Discussion.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('createdBy', 'name email').populate('ngoId', 'name logo');

    res.status(200).json({ success: true, data: discussion });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update a reply
// @route   PUT /api/v1/discussions/:id/reply/:replyId
// @access  Private (own reply or discussion owner or admin)
exports.updateReply = async (req, res) => {
  try {
    const { content } = req.body;
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ success: false, error: 'Discussion not found' });
    }

    const reply = discussion.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ success: false, error: 'Reply not found' });
    }

    // Check authorization: only the reply owner can update their reply
    if (reply.userId.toString() !== req.user.id && req.user.role !== 'system_admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to update this reply' });
    }

    reply.content = content;

    await discussion.save();

    const updatedDiscussion = await Discussion.findById(discussion._id)
      .populate('createdBy', 'name email')
      .populate('ngoId', 'name logo');

    res.status(200).json({ success: true, data: updatedDiscussion });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete a reply
// @route   DELETE /api/v1/discussions/:id/reply/:replyId
// @access  Private (own reply or discussion owner or admin)
exports.deleteReply = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ success: false, error: 'Discussion not found' });
    }

    const reply = discussion.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ success: false, error: 'Reply not found' });
    }

    // Check authorization: reply owner, discussion owner, or admin
    const discCreatorId = discussion.createdBy || discussion.userId;
    const isReplyOwner = reply.userId.toString() === req.user.id;
    const isDiscussionOwner = discCreatorId && discCreatorId.toString() === req.user.id;
    const isAdmin = req.user.role === 'system_admin';

    if (!isReplyOwner && !isDiscussionOwner && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this reply' });
    }

    // Use pull to remove the subdocument
    discussion.replies.pull(req.params.replyId);
    await discussion.save();

    const updatedDiscussion = await Discussion.findById(discussion._id)
      .populate('createdBy', 'name email')
      .populate('ngoId', 'name logo');

    res.status(200).json({ success: true, data: updatedDiscussion });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Mark reply as helpful/solution
// @route   PUT /api/v1/discussions/:id/mark-helpful
// @access  Private
exports.markHelpful = async (req, res) => {
  try {
    const { replyId } = req.body;
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ success: false, error: 'Discussion not found' });
    }

    const reply = discussion.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ success: false, error: 'Reply not found' });
    }

    reply.isHelpful = !reply.isHelpful;
    discussion.helpfulCount = discussion.replies.filter(r => r.isHelpful).length;

    await discussion.save();
    res.status(200).json({ success: true, data: discussion });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get discussions by category
// @route   GET /api/v1/discussions/category/:category
// @access  Public
exports.getByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;
    const discussions = await Discussion.find({ category })
      .populate('createdBy', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Discussion.countDocuments({ category });

    res.status(200).json({
      success: true,
      count: discussions.length,
      total,
      pages: Math.ceil(total / limit),
      data: discussions
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete discussion
// @route   DELETE /api/v1/discussions/:id
// @access  Private (own discussion or admin)
exports.deleteDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ success: false, error: 'Discussion not found' });
    }

    // Check authorization
    const creatorId = discussion.createdBy || discussion.userId;
    const isOwner = creatorId && creatorId.toString() === req.user.id;
    const isAdmin = req.user.role === 'system_admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete' });
    }

    await Discussion.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Close/Archive discussion
// @route   PUT /api/v1/discussions/:id/status
// @access  Private (own discussion)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ success: false, error: 'Discussion not found' });
    }

    if (discussion.createdBy.toString() !== req.user.id && req.user.role !== 'system_admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    discussion.status = status;
    await discussion.save();

    res.status(200).json({ success: true, data: discussion });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
