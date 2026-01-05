const CuisineGallery = require('../models/CuisineGallery');

// @desc    Get all cuisine galleries
// @route   GET /api/cuisine-gallery/all
// @access  Private/Merchant
const getAllCuisineGalleries = async (req, res) => {
  try {
    const cuisineGalleries = await CuisineGallery.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: cuisineGalleries.length,
      data: cuisineGalleries
    });
  } catch (error) {
    console.error('Error fetching cuisine galleries:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cuisine galleries',
      error: error.message
    });
  }
};

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

// @desc    Get single cuisine gallery by ID
// @route   GET /api/cuisine-gallery/:id
// @access  Private/Merchant
const getCuisineGalleryById = async (req, res) => {
  try {
    const cuisineGallery = await CuisineGallery.findById(req.params.id);

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

// @desc    Create cuisine gallery
// @route   POST /api/cuisine-gallery
// @access  Private/Merchant
const createCuisineGallery = async (req, res) => {
  try {
    const { heading, subheading } = req.body;

    if (!heading) {
      return res.status(400).json({
        success: false,
        message: 'Heading is required'
      });
    }

    // Create new
    const newGallery = new CuisineGallery({
      heading,
      subheading: subheading || '',
      isActive: false
    });

    await newGallery.save();

    res.status(201).json({
      success: true,
      message: 'Cuisine gallery created successfully',
      data: newGallery
    });
  } catch (error) {
    console.error('Error creating cuisine gallery:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating cuisine gallery',
      error: error.message
    });
  }
};

// @desc    Update cuisine gallery
// @route   PUT /api/cuisine-gallery/:id
// @access  Private/Merchant
const updateCuisineGallery = async (req, res) => {
  try {
    const { heading, subheading, isActive } = req.body;

    let cuisineGallery = await CuisineGallery.findById(req.params.id);

    if (!cuisineGallery) {
      return res.status(404).json({
        success: false,
        message: 'Cuisine gallery not found'
      });
    }

    // Update fields
    cuisineGallery.heading = heading || cuisineGallery.heading;
    cuisineGallery.subheading = subheading !== undefined ? subheading : cuisineGallery.subheading;
    
    if (isActive !== undefined) {
      // If activating this gallery, deactivate all others first
      if (isActive === true) {
        await CuisineGallery.updateMany(
          { _id: { $ne: req.params.id } },
          { $set: { isActive: false } }
        );
      }
      cuisineGallery.isActive = isActive;
    }

    await cuisineGallery.save();

    res.status(200).json({
      success: true,
      message: 'Cuisine gallery updated successfully',
      data: cuisineGallery
    });
  } catch (error) {
    console.error('Error updating cuisine gallery:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating cuisine gallery',
      error: error.message
    });
  }
};

// @desc    Delete cuisine gallery
// @route   DELETE /api/cuisine-gallery/:id
// @access  Private/Merchant
const deleteCuisineGallery = async (req, res) => {
  try {
    const cuisineGallery = await CuisineGallery.findById(req.params.id);

    if (!cuisineGallery) {
      return res.status(404).json({
        success: false,
        message: 'Cuisine gallery not found'
      });
    }

    await cuisineGallery.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Cuisine gallery deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting cuisine gallery:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting cuisine gallery',
      error: error.message
    });
  }
};

// @desc    Toggle cuisine gallery active status
// @route   PATCH /api/cuisine-gallery/:id/toggle
// @access  Private/Merchant
const toggleCuisineGalleryStatus = async (req, res) => {
  try {
    const cuisineGallery = await CuisineGallery.findById(req.params.id);

    if (!cuisineGallery) {
      return res.status(404).json({
        success: false,
        message: 'Cuisine gallery not found'
      });
    }

    const newStatus = !cuisineGallery.isActive;

    // If activating this gallery, deactivate all others first
    if (newStatus === true) {
      await CuisineGallery.updateMany(
        { _id: { $ne: req.params.id } },
        { $set: { isActive: false } }
      );
    }

    cuisineGallery.isActive = newStatus;
    await cuisineGallery.save();

    res.status(200).json({
      success: true,
      message: `Cuisine gallery ${cuisineGallery.isActive ? 'activated' : 'deactivated'} successfully`,
      data: cuisineGallery
    });
  } catch (error) {
    console.error('Error toggling cuisine gallery status:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling cuisine gallery status',
      error: error.message
    });
  }
};

module.exports = {
  getAllCuisineGalleries,
  getCuisineGallery,
  getCuisineGalleryById,
  createCuisineGallery,
  updateCuisineGallery,
  deleteCuisineGallery,
  toggleCuisineGalleryStatus
};
