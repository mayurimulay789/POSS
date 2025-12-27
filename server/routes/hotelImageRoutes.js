const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/hotelImageController');
const { protect } = require('../middleware/auth');
const { uploadMultiple, uploadSingle } = require('../middleware/uploadMiddleware');

// List all hotel images (authenticated)
router.get('/', protect, ctrl.list);

// Public list of hotel images (no auth required)
router.get('/public', ctrl.list);

// Upload multiple images
router.post('/', protect, uploadMultiple('images', 12), ctrl.create);

// Update metadata or replace a single image
router.put('/:id', protect, uploadSingle('image'), ctrl.update);

// Delete image
router.delete('/:id', protect, ctrl.remove);

module.exports = router;
