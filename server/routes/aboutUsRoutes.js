const express = require('express');
const router = express.Router();
const {
  getAboutUs,
  getAllAboutUs,
  getAboutUsById,
  createAboutUs,
  updateAboutUs,
  deleteAboutUs,
  activateAboutUs,
  addHighlight,
  addValue,
  addStat
} = require('../controllers/aboutUsController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAboutUs);

// Protected routes (Merchant only)
router.get('/all', protect, authorize('merchant'), getAllAboutUs);
router.get('/:id', protect, authorize('merchant'), getAboutUsById);
router.post('/', protect, authorize('merchant'), createAboutUs);
router.put('/:id', protect, authorize('merchant'), updateAboutUs);
router.delete('/:id', protect, authorize('merchant'), deleteAboutUs);
router.patch('/:id/activate', protect, authorize('merchant'), activateAboutUs);

// Add specific items
router.post('/:id/highlights', protect, authorize('merchant'), addHighlight);
router.post('/:id/values', protect, authorize('merchant'), addValue);
router.post('/:id/stats', protect, authorize('merchant'), addStat);

module.exports = router;
