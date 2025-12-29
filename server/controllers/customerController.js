const Customer = require('../models/Customer');
const mongoose = require('mongoose');

/**
 * @desc    Create a new customer
 * @route   POST /api/customers
 * @access  Private
 */
exports.createCustomer = async (req, res) => {
  try {
    const { 
      cust_name, 
      email, 
      phone, 
      address,
      membership_type = 'none',
      status = 'active'
    } = req.body;

    console.log('Create customer request body:', req.body);

    // Validation
    if (!cust_name || !email || !phone) {
      console.log('Validation failed: Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Customer name, email, and phone are required'
      });
    }

    // Check if email already exists
    const emailExists = await Customer.emailExists(email);
    if (emailExists) {
      console.log('Validation failed: Email already exists');
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Check if phone already exists
    const phoneExists = await Customer.phoneExists(phone);
    if (phoneExists) {
      console.log('Validation failed: Phone number already exists');
      return res.status(400).json({
        success: false,
        message: 'Phone number already exists'
      });
    }

    // Validate membership type
    const validMembershipTypes = ['none', 'basic', 'premium', 'gold', 'platinum'];
    if (!validMembershipTypes.includes(membership_type)) {
      console.log('Validation failed: Invalid membership type');
      return res.status(400).json({
        success: false,
        message: 'Invalid membership type'
      });
    }

    // Create customer
    const customer = await Customer.create({
      cust_name,
      email,
      phone,
      address: address || {},
      membership_type,
      status,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: customer,
      message: 'Customer created successfully'
    });

  } catch (error) {
    console.log('Error creating customer:', error);
    console.error('Create customer error:', error);
    
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
        message: 'Duplicate field value entered'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while creating customer'
    });
  }
};

/**
 * @desc    Get all customers
 * @route   GET /api/customers
 * @access  Private
 */
exports.getCustomers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      membership_type, 
      city, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;
    
    // Build query
    let query = {};
    
    // Status filter
    if (status) {
      query.status = status;
    }
    
    // Membership type filter
    if (membership_type) {
      query.membership_type = membership_type;
    }
    
    // City filter
    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }
    
    // Search filter (name, email, phone, membership_id)
    if (search) {
      query.$or = [
        { cust_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { membership_id: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const customers = await Customer.find(query)
      .populate('createdBy', 'FullName email role')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(); // Use lean() for better performance

    // Add virtual fields manually for lean documents
    customers.forEach(customer => {
      customer.is_membership_valid = customer.membership_validity 
        ? new Date(customer.membership_validity) > new Date() 
        : false;
    });

    const total = await Customer.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Get statistics for list view (simple version)
    const listStats = await Customer.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalActive: { 
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } 
          },
          totalWithMembership: {
            $sum: { $cond: [{ $ne: ['$membership_type', 'none'] }, 1, 0] }
          },
          totalExpiredMembership: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$membership_type', 'none'] },
                    { $lt: ['$membership_validity', new Date()] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: customers.length,
      total,
      totalPages,
      currentPage: parseInt(page),
      listStats: listStats[0] || { // Changed from 'stats' to 'listStats'
        totalActive: 0,
        totalWithMembership: 0,
        totalExpiredMembership: 0
      },
      data: customers
    });

  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching customers'
    });
  }
};

/**
 * @desc    Get customers created by current user
 * @route   GET /api/customers/my-customers
 * @access  Private
 */
exports.getMyCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = { createdBy: req.user._id };

    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Customer.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      count: customers.length,
      total,
      totalPages,
      currentPage: parseInt(page),
      data: customers
    });

  } catch (error) {
    console.error('Get my customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your customers'
    });
  }
};

/**
 * @desc    Get customers by membership type
 * @route   GET /api/customers/membership/:type
 * @access  Private
 */
exports.getCustomersByMembershipType = async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const validTypes = ['none', 'basic', 'premium', 'gold', 'platinum'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid membership type'
      });
    }

    const query = { membership_type: type };

    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Customer.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      count: customers.length,
      total,
      totalPages,
      currentPage: parseInt(page),
      membership_type: type,
      data: customers
    });

  } catch (error) {
    console.error('Get customers by membership type error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching customers by membership type'
    });
  }
};

