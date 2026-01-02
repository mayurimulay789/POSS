const AboutUs = require('../models/AboutUs');

// Validation helper functions
const validateHighlight = (highlight) => {
  const errors = [];
  
  if (!highlight.title || !highlight.title.trim()) {
    errors.push('Highlight title is required');
  } else if (highlight.title.length < 3) {
    errors.push('Highlight title must be at least 3 characters');
  } else if (highlight.title.length > 100) {
    errors.push('Highlight title cannot exceed 100 characters');
  }

  if (!highlight.description || !highlight.description.trim()) {
    errors.push('Highlight description is required');
  } else if (highlight.description.length < 10) {
    errors.push('Highlight description must be at least 10 characters');
  } else if (highlight.description.length > 500) {
    errors.push('Highlight description cannot exceed 500 characters');
  }

  if (!highlight.icon || !highlight.icon.trim()) {
    errors.push('Highlight icon is required');
  }

  return errors;
};

const validateValue = (value) => {
  const errors = [];
  const text = value.text || value;
  
  if (!text || !text.trim()) {
    errors.push('Value text is required');
  } else if (text.length < 5) {
    errors.push('Value text must be at least 5 characters');
  } else if (text.length > 300) {
    errors.push('Value text cannot exceed 300 characters');
  }

  return errors;
};

const validateStat = (stat) => {
  const errors = [];
  
  if (!stat.label || !stat.label.trim()) {
    errors.push('Stat label is required');
  } else if (stat.label.length > 50) {
    errors.push('Stat label cannot exceed 50 characters');
  }

  if (!stat.value || !stat.value.trim()) {
    errors.push('Stat value is required');
  } else if (stat.value.length > 50) {
    errors.push('Stat value cannot exceed 50 characters');
  }

  if (!stat.detail || !stat.detail.trim()) {
    errors.push('Stat detail is required');
  } else if (stat.detail.length < 5) {
    errors.push('Stat detail must be at least 5 characters');
  } else if (stat.detail.length > 100) {
    errors.push('Stat detail cannot exceed 100 characters');
  }

  return errors;
};

const validateAboutUsData = (data) => {
  const errors = {};

  // Main description validation
  if (!data.mainDescription || !data.mainDescription.trim()) {
    errors.mainDescription = 'Main description is required';
  } else if (data.mainDescription.length < 20) {
    errors.mainDescription = 'Main description must be at least 20 characters';
  } else if (data.mainDescription.length > 2000) {
    errors.mainDescription = 'Main description cannot exceed 2000 characters';
  }

  // Rhythm title validation
  if (!data.rhythmTitle || !data.rhythmTitle.trim()) {
    errors.rhythmTitle = 'Rhythm title is required';
  } else if (data.rhythmTitle.length < 5) {
    errors.rhythmTitle = 'Rhythm title must be at least 5 characters';
  } else if (data.rhythmTitle.length > 200) {
    errors.rhythmTitle = 'Rhythm title cannot exceed 200 characters';
  }

  // Rhythm description validation
  if (!data.rhythmDescription || !data.rhythmDescription.trim()) {
    errors.rhythmDescription = 'Rhythm description is required';
  } else if (data.rhythmDescription.length < 20) {
    errors.rhythmDescription = 'Rhythm description must be at least 20 characters';
  } else if (data.rhythmDescription.length > 1000) {
    errors.rhythmDescription = 'Rhythm description cannot exceed 1000 characters';
  }

  // Rhythm quote validation
  if (!data.rhythmQuote || !data.rhythmQuote.trim()) {
    errors.rhythmQuote = 'Rhythm quote is required';
  } else if (data.rhythmQuote.length < 10) {
    errors.rhythmQuote = 'Rhythm quote must be at least 10 characters';
  } else if (data.rhythmQuote.length > 500) {
    errors.rhythmQuote = 'Rhythm quote cannot exceed 500 characters';
  }

  // Highlights validation
  if (!Array.isArray(data.highlights) || data.highlights.length === 0) {
    errors.highlights = 'At least one highlight is required';
  } else {
    const highlightErrors = [];
    data.highlights.forEach((highlight, index) => {
      const hErrors = validateHighlight(highlight);
      if (hErrors.length > 0) {
        highlightErrors.push(`Highlight ${index + 1}: ${hErrors.join(', ')}`);
      }
    });
    if (highlightErrors.length > 0) {
      errors.highlights = highlightErrors.join('; ');
    }
  }

  // Values validation
  if (!Array.isArray(data.values) || data.values.length === 0) {
    errors.values = 'At least one value is required';
  } else {
    const valueErrors = [];
    data.values.forEach((value, index) => {
      const vErrors = validateValue(value);
      if (vErrors.length > 0) {
        valueErrors.push(`Value ${index + 1}: ${vErrors.join(', ')}`);
      }
    });
    if (valueErrors.length > 0) {
      errors.values = valueErrors.join('; ');
    }
  }

  // Stats validation
  if (!Array.isArray(data.stats) || data.stats.length === 0) {
    errors.stats = 'At least one statistic is required';
  } else {
    const statErrors = [];
    data.stats.forEach((stat, index) => {
      const sErrors = validateStat(stat);
      if (sErrors.length > 0) {
        statErrors.push(`Stat ${index + 1}: ${sErrors.join(', ')}`);
      }
    });
    if (statErrors.length > 0) {
      errors.stats = statErrors.join('; ');
    }
  }

  return errors;
};

