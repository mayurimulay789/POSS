const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createCustomer,
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  toggleCustomerStatus,
  renewMembership,
  getCustomerStats,
  searchCustomers,
  exportCustomers,
  importCustomers,
  getMyCustomers,
  getCustomersByMembershipType
} = require('../controllers/customerController');

// All routes are protected
router.use(protect);

router.post('/', createCustomer);

router.get('/', getCustomers);

router.get('/my-customers', getMyCustomers);

router.get('/membership/:type', getCustomersByMembershipType);

router.get('/search', searchCustomers);

router.get('/stats', getCustomerStats);

router.get('/:id', getCustomer);

router.put('/:id', updateCustomer);

router.delete('/:id', authorize('merchant', 'manager', 'supervisor'), deleteCustomer);

router.patch('/:id/status', authorize('merchant', 'manager', 'supervisor'), toggleCustomerStatus);

router.patch('/:id/renew-membership', authorize('merchant', 'manager'), renewMembership);

router.post('/export', authorize('merchant', 'manager'), exportCustomers);

router.post('/import', authorize('merchant', 'manager'), importCustomers);

module.exports = router;