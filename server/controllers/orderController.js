const Order = require('../models/Order');
const Table = require('../models/Table');
const mongoose = require('mongoose');

// Generate unique order ID
const generateOrderId = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
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
      status: 'pending',
      completedAt: null,
      createdBy: req.user.id
    });

    // Update the table to reflect the new order
    await Table.findByIdAndUpdate(tableId, {
      status: 'occupied',
      orderedMenu: items,
      totalBill: totalBill
    });

    // Prevent caching
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
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
    // FIX: Removed the default 'completed' status so it fetches all orders if no status is provided
	const { status, timeFrame } = req.query;
	const filter = {};
	if (status) {
	  filter.status = status;
	}

    // ... rest of your existing timeframe filter logic ...

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    // Prevent caching to always get fresh data
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// Get single order by ID
exports.getOrder = async (req, res) => {
  try {
    // Validate ObjectId before querying
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    const order = await Order.findById(req.params.id);
    
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
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// Update an order
exports.updateOrder = async (req, res) => {
  try {
    // Validate ObjectId before querying
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }


    const { orderId, tableId, paymentMethod,systemChargeTax,systemChargeAmmount,optionalcharge } = req.body;
    let { discountApplied } = req.body;
    console.log("req body",req.body);

    

    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // discounapplied comes in percentage so converting it to amount

 if(systemChargeTax !== undefined && systemChargeAmmount !== undefined && discountApplied !== undefined){

    order.finalAmount = 0; // reset final amount before recalculation

    

    discountAmount = (order.totalBill * discountApplied) / 100;
    req.body.discountApplied = discountAmount;
    order.discountApplied = discountApplied || 0;
    
    order.finalAmount = order.totalBill - discountAmount;

    order.finalAmount += optionalcharge || 0;
    order.optionalcharge = optionalcharge || 0;


    order.taxAmount= (order.finalAmount * systemChargeTax) / 100;
    order.taxAmount += systemChargeAmmount;

    order.finalAmount += order.taxAmount;

    console.log('final amount calculation details:', {
      totalBill: order.totalBill,
      discountApplied,
      discountAmount,
      optionalcharge: order.optionalcharge,
      systemChargeTax,
      systemChargeAmmount,
      taxAmount: order.taxAmount,
      finalAmount: order.finalAmount
    });
    
  }



    // Update order fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        order[key] = req.body[key];
        console.log(`[UPDATE ORDER] Updated ${key} to`, req.body[key]);
      }
    });

    



    await order.save();

    console.log("order after save",order);
    // If order is marked as completed, update table status to available
    if (order.status === 'completed' && order.tableId) {
      console.log(`[UPDATE ORDER] Completing order ${order._id}`);
      console.log(`[UPDATE ORDER] Table ID: ${order.tableId}`);
      console.log(`[UPDATE ORDER] Order status: ${order.status}`);
      
      try {
        // First, check if table exists
        const existingTable = await Table.findById(order.tableId);
        console.log(`[UPDATE ORDER] Table found:`, existingTable ? `Yes - Current status: ${existingTable.status}` : 'No');
        
        if (existingTable) {
          const tableUpdate = await Table.findByIdAndUpdate(
            order.tableId, 
            {
              status: 'available',
              orderedMenu: [],
              totalBill: 0
            },
            { new: true }
          );
          console.log(`[UPDATE ORDER] Table updated successfully:`, {
            tableId: tableUpdate._id,
            tableName: tableUpdate.tableName,
            status: tableUpdate.status,
            orderedMenu: tableUpdate.orderedMenu,
            totalBill: tableUpdate.totalBill
          });
        } else {
          console.error(`[UPDATE ORDER] ERROR: Table with ID ${order.tableId} not found!`);
        }
      } catch (tableError) {
        console.error(`[UPDATE ORDER] ERROR updating table:`, tableError);
      }
    } else {
      console.log(`[UPDATE ORDER] Not updating table - Status: ${order.status}, TableId: ${order.tableId}`);
    }

    // Prevent caching
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });


    console.log("final order after update",order);
    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating order',
      error: error.message
    });
  }
};

// Complete an order
exports.completeOrder = async (req, res) => {
  try {
    const { orderId, tableId, paymentMethod, } = req.body;
    
    let order;
    
    if (orderId) {
      order = await Order.findById(orderId);
    } else if (tableId) {
      order = await Order.findOne({ tableId, status: { $ne: 'completed' } });
    }
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = 'completed';
    order.completedAt = new Date();
    if (paymentMethod) {
      order.paymentMethod = paymentMethod;
    }
    await order.save();

    // Update table status to available
    if (order.tableId) {
      console.log(`Completing order - Updating table ${order.tableId} to available`);
      const tableUpdate = await Table.findByIdAndUpdate(
        order.tableId,
        {
          status: 'available',
          orderedMenu: [],
          totalBill: 0
        },
        { new: true }
      );
      console.log('Table updated after completion:', tableUpdate);
    }

    res.status(200).json({
      success: true,
      message: 'Order completed successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error completing order',
      error: error.message
    });
  }
};

// Get orders summary/stats
exports.getOrdersSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const summary = await Order.aggregate([
      { $match: { createdBy: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalBill' }
        }
      }
    ]);

    const stats = {
      totalOrders: 0,
      activeOrders: 0,
      completedOrders: 0,
      totalRevenue: 0
    };

    summary.forEach(item => {
      stats.totalOrders += item.count;
      stats.totalRevenue += item.totalRevenue;
      
      if (item._id === 'completed') {
        stats.completedOrders = item.count;
      } else if (['pending', 'payment_pending', 'served'].includes(item._id)) {
        stats.activeOrders += item.count;
      }
    });

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders summary',
      error: error.message
    });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId || req.params.id;
    console.log('Cancel order request - orderId:', orderId);
    console.log('req.params:', req.params);
    if (!orderId) {
      console.log('No orderId provided');
      return res.status(400).json({ message: 'No orderId provided in params' });
    }
    const order = await Order.findById(orderId);
    console.log('Order found:', order ? 'Yes' : 'No');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    console.log('Order status:', order.status);
    if (order.status === 'served' || order.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot cancel a served or already cancelled order' });
    }
    order.status = 'cancelled';
    await order.save();
    console.log('Order status updated to cancelled');
    // Clear table if tableId provided
    if (order.tableId) {
      const table = await Table.findById(order.tableId);
      if (table) {
        table.status = 'available';
        table.currentOrderId = null;
        table.orderedMenu = [];
        table.totalBill = 0;
        await table.save();
        console.log('Table status updated to available and cleared');
      }
    }
    return res.status(200).json({ message: 'Order cancelled and table cleared', order });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};