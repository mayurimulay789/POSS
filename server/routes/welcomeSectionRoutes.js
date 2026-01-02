const express = require('express');
const router = express.Router();
const {
  getWelcomeSection,
  createOrUpdateWelcomeSection
} = require('../controllers/welcomeSectionController');
const { protect, authorize } = require('../middleware/auth');

// Public route
router.get('/', getWelcomeSection);

// Protected route (Merchant only)
router.post('/', protect, authorize('merchant'), createOrUpdateWelcomeSection);

module.exports = router;
