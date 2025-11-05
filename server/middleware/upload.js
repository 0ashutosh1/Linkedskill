const multer = require('multer')
const path = require('path')

// Use memory storage for Cloudinary uploads
const storage = multer.memoryStorage()

// File filter to accept only images
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (mimetype && extname) {
    return cb(null, true)
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'))
  }
}

// Multer configuration for both profile and thumbnail uploads
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: imageFilter
})

module.exports = {
  uploadProfile: upload,
  uploadThumbnail: upload,
  upload
}
