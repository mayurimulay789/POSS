const WelcomeSection = require('../models/WelcomeSection');

// @desc    Get active welcome section
// @route   GET /api/welcome-section
// @access  Public
const getWelcomeSection = async (req, res) => {
  try {
    const welcomeSection = await WelcomeSection.findOne({ isActive: true });

    if (!welcomeSection) {
      return res.status(404).json({
        success: false,
        message: 'Welcome section not found'
      });
    }

    res.status(200).json({
      success: true,
      data: welcomeSection
    });
  } catch (error) {
    console.error('Error fetching welcome section:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching welcome section',
      error: error.message
    });
  }
};

// @desc    Create/Update welcome section
// @route   POST /api/welcome-section
// @access  Private/Merchant
const createOrUpdateWelcomeSection = async (req, res) => {
  try {
    const { hotelName, tagline, description } = req.body;

    if (!hotelName || !tagline || !description) {
      return res.status(400).json({
        success: false,
        message: 'Hotel name, tagline, and description are required'
      });
    }

    // Find existing active welcome section
    const existingSection = await WelcomeSection.findOne({ isActive: true });

    if (existingSection) {
      // Update existing
      existingSection.hotelName = hotelName;
      existingSection.tagline = tagline;
      existingSection.description = description;
      existingSection.lastUpdatedBy = req.user._id;
      await existingSection.save();

      return res.status(200).json({
        success: true,
        message: 'Welcome section updated successfully',
        data: existingSection
      });
    } else {
      // Create new
      const welcomeSection = await WelcomeSection.create({
        hotelName,
        tagline,
        description,
        isActive: true,
        lastUpdatedBy: req.user._id
      });

      return res.status(201).json({
        success: true,
        message: 'Welcome section created successfully',
        data: welcomeSection
      });
    }
  } catch (error) {
    console.error('Error saving welcome section:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving welcome section',
      error: error.message
    });
  }
};

module.exports = {
  getWelcomeSection,
  createOrUpdateWelcomeSection
};
