const express = require('express');
const router = express.Router();
const {
  getCuisineGallery,
  createOrUpdateCuisineGallery
} = require('../controllers/cuisineGalleryController');
const { protect, authorize } = require('../middleware/auth');

// Public route
router.get('/', getCuisineGallery);

// Protected route (Merchant only)
router.post('/', protect, authorize('merchant'), createOrUpdateCuisineGallery);

module.exports = router;
