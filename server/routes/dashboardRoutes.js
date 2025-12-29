const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getMerchantDashboard,
  getManagerDashboard,
  getSupervisorDashboard,
  getStaffDashboard
} = require('../controllers/dashboardController');

// All routes are protected
router.use(protect);


router.get('/merchant', authorize('merchant'), getMerchantDashboard);


router.get('/manager', authorize('merchant', 'manager'), getManagerDashboard);


router.get('/supervisor', authorize('merchant', 'manager', 'supervisor'), getSupervisorDashboard);


router.get('/staff', getStaffDashboard);

module.exports = router;