const CuisineGallery = require('../models/CuisineGallery');

// @desc    Get active cuisine gallery
// @route   GET /api/cuisine-gallery
// @access  Public
const getCuisineGallery = async (req, res) => {
  try {
    const cuisineGallery = await CuisineGallery.findOne({ isActive: true });

    if (!cuisineGallery) {
      return res.status(404).json({
        success: false,
        message: 'Cuisine gallery not found'
      });
    }

    res.status(200).json({
      success: true,
      data: cuisineGallery
    });
  } catch (error) {
    console.error('Error fetching cuisine gallery:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cuisine gallery',
      error: error.message
    });
  }
};

// @desc    Create/Update cuisine gallery
// @route   POST /api/cuisine-gallery
// @access  Private/Merchant
const createOrUpdateCuisineGallery = async (req, res) => {
  try {
    const { heading, subheading, description } = req.body;

    if (!heading) {
      return res.status(400).json({
        success: false,
        message: 'Heading is required'
      });
    }

    // Find existing active cuisine gallery
    const existingGallery = await CuisineGallery.findOne({ isActive: true });

    if (existingGallery) {
      // Update existing
      existingGallery.heading = heading;
      existingGallery.subheading = subheading || '';
      existingGallery.description = description || '';
      await existingGallery.save();

      return res.status(200).json({
        success: true,
        message: 'Cuisine gallery updated successfully',
        data: existingGallery
      });
    }

    // Create new
    const newGallery = new CuisineGallery({
      heading,
      subheading: subheading || '',
      description: description || '',
      isActive: true
    });

    await newGallery.save();

    res.status(201).json({
      success: true,
      message: 'Cuisine gallery created successfully',
      data: newGallery
    });
  } catch (error) {
    console.error('Error creating/updating cuisine gallery:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating/updating cuisine gallery',
      error: error.message
    });
  }
};

module.exports = {
  getCuisineGallery,
  createOrUpdateCuisineGallery
};
