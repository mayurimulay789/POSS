
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/hotelImageController');
const { protect, authorize } = require('../middleware/auth');
const { uploadMultiple, uploadSingle } = require('../middleware/uploadMiddleware');

// Public endpoints for sections
router.get('/banner', ctrl.getBannerImages);
router.get('/welcome', ctrl.getWelcomeImage);
router.get('/login', ctrl.getLoginImage);
router.get('/cuisine-gallery', ctrl.getCuisineGalleryImage);

router.get('/', ctrl.list);

router.get('/:id', protect, authorize('merchant', 'manager', 'supervisor', 'staff'), ctrl.getById);

router.post('/', protect, authorize('merchant', 'manager', 'supervisor', 'staff'), uploadMultiple('images', 12), ctrl.create);

router.put('/:id', protect, authorize('merchant', 'manager', 'supervisor', 'staff'), uploadSingle('image'), ctrl.update);

router.delete('/:id', protect, authorize('merchant', 'manager', 'supervisor', 'staff'), ctrl.remove);

module.exports = router;
