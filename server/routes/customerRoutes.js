const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createCustomer,
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerStats,
  searchCustomers,
  exportCustomers,
  getMyCustomers,
} = require('../controllers/customerController');

// All routes are protected
router.use(protect);

router.post('/', createCustomer);

router.get('/', getCustomers);

router.get('/my-customers', getMyCustomers);

router.get('/search', searchCustomers);

router.get('/stats', getCustomerStats);

router.get('/:id', getCustomer);

router.put('/:id', updateCustomer);

router.delete('/:id', authorize('merchant', 'manager', 'supervisor'), deleteCustomer);

router.post('/export', authorize('merchant', 'manager'), exportCustomers);

module.exports = router;