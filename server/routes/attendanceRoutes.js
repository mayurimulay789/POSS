const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  startShift,
  endShift,
  getCurrentShift,
  getMyAttendance
} = require('../controllers/attendanceController');

// Import multer for file upload
const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/temp/'); // Temporary storage
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'attendance-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: fileFilter
});

router.use(protect);

router.post('/start', upload.single('selfie'), startShift);

router.post('/end', upload.single('selfie'), endShift);

router.get('/current', getCurrentShift);

router.get('/my-attendance', getMyAttendance);

module.exports = router;