/**
 * @desc    Search customers
 * @route   GET /api/customers/search
 * @access  Private
 */
exports.searchCustomers = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const query = {
      $or: [
        { cust_name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { membership_id: { $regex: q, $options: 'i' } }
      ]
    };

    const customers = await Customer.find(query)
      .select('cust_name email phone membership_id membership_type status')
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers
    });

  } catch (error) {
    console.error('Search customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching customers'
    });
  }
};

/**
 * @desc    Get single customer
 * @route   GET /api/customers/:id
 * @access  Private
 */
exports.getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('createdBy', 'FullName email role');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: customer
    });

  } catch (error) {
    console.error('Get customer error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching customer'
    });
  }
};

/**
 * @desc    Update customer
 * @route   PUT /api/customers/:id
 * @access  Private
 */
exports.updateCustomer = async (req, res) => {
  try {
    let customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check if user is authorized to update (creator or higher roles)
    if (req.user.role !== 'merchant' && 
        req.user.role !== 'manager' && 
        req.user.role !== 'supervisor' &&
        customer.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this customer'
      });
    }

    // Check for duplicate email if email is being updated
    if (req.body.email && req.body.email !== customer.email) {
      const emailExists = await Customer.emailExists(req.body.email);
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Check for duplicate phone if phone is being updated
    if (req.body.phone && req.body.phone !== customer.phone) {
      const phoneExists = await Customer.phoneExists(req.body.phone);
      if (phoneExists) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already exists'
        });
      }
    }

    // Update customer
    const updatedFields = req.body;
    
    // Handle address updates properly
    if (updatedFields.address) {
      customer.address = { ...customer.address.toObject(), ...updatedFields.address };
      delete updatedFields.address;
    }

    Object.assign(customer, updatedFields);
    await customer.save();

    // Populate before returning
    const updatedCustomer = await Customer.findById(customer._id)
      .populate('createdBy', 'FullName email role');

    res.status(200).json({
      success: true,
      data: updatedCustomer,
      message: 'Customer updated successfully'
    });

  } catch (error) {
    console.error('Update customer error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
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
        message: 'Duplicate field value entered'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while updating customer'
    });
  }
};

/**
 * @desc    Delete customer
 * @route   DELETE /api/customers/:id
 * @access  Private (merchant, manager, supervisor)
 */
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    await customer.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully'
    });

  } catch (error) {
    console.error('Delete customer error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while deleting customer'
    });
  }
};

/**
 * @desc    Toggle customer status
 * @route   PATCH /api/customers/:id/status
 * @access  Private (merchant, manager, supervisor)
 */
exports.toggleCustomerStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['active', 'inactive', 'suspended', 'blocked'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required: active, inactive, suspended, or blocked'
      });
    }

    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    customer.status = status;
    await customer.save();

    res.status(200).json({
      success: true,
      data: customer,
      message: `Customer status updated to ${status}`
    });

  } catch (error) {
    console.error('Toggle customer status error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while updating customer status'
    });
  }
};

/**
 * @desc    Renew customer membership
 * @route   PATCH /api/customers/:id/renew-membership
 * @access  Private (merchant, manager)
 */
exports.renewMembership = async (req, res) => {
  try {
    const { months = 12 } = req.body;

    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    if (customer.membership_type === 'none') {
      return res.status(400).json({
        success: false,
        message: 'Customer does not have a membership'
      });
    }

    await customer.renewMembership(months);

    res.status(200).json({
      success: true,
      data: customer,
      message: `Membership renewed for ${months} months`
    });

  } catch (error) {
    console.error('Renew membership error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while renewing membership'
    });
  }
};

/**
 * @desc    Get customer statistics
 * @route   GET /api/customers/stats
 * @access  Private
 */
