const Space = require('../models/Space');


// Create a new space
exports.createSpace = async (req, res) => {
  try {
    const { spaceName, capacity, spaceType, status, isReserved, spaceImage } = req.body;
    if (!spaceName || !capacity || !spaceType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide spaceName, capacity, and spaceType'
      });
    }
    const space = await Space.create({
      spaceName,
      capacity,
      spaceType,
      status,
      isReserved,
      spaceImage,
      createdBy: req.user._id
    });
    res.status(201).json({
      success: true,
      message: 'Space created successfully',
      data: space
    });
  } catch (error) {
    console.error('Error creating space:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating space',
      error: error.message
    });
  }
};

// Get all spaces
exports.getSpaces = async (req, res) => {
  try {
    const { spaceType } = req.query;
    const filter = {};
    if (spaceType) filter.spaceType = spaceType;
    const spaces = await Space.find(filter)
      .populate({ path: 'createdBy', select: 'FullName role email' })
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: spaces.length,
      data: spaces
    });
  } catch (error) {
    console.error('Error fetching spaces:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching spaces',
      error: error.message
    });
  }
};

// Get a single space by id
exports.getSpaceById = async (req, res) => {
  try {
    const { id } = req.params;
    const space = await Space.findById(id);
    if (!space) {
      return res.status(404).json({
        success: false,
        message: 'Space not found'
      });
    }
    res.status(200).json({
      success: true,
      data: space
    });
  } catch (error) {
    console.error('Error fetching space:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching space',
      error: error.message
    });
  }
};

// Update a space
exports.updateSpace = async (req, res) => {
  try {
    const { id } = req.params;
    const { spaceName, capacity, status, spaceType, isReserved, spaceImage } = req.body;
    let space = await Space.findById(id);
    if (!space) {
      return res.status(404).json({
        success: false,
        message: 'Space not found'
      });
    }
    if (spaceName) space.spaceName = spaceName;
    if (capacity) space.capacity = capacity;
    if (status) space.status = status;
    if (spaceType) space.spaceType = spaceType;
    if (isReserved !== undefined) space.isReserved = isReserved;
    if (spaceImage) space.spaceImage = spaceImage;
    await space.save();
    res.status(200).json({
      success: true,
      message: 'Space updated successfully',
      data: space
    });
  } catch (error) {
    console.error('Error updating space:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating space',
      error: error.message
    });
  }
};

// Delete a space
exports.deleteSpace = async (req, res) => {
  try {
    const { id } = req.params;
    const space = await Space.findByIdAndDelete(id);
    if (!space) {
      return res.status(404).json({
        success: false,
        message: 'Space not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Space deleted'
    });
  } catch (error) {
    console.error('Error deleting space:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting space',
      error: error.message
    });
  }
};
