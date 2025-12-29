import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../../config/apiConfig';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get(`${API_BASE_URL}/tables`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = response.data?.data || [];
      const activeOrders = data.filter(
        table => table.orderedMenu && table.orderedMenu.length > 0
      );

      setOrders(activeOrders);
    } catch (err) {
      console.error('Error fetching orders:', err.message || err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = status => {
    switch (status) {
      case 'served':
        return 'bg-blue-100 text-blue-800';
      case 'occupied':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = status => {
    switch (status) {
      case 'served':
        return 'Served - Payment Pending';
      case 'occupied':
        return 'Pending';
      default:
        return 'Pending';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Order Management
        </h1>

        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        {loading ? (
          <p className="text-gray-600">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-600">No active orders right now.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map(order => (
              <div
                key={order._id}
                className="border rounded-lg p-4 bg-slate-50 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm text-gray-500">
                      {order.spaceType}
                    </p>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {order.tableName}
                    </h3>
                  </div>

                  <span
                    className={`px-2 py-1 text-xs rounded font-semibold ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusText(order.status)}
                  </span>
                </div>

                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Capacity: {order.capacity}
                  </p>

                  {order.totalBill && (
                    <p className="text-sm font-semibold text-gray-800">
                      Total: ₹{order.totalBill.toFixed(2)}
                    </p>
                  )}
                </div>

                <div className="mb-3">
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    Items
                  </p>

                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {order.orderedMenu.map((item, idx) => (
                      <div
                        key={`${order._id}-item-${idx}`}
                        className="flex justify-between text-sm bg-white rounded px-2 py-1 border"
                      >
                        <span className="truncate">{item.name}</span>
                        <span className="font-medium">
                          x{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {order.status === 'served' && (
                  <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-center">
                    <p className="text-sm font-semibold text-orange-700">
                      ⏳ Payment Pending
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Complete payment in Print Bill section
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
