const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const Testimonial = require('../models/Testimonial');

// Get all testimonials for an NGO
const getTestimonials = asyncHandler(async (req, res) => {
  const { ngoId } = req.params;
  const testimonials = await Testimonial.find({ ngoId, isPublished: true })
    .populate('userId', 'name email')
    .populate('ngoId', 'name')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: testimonials });
});

// Get single testimonial
const getTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const testimonial = await Testimonial.findById(id)
    .populate('userId', 'name email')
    .populate('ngoId', 'name');
  if (!testimonial) throw new ApiError(404, 'Testimonial not found');
  res.json({ success: true, data: testimonial });
});

// Create testimonial
const createTestimonial = asyncHandler(async (req, res) => {
  const { ngoId, name, role, message, rating, impact } = req.body;
  const userId = req.user._id;
  
  const testimonial = await Testimonial.create({
    ngoId,
    userId,
    name,
    role,
    message,
    rating,
    impact,
    isPublished: true
  });
  
  res.status(201).json({ success: true, data: testimonial });
});

// Update testimonial
const updateTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const testimonial = await Testimonial.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  if (!testimonial) throw new ApiError(404, 'Testimonial not found');
  res.json({ success: true, data: testimonial });
});

// Delete testimonial
const deleteTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const testimonial = await Testimonial.findByIdAndDelete(id);
  if (!testimonial) throw new ApiError(404, 'Testimonial not found');
  res.json({ success: true, message: 'Testimonial deleted successfully' });
});

// Like testimonial
const likeTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const testimonial = await Testimonial.findByIdAndUpdate(
    id,
    { $inc: { likes: 1 } },
    { new: true }
  );
  if (!testimonial) throw new ApiError(404, 'Testimonial not found');
  res.json({ success: true, data: testimonial });
});

module.exports = {
  getTestimonials,
  getTestimonial,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  likeTestimonial
};
