import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../../config/apiConfig';

const BillingManagement = () => {
  const [activeTab, setActiveTab] = useState('kot');
  const [orders, setOrders] = useState([]);
  const [servedOrders, setServedOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState({});

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/tables`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = response.data?.data || [];
      const activeOrders = data.filter(
        (t) => t.orderedMenu && t.orderedMenu.length > 0 && (t.status === 'occupied' || !t.status)
      );
      const served = data.filter(
        (t) => t.orderedMenu && t.orderedMenu.length > 0 && t.status === 'served'
      );
      setOrders(activeOrders);
      setServedOrders(served);
    } catch (err) {
      console.error('Error fetching orders:', err.message || err);
      setOrders([]);
      setServedOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/orders?status=completed`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompletedOrders(response.data?.data || []);
    } catch (err) {
      console.error('Error fetching completed orders:', err.message || err);
      setCompletedOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'completed') {
      fetchCompletedOrders();
    } else {
      fetchOrders();
    }
  }, [activeTab]);

  const markServed = async (order) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      await axios.put(
        `${API_BASE_URL}/tables/${order._id}`,
        {
          tableName: order.tableName,
          capacity: order.capacity,
          spaceType: order.spaceType,
          status: 'served',
          orderedMenu: order.orderedMenu,
          totalBill: order.totalBill
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      fetchOrders();
    } catch (err) {
      console.error('Error marking order as served:', err.response?.data || err.message || err);
      alert('Failed to mark order as served: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const markCompleted = async (order) => {
    const paymentMethod = selectedPayment[order._id] || 'cash';
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Create order in database
      await axios.post(
        `${API_BASE_URL}/orders/complete`,
        {
          tableId: order._id,
          tableName: order.tableName,
          spaceType: order.spaceType,
          items: order.orderedMenu,
          totalBill: order.totalBill,
          paymentMethod: paymentMethod
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Clear the table
      await axios.put(
        `${API_BASE_URL}/tables/${order._id}`,
        {
          tableName: order.tableName,
          capacity: order.capacity,
          spaceType: order.spaceType,
          status: 'available',
          orderedMenu: [],
          totalBill: 0
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      fetchOrders();
    } catch (err) {
      console.error('Error completing order:', err.response?.data || err.message || err);
      alert('Failed to complete order');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (order) => {
    const paymentMethod = selectedPayment[order._id] || 'cash';
    
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill - ${order.tableName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .bill-details { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .total { font-weight: bold; font-size: 18px; text-align: right; margin-top: 20px; padding: 10px; border-top: 2px solid #000; }
          .payment-info { margin-top: 20px; padding: 10px; background-color: #f9f9f9; border: 1px solid #ddd; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Restaurant Bill</h1>
          <p>Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
        </div>
        <div class="bill-details">
          <p><strong>Table:</strong> ${order.tableName}</p>
          <p><strong>Space Type:</strong> ${order.spaceType}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${order.orderedMenu.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>₹${item.price?.toFixed(2) || '0.00'}</td>
                <td>₹${((item.price || 0) * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="payment-info">
          <p><strong>Payment Method:</strong> ${paymentMethod.toUpperCase()}</p>
        </div>
        <div class="total">
          <p>Total Bill: ₹${order.totalBill?.toFixed(2) || '0.00'}</p>
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <p style="font-size: 12px; color: #666;">Thank you for your visit!</p>
          <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; background-color: #4CAF50; color: white; border: none; border-radius: 4px; margin-top: 10px;">Print Bill</button>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="p-6">

        <button
          onClick={() => setActiveTab('completed')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'completed'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Completed Bills
        </button>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Billing Management

     </h1>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('kot')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'kot'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          KOT
        </button>
        <button
          onClick={() => setActiveTab('print-bill')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'print-bill'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Print Bill
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow p-6">

        {activeTab === 'kot' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">KOT (Kitchen Order Ticket)</h2>
              {/* <button
                onClick={fetchOrders}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Refresh
              </button> */}
            </div>

            {loading ? (
              <p className="text-gray-600">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-gray-600">No pending orders right now.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="border rounded-lg p-4 bg-slate-50 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm text-gray-500">{order.spaceType}</p>
                        <h3 className="text-lg font-semibold text-gray-800">{order.tableName}</h3>
                      </div>
                      <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800 font-semibold">
                        Pending
                      </span>
                    </div>

                    <div className="mb-2">
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt || Date.now()).toLocaleDateString()} {new Date(order.createdAt || Date.now()).toLocaleTimeString()}
                      </p>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Items</p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {order.orderedMenu.map((item, idx) => (
                          <div
                            key={`${order._id}-item-${idx}`}
                            className="flex justify-between text-sm bg-white rounded px-2 py-1 border"
                          >
                            <span className="truncate">{item.name}</span>
                            <span className="font-medium">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => markServed(order)}
                        className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Mark as Served
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'print-bill' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Print Bill</h2>
              {/* <button
                onClick={fetchOrders}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Refresh
              </button> */}
            </div>

            {loading ? (
              <p className="text-gray-600">Loading served orders...</p>
            ) : servedOrders.length === 0 ? (
              <p className="text-gray-600">No served orders available for billing.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {servedOrders.map((order) => (
                  <div
                    key={order._id}
                    className="border rounded-lg p-4 bg-slate-50 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm text-gray-500">{order.spaceType}</p>
                        <h3 className="text-lg font-semibold text-gray-800">{order.tableName}</h3>
                      </div>
                      <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 font-semibold">
                        Served
                      </span>
                    </div>

                    <div className="mb-2">
                      <p className="text-sm font-semibold text-gray-800">Total: ₹{order.totalBill?.toFixed(2) || '0.00'}</p>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Items</p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {order.orderedMenu.map((item, idx) => (
                          <div
                            key={`${order._id}-item-${idx}`}
                            className="flex justify-between text-sm bg-white rounded px-2 py-1 border"
                          >
                            <span className="truncate">{item.name}</span>
                            <span className="font-medium">x{item.quantity} - ₹{((item.price || 0) * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
                      <select
                        value={selectedPayment[order._id] || 'cash'}
                        onChange={(e) => setSelectedPayment({ ...selectedPayment, [order._id]: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="cash">Cash</option>
                        <option value="upi">UPI</option>
                        <option value="card">Card</option>
                        <option value="online">Online</option>
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePrint(order)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Print Bill
                      </button>
                      <button
                        onClick={() => markCompleted(order)}
                        className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Payment Complete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'completed' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Completed Bills</h2>
              {/* <button
                onClick={fetchCompletedOrders}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Refresh
              </button> */}
            </div>

            {loading ? (
              <p className="text-gray-600">Loading completed bills...</p>
            ) : completedOrders.length === 0 ? (
              <p className="text-gray-600">No completed bills yet.</p>
            ) : (
              <div className="space-y-3">
                {completedOrders.map((order) => (
                  <div
                    key={order._id}
                    className="border rounded-lg p-4 bg-green-50 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-800">{order.tableName}</h3>
                          <span className="px-2 py-1 text-xs rounded bg-green-600 text-white font-semibold">
                            Completed
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{order.spaceType}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(order.completedAt || order.createdAt).toLocaleDateString()} {new Date(order.completedAt || order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-700">₹{order.totalBill?.toFixed(2) || order.finalAmount?.toFixed(2) || '0.00'}</p>
                        <p className="text-sm text-gray-600 capitalize">
                          <span className="font-semibold">Payment:</span> {order.paymentMethod || 'cash'}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-2">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Items:</p>
                      <div className="space-y-1">
                        {order.items?.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm text-gray-600"
                          >
                            <span>{item.name}</span>
                            <span>x{item.quantity} - ₹{(item.subtotal || (item.price * item.quantity))?.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <p className="text-gray-600">
          This is the BillingManagement component for merchant role.
        </p>
        {/* Add your BillingManagement content here */}

      </div>
    </div>
  );
};

export default BillingManagement;
