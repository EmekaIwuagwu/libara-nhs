const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Test connection
const testConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log('✓ Cloudinary connected successfully');
    return true;
  } catch (error) {
    console.error('✗ Cloudinary connection failed:', error.message);
    return false;
  }
};

// Helper function to upload file
const uploadFile = async (filePath, options = {}) => {
  try {
    // For PDFs, use 'auto' resource type so Cloudinary can handle them properly
    // This allows PDFs to be viewable in browsers
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'auto',
      folder: options.folder || 'libaranhs/resumes',
      public_id: options.public_id,
      type: 'upload',
      flags: 'attachment',
      ...options
    });
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Helper function to delete file
const deleteFile = async (publicId) => {
  try {
    console.log('[CLOUDINARY] Attempting to delete:', publicId);

    // Try deleting as image first (PDFs are stored as images when using auto)
    let result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
      invalidate: true
    });

    console.log('[CLOUDINARY] Delete result (image):', result);

    // If not found as image, try as raw
    if (result.result === 'not found') {
      console.log('[CLOUDINARY] Not found as image, trying raw...');
      result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'raw',
        invalidate: true
      });
      console.log('[CLOUDINARY] Delete result (raw):', result);
    }

    return result;
  } catch (error) {
    console.error('[CLOUDINARY] Delete error:', error);
    throw error;
  }
};

// Helper function to get secure URL
const getSecureUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    resource_type: 'raw',
    secure: true,
    ...options
  });
};

module.exports = {
  cloudinary,
  testConnection,
  uploadFile,
  deleteFile,
  getSecureUrl
};
