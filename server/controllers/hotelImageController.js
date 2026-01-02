// Get all banner images (public)
exports.getBannerImages = async (req, res) => {
  try {
    const images = await HotelImage.find({ isBanner: true }).sort({ bannerOrder: 1, createdAt: -1 });
    res.json(images);
  } catch (err) {
    console.error('HotelImage getBannerImages error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get welcome section image (public)
exports.getWelcomeImage = async (req, res) => {
  try {
    const img = await HotelImage.findOne({ isWelcome: true });
    if (!img) return res.status(404).json({ message: 'Welcome image not found' });
    res.json(img);
  } catch (err) {
    console.error('HotelImage getWelcomeImage error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get login page image (public)
exports.getLoginImage = async (req, res) => {
  try {
    const img = await HotelImage.findOne({ isLoginImage: true });
    if (!img) return res.status(404).json({ message: 'Login image not found' });
    res.json(img);
  } catch (err) {
    console.error('HotelImage getLoginImage error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get cuisine gallery background image (public)
exports.getCuisineGalleryImage = async (req, res) => {
  try {
    const img = await HotelImage.findOne({ isCuisineGallery: true });
    if (!img) return res.status(404).json({ message: 'Cuisine gallery image not found' });
    res.json(img);
  } catch (err) {
    console.error('HotelImage getCuisineGalleryImage error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
// Get a single hotel image by ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const img = await HotelImage.findById(id);
    if (!img) return res.status(404).json({ message: 'Image not found' });
    res.json(img);
  } catch (err) {
    console.error('HotelImage getById error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
const HotelImage = require('../models/HotelImage');
const { uploadBufferToCloudinary, cloudinary } = require('../utils/cloudinary');

exports.list = async (req, res) => {
  try {
    const images = await HotelImage.find().sort({ createdAt: -1 }).lean();
    res.json(images);
  } catch (err) {
    console.error('HotelImage list error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    if (!req.files || !req.files.length) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    const created = [];
    for (const file of req.files) {
      const originalName = file.originalname || 'upload.jpg';
      const ext = (originalName.match(/\.[^/.]+$/) || ['.jpg'])[0];
      const filename = `${Date.now()}_${originalName.replace(/\.[^/.]+$/, '')}${ext}`;
      const result = await uploadBufferToCloudinary(file.buffer, filename, 'pos_hotel_images');

      const doc = await HotelImage.create({
        url: result.secure_url,
        publicId: result.public_id || null,
        title: req.body.title || '',
        alt: req.body.alt || '',
        isBanner: req.body.isBanner === 'true' || req.body.isBanner === true || false,
        bannerHeading: req.body.bannerHeading || '',
        bannerOrder: Number(req.body.bannerOrder || 0),
        createdBy: req.user?._id || null,
      });
      created.push(doc);
    }

    res.status(201).json(created);
  } catch (err) {
    console.error('HotelImage create error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Update hotel image request - ID:', id);
    console.log('Update data:', req.body);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Has file:', !!req.file);
    
    const img = await HotelImage.findById(id);
    if (!img) {
      console.log('Image not found for ID:', id);
      return res.status(404).json({ message: 'Image not found' });
    }

    // Check if we have any data to update
    if (!req.body && !req.file) {
      console.log('No update data provided');
      return res.status(400).json({ 
        message: 'No data provided for update',
        hint: 'Please send data as JSON with Content-Type: application/json or as multipart/form-data'
      });
    }

    // Update text fields (with safe access)
    if (req.body && typeof req.body.title !== 'undefined') img.title = req.body.title;
    if (req.body && typeof req.body.alt !== 'undefined') img.alt = req.body.alt;
    if (req.body && typeof req.body.isBanner !== 'undefined') {
      const v = req.body.isBanner;
      img.isBanner = v === true || v === 'true' || v === '1' || v === 1;
    }
    if (req.body && typeof req.body.bannerHeading !== 'undefined') img.bannerHeading = req.body.bannerHeading;
    if (req.body && typeof req.body.bannerOrder !== 'undefined') img.bannerOrder = Number(req.body.bannerOrder) || 0;
    
    // Handle isWelcome - only one image can be welcome
    if (req.body && typeof req.body.isWelcome !== 'undefined') {
      const v = req.body.isWelcome;
      const shouldBeWelcome = v === true || v === 'true' || v === '1' || v === 1;
      if (shouldBeWelcome) {
        // Remove welcome flag from all other images
        await HotelImage.updateMany({ _id: { $ne: id } }, { isWelcome: false });
        img.isWelcome = true;
      } else {
        img.isWelcome = false;
      }
    }

    // Handle isCuisineGallery - only one image can be cuisine gallery background
    if (req.body && typeof req.body.isCuisineGallery !== 'undefined') {
      const v = req.body.isCuisineGallery;
      const shouldBeCuisineGallery = v === true || v === 'true' || v === '1' || v === 1;
      if (shouldBeCuisineGallery) {
        // Remove cuisine gallery flag from all other images
        await HotelImage.updateMany({ _id: { $ne: id } }, { isCuisineGallery: false });
        img.isCuisineGallery = true;
      } else {
        img.isCuisineGallery = false;
      }
    }

    // Handle isCuisineCard - can have multiple images in cards
    if (req.body && typeof req.body.isCuisineCard !== 'undefined') {
      const v = req.body.isCuisineCard;
      img.isCuisineCard = v === true || v === 'true' || v === '1' || v === 1;
    }

    // Handle isLoginImage - only one image can be login page image
    if (req.body && typeof req.body.isLoginImage !== 'undefined') {
      const v = req.body.isLoginImage;
      const shouldBeLoginImage = v === true || v === 'true' || v === '1' || v === 1;
      if (shouldBeLoginImage) {
        // Remove login image flag from all other images
        await HotelImage.updateMany({ _id: { $ne: id } }, { isLoginImage: false });
        img.isLoginImage = true;
      } else {
        img.isLoginImage = false;
      }
    }

    // Replace image if provided
    if (req.file && req.file.buffer) {
      const originalName = req.file.originalname || 'upload.jpg';
      const ext = (originalName.match(/\.[^/.]+$/) || ['.jpg'])[0];
      const filename = `${Date.now()}_${originalName.replace(/\.[^/.]+$/, '')}${ext}`;
      const result = await uploadBufferToCloudinary(req.file.buffer, filename, 'pos_hotel_images');

      // delete old from Cloudinary if we have a publicId
      if (img.publicId && cloudinary && cloudinary.uploader && cloudinary.uploader.destroy) {
        try { await cloudinary.uploader.destroy(img.publicId); } catch (_) {}
      }
      img.url = result.secure_url;
      img.publicId = result.public_id || img.publicId || null;
    }

    await img.save();
    console.log('Image updated successfully:', img._id);
    res.json(img);
  } catch (err) {
    console.error('HotelImage update error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const img = await HotelImage.findById(id);
    if (!img) return res.status(404).json({ message: 'Image not found' });

    if (img.publicId && cloudinary && cloudinary.uploader && cloudinary.uploader.destroy) {
      try { await cloudinary.uploader.destroy(img.publicId); } catch (err) { console.warn('Cloudinary destroy error:', err.message); }
    }

    await HotelImage.deleteOne({ _id: id });
    res.json({ message: 'Image deleted' });
  } catch (err) {
    console.error('HotelImage delete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
