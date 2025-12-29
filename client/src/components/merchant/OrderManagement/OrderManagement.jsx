import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../../config/apiConfig';

const OrderManagement = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [orders, setOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState('all');
  const [summary, setSummary] = useState(null);

  const token = localStorage.getItem('token');

  // Fetch active orders
  const fetchActiveOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/tables`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = response.data?.data || [];
      const activeOrders = data.filter(
        (t) => t.orderedMenu && t.orderedMenu.length > 0
      );
      setOrders(activeOrders);
    } catch (err) {
      console.error('Error fetching active orders:', err.message || err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'served':
        return 'bg-blue-100 text-blue-800';
      case 'occupied':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'served':
        return 'Served - Payment Pending';
      case 'occupied':
        return 'Pending';
      default:
        return 'Pending';
    }
  };

  // Fetch completed orders
  const fetchCompletedOrders = async (filter = 'all') => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/orders?status=completed`;

      if (filter !== 'all') {
        url += `&timeFrame=${filter}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCompletedOrders(response.data?.data || []);
      setSummary(response.data?.summary);
    } catch (err) {
      console.error('Error fetching completed orders:', err.message || err);
      setCompletedOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'active') {
      fetchActiveOrders();
    } else {
      fetchCompletedOrders(timeFilter);
    }
  }, [activeTab, timeFilter]);

  const handleCompleteOrder = async (order) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/orders/${order._id}/complete`,
        {
          tableId: order._id,
          paymentMethod: 'cash',
          discountApplied: 0,
          notes: ''
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        fetchActiveOrders();
        // Auto-switch to completed tab
        setActiveTab('completed');
        setTimeout(() => fetchCompletedOrders('today'), 500);
      }
    } catch (err) {
      console.error('Error completing order:', err);
      alert('Failed to complete order: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Active Orders Tab
  const renderActiveTab = () => (
    <div className="space-y-4">
      {loading ? (
        <p className="text-gray-600 text-center py-8">Loading active orders...</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <p className="text-gray-600 text-lg">No active orders at the moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border rounded-lg p-4 bg-slate-50 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">{order.spaceType}</p>
                  <h3 className="text-xl font-bold text-gray-800">{order.tableName}</h3>
                </div>
                <span className={`px-3 py-1 text-xs rounded-full font-semibold ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>

              <div className="mb-3 pb-3 border-b border-gray-200">
                <p className="text-sm text-gray-600">Capacity: <span className="font-semibold">{order.capacity}</span></p>
                {order.totalBill ? (
                  <p className="text-lg font-bold text-gray-700">₹{order.totalBill.toFixed(2)}</p>
                ) : null}
              </div>

              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Order Items</p>
                <div className="space-y-1 max-h-40 overflow-y-auto bg-white rounded p-2 border border-gray-200">
                  {order.orderedMenu.map((item, idx) => (
                    <div
                      key={`${order._id}-item-${idx}`}
                      className="flex justify-between text-sm py-1"
                    >
                      <span className="truncate text-gray-700">{item.name}</span>
                      <div className="flex gap-2 ml-2">
                        <span className="font-semibold text-gray-700">x{item.quantity}</span>
                        <span className="text-gray-600">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {order.status === 'served' && (
                <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-center">
                  <p className="text-sm font-semibold text-orange-700">⏳ Payment Pending</p>
                  <p className="text-xs text-gray-600 mt-1">Complete payment in Billing Management → Print Bill</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Completed Orders Tab
  const renderCompletedTab = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-600 text-sm font-semibold">Total Orders</p>
            <p className="text-2xl font-bold text-blue-700">{summary.totalOrders}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-600 text-sm font-semibold">Total Revenue</p>
            <p className="text-2xl font-bold text-green-700">₹{summary.totalRevenue?.toFixed(2)}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm font-semibold">Total Discount</p>
            <p className="text-2xl font-bold text-red-700">₹{summary.totalDiscount?.toFixed(2)}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-purple-600 text-sm font-semibold">Avg Order Value</p>
            <p className="text-2xl font-bold text-purple-700">₹{summary.averageOrderValue?.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Orders List */}
      {loading ? (
        <p className="text-gray-600 text-center py-8">Loading completed orders...</p>
      ) : completedOrders.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <p className="text-gray-600 text-lg">No completed orders for {timeFilter}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {completedOrders.map((order) => (
            <div
              key={order._id}
              className="border border-green-300 rounded-lg p-4 bg-green-50 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">{order.spaceType}</p>
                  <h3 className="text-lg font-bold text-gray-800">{order.tableName}</h3>
                  <p className="text-xs text-gray-600 mt-1">{order.orderId}</p>
                </div>
                <span className="px-3 py-1 text-xs rounded-full bg-green-600 text-white font-semibold">
                  COMPLETED
                </span>
              </div>

              <div className="mb-3 pb-3 border-b border-green-200">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Subtotal</p>
                    <p className="font-semibold">₹{order.totalBill?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Discount</p>
                    <p className="font-semibold text-red-600">-₹{order.discountApplied?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Tax</p>
                    <p className="font-semibold">₹{order.taxAmount?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment</p>
                    <p className="font-semibold capitalize">{order.paymentMethod}</p>
                  </div>
                </div>
              </div>

              <div className="mb-3 pb-3 border-b border-green-200">
                <p className="text-2xl font-bold text-green-700">Total: ₹{order.finalAmount?.toFixed(2)}</p>
              </div>

              <div className="mb-3">
                <p className="text-sm font-semibold text-gray-700 mb-2">Items ({order.items?.length || 0})</p>
                <div className="space-y-1 max-h-32 overflow-y-auto text-sm">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-gray-700">
                      <span>{item.name} x{item.quantity}</span>
                      <span className="font-medium">₹{(item.subtotal || item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {order.notes && (
                <div className="bg-white border border-green-200 rounded p-2 text-xs text-gray-700">
                  <p className="font-semibold">Notes:</p>
                  <p>{order.notes}</p>
                </div>
              )}


              <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-green-200">
                Completed: {new Date(order.completedAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
        <button
          onClick={() => activeTab === 'active' ? fetchActiveOrders() : fetchCompletedOrders(timeFilter)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
        >
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'active'
              ? 'text-yellow-600 border-b-2 border-yellow-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          🔄 Active Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'completed'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          ✅ Completed Orders ({completedOrders.length})
        </button>
      </div>

      {/* Time Filter for Completed Orders */}
      {activeTab === 'completed' && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTimeFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              timeFilter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setTimeFilter('today')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              timeFilter === 'today'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeFilter('week')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              timeFilter === 'week'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeFilter('month')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              timeFilter === 'month'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            This Month
          </button>
        </div>
      )}

      {/* Tab Content */}
      <div className="bg-gray-50 rounded-lg p-6">
        {activeTab === 'active' ? renderActiveTab() : renderCompletedTab()}
      </div>
    </div>
  );
};

export default OrderManagement;
