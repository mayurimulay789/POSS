const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const upload = require('../middleware/uploadMiddleware');
const { protect, merchant } = require('../middleware/auth');

console.log('🔔 menuRoutes module imported');

// Note: Authentication middleware is not enforced here. If you have an auth middleware, add it.

// Protected routes for merchants
router.post('/categories', protect, merchant, menuController.createCategory);
router.get('/categories', menuController.getCategories);

router.post('/items', protect, merchant, upload.uploadSingle('image'), menuController.createItem);
router.get('/items', menuController.getItems);
router.put('/items/:id', protect, merchant, upload.uploadSingle('image'), menuController.updateItem);
router.delete('/items/:id', protect, merchant, menuController.deleteItem);

// Excel upload: expects form-data with field 'file'
router.post('/upload-excel', upload.uploadSingle('file'), menuController.uploadExcel);

// quick ping route for diagnostics (available at GET /api/menu/ping)
router.get('/ping', (req, res) => res.json({ ok: true, route: '/api/menu/ping' }));

module.exports = router;
