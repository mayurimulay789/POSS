
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');
const Logo = require('../models/Logo');

// GET logo (returns latest logo)
exports.getLogo = async (req, res) => {
  try {
    const logo = await Logo.findOne().sort({ createdAt: -1 });
    if (!logo) return res.json({ logoUrl: '' });
    res.json({ logoUrl: logo.url });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch logo' });
  }
};

// POST logo (upload new logo, delete old if exists)
exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    // Delete old logo from Cloudinary and DB
    const oldLogo = await Logo.findOne().sort({ createdAt: -1 });
    if (oldLogo) {
      try { await deleteFromCloudinary(oldLogo.public_id); } catch {}
      await Logo.deleteMany({});
    }
    // Upload new logo
    const result = await uploadToCloudinary(req.file, 'logo');
    const newLogo = await Logo.create({ url: result.url, public_id: result.publicId });
    res.json({ logoUrl: newLogo.url });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to upload logo' });
  }
};

// DELETE logo (delete from Cloudinary and DB)
exports.deleteLogo = async (req, res) => {
  try {
    const logo = await Logo.findOne().sort({ createdAt: -1 });
    if (!logo) {
      return res.status(404).json({ message: 'No logo to delete' });
    }
    await deleteFromCloudinary(logo.public_id);
    await Logo.deleteMany({});
    res.json({ message: 'Logo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to delete logo' });
  }
};
