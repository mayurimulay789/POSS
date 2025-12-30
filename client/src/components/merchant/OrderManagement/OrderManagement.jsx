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
  
  // Create Order states
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [createOrderStep, setCreateOrderStep] = useState('selectTable'); 
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedMenuItems, setSelectedMenuItems] = useState([]);
  const [menuSearch, setMenuSearch] = useState('');

  const token = localStorage.getItem('token');

  const fetchActiveOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/tables`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data?.data || [];
      const activeOrders = data.filter((t) => t.orderedMenu && t.orderedMenu.length > 0);
      setOrders(activeOrders);
    } catch (err) {
      console.error('Error fetching active orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // --- UPDATED: Robust Filter to exclude Spa Room ---
  const fetchAvailableTables = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tables`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data?.data || [];
      
      const filteredTables = data.filter((t) => {
        const isTableEmpty = !t.orderedMenu || t.orderedMenu.length === 0;
        
        // This checks if spaceType exists and does NOT contain the word "spa" (case-insensitive)
        const spaceType = (t.spaceType || "").toLowerCase();
        const isNotSpa = !spaceType.includes('spa');
        
        return isTableEmpty && isNotSpa;
      });

      setAvailableTables(filteredTables);
    } catch (err) {
      console.error('Error fetching tables:', err);
      setAvailableTables([]);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/menu/items`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMenuItems(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Error fetching menu:', err);
      setMenuItems([]);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'served': return 'bg-blue-100 text-blue-800';
      case 'occupied': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'served': return 'Served - Payment Pending';
      case 'occupied': return 'Pending';
      default: return 'Pending';
    }
  };

  const fetchCompletedOrders = async (filter = 'all') => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/orders?status=completed`;
      if (filter !== 'all') url += `&timeFrame=${filter}`;
      const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setCompletedOrders(response.data?.data || []);
      setSummary(response.data?.summary || null);
    } catch (err) {
      console.error('Error fetching completed orders:', err);
      setCompletedOrders([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'active') fetchActiveOrders();
    else fetchCompletedOrders(timeFilter);
  }, [activeTab, timeFilter]);

  const handleCreateOrder = () => {
    setCreateOrderStep('selectTable');
    fetchAvailableTables();
    setShowCreateOrderModal(true);
  };

  const handleSelectTable = (table) => {
    setSelectedTable(table);
    fetchMenuItems();
    setCreateOrderStep('selectMenu');
    setSelectedMenuItems([]);
  };

  const handleAddMenuItem = (item) => {
    const existing = selectedMenuItems.find(m => m._id === item._id);
    if (existing) {
      setSelectedMenuItems(selectedMenuItems.map(m =>
        m._id === item._id ? { ...m, quantity: m.quantity + 1 } : m
      ));
    } else {
      setSelectedMenuItems([...selectedMenuItems, { ...item, quantity: 1 }]);
    }
  };

  const handleUpdateQuantity = (itemId, quantity) => {
    if (quantity <= 0) setSelectedMenuItems(selectedMenuItems.filter(m => m._id !== itemId));
    else setSelectedMenuItems(selectedMenuItems.map(m => m._id === itemId ? { ...m, quantity } : m));
  };

  const calculateTotal = () => selectedMenuItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const handleSubmitOrder = async () => {
    if (selectedMenuItems.length === 0) return alert('Please select menu items');
    try {
      setLoading(true);
      const orderData = {
        tableName: selectedTable.tableName,
        capacity: selectedTable.capacity,
        spaceType: selectedTable.spaceType || 'Tables',
        status: 'occupied',
        orderedMenu: selectedMenuItems.map(item => ({
          id: item._id,
          name: item.name || item.itemName,
          price: item.price,
          quantity: item.quantity
        })),
        totalBill: calculateTotal()
      };
      await axios.put(`${API_BASE_URL}/tables/${selectedTable._id}`, orderData, { headers: { Authorization: `Bearer ${token}` } });
      setShowCreateOrderModal(false);
      fetchActiveOrders();
    } catch (err) {
      alert('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (tableId) => {
    if (!window.confirm("Cancel this order?")) return;
    try {
      setLoading(true);
      const resetData = { status: 'available', orderedMenu: [], totalBill: 0 };
      await axios.put(`${API_BASE_URL}/tables/${tableId}`, resetData, { headers: { Authorization: `Bearer ${token}` } });
      fetchActiveOrders();
    } catch (err) {
      alert('Failed to cancel');
    } finally {
      setLoading(false);
    }
  };

  const renderActiveTab = () => (
    <div className="space-y-4">
      {loading ? <p className="text-center py-8">Loading...</p> : orders.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg">No active orders</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <div key={order._id} className="border rounded-lg p-4 bg-slate-50 flex flex-col">
              <div className="flex justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-500 font-semibold">{order.spaceType}</p>
                  <h3 className="text-xl font-bold">{order.tableName}</h3>
                </div>
                <span className={`px-3 py-1 text-xs rounded-full font-semibold ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>
              <div className="mb-4 flex-grow">
                <div className="bg-white rounded p-2 border border-gray-200">
                  {order.orderedMenu.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm py-1">
                      <span>{item.name} x{item.quantity}</span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-auto">
                {order.status !== 'served' && (
                  <button onClick={() => handleCancelOrder(order._id)} className="w-full py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg font-semibold">
                    🚫 Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Order Management</h1>
        <button onClick={handleCreateOrder} className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold">➕ Create Order</button>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button onClick={() => setActiveTab('active')} className={`px-6 py-3 font-semibold ${activeTab === 'active' ? 'text-yellow-600 border-b-2 border-yellow-600' : 'text-gray-600'}`}>🔄 Active ({orders.length})</button>
        <button onClick={() => setActiveTab('completed')} className={`px-6 py-3 font-semibold ${activeTab === 'completed' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600'}`}>✅ Completed ({completedOrders.length})</button>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        {activeTab === 'active' ? renderActiveTab() : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex gap-2">
                {['all','today','week','month'].map(f => (
                  <button
                    key={f}
                    onClick={() => setTimeFilter(f)}
                    className={`px-3 py-2 text-sm rounded border ${timeFilter === f ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-200'}`}
                  >
                    {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
              {summary && (
                <div className="flex flex-wrap gap-3 text-sm text-gray-700">
                  <span className="px-3 py-1 bg-white border border-gray-200 rounded">Orders: {summary.totalOrders}</span>
                  <span className="px-3 py-1 bg-white border border-gray-200 rounded">Revenue: ₹{summary.totalRevenue?.toFixed(2) || 0}</span>
                  <span className="px-3 py-1 bg-white border border-gray-200 rounded">Avg: ₹{summary.averageOrderValue?.toFixed(2) || 0}</span>
                </div>
              )}
            </div>

            {loading ? (
              <p className="text-center py-8">Loading...</p>
            ) : completedOrders.length === 0 ? (
              <div className="text-center py-12 bg-white border border-dashed border-gray-200 rounded-lg">No completed orders</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedOrders.map(order => (
                  <div key={order._id} className="border rounded-lg bg-white p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-xs text-gray-500">{order.spaceType}</p>
                        <h3 className="text-lg font-semibold">{order.tableName}</h3>
                        <p className="text-xs text-gray-500">Order #{order.orderId || order._id?.slice(-6)}</p>
                      </div>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Completed</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-3">{order.completedAt ? new Date(order.completedAt).toLocaleString() : '—'}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                      <span className="px-2 py-1 bg-gray-100 rounded">Payment: {(order.paymentMethod || 'cash').toUpperCase()}</span>
                    </div>
                    <div className="bg-gray-50 border rounded p-2 max-h-40 overflow-y-auto mb-3">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm py-1">
                          <span>{item.name} x{item.quantity}</span>
                          <span>₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-sm font-semibold">
                      <span>Total</span>
                      <span>₹{(order.finalAmount || order.totalBill || 0).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showCreateOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-green-600 text-white p-6 flex justify-between items-center sticky top-0">
              <h2 className="text-2xl font-bold">{createOrderStep === 'selectTable' ? 'Select Table' : 'Add Items'}</h2>
              <button onClick={() => setShowCreateOrderModal(false)}>✕</button>
            </div>
            <div className="p-6">
              {createOrderStep === 'selectTable' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {availableTables.map((table) => (
                    <button key={table._id} onClick={() => handleSelectTable(table)} className="p-4 border-2 rounded-lg hover:border-green-600 hover:bg-green-50 text-left">
                      <h3 className="font-bold">{table.tableName}</h3>
                      <p className="text-xs text-gray-500">{table.spaceType}</p>
                    </button>
                  ))}
                </div>
              )}
              {createOrderStep === 'selectMenu' && (
                <div className="space-y-4">
                  <input type="text" placeholder="Search menu..." value={menuSearch} onChange={(e) => setMenuSearch(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                    {menuItems.filter(i => (i.name || i.itemName).toLowerCase().includes(menuSearch.toLowerCase())).map(item => (
                      <div key={item._id} className="p-3 border rounded-lg flex justify-between items-center">
                        <span>{item.name || item.itemName} (₹{item.price})</span>
                        <button onClick={() => handleAddMenuItem(item)} className="bg-green-600 text-white px-3 py-1 rounded">Add</button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setCreateOrderStep('selectTable')} className="flex-1 py-2 bg-gray-400 text-white rounded-lg">Back</button>
                    <button onClick={handleSubmitOrder} className="flex-1 py-2 bg-green-600 text-white rounded-lg">Submit Order</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;