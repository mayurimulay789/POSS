const fs = require('fs');
const path = require('path');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');

// Path to store logo URL persistently (for demo, use a JSON file)
const LOGO_DATA_PATH = path.join(__dirname, '../config/logo.json');

// Helper to read logo URL
function getLogoUrl() {
  if (fs.existsSync(LOGO_DATA_PATH)) {
    const data = JSON.parse(fs.readFileSync(LOGO_DATA_PATH, 'utf-8'));
    return data.logoUrl || '';
  }
  return '';
}

// Helper to save logo URL
function saveLogoUrl(url) {
  fs.writeFileSync(LOGO_DATA_PATH, JSON.stringify({ logoUrl: url }, null, 2));
}

exports.getLogo = (req, res) => {
  const logoUrl = getLogoUrl();
  res.json({ logoUrl });
};

// Helper to extract publicId from Cloudinary URL
function extractPublicId(url) {
  if (!url) return null;
  // Cloudinary URLs look like: https://res.cloudinary.com/<cloud>/image/upload/v123456789/<folder>/<public_id>.<ext>
  // We want: <folder>/<public_id> (without extension)
  const uploadIdx = url.indexOf('/upload/');
  if (uploadIdx === -1) return null;
  let publicIdWithVersion = url.substring(uploadIdx + 8); // after '/upload/'
  // Remove version if present (starts with v + digits + /)
  publicIdWithVersion = publicIdWithVersion.replace(/^v\d+\//, '');
  // Remove extension
  return publicIdWithVersion.replace(/\.(jpg|jpeg|png|gif|webp)$/, '');
}

exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    // Upload to Cloudinary (use 'logo' folder)
    const result = await uploadToCloudinary(req.file, 'logo');
    saveLogoUrl(result.url);
    res.json({ logoUrl: result.url });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to upload logo' });
  }
};

exports.deleteLogo = async (req, res) => {
  try {
    const logoUrl = getLogoUrl();
    if (!logoUrl) {
      return res.status(404).json({ message: 'No logo to delete' });
    }
    const publicId = extractPublicId(logoUrl);
    if (!publicId) {
      return res.status(400).json({ message: 'Invalid logo URL' });
    }
    // Delete from Cloudinary
    const { deleteFromCloudinary } = require('../utils/cloudinaryUpload');
    await deleteFromCloudinary(publicId);
    // Remove from local config
    saveLogoUrl('');
    res.json({ message: 'Logo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to delete logo' });
  }
};
