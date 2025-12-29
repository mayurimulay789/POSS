// // server/routes/merchantAttendanceRoutes.js
// const express = require('express');
// const router = express.Router();
// const { protect, authorize } = require('../middleware/auth');
// const merchantAttendanceController = require('../controllers/merchantAttendanceController');

// // Debug middleware
// router.use((req, res, next) => {
//   console.log(`🔍 Merchant Attendance Route: ${req.method} ${req.originalUrl}`);
//   console.log('📋 Request body:', req.body);
//   console.log('📋 Request query:', req.query);
//   next();
// });

// // All routes require merchant role
// router.use(protect);
// router.use(authorize('merchant'));

// // Get all attendance records
// router.get('/all', merchantAttendanceController.getAllAttendance);

// // Get team attendance (filtered by team)
// router.get('/team', merchantAttendanceController.getTeamAttendance);

// // Get daily attendance sheet
// router.get('/daily-sheet', merchantAttendanceController.getDailyAttendanceSheet);

// // Get attendance reports
// router.get('/reports', merchantAttendanceController.getAttendanceReport);

// // Get analytics
// router.get('/analytics', merchantAttendanceController.getAttendanceAnalytics);

// // Approve/Reject attendance
// router.patch('/:id/approve', merchantAttendanceController.approveAttendance);

// // Export attendance data - IMPORTANT: Use POST for export
// router.post('/export', merchantAttendanceController.exportAttendance);

// module.exports = router;
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const merchantAttendanceController = require('../controllers/merchantAttendanceController');

// Debug middleware
router.use((req, res, next) => {
  console.log(`🔍 Merchant Attendance Route: ${req.method} ${req.originalUrl}`);
  console.log('📋 Request body:', req.body);
  console.log('📋 Request query:', req.query);
  next();
});

// All routes require merchant role
router.use(protect);
router.use(authorize('merchant'));

// Get all attendance records
router.get('/all', merchantAttendanceController.getAllAttendance);

// Get team attendance (filtered by team)
router.get('/team', merchantAttendanceController.getTeamAttendance);

// Get daily attendance sheet
router.get('/daily-sheet', merchantAttendanceController.getDailyAttendanceSheet);

// Get attendance reports
router.get('/reports', merchantAttendanceController.getAttendanceReport);

// Get analytics
router.get('/analytics', merchantAttendanceController.getAttendanceAnalytics);

// Get attendance calendar data
router.get('/calendar', merchantAttendanceController.getAttendanceCalendar);

// Get merchant users for dropdown
router.get('/users', merchantAttendanceController.getMerchantUsers);

// Approve/Reject attendance
router.patch('/:id/approve', merchantAttendanceController.approveAttendance);

// Export attendance data - IMPORTANT: Use POST for export
router.post('/export', merchantAttendanceController.exportAttendance);

module.exports = router;