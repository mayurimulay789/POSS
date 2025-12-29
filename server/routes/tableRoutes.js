const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/uploadMiddleware');
const {
  getTables,
  createTable,
  updateTable,
  deleteTable,
  getTableById
} = require('../controllers/tableController');

// All routes are protected and require authentication
router.use(protect);

// Routes
router.route('/')
  .get(getTables)
  .post(uploadSingle('tableImage'), createTable);

router.route('/:id')
  .get(getTableById)
  .put(uploadSingle('tableImage'), updateTable)
  .delete(deleteTable);

module.exports = router;
