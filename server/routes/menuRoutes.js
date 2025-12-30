const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const upload = require('../middleware/uploadMiddleware');
const { protect, authorize } = require('../middleware/auth');

console.log('🔔 menuRoutes module imported');

// Protected routes for merchants and managers
router.post('/categories', protect, authorize('merchant', 'manager'), menuController.createCategory);
router.get('/categories', menuController.getCategories);
router.delete('/categories/:id', protect, authorize('merchant', 'manager'), menuController.deleteCategory);

router.post('/items', protect, authorize('merchant', 'manager'), upload.uploadSingle('image'), menuController.createItem);
router.get('/items', menuController.getItems);
router.put('/items/:id', protect, authorize('merchant', 'manager'), upload.uploadSingle('image'), menuController.updateItem);
router.delete('/items/:id', protect, authorize('merchant', 'manager'), menuController.deleteItem);

// Excel upload: expects form-data with field 'file'
router.post('/upload-excel', upload.uploadSingle('file'), menuController.uploadExcel);

// quick ping route for diagnostics (available at GET /api/menu/ping)
router.get('/ping', (req, res) => res.json({ ok: true, route: '/api/menu/ping' }));

module.exports = router;
