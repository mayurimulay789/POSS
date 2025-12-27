import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdTableRestaurant, MdEdit } from 'react-icons/md';
import API_BASE_URL from '../../../config/apiConfig';

const SpaceManagement = () => {
  const [activeTab, setActiveTab] = useState('Tables');
  const [tables, setTables] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState([]);
  const [menuSearch, setMenuSearch] = useState('');
  const [formData, setFormData] = useState({
    tableName: '',
    capacity: ''
  });

  const tabs = ['Tables' /*, 'Spa Room' */];

  // Fetch tables when tab changes
  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${API_BASE_URL}/tables?spaceType=${activeTab}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        console.log('Fetched tables:', response.data.data);
        setTables(response.data.data || []);
      } catch (err) {
        console.error('Error fetching tables:', err.message || err);
        // Only show alert for non-404 errors
        if (err.response && err.response.status !== 404) {
          alert('Failed to fetch tables. Please try again.');
        }
        setTables([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };
    
    fetchTables();
  }, [activeTab]);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/tables?spaceType=${activeTab}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setTables(response.data.data || []);
    } catch (err) {
      console.error('Error fetching tables:', err.message || err);
      // Only show alert for non-404 errors
      if (err.response && err.response.status !== 404) {
        alert('Failed to fetch tables. Please try again.');
      }
      setTables([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fetchMenuItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/menu/items`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log('Menu items fetched:', response.data);
      setMenuItems(response.data.data || response.data || []);
    } catch (err) {
      console.error('Error fetching menu:', err.message || err);
      setMenuItems([]);
    }
  };

  const openBookingModal = (table) => {
    setSelectedTable(table);
    // Pre-fill existing menu items if table is already booked
    if (table.orderedMenu && table.orderedMenu.length > 0) {
      setSelectedMenu(table.orderedMenu);
    } else {
      setSelectedMenu([]);
    }
    setMenuSearch('');
    fetchMenuItems();
    setShowBookingModal(true);
  };

  const handleUpdateMenu = (table, e) => {
    e.stopPropagation(); // Prevent card click
    openBookingModal(table);
  };

  const handleMenuQuantityChange = (itemId, quantity) => {
    if (quantity <= 0) {
      setSelectedMenu(selectedMenu.filter(m => m.id !== itemId));
    } else {
      const existing = selectedMenu.find(m => m.id === itemId);
      if (existing) {
        setSelectedMenu(selectedMenu.map(m => 
          m.id === itemId ? { ...m, quantity } : m
        ));
      } else {
        const item = menuItems.find(m => m._id === itemId);
        if (item) {
          setSelectedMenu([...selectedMenu, { 
            id: itemId, 
            name: item.name || item.itemName, 
            price: item.price,
            quantity 
          }]);
        }
      }
    }
  };

  const calculateBill = () => {
    return selectedMenu.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleBookTable = async () => {
    if (!selectedMenu.length) {
      alert('Please select at least one menu item');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const bookingData = {
        tableName: selectedTable.tableName,
        capacity: selectedTable.capacity,
        spaceType: activeTab,
        status: 'occupied',
        orderedMenu: selectedMenu,
        totalBill: calculateBill()
      };
      
      console.log('Booking data to send:', bookingData);
      
      // Update table status to booked
      const response = await axios.put(
        `${API_BASE_URL}/tables/${selectedTable._id}`,
        bookingData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('Booking response:', response.data);

      alert('Table booked successfully!');
      setShowBookingModal(false);
      setSelectedTable(null);
      setSelectedMenu([]);
      fetchTables();
    } catch (err) {
      console.error('Error booking table:', err.message || err);
      alert('Failed to book table');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.tableName || !formData.capacity) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.post(
        `${API_BASE_URL}/tables`,
        {
          tableName: formData.tableName,
          capacity: formData.capacity,
          spaceType: activeTab
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert('Table created successfully!');
      setShowAddForm(false);
      resetForm();
      fetchTables();
    } catch (err) {
      console.error('Error creating table:', err.message || err);
      alert('Failed to create table');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!formData.tableName || !formData.capacity) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${API_BASE_URL}/tables/${editingTable._id}`,
        {
          tableName: formData.tableName,
          capacity: formData.capacity,
          spaceType: activeTab
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert('Table updated successfully!');
      setShowEditForm(false);
      setEditingTable(null);
      resetForm();
      fetchTables();
    } catch (err) {
      console.error('Error updating table:', err.message || err);
      alert('Failed to update table');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (table) => {
    setEditingTable(table);
    setFormData({
      tableName: table.tableName,
      capacity: table.capacity
    });
    setShowEditForm(true);
  };

  const handleDelete = async (tableId) => {
    if (!window.confirm('Are you sure you want to delete this table?')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_BASE_URL}/tables/${tableId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Table deleted successfully!');
      fetchTables();
    } catch (err) {
      console.error('Error deleting table:', err.message || err);
      alert('Failed to delete table');
    } finally {
      setLoading(false);
    }
  };

  const handleClearTable = async (table, e) => {
    e.stopPropagation(); // Prevent opening booking modal
    
    if (!window.confirm(`Clear ${table.tableName}? This will mark it as available and remove all orders.`)) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${API_BASE_URL}/tables/${table._id}`,
        {
          tableName: table.tableName,
          capacity: table.capacity,
          spaceType: table.spaceType,
          status: 'available',
          orderedMenu: [],
          totalBill: 0
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Table cleared successfully!');
      fetchTables();
    } catch (err) {
      console.error('Error clearing table:', err.message || err);
      alert('Failed to clear table');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      tableName: '',
      capacity: ''
    });
  };

  const closeAddForm = () => {
    setShowAddForm(false);
    resetForm();
  };

  const closeEditForm = () => {
    setShowEditForm(false);
    setEditingTable(null);
    resetForm();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Space Management</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Management Content */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {activeTab} Management
          </h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add {activeTab === 'Tables' ? 'Table' : 'Room'}
          </button>
        </div>

        {/* Tables Grid */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : tables.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {tables.map((table) => (
              <div
                key={table._id}
                onClick={() => table.status === 'available' && openBookingModal(table)}
                className={`border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer ${
                  table.status === 'occupied' ? 'bg-green-50 border-green-200' : 'bg-white'
                }`}
              >
                <div className="aspect-video mb-2 rounded-lg overflow-hidden bg-white border flex items-start justify-start p-2 relative">
                  {table.orderedMenu && table.orderedMenu.length > 0 ? (
                    <div className="w-full h-full overflow-y-auto">
                      <button
                        onClick={(e) => handleUpdateMenu(table, e)}
                        className="absolute top-1 right-1 p-1 bg-green-500 text-white rounded-full hover:bg-green-600 shadow-md z-10"
                        title="Edit Menu"
                      >
                        <MdEdit className="w-3 h-3" />
                      </button>
                      <p className="text-xs font-bold text-green-700 mb-1">Menu Items:</p>
                      <div className="space-y-1">
                        {table.orderedMenu.map((item, idx) => (
                          <div key={idx} className="text-xs flex justify-between items-center bg-green-50 rounded px-1.5 py-1 border border-green-200">
                            <span className="font-medium text-gray-800 truncate">{item.name}</span>
                            <span className="text-gray-700 font-semibold ml-1">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      {table.totalBill && (
                        <div className="mt-2 pt-1 border-t border-green-300">
                          <p className="text-xs font-bold text-green-800">Total: ₹{table.totalBill.toFixed(2)}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MdTableRestaurant className="w-12 h-12 text-indigo-600" />
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-800 mb-1 text-sm">
                  {table.tableName}
                </h3>
                <p className="text-xs text-gray-600 mb-1">
                  Capacity: {table.capacity}
                </p>
                <p className="text-xs text-gray-600 mb-2">
                  Status: <span className={`font-medium ${
                    table.status === 'available' ? 'text-green-600' :
                    table.status === 'occupied' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>{table.status === 'occupied' ? 'Booked' : table.status}</span>
                </p>
                <div className="flex gap-1">
                  {table.status === 'occupied' ? (
                    <button
                      onClick={(e) => handleClearTable(table, e)}
                      className="w-full px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                    >
                      Clear Table
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(table); }}
                        className="flex-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(table._id); }}
                        className="flex-1 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">
              No {activeTab.toLowerCase()} found. Click "Add {activeTab === 'Tables' ? 'Table' : 'Room'}" to create one.
            </p>
          </div>
        )}
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Add New {activeTab === 'Tables' ? 'Table' : 'Room'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="tableName"
                  value={formData.tableName}
                  onChange={handleInputChange}
                  placeholder={`Enter ${activeTab === 'Tables' ? 'table' : 'room'} name`}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity *
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  placeholder="Enter capacity"
                  min="1"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={closeAddForm}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Edit {activeTab === 'Tables' ? 'Table' : 'Room'}
            </h2>
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="tableName"
                  value={formData.tableName}
                  onChange={handleInputChange}
                  placeholder={`Enter ${activeTab === 'Tables' ? 'table' : 'room'} name`}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity *
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  placeholder="Enter capacity"
                  min="1"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={closeEditForm}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              Book {selectedTable.tableName} (Capacity: {selectedTable.capacity})
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Menu Selection */}
              <div className="md:col-span-2">
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-700 mb-2">Select Menu Items</h3>
                  <input
                    type="text"
                    placeholder="Search menu items..."
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value.toLowerCase())}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto border rounded p-3">
                  {menuItems.length > 0 ? (
                    menuItems
                      .filter(item => item.name?.toLowerCase().includes(menuSearch) || item.itemName?.toLowerCase().includes(menuSearch))
                      .map((item) => (
                        <div key={item._id} className="flex gap-3 p-2 bg-gray-50 rounded hover:bg-gray-100">
                          {item.imageUrl && (
                            <img 
                              src={item.imageUrl} 
                              alt={item.name || item.itemName}
                              className="w-16 h-16 rounded object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.name || item.itemName}</p>
                            {item.description && (
                              <p className="text-xs text-gray-500 line-clamp-1">{item.description}</p>
                            )}
                            <p className="text-sm font-semibold text-indigo-600">₹{item.price}</p>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="number"
                              min="0"
                              max="10"
                              value={selectedMenu.find(m => m.id === item._id)?.quantity || 0}
                              onChange={(e) => handleMenuQuantityChange(item._id, parseInt(e.target.value) || 0)}
                              className="w-14 p-1 border rounded text-center text-sm"
                            />
                          </div>
                        </div>
                      ))
                  ) : (
                    <p className="text-gray-600 text-sm">No menu items available</p>
                  )}
                </div>
              </div>

              {/* Bill Summary */}
              <div className="bg-gray-50 rounded-lg p-4 h-fit">
                <h3 className="font-semibold text-gray-700 mb-3">Bill Summary</h3>
                <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                  {selectedMenu.length > 0 ? (
                    selectedMenu.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="truncate">{item.name} x {item.quantity}</span>
                        <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 text-sm">No items selected</p>
                  )}
                </div>
                <div className="border-t pt-2 mb-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₹{calculateBill().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-4">
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setSelectedTable(null);
                  setSelectedMenu([]);
                  setMenuSearch('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleBookTable}
                disabled={loading || selectedMenu.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                {loading ? 'Booking...' : 'Book Table'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpaceManagement;
