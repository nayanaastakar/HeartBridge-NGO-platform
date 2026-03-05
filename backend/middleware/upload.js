const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'photos' || file.fieldname === 'logo' || file.fieldname === 'banner') {
        cb(null, path.join(__dirname, '../uploads/ngo-photos'));
      } else if (file.fieldname === 'gallery-images') {
        cb(null, path.join(__dirname, '../uploads/gallery-images'));
      } else if (file.fieldname === 'impact-images' || file.fieldname === 'images' || file.fieldname === 'beforePhoto' || file.fieldname === 'afterPhoto') {
        cb(null, path.join(__dirname, '../uploads/impact-updates'));
      } else if (file.fieldname === 'profilePicture') {
        cb(null, path.join(__dirname, '../uploads/profile-pictures'));
      } else if (file.fieldname === 'proof-document') {
        cb(null, path.join(__dirname, '../uploads/proof-documents'));
      } else {
        cb(null, path.join(__dirname, '../uploads'));
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'proof-document') {
      // Allow images, PDFs, and documents for proof
      const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only image files (JPG, PNG) and documents (PDF, DOC, DOCX) are allowed for proof!'), false);
      }
    } else if (file.mimetype.startsWith('image/')) {
      // Allow images only for other fields
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 30 * 1024 * 1024, // 30MB per file
    files: 10 // Maximum 10 files per upload
  }
});

module.exports = upload;