// @desc    Get active About Us content
// @route   GET /api/about-us
// @access  Public
const getAboutUs = async (req, res) => {
  try {
    console.log('📖 Getting About Us content...');
    const aboutUs = await AboutUs.findOne({ isActive: true })
      .sort({ createdAt: -1 });

    if (!aboutUs) {
      console.log('ℹ️ No active About Us content found');
      return res.status(404).json({
        success: false,
        message: 'About Us content not found'
      });
    }

    console.log('✅ About Us content found');
    res.status(200).json({
      success: true,
      data: aboutUs
    });
  } catch (error) {
    console.error('❌ Error fetching About Us:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching About Us content',
      error: error.message
    });
  }
};

// @desc    Get all About Us versions
// @route   GET /api/about-us/all
// @access  Private/Admin
const getAllAboutUs = async (req, res) => {
  try {
    const aboutUsList = await AboutUs.find()
      .populate('lastUpdatedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: aboutUsList.length,
      data: aboutUsList
    });
  } catch (error) {
    console.error('Error fetching all About Us versions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching About Us versions',
      error: error.message
    });
  }
};

// @desc    Get About Us by ID
// @route   GET /api/about-us/:id
// @access  Private/Admin
const getAboutUsById = async (req, res) => {
  try {
    const aboutUs = await AboutUs.findById(req.params.id)
      .populate('lastUpdatedBy', 'name email');

    if (!aboutUs) {
      return res.status(404).json({
        success: false,
        message: 'About Us content not found'
      });
    }

    res.status(200).json({
      success: true,
      data: aboutUs
    });
  } catch (error) {
    console.error('Error fetching About Us by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching About Us content',
      error: error.message
    });
  }
};

