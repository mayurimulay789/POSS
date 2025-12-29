const express = require('express');
const router = express.Router();
const {
  getRolePermissions,
  updateRolePermissions,
  getAllRolePermissions,
  getUserPermissions
} = require('../controllers/rolePermissionController');
const { protect, merchant } = require('../middleware/auth');

router.get('/roles/:role', protect, merchant, getRolePermissions);

router.put('/roles/:role', protect, merchant, updateRolePermissions);

router.get('/all', protect, merchant, getAllRolePermissions);

router.get('/my-permissions', protect, getUserPermissions);

module.exports = router;