const express = require('express');
const router = express.Router();
const {
  getAllContactUs,
  getContactUs,
  getContactUsById,
  createContactUs,
  updateContactUs,
  deleteContactUs,
  toggleContactUsStatus
} = require('../controllers/contactUsController');
const { protect, authorize } = require('../middleware/auth');

// Public route - Get active contact info
router.get('/', getContactUs);

// Protected routes (Merchant only)
router.get('/all', protect, authorize('merchant', 'manager', 'supervisor', 'staff'), getAllContactUs);
router.get('/:id', protect, authorize('merchant', 'manager', 'supervisor', 'staff'), getContactUsById);
router.post('/', protect, authorize('merchant', 'manager', 'supervisor', 'staff'), createContactUs);
router.put('/:id', protect, authorize('merchant', 'manager', 'supervisor', 'staff'), updateContactUs);
router.delete('/:id', protect, authorize('merchant', 'manager', 'supervisor', 'staff'), deleteContactUs);
router.patch('/:id/toggle', protect, authorize('merchant', 'manager', 'supervisor', 'staff'), toggleContactUsStatus);

module.exports = router;
