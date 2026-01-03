const express = require('express');
const router = express.Router();
const {
  getContactUs,
  createOrUpdateContactUs
} = require('../controllers/contactUsController');
const { protect, authorize } = require('../middleware/auth');

// Public route
router.get('/', getContactUs);

// Protected route (Merchant only)
router.post('/', protect, authorize('merchant'), createOrUpdateContactUs);

module.exports = router;
