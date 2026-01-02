const express = require('express');
const { protect } = require('../middleware/auth');
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrder,
  completeOrder,
  getOrdersSummary,
  cancelOrder
} = require('../controllers/orderController');

const router = express.Router();

// All routes require authentication
router.use(protect);

// More specific routes FIRST to avoid conflicts
// Get orders summary (specific path before :id)
router.get('/summary/stats', getOrdersSummary);

// Complete an order directly (from print bill)
router.post('/complete', completeOrder);

// Complete an order (from active to completed)
router.post('/:tableId/complete', completeOrder);

// Cancel order - MUST be before /:id routes to avoid conflicts
router.post('/:orderId/cancel', cancelOrder);
router.delete('/:id/cancel', cancelOrder);

// Then more general routes
// Create a new order
router.post('/', createOrder);

// Get all orders with filters
router.get('/', getOrders);

// Get single order
router.get('/:id', getOrder);

// Update order
router.put('/:id', updateOrder);

// Delete order
router.delete('/:id', cancelOrder);

module.exports = router;
