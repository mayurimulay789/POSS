const express = require('express');
const { 
  createUser, 
  getUsers, 
  getUser, 
  updateUser, 
  toggleUserStatus, 
  deleteUser 
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes protected and only accessible by merchants
router.use(protect);

// User management routes
router.post('/users',authorize('merchant'), createUser);

router.get('/users',authorize('merchant', 'manager', 'supervisor', 'staff'), getUsers);

router.get('/users/:id',authorize('merchant'), getUser);

router.put('/users/:id',authorize('merchant'), updateUser);

router.patch('/users/:id/toggle-status',authorize('merchant'), toggleUserStatus);

router.delete('/users/:id',authorize('merchant'), deleteUser);

module.exports = router;