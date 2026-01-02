const Order = require('../models/Order');
const Table = require('../models/Table');

// Generate unique order ID
const generateOrderId = () => {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

// Create a new order from table data
exports.createOrder = async (req, res) => {
  try {
    const { tableId, tableName, spaceType, items, totalBill, guestCount, paymentMethod, discountApplied, taxAmount } = req.body;

    if (!tableId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide tableId and items'
      });
    }

    const finalAmount = totalBill - (discountApplied || 0) + (taxAmount || 0);

    const order = await Order.create({
      orderId: generateOrderId(),
      tableId,
      tableName,
      spaceType,
      items,
      totalBill,
      finalAmount,
      guestCount: guestCount || 0,
      paymentMethod: paymentMethod || 'cash',
      discountApplied: discountApplied || 0,
      taxAmount: taxAmount || 0,
      status: 'completed',
      completedAt: new Date(),
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

// Get all orders with filters
exports.getOrders = async (req, res) => {
  try {
    const { status = 'completed', timeFrame } = req.query;
    const filter = {};

    // Merchants, managers, supervisors, and staff should see all orders
    // Only other roles are filtered by createdBy
    if (req.user.role !== 'merchant' && req.user.role !== 'manager' && req.user.role !== 'supervisor' && req.user.role !== 'staff') {
      filter.createdBy = req.user.id;
    }

    if (status) {
      filter.status = status;
    }

    // Time frame filtering
    if (timeFrame) {
      const now = new Date();
      let startDate;

      switch (timeFrame.toLowerCase()) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - now.getDay()));
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          break;
      }

      if (startDate) {
        filter.completedAt = { $gte: startDate };
      }
    }

    const orders = await Order.find(filter)
      .populate('tableId', 'tableName spaceType')
      .sort({ completedAt: -1 });

    // Calculate summary
    const summary = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.finalAmount, 0),
      totalDiscount: orders.reduce((sum, order) => sum + order.discountApplied, 0),
      totalTax: orders.reduce((sum, order) => sum + order.taxAmount, 0),
      averageOrderValue: orders.length > 0 ? (orders.reduce((sum, order) => sum + order.finalAmount, 0) / orders.length) : 0
    };

    res.status(200).json({
      success: true,
      count: orders.length,
      summary,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// Get single order
exports.getOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, createdBy: req.user.id })
      .populate('tableId')
      .populate('createdBy', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// Mark order as completed (from active order)
exports.completeOrder = async (req, res) => {
  try {
    const { tableId } = req.params;
    const { 
      paymentMethod,
      tableName,
      spaceType,
      items,
      totalBill,
      discountPercentage,
      systemChargeTax,
      systemChargesAmount,
      optionalCharges,
      finalTotal
    } = req.body;


    // Handle both formats: direct data or from table
    let orderData;
    
    if (tableId) {
      // Get table data
      const table = await Table.findOne({ _id: tableId, createdBy: req.user.id });

      if (!table) {
        return res.status(404).json({
          success: false,
          message: 'Table not found'
        });
      }

      if (!table.orderedMenu || table.orderedMenu.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No items in this order'
        });
      }

      orderData = {
        tableId: table._id,
        tableName: table.tableName,
        spaceType: table.spaceType,
        items: table.orderedMenu,
        totalBill: table.totalBill || 0
      };
    } else {
      // Direct data from request body
      orderData = {
        tableId: req.body.tableId,
        tableName,
        spaceType,
        items,
        totalBill: totalBill || 0
      };
    }

    const discountApplied = Math.round((orderData.totalBill * (discountPercentage || 0)) / 100);
    let finalAmount = orderData.totalBill - discountApplied ;
    const taxAmount = Math.round((finalAmount * (systemChargeTax || 0)) / 100)+ (systemChargesAmount || 0);
    finalAmount += taxAmount;

    return 0;

    // Create order record
    const order = await Order.create({
      orderId: generateOrderId(),
      tableId: orderData.tableId,
      tableName: orderData.tableName,
      spaceType: orderData.spaceType,
      items: orderData.items,
      totalBill: orderData.totalBill,
      finalAmount: finalAmount,
      paymentMethod,
      discountApplied: discountApplied,
      taxAmount: taxAmount,
      notes: '',
      status: 'completed',
      completedAt: new Date(),
      createdBy: req.user.id
    });

    // Clear table if tableId provided
    if (orderData.tableId) {
      await Table.findByIdAndUpdate(orderData.tableId, {
        status: 'available',
        orderedMenu: [],
        totalBill: 0
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order completed successfully',
      data: order
    });
  } catch (error) {
    console.error('Error completing order:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing order',
      error: error.message
    });
  }
};

// Get orders summary by date range
exports.getOrdersSummary = async (req, res) => {
  try {
    const { timeFrame = 'today' } = req.query;
    const now = new Date();
    let startDate;

    switch (timeFrame.toLowerCase()) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    const orders = await Order.find({
      createdBy: req.user.id,
      status: 'completed',
      completedAt: { $gte: startDate }
    });

    const summary = {
      timeFrame,
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.finalAmount, 0),
      totalDiscount: orders.reduce((sum, order) => sum + order.discountApplied, 0),
      totalTax: orders.reduce((sum, order) => sum + order.taxAmount, 0),
      averageOrderValue: orders.length > 0 ? (orders.reduce((sum, order) => sum + order.finalAmount, 0) / orders.length) : 0,
      paymentMethods: {
        cash: orders.filter(o => o.paymentMethod === 'cash').length,
        card: orders.filter(o => o.paymentMethod === 'card').length,
        online: orders.filter(o => o.paymentMethod === 'online').length,
        upi: orders.filter(o => o.paymentMethod === 'upi').length
      }
    };

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching orders summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders summary',
      error: error.message
    });
  }
};

// Delete/Cancel an order
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = '' } = req.body;

    const order = await Order.findOne({ _id: id, createdBy: req.user.id });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = 'cancelled';
    order.notes = reason;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling order',
      error: error.message
    });
  }
};
