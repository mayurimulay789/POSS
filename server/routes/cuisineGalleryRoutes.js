const express = require('express');
const router = express.Router();
const {
  getAllCuisineGalleries,
  getCuisineGallery,
  getCuisineGalleryById,
  createCuisineGallery,
  updateCuisineGallery,
  deleteCuisineGallery,
  toggleCuisineGalleryStatus
} = require('../controllers/cuisineGalleryController');
const { protect, authorize } = require('../middleware/auth');

// Public route - Get active cuisine gallery
router.get('/', getCuisineGallery);

router.get('/all', protect, authorize('merchant', 'manager', 'supervisor', 'staff'), getAllCuisineGalleries);
router.get('/:id', protect, authorize('merchant', 'manager', 'supervisor', 'staff'), getCuisineGalleryById);
router.post('/', protect, authorize('merchant', 'manager', 'supervisor', 'staff'), createCuisineGallery);
router.put('/:id', protect, authorize('merchant', 'manager', 'supervisor', 'staff'), updateCuisineGallery);
router.delete('/:id', protect, authorize('merchant', 'manager', 'supervisor', 'staff'), deleteCuisineGallery);
router.patch('/:id/toggle', protect, authorize('merchant', 'manager', 'supervisor', 'staff'), toggleCuisineGalleryStatus);

module.exports = router;
