const User = require('../models/User');
const { generateToken } = require('../middleware/jwtToken');
const bcrypt = require('bcryptjs');

// Create user by merchant
const createUser = async (req, res) => {
  try {
    const { FullName, email, password, role } = req.body;

    // Validation
    if (!FullName || !email || !password || !role) {
      return res.status(400).json({ 
        message: 'Please provide FullName, email, password, and role' 
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate role (merchant can create staff, supervisor, manager but not another merchant)
    const allowedRoles = ['staff', 'supervisor', 'manager'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ 
        message: 'Merchant can only create staff, supervisor, or manager accounts' 
      });
    }

    // Create user
    const user = await User.create({
      FullName,
      email,
      password,
      role,
      createdBy: req.user._id, // Track who created this user
      isActive: true
    });

    res.status(201).json({
      user: {
        _id: user._id,
        FullName: user.FullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      },
      message: 'User created successfully'
    });

  } catch (error) {
    console.error("Create user error:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ 
      message: 'Server error during user creation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all users (created by this merchant)
// const getUsers = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     // Build filter - merchants can see users they created
//     const filter = { createdBy: req.user._id };

//     // Optional role filter
//     if (req.query.role) {
//       filter.role = req.query.role;
//     }

//     // Optional search by name or email
//     if (req.query.search) {
//       filter.$or = [
//         { FullName: { $regex: req.query.search, $options: 'i' } },
//         { email: { $regex: req.query.search, $options: 'i' } }
//       ];
//     }

//     const users = await User.find(filter)
//       .select('-password')
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     const total = await User.countDocuments(filter);
//     const totalPages = Math.ceil(total / limit);

//     res.status(200).json({
//       users,
//       pagination: {
//         current: page,
//         pages: totalPages,
//         total: total,
//         hasNext: page < totalPages,
//         hasPrev: page > 1
//       }
//     });

//   } catch (error) {
//     console.error("Get users error:", error);
//     res.status(500).json({ message: 'Server error while fetching users' });
//   }
// };

// Get all users (created by this merchant OR same hierarchy level)
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter based on user role
    let filter = {};
    
    if (req.user.role === 'merchant') {
      // Merchant can see users they created
      filter = { createdBy: req.user._id };
    } else {
      // Non-merchant users (manager, supervisor, staff) should see:
      // 1. Themselves
      // 2. Users in the same or lower hierarchy level
      // 3. Users created by the same merchant
      
      // First, get the merchant who created this user
      const currentUser = await User.findById(req.user._id).populate('createdBy');
      const merchantId = currentUser.createdBy?._id || req.user._id;
      
      // Build filter to show users created by the same merchant
      // and with appropriate roles based on hierarchy
      filter = { createdBy: merchantId };
      
      // Filter by allowed roles based on current user's role
      const roleHierarchy = {
        'manager': ['manager', 'supervisor', 'staff'],
        'supervisor': ['supervisor', 'staff'],
        'staff': ['staff']
      };
      
      if (roleHierarchy[req.user.role]) {
        filter.role = { $in: roleHierarchy[req.user.role] };
      }
    }

    // Optional role filter
    if (req.query.role && req.user.role === 'merchant') {
      // Only merchant can filter by specific role
      filter.role = req.query.role;
    }

    // Optional search by name or email
    if (req.query.search) {
      filter.$or = [
        { FullName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      users,
      pagination: {
        current: page,
        pages: totalPages,
        total: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

// Get single user
const getUser = async (req, res) => {
  try {
    const user = await User.findOne({ 
      _id: req.params.id, 
      createdBy: req.user._id 
    }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });

  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: 'Server error while fetching user' });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { FullName, role } = req.body;

    // Find user created by this merchant
    let user = await User.findOne({ 
      _id: req.params.id, 
      createdBy: req.user._id 
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update allowed fields
    if (FullName) user.FullName = FullName;
    
    // Validate role if provided
    if (role) {
      const allowedRoles = ['staff', 'supervisor', 'manager'];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ 
          message: 'Invalid role. Allowed roles: staff, supervisor, manager' 
        });
      }
      user.role = role;
    }

    await user.save();

    // Return updated user without password
    user = await User.findById(user._id).select('-password');

    res.status(200).json({
      user,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error("Update user error:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    res.status(500).json({ message: 'Server error while updating user' });
  }
};

// Activate/Deactivate user
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findOne({ 
      _id: req.params.id, 
      createdBy: req.user._id 
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Toggle active status
    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        _id: user._id,
        FullName: user.FullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error("Toggle user status error:", error);
    res.status(500).json({ message: 'Server error while updating user status' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findOne({ 
      _id: req.params.id, 
      createdBy: req.user._id 
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent merchant from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  toggleUserStatus,
  deleteUser
};