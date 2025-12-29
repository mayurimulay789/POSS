const express = require('express');
const router = express.Router();

const {
  createTask,
  getAllTasks,
  getMyTasks,
  getAssignedTasks,
  getMyPendingTasks,
  getMyCompletedTasks,
  getTaskById,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

const { protect, authorize } = require('../middleware/auth');


router.use(protect);

router.post(
  '/',
  authorize('merchant', 'manager', 'supervisor', 'staff'),
  createTask
);


router.get(
  '/',
  authorize('merchant', 'manager', 'supervisor', 'staff'),
  getAllTasks
);


router.get(
  '/my-tasks',
  authorize('merchant', 'manager', 'supervisor', 'staff'),
  getMyTasks
);


router.get(
  '/assigned-by-me',
  authorize('merchant', 'manager', 'supervisor', 'staff'),
  getAssignedTasks
);


router.get(
  '/my-tasks/pending',
  authorize('merchant', 'manager', 'supervisor', 'staff'),
  getMyPendingTasks
);


router.get(
  '/my-tasks/completed',
  authorize('merchant', 'manager', 'supervisor', 'staff'),
  getMyCompletedTasks
);


router.get(
  '/:id',
  authorize('merchant', 'manager', 'supervisor', 'staff'),
  getTaskById
);


router.put(
  '/:id',
  authorize('merchant', 'manager', 'supervisor', 'staff'),
  updateTask
);


router.delete(
  '/:id',
  authorize('merchant', 'manager', 'supervisor', 'staff'),
  deleteTask
);

module.exports = router;
