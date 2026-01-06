const express = require('express');
const router = express.Router();
const footerController = require('../controllers/footerController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', footerController.getFooter);

// Protected routes
router.get('/all', protect, authorize('merchant', 'manager', 'supervisor', 'staff'), footerController.getAllFooters);
router.get('/:id', protect, authorize('merchant', 'manager', 'supervisor', 'staff'), footerController.getFooterById);
router.post('/', protect, authorize('merchant', 'manager'), footerController.createFooter);
router.put('/:id', protect, authorize('merchant', 'manager'), footerController.updateFooter);
router.delete('/:id', protect, authorize('merchant', 'manager'), footerController.deleteFooter);
router.patch('/:id/toggle', protect, authorize('merchant', 'manager'), footerController.toggleFooterStatus);

module.exports = router;
