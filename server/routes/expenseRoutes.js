// const express = require('express');
// const router = express.Router();
// const {
//   createExpense,
//   getExpenses,
//   getExpense,
//   updateExpense,
//   deleteExpense,
//   getMyExpenses
// } = require('../controllers/expenseController');
// const { protect, authorize } = require('../middleware/auth');

// router.use(protect);

// router.post('/', authorize('staff', 'supervisor', 'manager','merchant'), createExpense);

// router.get('/', authorize('merchant', 'manager'), getExpenses);

// router.get('/my-expenses', authorize('staff', 'supervisor', 'manager','merchant'), getMyExpenses);

// router.get('/:id', getExpense);

// router.put('/:id', updateExpense);

// router.delete('/:id', deleteExpense);

// module.exports = router;

const express = require('express');
const router = express.Router();
const {
  createExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
  getMyExpenses
} = require('../controllers/expenseController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Create expense - accessible to staff, supervisor, manager, merchant
router.post('/', authorize('staff', 'supervisor', 'manager', 'merchant'), createExpense);

// Get all expenses - only for merchant and manager
router.get('/', authorize('merchant', 'manager'), getExpenses);

// Get my expenses - accessible to all authenticated users
router.get('/my-expenses', authorize('staff', 'supervisor', 'manager', 'merchant'), getMyExpenses);

// Get single expense - user can view their own, merchant can view any
router.get('/:id', getExpense);

// Update expense - user can update their own (before midnight), merchant anytime
router.put('/:id', updateExpense);

// Delete expense - user can delete their own (before midnight), merchant anytime
router.delete('/:id', deleteExpense);

module.exports = router;