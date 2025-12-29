const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary (call this in server.js)
const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
  console.log('✅ Cloudinary configured');
};

/**
 * Upload image to Cloudinary
 * @param {Object} file - Multer file object
 * @param {String} folder - Cloudinary folder path
 * @returns {Promise} - Cloudinary upload result
 */
const uploadToCloudinary = async (file, folder = 'attendance') => {
  try {
    if (!file || !file.path) {
      throw new Error('No file provided');
    }
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: folder,
      public_id: `attendance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      resource_type: 'image',
      overwrite: true,
      transformation: [
        { width: 800, height: 800, crop: 'limit' }, // Resize to max 800x800
        { quality: 'auto:good' } // Optimize quality
      ]
    });
    
    // Delete temporary file after upload
    try {
      fs.unlinkSync(file.path);
    } catch (unlinkError) {
      console.warn('Could not delete temp file:', unlinkError.message);
    }
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height
    };
    
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    
    // Try to delete temp file even if upload failed
    if (file && file.path) {
      try {
        fs.unlinkSync(file.path);
      } catch (unlinkError) {
        console.warn('Could not delete temp file after failed upload:', unlinkError.message);
      }
    }
    
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

/**
 * Delete image from Cloudinary
 * @param {String} publicId - Cloudinary public_id
 * @returns {Promise} - Deletion result
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      throw new Error('No public ID provided');
    }
    
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
    
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};

/**
 * Delete old images (older than 2 months)
 * This should be called by a scheduled job
 */
const cleanupOldImages = async () => {
  try {
    // Get all resources from attendance folder
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'attendance/',
      max_results: 500
    });
    
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    
    const oldImages = result.resources.filter(resource => {
      const createdDate = new Date(resource.created_at);
      return createdDate < twoMonthsAgo;
    });
    
    console.log(`Found ${oldImages.length} images older than 2 months`);
    
    // Delete old images
    for (const image of oldImages) {
      try {
        await deleteFromCloudinary(image.public_id);
        console.log(`Deleted: ${image.public_id}`);
      } catch (deleteError) {
        console.error(`Failed to delete ${image.public_id}:`, deleteError.message);
      }
    }
    
    return {
      deleted: oldImages.length,
      message: `Cleaned up ${oldImages.length} old images`
    };
    
  } catch (error) {
    console.error('Cleanup error:', error);
    throw error;
  }
};

module.exports = {
  configureCloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  cleanupOldImages
};