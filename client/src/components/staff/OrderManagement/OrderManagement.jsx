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
    if (selectedMenuItems.length === 0) {
      alert('Please select menu items');
      return;
    }
    
    if (!selectedTable || !selectedTable._id) {
      alert('No table selected. Please try again.');
      return;
    }

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

      console.log('Submitting order:', orderData);
      
      const response = await axios.put(
        `${API_BASE_URL}/tables/${selectedTable._id}`, 
        orderData, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Order created successfully:', response.data);
      alert('Order created successfully!');
      setShowCreateOrderModal(false);
      setSelectedTable(null);
      setSelectedMenuItems([]);
      setMenuSearch('');
      await fetchActiveOrders();
    } catch (err) {
      console.error('Error creating order:', err);
      console.error('Error response:', err.response?.data);
      alert(`Failed to create order: ${err.response?.data?.message || err.message || 'Unknown error'}`);
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

  const handleCompleteOrder = async (order) => {
    if (!window.confirm("Mark this order as served?")) return;
    try {
      setLoading(true);
      const taxAmount = Math.round((order.totalBill * 5) / 100);
      const finalAmount = order.totalBill + taxAmount;
      
      await axios.post(`${API_BASE_URL}/orders`, 
        { 
          tableId: order._id,
          tableName: order.tableName,
          spaceType: order.spaceType,
          items: order.orderedMenu,
          totalBill: order.totalBill,
          paymentMethod: 'cash',
          discountApplied: 0,
          taxAmount: taxAmount
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Clear the table
      await axios.put(`${API_BASE_URL}/tables/${order._id}`, 
        { status: 'available', orderedMenu: [], totalBill: 0 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await fetchActiveOrders();
      await fetchCompletedOrders(timeFilter);
    } catch (err) {
      console.error('Error completing order:', err);
      alert('Failed to complete order');
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
                  <div className="flex gap-2">
                    <button onClick={() => handleCancelOrder(order._id)} className="flex-1 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg font-semibold hover:bg-red-100">
                      🚫 Cancel
                    </button>
                  </div>
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
                  <div className="mb-4">
                    <h3 className="font-bold text-lg mb-2">Selected for: {selectedTable?.tableName}</h3>
                    <p className="text-sm text-gray-600">{selectedTable?.spaceType}</p>
                  </div>
                  
                  <input type="text" placeholder="Search menu..." value={menuSearch} onChange={(e) => setMenuSearch(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                    {menuItems.length === 0 ? (
                      <div className="col-span-2 text-center py-8 text-gray-500">No menu items available</div>
                    ) : menuItems.filter(i => (i.name || i.itemName).toLowerCase().includes(menuSearch.toLowerCase())).map(item => (
                      <div key={item._id} className="p-3 border rounded-lg flex justify-between items-center bg-white hover:shadow-md transition-shadow">
                        <div>
                          <div className="font-semibold">{item.name || item.itemName}</div>
                          <div className="text-sm text-gray-600">₹{item.price}</div>
                        </div>
                        <button onClick={() => handleAddMenuItem(item)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {selectedMenuItems.length > 0 && (
                    <div className="border-2 border-green-600 rounded-lg p-4 bg-green-50">
                      <h3 className="font-bold text-lg mb-3 text-green-800">Selected Items ({selectedMenuItems.length})</h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
                        {selectedMenuItems.map(item => (
                          <div key={item._id} className="flex justify-between items-center bg-white p-2 rounded border">
                            <span className="font-medium">{item.name || item.itemName}</span>
                            <div className="flex items-center gap-3">
                              <button onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)} className="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200">-</button>
                              <span className="font-bold min-w-[30px] text-center">{item.quantity}</span>
                              <button onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)} className="px-2 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200">+</button>
                              <span className="ml-2 font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center text-lg font-bold border-t-2 border-green-600 pt-3">
                        <span>Total Amount:</span>
                        <span className="text-green-700">₹{calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <button onClick={() => setCreateOrderStep('selectTable')} className="flex-1 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500">Back</button>
                    <button 
                      onClick={handleSubmitOrder} 
                      disabled={selectedMenuItems.length === 0}
                      className={`flex-1 py-2 rounded-lg font-semibold ${selectedMenuItems.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                    >
                      Submit Order {selectedMenuItems.length > 0 && `(${selectedMenuItems.length} items)`}
                    </button>
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
