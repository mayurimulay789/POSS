const express = require('express');
const router = express.Router();
const {
  getRolePermissions,
  updateRolePermissions,
  getAllRolePermissions,
  getUserPermissions
} = require('../controllers/rolePermissionController');
const { protect, merchant } = require('../middleware/auth');

// @desc    Get permissions for a specific role
// @route   GET /api/role-permissions/roles/:role
// @access  Private/Merchant
router.get('/roles/:role', protect, merchant, getRolePermissions);

// @desc    Update permissions for a specific role
// @route   PUT /api/role-permissions/roles/:role
// @access  Private/Merchant
router.put('/roles/:role', protect, merchant, updateRolePermissions);

// @desc    Get all roles with their permissions
// @route   GET /api/role-permissions/all
// @access  Private/Merchant
router.get('/all', protect, merchant, getAllRolePermissions);

// @desc    Get current user's permissions
// @route   GET /api/role-permissions/my-permissions
// @access  Private
router.get('/my-permissions', protect, getUserPermissions);

module.exports = router;