// @desc    Create new About Us content
// @route   POST /api/about-us
// @access  Private/Admin
const createAboutUs = async (req, res) => {
  try {
    const {
      yearEstablished,
      mainTitle,
      mainDescription,
      highlights,
      values,
      stats,
      rhythmTitle,
      rhythmDescription,
      rhythmQuote,
      isActive
    } = req.body;

    // Comprehensive validation
    const validationErrors = validateAboutUsData({
      mainDescription,
      highlights,
      values,
      stats,
      rhythmTitle,
      rhythmDescription,
      rhythmQuote
    });

    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    const aboutUsData = {
      yearEstablished: yearEstablished || new Date().getFullYear().toString(),
      mainTitle: mainTitle || 'About Us',
      mainDescription: mainDescription.trim(),
      highlights: highlights.map(h => ({
        title: h.title.trim(),
        description: h.description.trim(),
        icon: h.icon.trim(),
        order: h.order || 0
      })),
      values: values.map((v, index) => ({
        text: (typeof v === 'string' ? v : v.text).trim(),
        order: v.order || index
      })),
      stats: stats.map((s, index) => ({
        label: s.label.trim(),
        value: s.value.trim(),
        detail: s.detail.trim(),
        order: s.order || index
      })),
      rhythmTitle: rhythmTitle.trim(),
      rhythmDescription: rhythmDescription.trim(),
      rhythmQuote: rhythmQuote.trim(),
      isActive: isActive !== undefined ? isActive : true,
      lastUpdatedBy: req.user._id
    };

    const aboutUs = await AboutUs.create(aboutUsData);

    res.status(201).json({
      success: true,
      message: 'About Us content created successfully',
      data: aboutUs
    });
  } catch (error) {
    console.error('Error creating About Us:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating About Us content',
      error: error.message
    });
  }
};

// @desc    Update About Us content
// @route   PUT /api/about-us/:id
// @access  Private/Admin
const updateAboutUs = async (req, res) => {
  try {
    const {
      yearEstablished,
      mainTitle,
      mainDescription,
      highlights,
      values,
      stats,
      rhythmTitle,
      rhythmDescription,
      rhythmQuote,
      isActive
    } = req.body;

    const aboutUs = await AboutUs.findById(req.params.id);

    if (!aboutUs) {
      return res.status(404).json({
        success: false,
        message: 'About Us content not found'
      });
    }

    // Comprehensive validation
    const validationErrors = validateAboutUsData({
      mainDescription: mainDescription || aboutUs.mainDescription,
      highlights: highlights || aboutUs.highlights,
      values: values || aboutUs.values,
      stats: stats || aboutUs.stats,
      rhythmTitle: rhythmTitle || aboutUs.rhythmTitle,
      rhythmDescription: rhythmDescription || aboutUs.rhythmDescription,
      rhythmQuote: rhythmQuote || aboutUs.rhythmQuote
    });

    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Update fields with validation and trimming
    if (yearEstablished !== undefined) aboutUs.yearEstablished = yearEstablished;
    if (mainTitle !== undefined) aboutUs.mainTitle = mainTitle;
    if (mainDescription !== undefined) aboutUs.mainDescription = mainDescription.trim();
    
    if (highlights !== undefined) {
      aboutUs.highlights = highlights.map(h => ({
        title: h.title.trim(),
        description: h.description.trim(),
        icon: h.icon.trim(),
        order: h.order || 0
      }));
    }
    
    if (values !== undefined) {
      aboutUs.values = values.map((v, index) => ({
        text: (typeof v === 'string' ? v : v.text).trim(),
        order: v.order || index
      }));
    }
    
    if (stats !== undefined) {
      aboutUs.stats = stats.map((s, index) => ({
        label: s.label.trim(),
        value: s.value.trim(),
        detail: s.detail.trim(),
        order: s.order || index
      }));
    }
    
    if (rhythmTitle !== undefined) aboutUs.rhythmTitle = rhythmTitle.trim();
    if (rhythmDescription !== undefined) aboutUs.rhythmDescription = rhythmDescription.trim();
    if (rhythmQuote !== undefined) aboutUs.rhythmQuote = rhythmQuote.trim();
    if (isActive !== undefined) aboutUs.isActive = isActive;
    
    aboutUs.lastUpdatedBy = req.user._id;

    await aboutUs.save();

    res.status(200).json({
      success: true,
      message: 'About Us content updated successfully',
      data: aboutUs
    });
  } catch (error) {
    console.error('Error updating About Us:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating About Us content',
      error: error.message
    });
  }
};;

