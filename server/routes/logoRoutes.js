const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/temp/' });
const logoController = require('../controllers/logoController');

// GET logo
router.get('/', logoController.getLogo);
// POST logo (upload)

// DELETE logo
router.delete('/', logoController.deleteLogo);

router.post('/', upload.single('logo'), logoController.uploadLogo);

module.exports = router;
