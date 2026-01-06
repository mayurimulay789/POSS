const Footer = require('../models/Footer');

// Get all footers (for management)
exports.getAllFooters = async (req, res) => {
  try {
    const footers = await Footer.find().sort({ createdAt: -1 });
    res.json(footers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get active footer (public)
exports.getFooter = async (req, res) => {
  try {
    const footer = await Footer.findOne({ isActive: true });
    if (!footer) {
      return res.status(404).json({ message: 'No active footer found' });
    }
    res.json(footer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get footer by ID
exports.getFooterById = async (req, res) => {
  try {
    const footer = await Footer.findById(req.params.id);
    if (!footer) {
      return res.status(404).json({ message: 'Footer not found' });
    }
    res.json(footer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new footer
exports.createFooter = async (req, res) => {
  try {
    const footer = await Footer.create(req.body);
    res.status(201).json(footer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update footer
exports.updateFooter = async (req, res) => {
  try {
    const footer = await Footer.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastUpdated: Date.now() },
      { new: true, runValidators: true }
    );
    if (!footer) {
      return res.status(404).json({ message: 'Footer not found' });
    }
    res.json(footer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete footer
exports.deleteFooter = async (req, res) => {
  try {
    const footer = await Footer.findByIdAndDelete(req.params.id);
    if (!footer) {
      return res.status(404).json({ message: 'Footer not found' });
    }
    res.json({ message: 'Footer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle footer status
exports.toggleFooterStatus = async (req, res) => {
  try {
    const footer = await Footer.findById(req.params.id);
    if (!footer) {
      return res.status(404).json({ message: 'Footer not found' });
    }
    
    const newStatus = !footer.isActive;
    
    // If activating, deactivate all others first
    if (newStatus === true) {
      await Footer.updateMany(
        { _id: { $ne: req.params.id } },
        { $set: { isActive: false } }
      );
    }
    
    footer.isActive = newStatus;
    await footer.save();
    
    res.json(footer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
