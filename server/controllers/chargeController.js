const Charge = require('../models/Charge');

// @desc    Create a new charge
// @route   POST /api/charges
// @access  Private (Admin, Manager)
exports.createCharge = async (req, res) => {
  try {
    const { chargeName, chargeType, value, category, active = true } = req.body;

    // Validation
    if (!chargeName || !chargeType || value === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: 'Charge name, type, value, and category are required'
      });
    }

    // Validate charge type
    if (!['percentage', 'fixed'].includes(chargeType)) {
      return res.status(400).json({
        success: false,
        message: 'Charge type must be either "percentage" or "fixed"'
      });
    }

    // Validate category
    if (!['systemcharge', 'optionalcharge'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Category must be either "systemcharge" or "optionalcharge"'
      });
    }

    // Validate value based on type
    if (chargeType === 'percentage' && (value < 0 || value > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Percentage value must be between 0 and 100'
      });
    }

    if (chargeType === 'fixed' && value < 0) {
      return res.status(400).json({
        success: false,
        message: 'Fixed value cannot be negative'
      });
    }

    // Check if charge with same name already exists
    const existingCharge = await Charge.findOne({ chargeName });
    if (existingCharge) {
      return res.status(400).json({
        success: false,
        message: 'Charge with this name already exists'
      });
    }

    // Create charge
    const charge = await Charge.create({
      chargeName,
      chargeType,
      value,
      category,
      active,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: charge,
      message: 'Charge created successfully'
    });

  } catch (error) {
    console.error('Create charge error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Charge name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while creating charge'
    });
  }
};

// @desc    Get all charges (admin view)
// @route   GET /api/charges
// @access  Private (Admin, Manager)
// @desc    Get all charges (admin view)
// @route   GET /api/charges
// @access  Private (Admin, Manager)
exports.getAllCharges = async (req, res) => {
  try {
    const { 
      category, 
      active, 
      search, 
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = {};
    
    // Filter by category (only if not empty string)
    if (category && category.trim() !== '' && ['systemcharge', 'optionalcharge'].includes(category)) {
      query.category = category;
    }
    
    // Filter by active status (only if explicitly provided)
    if (active !== undefined && active !== '') {
      query.active = active === 'true';
    }
    
    // Search by charge name (case-insensitive)
    if (search && search.trim() !== '') {
      query.chargeName = { 
        $regex: search, 
        $options: 'i' 
      };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Sort configuration
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const charges = await Charge.find(query)
      .populate('createdBy', 'FullName email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Charge.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    console.log('Charges fetched:', {
      count: charges.length,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      filters: query
    });

    res.status(200).json({
      success: true,
      count: charges.length,
      total,
      totalPages,
      currentPage: parseInt(page),
      data: charges
    });

  } catch (error) {
    console.error('Get all charges error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching charges'
    });
  }
};

// @desc    Get single charge by ID
// @route   GET /api/charges/:id
// @access  Private (Admin, Manager)
exports.getChargeById = async (req, res) => {
  try {
    const charge = await Charge.findById(req.params.id)
      .populate('createdBy', 'FullName email');

    if (!charge) {
      return res.status(404).json({
        success: false,
        message: 'Charge not found'
      });
    }

    res.status(200).json({
      success: true,
      data: charge
    });

  } catch (error) {
    console.error('Get charge by ID error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Charge not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching charge'
    });
  }
};

// @desc    Update charge
// @route   PUT /api/charges/:id
// @access  Private (Admin, Manager)
exports.updateCharge = async (req, res) => {
  try {
    let charge = await Charge.findById(req.params.id);

    if (!charge) {
      return res.status(404).json({
        success: false,
        message: 'Charge not found'
      });
    }

    const { chargeName, chargeType, value, category, active } = req.body;

    // If charge name is being updated, check for duplicates
    if (chargeName && chargeName !== charge.chargeName) {
      const existingCharge = await Charge.findOne({ chargeName });
      if (existingCharge) {
        return res.status(400).json({
          success: false,
          message: 'Charge with this name already exists'
        });
      }
    }

    // Update charge
    Object.assign(charge, req.body);
    await charge.save();

    res.status(200).json({
      success: true,
      data: charge,
      message: 'Charge updated successfully'
    });

  } catch (error) {
    console.error('Update charge error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Charge not found'
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Charge name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while updating charge'
    });
  }
};

// @desc    Delete charge
// @route   DELETE /api/charges/:id
// @access  Private (Admin, Manager)
exports.deleteCharge = async (req, res) => {
  try {
    const charge = await Charge.findById(req.params.id);

    if (!charge) {
      return res.status(404).json({
        success: false,
        message: 'Charge not found'
      });
    }

    await charge.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Charge deleted successfully'
    });

  } catch (error) {
    console.error('Delete charge error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Charge not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while deleting charge'
    });
  }
};

// @desc    Toggle charge active status
// @route   PATCH /api/charges/:id/status
// @access  Private (Admin, Manager)
exports.toggleChargeStatus = async (req, res) => {
  try {
    const { active } = req.body;
    console.log('Toggle charge status request body:', req.body);

    if (active === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Active status is required'
      });
    }

    const charge = await Charge.findById(req.params.id);

    if (!charge) {
      return res.status(404).json({
        success: false,
        message: 'Charge not found'
      });
    }

    charge.active = active;
    await charge.save();

    res.status(200).json({
      success: true,
      data: charge,
      message: `Charge ${active ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error) {
    console.error('Toggle charge status error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Charge not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while updating charge status'
    });
  }
};

// @desc    Get active system charges
// @route   GET /api/charges/system
// @access  Private (All authenticated users)
exports.getSystemCharges = async (req, res) => {
  try {
    const systemCharges = await Charge.find({
      category: 'systemcharge',
      active: true
    }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: systemCharges.length,
      data: systemCharges
    });

  } catch (error) {
    console.error('Get system charges error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching system charges'
    });
  }
};

// @desc    Get active optional charges
// @route   GET /api/charges/optional
// @access  Private (All authenticated users)
exports.getOptionalCharges = async (req, res) => {
  try {
    const optionalCharges = await Charge.find({
      category: 'optionalcharge',
      active: true
    }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: optionalCharges.length,
      data: optionalCharges
    });

  } catch (error) {
    console.error('Get optional charges error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching optional charges'
    });
  }
};

// @desc    Get system charges summary
// @route   GET /api/charges/system/summary
// @access  Private (All authenticated users)
exports.getSystemChargesSummary = async (req, res) => {
  try {
    // Get all active system charges
    const systemCharges = await Charge.find({
      category: 'systemcharge',
      active: true
    });

    // Calculate total system charge rate (only percentage charges)
    let totalSystemChargeRate = 0;
    let totalSystemChargesAmount = 0;
    
    systemCharges.forEach(charge => {
      if (charge.chargeType === 'percentage') {
        totalSystemChargeRate += charge.value;
      }
      else if (charge.chargeType === 'fixed') {
        totalSystemChargesAmount += charge.value;
      }
    });



    res.status(200).json({
      success: true,
      systemchargeSummary: {
        totalSystemChargeRate: totalSystemChargeRate,
        totalSystemChargesAmount: totalSystemChargesAmount
      }
    });

  } catch (error) {
    console.error('Get system charges summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while calculating system charges summary'
    });
  }
};