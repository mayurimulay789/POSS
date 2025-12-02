const express = require('express');
const { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getCurrentUser, 
  updateUserProfile 
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// Public routes
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Protected routes
router.use(protect);

router.get('/me', getCurrentUser);
router.put('/myprofile', updateUserProfile);

// Registration - only merchants can register new users
router.post('/register', authorize('merchant'), registerUser);

module.exports = router;