// @desc    Delete About Us content
// @route   DELETE /api/about-us/:id
// @access  Private/Admin
const deleteAboutUs = async (req, res) => {
  try {
    const aboutUs = await AboutUs.findById(req.params.id);

    if (!aboutUs) {
      return res.status(404).json({
        success: false,
        message: 'About Us content not found'
      });
    }

    await aboutUs.deleteOne();

    res.status(200).json({
      success: true,
      message: 'About Us content deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting About Us:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting About Us content',
      error: error.message
    });
  }
};

// @desc    Set active About Us
// @route   PATCH /api/about-us/:id/activate
// @access  Private/Admin
const activateAboutUs = async (req, res) => {
  try {
    const aboutUs = await AboutUs.findById(req.params.id);

    if (!aboutUs) {
      return res.status(404).json({
        success: false,
        message: 'About Us content not found'
      });
    }

    // Deactivate all other versions
    await AboutUs.updateMany(
      { _id: { $ne: aboutUs._id } },
      { $set: { isActive: false } }
    );

    // Activate this version
    aboutUs.isActive = true;
    aboutUs.lastUpdatedBy = req.user._id;
    await aboutUs.save();

    res.status(200).json({
      success: true,
      message: 'About Us content activated successfully',
      data: aboutUs
    });
  } catch (error) {
    console.error('Error activating About Us:', error);
    res.status(500).json({
      success: false,
      message: 'Error activating About Us content',
      error: error.message
    });
  }
};

// @desc    Add highlight
// @route   POST /api/about-us/:id/highlights
// @access  Private/Admin
const addHighlight = async (req, res) => {
  try {
    const { title, description, icon, order } = req.body;

    if (!title || !description || !icon) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and icon are required'
      });
    }

    const aboutUs = await AboutUs.findById(req.params.id);

    if (!aboutUs) {
      return res.status(404).json({
        success: false,
        message: 'About Us content not found'
      });
    }

    aboutUs.highlights.push({ title, description, icon, order });
    aboutUs.lastUpdatedBy = req.user._id;
    await aboutUs.save();

    res.status(200).json({
      success: true,
      message: 'Highlight added successfully',
      data: aboutUs
    });
  } catch (error) {
    console.error('Error adding highlight:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding highlight',
      error: error.message
    });
  }
};

// @desc    Add value
// @route   POST /api/about-us/:id/values
// @access  Private/Admin
const addValue = async (req, res) => {
  try {
    const { text, order } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Value text is required'
      });
    }

    const aboutUs = await AboutUs.findById(req.params.id);

    if (!aboutUs) {
      return res.status(404).json({
        success: false,
        message: 'About Us content not found'
      });
    }

    aboutUs.values.push({ text, order });
    aboutUs.lastUpdatedBy = req.user._id;
    await aboutUs.save();

    res.status(200).json({
      success: true,
      message: 'Value added successfully',
      data: aboutUs
    });
  } catch (error) {
    console.error('Error adding value:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding value',
      error: error.message
    });
  }
};

// @desc    Add stat
// @route   POST /api/about-us/:id/stats
// @access  Private/Admin
const addStat = async (req, res) => {
  try {
    const { label, value, detail, order } = req.body;

    if (!label || !value || !detail) {
      return res.status(400).json({
        success: false,
        message: 'Label, value, and detail are required'
      });
    }

    const aboutUs = await AboutUs.findById(req.params.id);

    if (!aboutUs) {
      return res.status(404).json({
        success: false,
        message: 'About Us content not found'
      });
    }

    aboutUs.stats.push({ label, value, detail, order });
    aboutUs.lastUpdatedBy = req.user._id;
    await aboutUs.save();

    res.status(200).json({
      success: true,
      message: 'Stat added successfully',
      data: aboutUs
    });
  } catch (error) {
    console.error('Error adding stat:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding stat',
      error: error.message
    });
  }
};

module.exports = {
  getAboutUs,
  getAllAboutUs,
  getAboutUsById,
  createAboutUs,
  updateAboutUs,
  deleteAboutUs,
  activateAboutUs,
  addHighlight,
  addValue,
  addStat
};