exports.getCustomerStats = async (req, res) => {
  try {
    const stats = await Customer.aggregate([
      {
        $facet: {
          // Total counts
          totals: [
            {
              $group: {
                _id: null,
                totalCustomers: { $sum: 1 },
                totalActive: { 
                  $sum: { 
                    $cond: [
                      { $eq: ['$status', 'active'] }, 
                      1, 
                      0
                    ] 
                  } 
                },
                totalInactive: {
                  $sum: {
                    $cond: [
                      { $eq: ['$status', 'inactive'] },
                      1,
                      0
                    ]
                  }
                },
                totalSuspended: {
                  $sum: {
                    $cond: [
                      { $eq: ['$status', 'suspended'] },
                      1,
                      0
                    ]
                  }
                },
                totalBlocked: {
                  $sum: {
                    $cond: [
                      { $eq: ['$status', 'blocked'] },
                      1,
                      0
                    ]
                  }
                }
              }
            }
          ],
          
          // Membership breakdown
          membershipStats: [
            {
              $group: {
                _id: '$membership_type',
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1 } }
          ],
          
          // Membership validity stats
          membershipValidity: [
            {
              $match: {
                membership_type: { $ne: 'none' }
              }
            },
            {
              $group: {
                _id: null,
                totalWithMembership: { $sum: 1 },
                validMemberships: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $ne: ['$membership_validity', null] },
                          { $gt: ['$membership_validity', new Date()] }
                        ]
                      },
                      1,
                      0
                    ]
                  }
                },
                expiredMemberships: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $ne: ['$membership_validity', null] },
                          { $lt: ['$membership_validity', new Date()] }
                        ]
                      },
                      1,
                      0
                    ]
                  }
                }
              }
            }
          ]
        }
      }
    ]);

    // Process and format the stats
    const result = stats[0] || {};
    
    // Extract totals
    const totals = result.totals?.[0] || {
      totalCustomers: 0,
      totalActive: 0,
      totalInactive: 0,
      totalSuspended: 0,
      totalBlocked: 0
    };
    
    // Extract membership validity
    const membershipValidity = result.membershipValidity?.[0] || {
      totalWithMembership: 0,
      validMemberships: 0,
      expiredMemberships: 0
    };

    // Format membership stats
    const membershipStats = result.membershipStats || [];
    
    // Calculate total customers with membership (excluding 'none')
    const totalWithMembership = membershipStats
      .filter(m => m._id !== 'none')
      .reduce((sum, m) => sum + m.count, 0);

    const responseData = {
      success: true,
      data: {
        totals,
        membershipStats,
        membershipValidity,
        calculated: {
          totalWithMembership,
          membershipPercentage: totals.totalCustomers > 0 
            ? ((totalWithMembership / totals.totalCustomers) * 100).toFixed(1)
            : 0
        }
      }
    };

    res.status(200).json(responseData);

  } catch (error) {
    console.error('Get customer stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching customer statistics'
    });
  }
};

/**
 * @desc    Export customers
 * @route   POST /api/customers/export
 * @access  Private (merchant, manager)
 */
exports.exportCustomers = async (req, res) => {
  try {
    // For now, return JSON. You can implement CSV/Excel export later
    const customers = await Customer.find()
      .populate('createdBy', 'FullName email')
      .select('-__v');

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers,
      message: 'Customers exported successfully'
    });

  } catch (error) {
    console.error('Export customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while exporting customers'
    });
  }
};

/**
 * @desc    Import customers
 * @route   POST /api/customers/import
 * @access  Private (merchant, manager)
 */
exports.importCustomers = async (req, res) => {
  try {
    // For now, accept JSON data. You can implement CSV/Excel import later
    const { customers } = req.body;

    if (!customers || !Array.isArray(customers)) {
      return res.status(400).json({
        success: false,
        message: 'Valid customers array is required'
      });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    // Process each customer
    for (const customerData of customers) {
      try {
        // Validate required fields
        if (!customerData.cust_name || !customerData.email || !customerData.phone) {
          throw new Error('Missing required fields');
        }

        // Check for duplicates
        const emailExists = await Customer.emailExists(customerData.email);
        const phoneExists = await Customer.phoneExists(customerData.phone);

        if (emailExists || phoneExists) {
          throw new Error('Duplicate email or phone');
        }

        // Create customer
        await Customer.create({
          ...customerData,
          createdBy: req.user._id
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          customer: customerData,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      results,
      message: `Import completed: ${results.success} successful, ${results.failed} failed`
    });

  } catch (error) {
    console.error('Import customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while importing customers'
    });
  }
};