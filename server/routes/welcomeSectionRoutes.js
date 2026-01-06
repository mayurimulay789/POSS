const express = require('express');
const router = express.Router();
const {
  getAllWelcomeSections,
  getWelcomeSection,
  getWelcomeSectionById,
  createWelcomeSection,
  updateWelcomeSection,
  deleteWelcomeSection,
  toggleWelcomeSectionStatus
} = require('../controllers/welcomeSectionController');
const { protect, authorize } = require('../middleware/auth');

// Public route - Get active welcome section
router.get('/', getWelcomeSection);

// Protected routes (Merchant only)
router.get('/all', protect, authorize('merchant', 'manager', 'supervisor', 'staff'), getAllWelcomeSections);
router.get('/:id', protect, authorize('merchant', 'manager', 'supervisor', 'staff'), getWelcomeSectionById);
router.post('/', protect, authorize('merchant', 'manager', 'supervisor', 'staff'), createWelcomeSection);
router.put('/:id', protect, authorize('merchant', 'manager', 'supervisor', 'staff'), updateWelcomeSection);
router.delete('/:id', protect, authorize('merchant', 'manager', 'supervisor', 'staff'), deleteWelcomeSection);
router.patch('/:id/toggle', protect, authorize('merchant', 'manager', 'supervisor', 'staff'), toggleWelcomeSectionStatus);

module.exports = router;
