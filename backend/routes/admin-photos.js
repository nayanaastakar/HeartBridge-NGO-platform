const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { protect, requireAdmin } = require('../middleware/auth');
const ngoController = require('../controllers/ngoController');

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next();
  }
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors: errors.array()
  });
};

// Admin only routes
router.use(protect);
router.use(requireAdmin);

// Get all pending photos (for admin approval)
router.get('/photos/pending', async (req, res) => {
  const NGO = require('../models/NGO');
  const ngos = await NGO.find({})
    .populate('photos.uploadedBy', 'name email')
    .populate('photos.approvedBy', 'name email');
  
  let allPendingPhotos = [];
  ngos.forEach(ngo => {
    const pendingPhotos = ngo.photos.filter(photo => !photo.isApproved);
    allPendingPhotos.push(...pendingPhotos.map(photo => ({
      ...photo.toObject(),
      ngoName: ngo.name,
      ngoId: ngo._id,
      uploadedBy: photo.uploadedBy,
      uploadedAt: photo.uploadedAt
    })));
  });

  res.json({
    success: true,
    data: allPendingPhotos,
    count: allPendingPhotos.length
  });
});

// Get all approved photos
router.get('/photos/approved', async (req, res) => {
  const NGO = require('../models/NGO');
  const ngos = await NGO.find({})
    .populate('photos.uploadedBy', 'name email')
    .populate('photos.approvedBy', 'name email');
  
  let allApprovedPhotos = [];
  ngos.forEach(ngo => {
    const approvedPhotos = ngo.photos.filter(photo => photo.isApproved);
    allApprovedPhotos.push(...approvedPhotos.map(photo => ({
      ...photo.toObject(),
      ngoName: ngo.name,
      ngoId: ngo._id,
      uploadedBy: photo.uploadedBy,
      approvedBy: photo.approvedBy,
      approvedAt: photo.approvedAt
    })));
  });

  res.json({
    success: true,
    data: allApprovedPhotos,
    count: allApprovedPhotos.length
  });
});

// Get all photo galleries
router.get('/galleries', async (req, res) => {
  const NGO = require('../models/NGO');
  const ngos = await NGO.find({})
    .populate('photoGallery.uploadedBy', 'name email')
    .populate('photoGallery.publishedBy', 'name email');
  
  let allGalleries = [];
  ngos.forEach(ngo => {
    const galleries = ngo.photoGallery.map(gallery => ({
      ...gallery.toObject(),
      ngoName: ngo.name,
      ngoId: ngo._id,
      uploadedBy: gallery.uploadedBy,
      publishedBy: gallery.publishedBy,
      publishedAt: gallery.publishedAt
    }));
    allGalleries.push(...galleries);
  });

  res.json({
    success: true,
    data: allGalleries,
    count: allGalleries.length
  });
});

// Approve photo
router.post('/photos/:photoId/approve', validateRequest, ngoController.approvePhoto);

// Reject photo  
router.post('/photos/:photoId/reject', validateRequest, ngoController.rejectPhoto);

// Approve photo gallery
router.post('/galleries/:galleryId/publish', validateRequest, ngoController.publishPhotoGallery);

// Delete photo
router.delete('/photos/:photoId', async (req, res) => {
  const NGO = require('../models/NGO');
  const { photoId } = req.params;
  
  const ngo = await NGO.findOne({
    'photos._id': photoId
  });
  
  if (!ngo) {
    return res.status(404).json({
      success: false,
      message: 'Photo not found'
    });
  }
  
  // Remove photo from NGO photos array
  ngo.photos = ngo.photos.filter(photo => photo._id.toString() !== photoId);
  await ngo.save();
  
  res.json({
    success: true,
    message: 'Photo deleted successfully'
  });
});

// Delete photo gallery
router.delete('/galleries/:galleryId', async (req, res) => {
  const NGO = require('../models/NGO');
  const { galleryId } = req.params;
  
  const ngo = await NGO.findOne({
    'photoGallery._id': galleryId
  });
  
  if (!ngo) {
    return res.status(404).json({
      success: false,
      message: 'Gallery not found'
    });
  }
  
  // Remove gallery from NGO photoGallery array
  ngo.photoGallery = ngo.photoGallery.filter(gallery => gallery._id.toString() !== galleryId);
  await ngo.save();
  
  res.json({
    success: true,
    message: 'Gallery deleted successfully'
  });
});

module.exports = router;
