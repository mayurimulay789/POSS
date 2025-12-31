const RolePermission = require('../models/RolePermission');
const { FIXED_PERMISSIONS } = require('../config/fixedPermissions');

// Default role permissions
const DEFAULT_ROLE_PERMISSIONS = {
  merchant: [
    'menu_management', 'order_management', 'billing_management',
    'space_management', 'task_management', 'expense_management',
    'reports_analytics', 'employee_management', 'customer_management', 'charges_management'
  ],
  manager: [
    'menu_management', 'order_management', 'billing_management',
    'space_management', 'task_management', 'expense_management',
    'reports_analytics', 'employee_management', 'customer_management', 'charges_management'
  ],
  supervisor: [
    'order_management', 'billing_management', 'space_management', 'task_management','customer_management'
  ],
  staff: [
    'order_management', 'billing_management', 'space_management','customer_management'
  ]
};


// @desc    Get permissions for a specific role
// @route   GET /api/role-permissions/roles/:role
// @access  Private/Merchant
const getRolePermissions = async (req, res) => {
  try {
    console.log("rolePermissionController is calling");
    const { role } = req.params;
    const merchantId = req.user._id;

    // Validate role
    const validRoles = ['merchant', 'manager', 'supervisor', 'staff'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    let rolePermission = await RolePermission.findOne({ merchantId, role });
    
    // If no custom permissions set, return defaults
    if (!rolePermission) {
      const defaultPermissions = DEFAULT_ROLE_PERMISSIONS[role] || [];
      return res.json({ 
        role,
        permissions: defaultPermissions,
        isDefault: true
      });
    }

    console.log("rolePermission found:", rolePermission);

    res.json({ 
      role,
      permissions: rolePermission.permissions,
      isDefault: false
    });
  } catch (error) {
    console.error('Get role permissions error:', error);
    res.status(500).json({ message: 'Error fetching permissions' });
  }
};

// @desc    Update permissions for a specific role
// @route   PUT /api/role-permissions/roles/:role
// @access  Private/Merchant
const updateRolePermissions = async (req, res) => {
  try {
    console.log("updaterolepermission is calling");
    const { role } = req.params;
    console.log("role:", role);
    const { permissions } = req.body;
    console.log("permissions:", permissions);
    const merchantId = req.user._id;
    console.log("merchantId:", merchantId);

    // Validate role
    const validRoles = ['manager', 'supervisor', 'staff']; // Merchant cannot edit their own permissions
    if (!validRoles.includes(role)) {
      console.log("invalid role specified");
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Validate permissions array
    if (!Array.isArray(permissions)) {
      console.log("permissions must be an array");
      return res.status(400).json({ message: 'Permissions must be an array' });
    }

    // Validate each permission
    const validPermissions = Object.values(FIXED_PERMISSIONS);
    const invalidPermissions = permissions.filter(p => !validPermissions.includes(p));
    
    if (invalidPermissions.length > 0) {
      console.log("invalid permissions provided");
      return res.status(400).json({ 
        message: 'Invalid permissions provided',
        invalidPermissions 
      });
    }

    const rolePermission = await RolePermission.findOneAndUpdate(
      { merchantId, role },
      { permissions },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({ 
      message: 'Permissions updated successfully',
      role: rolePermission.role,
      permissions: rolePermission.permissions,
      updatedAt: rolePermission.updatedAt
    });
  } catch (error) {
    console.error('Update role permissions error:', error);
    res.status(500).json({ message: 'Error updating permissions' });
  }
};

// @desc    Get all roles with their permissions
// @route   GET /api/role-permissions/all
// @access  Private/Merchant
const getAllRolePermissions = async (req, res) => {
  try {
    console.log("getAllRolePermissions is calling");
    const merchantId = req.user._id;
    
    const rolePermissions = await RolePermission.find({ merchantId });
    
    // Merge with defaults for roles without custom permissions
    const result = {};
    const roles = ['merchant', 'manager', 'supervisor', 'staff'];
    
    for (const role of roles) {
      const customPermission = rolePermissions.find(rp => rp.role === role);
      result[role] = {
        permissions: customPermission ? customPermission.permissions : DEFAULT_ROLE_PERMISSIONS[role],
        isDefault: !customPermission,
        lastUpdated: customPermission ? customPermission.updatedAt : null
      };
    }

    console.log("all role permissions:", result);

    res.json(result);
  } catch (error) {
    console.error('Get all role permissions error:', error);
    res.status(500).json({ message: 'Error fetching role permissions' });
  }
};

// @desc    Get current user's permissions
// @route   GET /api/role-permissions/my-permissions
// @access  Private
const getUserPermissions = async (req, res) => {
  try {
    console.log("permissionslice is calling");
    const user = req.user;
    
    // If user is merchant, they have all permissions
    if (user.role === 'merchant') {
      return res.json({
        role: user.role,
        permissions: Object.values(FIXED_PERMISSIONS),
        isMerchant: true
      });
    }

    // For other roles, check custom permissions or use defaults
    let rolePermission = await RolePermission.findOne({ 
      merchantId: user.createdBy || user._id, 
      role: user.role 
    });

    const permissions = rolePermission 
      ? rolePermission.permissions 
      : DEFAULT_ROLE_PERMISSIONS[user.role] || [];

      console.log("user permissions:", permissions);

    res.json({
      role: user.role,
      permissions: permissions,
      isMerchant: false
    });
  } catch (error) {
    console.error('Get user permissions error:', error);
    res.status(500).json({ message: 'Error fetching user permissions' });
  }
};

module.exports = {
  getRolePermissions,
  updateRolePermissions,
  getAllRolePermissions,
  getUserPermissions
};