const Customer = require('../models/Customer');
const mongoose = require('mongoose');


exports.createCustomer = async (req, res) => {
  try {
    const { 
      cust_name, 
      email, 
      phone, 
      membership_id,
    } = req.body;
  

    console.log('Create customer request body:', req.body);

    // Validation - according to schema, only cust_name is required
    if (!cust_name) {
      console.log('Validation failed: Missing required field');
      return res.status(400).json({
        success: false,
        message: 'Customer name is required'
      });
    }

    // Check for duplicates in a single query (email, phone, membership_id)
    const orConditions = [];
    if (email) orConditions.push({ email });
    if (phone) orConditions.push({ phone });
    if (membership_id) orConditions.push({ membership_id });

    const existingCustomer = orConditions.length > 0 
      ? await Customer.findOne({ $or: orConditions })
      : null;

      console.log("********1");
    if (existingCustomer) {
      // Determine which field is duplicate
      let duplicateField = '';
      if (email && existingCustomer.email === email) {
        duplicateField = 'Email';
      } else if (phone && existingCustomer.phone === phone) {
        duplicateField = 'Phone number';
      } else if (membership_id && existingCustomer.membership_id === membership_id) {
        duplicateField = 'Membership ID';
      }
      
      console.log(`Validation failed: ${duplicateField} already exists`);
      return res.status(400).json({
        success: false,
        message: `${duplicateField} already exists`
      });
    }

    console.log("********2");

    // Create customer
    const customer = await Customer.create({
      cust_name,
      ...(email && { email }),
      ...(phone && { phone }),
      ...(membership_id && { membership_id }),
      createdBy: req.user._id
    });
    console.log("********3");

    res.status(201).json({
      success: true,
      data: customer,
      message: 'Customer created successfully'
    });

  } catch (error) {
    console.log("********4");
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
      console.log("********5");
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

exports.getCustomers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;
    
    // Build query
    let query = {};
    
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
      .limit(parseInt(limit));

    const total = await Customer.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Get simple statistics
    const listStats = {
      totalCustomers: total,
      totalWithEmail: await Customer.countDocuments({ email: { $exists: true, $ne: null } }),
      totalWithPhone: await Customer.countDocuments({ phone: { $exists: true, $ne: null } }),
      totalWithMembershipId: await Customer.countDocuments({ membership_id: { $exists: true, $ne: null } })
    };

    res.status(200).json({
      success: true,
      count: customers.length,
      total,
      totalPages,
      currentPage: parseInt(page),
      listStats,
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
      .select('cust_name email phone membership_id')
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

    // Prepare update data - directly use req.body since no unique constraints
    const updateData = { ...req.body };
    console.log(req.body);
    
    // Update customer
    Object.assign(customer, updateData);
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
    
    // If you still get duplicate errors, you need to remove the old index
    if (error.code === 11000) {
      console.log('⚠️ Duplicate error indicates existing unique index in DB');
      console.log('Run this in MongoDB to check indexes: db.customers.getIndexes()');
      console.log('To remove index: db.customers.dropIndex("membership_id_1")');
      
      return res.status(400).json({
        success: false,
        message: 'Database has unique constraint. Contact admin to fix schema.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while updating customer'
    });
  }
};

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


exports.getCustomerStats = async (req, res) => {
  try {
    const stats = await Customer.aggregate([
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          totalWithEmail: {
            $sum: {
              $cond: [
                { $and: [{ $ne: ['$email', null] }, { $ne: ['$email', ''] }] },
                1,
                0
              ]
            }
          },
          totalWithPhone: {
            $sum: {
              $cond: [
                { $and: [{ $ne: ['$phone', null] }, { $ne: ['$phone', ''] }] },
                1,
                0
              ]
            }
          },
          totalWithMembershipId: {
            $sum: {
              $cond: [
                { $and: [{ $ne: ['$membership_id', null] }, { $ne: ['$membership_id', ''] }] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Extract totals
    const totals = stats[0] || {
      totalCustomers: 0,
      totalWithEmail: 0,
      totalWithPhone: 0,
      totalWithMembershipId: 0
    };

    // Remove the _id field from response
    delete totals._id;

    console.log('Customer statistics:', totals);

    res.status(200).json({
      success: true,
      data: totals
    });

  } catch (error) {
    console.error('Get customer stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching customer statistics'
    });
  }
};


exports.exportCustomers = async (req, res) => {
  try {
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
