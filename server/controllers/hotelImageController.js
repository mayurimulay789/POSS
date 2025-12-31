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
    const img = await HotelImage.findById(id);
    if (!img) return res.status(404).json({ message: 'Image not found' });

    // Update text fields
    if (typeof req.body.title !== 'undefined') img.title = req.body.title;
    if (typeof req.body.alt !== 'undefined') img.alt = req.body.alt;
    if (typeof req.body.isBanner !== 'undefined') {
      const v = req.body.isBanner;
      img.isBanner = v === true || v === 'true' || v === '1' || v === 1;
    }
    if (typeof req.body.bannerHeading !== 'undefined') img.bannerHeading = req.body.bannerHeading;
    if (typeof req.body.bannerOrder !== 'undefined') img.bannerOrder = Number(req.body.bannerOrder) || 0;
    
    // Handle isWelcome - only one image can be welcome
    if (typeof req.body.isWelcome !== 'undefined') {
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
    if (typeof req.body.isCuisineGallery !== 'undefined') {
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
    if (typeof req.body.isCuisineCard !== 'undefined') {
      const v = req.body.isCuisineCard;
      img.isCuisineCard = v === true || v === 'true' || v === '1' || v === 1;
    }

    // Handle isLoginImage - only one image can be login page image
    if (typeof req.body.isLoginImage !== 'undefined') {
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
    res.json(img);
  } catch (err) {
    console.error('HotelImage update error:', err);
    res.status(500).json({ message: 'Server error' });
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
