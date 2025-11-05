const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

/**
 * Upload an image buffer to Cloudinary
 * @param {Buffer} fileBuffer - The image file buffer from multer
 * @param {string} folder - Cloudinary folder name (e.g., 'profiles', 'thumbnails')
 * @param {string} publicId - Optional public ID for the image
 * @returns {Promise<Object>} - Cloudinary upload result
 */
const uploadToCloudinary = (fileBuffer, folder, publicId = null) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: `linkedskill/${folder}`,
      resource_type: 'image',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }
      ]
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise<Object>} - Cloudinary deletion result
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - The Cloudinary URL
 * @returns {string} - The public ID
 */
const extractPublicId = (url) => {
  if (!url) return null;
  
  // Extract public ID from URL
  // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/linkedskill/profiles/profile-123.jpg
  const parts = url.split('/');
  const uploadIndex = parts.indexOf('upload');
  
  if (uploadIndex === -1) return null;
  
  // Get everything after 'upload' and version number, remove file extension
  const pathParts = parts.slice(uploadIndex + 2);
  const publicIdWithExt = pathParts.join('/');
  const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.')) || publicIdWithExt;
  
  return publicId;
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicId
};
