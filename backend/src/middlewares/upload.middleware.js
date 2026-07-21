const multer = require('multer');
const { propertyImageStorage } = require('../config/cloudinary');

const upload = multer({
  storage: propertyImageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per image
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
    }
    cb(null, true);
  },
});

module.exports = upload;