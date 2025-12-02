const express = require('express');
const { 
  createUser, 
  getUsers, 
  getUser, 
  updateUser, 
  toggleUserStatus, 
  deleteUser 
} = require('../controllers/employeeController');
const { protect, merchant, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes protected and only accessible by merchants
router.use(protect, merchant);

// User management routes
router.post('/users', createUser);
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

module.exports = router;