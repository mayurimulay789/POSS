const WelcomeSection = require('../models/WelcomeSection');

// @desc    Get all welcome sections
// @route   GET /api/welcome-section/all
// @access  Private/Merchant
const getAllWelcomeSections = async (req, res) => {
  try {
    const welcomeSections = await WelcomeSection.find()
      .populate('lastUpdatedBy', 'FullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: welcomeSections.length,
      data: welcomeSections
    });
  } catch (error) {
    console.error('Error fetching welcome sections:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching welcome sections',
      error: error.message
    });
  }
};

// @desc    Get active welcome section
// @route   GET /api/welcome-section
// @access  Public
const getWelcomeSection = async (req, res) => {
  try {
    const welcomeSection = await WelcomeSection.findOne({ isActive: true })
      .populate('lastUpdatedBy', 'FullName email');

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

// @desc    Get single welcome section by ID
// @route   GET /api/welcome-section/:id
// @access  Private/Merchant
const getWelcomeSectionById = async (req, res) => {
  try {
    const welcomeSection = await WelcomeSection.findById(req.params.id)
      .populate('lastUpdatedBy', 'FullName email');

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

// @desc    Create welcome section
// @route   POST /api/welcome-section
// @access  Private/Merchant
const createWelcomeSection = async (req, res) => {
  try {
    const { hotelName, description } = req.body;

    if (!hotelName || !description) {
      return res.status(400).json({
        success: false,
        message: 'Hotel name and description are required'
      });
    }

    const welcomeSection = await WelcomeSection.create({
      hotelName,
      description,
      isActive: false,
      lastUpdatedBy: req.user._id
    });

    await welcomeSection.populate('lastUpdatedBy', 'FullName email');

    res.status(201).json({
      success: true,
      message: 'Welcome section created successfully',
      data: welcomeSection
    });
  } catch (error) {
    console.error('Error creating welcome section:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating welcome section',
      error: error.message
    });
  }
};

// @desc    Update welcome section
// @route   PUT /api/welcome-section/:id
// @access  Private/Merchant
const updateWelcomeSection = async (req, res) => {
  try {
    const { hotelName, description, isActive } = req.body;

    let welcomeSection = await WelcomeSection.findById(req.params.id);

    if (!welcomeSection) {
      return res.status(404).json({
        success: false,
        message: 'Welcome section not found'
      });
    }

    // Update fields
    welcomeSection.hotelName = hotelName || welcomeSection.hotelName;
    welcomeSection.description = description || welcomeSection.description;
    welcomeSection.lastUpdatedBy = req.user._id;

    if (isActive !== undefined) {
      // If activating this section, deactivate all others first
      if (isActive === true) {
        await WelcomeSection.updateMany(
          { _id: { $ne: req.params.id } },
          { $set: { isActive: false } }
        );
      }
      welcomeSection.isActive = isActive;
    }

    await welcomeSection.save();
    await welcomeSection.populate('lastUpdatedBy', 'FullName email');

    res.status(200).json({
      success: true,
      message: 'Welcome section updated successfully',
      data: welcomeSection
    });
  } catch (error) {
    console.error('Error updating welcome section:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating welcome section',
      error: error.message
    });
  }
};

// @desc    Delete welcome section
// @route   DELETE /api/welcome-section/:id
// @access  Private/Merchant
const deleteWelcomeSection = async (req, res) => {
  try {
    const welcomeSection = await WelcomeSection.findById(req.params.id);

    if (!welcomeSection) {
      return res.status(404).json({
        success: false,
        message: 'Welcome section not found'
      });
    }

    await welcomeSection.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Welcome section deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting welcome section:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting welcome section',
      error: error.message
    });
  }
};

// @desc    Toggle welcome section active status
// @route   PATCH /api/welcome-section/:id/toggle
// @access  Private/Merchant
const toggleWelcomeSectionStatus = async (req, res) => {
  try {
    const welcomeSection = await WelcomeSection.findById(req.params.id);

    if (!welcomeSection) {
      return res.status(404).json({
        success: false,
        message: 'Welcome section not found'
      });
    }

    const newStatus = !welcomeSection.isActive;

    // If activating this section, deactivate all others first
    if (newStatus === true) {
      await WelcomeSection.updateMany(
        { _id: { $ne: req.params.id } },
        { $set: { isActive: false } }
      );
    }

    welcomeSection.isActive = newStatus;
    welcomeSection.lastUpdatedBy = req.user._id;
    await welcomeSection.save();
    await welcomeSection.populate('lastUpdatedBy', 'FullName email');

    res.status(200).json({
      success: true,
      message: `Welcome section ${welcomeSection.isActive ? 'activated' : 'deactivated'} successfully`,
      data: welcomeSection
    });
  } catch (error) {
    console.error('Error toggling welcome section status:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling welcome section status',
      error: error.message
    });
  }
};

module.exports = {
  getAllWelcomeSections,
  getWelcomeSection,
  getWelcomeSectionById,
  createWelcomeSection,
  updateWelcomeSection,
  deleteWelcomeSection,
  toggleWelcomeSectionStatus
};
