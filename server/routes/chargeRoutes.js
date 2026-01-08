const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createCharge,
  getAllCharges,
  getChargeById,
  updateCharge,
  deleteCharge,
  toggleChargeStatus,
  getSystemCharges,
  getOptionalCharges,
  getSystemChargesSummary
} = require('../controllers/chargeController');

// All routes require authentication
router.use(protect);

// ==================== PUBLIC ROUTES (All authenticated users) ====================

// GET /api/charges/system - Get active system charges
router.get('/system', getSystemCharges);

// GET /api/charges/optional - Get active optional charges  
router.get('/optional', getOptionalCharges);

// GET /api/charges/system/summary - Get system charges summary
router.get('/system/summary', getSystemChargesSummary);

// ==================== ADMIN/MANAGER ROUTES ====================

// GET /api/charges - Get all charges (merchant view)
router.get('/', authorize('merchant', 'manager','staff','supervisor'), getAllCharges);

// GET /api/charges/:id - Get single charge by ID
router.get('/:id', authorize('merchant', 'manager'), getChargeById);

// POST /api/charges - Create new charge
router.post('/', authorize('merchant', 'manager'), createCharge);

// PUT /api/charges/:id - Update charge
router.put('/:id', authorize('merchant', 'manager'), updateCharge);

// DELETE /api/charges/:id - Delete charge
router.delete('/:id', authorize('merchant', 'manager'), deleteCharge);

// PATCH /api/charges/:id/status - Toggle charge status
router.patch('/:id/status', authorize('merchant', 'manager'), toggleChargeStatus);

module.exports = router;