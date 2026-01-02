const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const {
  createSpace,
  getSpaces,
  getSpaceById,
  updateSpace,
  deleteSpace
} = require('../controllers/spaceController');

// All routes protected
router.use(protect);


// Create space - merchant, manager
router.post('/', authorize('merchant', 'manager'), createSpace);

// Get all spaces - merchant, manager, supervisor, staff
router.get('/', authorize('merchant', 'manager', 'supervisor', 'staff'), getSpaces);

// Get single space by id - merchant, manager, supervisor, staff
router.get('/:id', authorize('merchant', 'manager', 'supervisor', 'staff'), getSpaceById);

// Update space - merchant, manager
router.put('/:id', authorize('merchant', 'manager'), updateSpace);

// Delete space - merchant, manager
router.delete('/:id', authorize('merchant', 'manager'), deleteSpace);

module.exports = router;
