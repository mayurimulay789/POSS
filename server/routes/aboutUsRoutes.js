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
router.get('/all', protect, authorize('merchant', 'manager', 'supervisor', 'staff'), getAllAboutUs);
router.get('/:id', protect, authorize('merchant', 'manager', 'supervisor', 'staff'), getAboutUsById);
router.post('/', protect, authorize('merchant', 'manager', 'supervisor', 'staff'), createAboutUs);
router.put('/:id', protect, authorize('merchant', 'manager', 'supervisor', 'staff'), updateAboutUs);
router.delete('/:id', protect, authorize('merchant', 'manager', 'supervisor', 'staff'), deleteAboutUs);
router.patch('/:id/activate', protect, authorize('merchant', 'manager', 'supervisor', 'staff'), activateAboutUs);

// Add specific items
router.post('/:id/highlights', protect, authorize('merchant', 'manager', 'supervisor', 'staff'), addHighlight);
router.post('/:id/values', protect, authorize('merchant', 'manager', 'supervisor', 'staff'), addValue);
router.post('/:id/stats', protect, authorize('merchant', 'manager', 'supervisor', 'staff'), addStat);

module.exports = router;
