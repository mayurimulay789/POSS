import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdTableRestaurant } from 'react-icons/md';
import API_BASE_URL from '../../../config/apiConfig';

const SpaceManagement = () => {
  const [activeTab, setActiveTab] = useState('Tables');
  const [tables, setTables] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tableName: '',
    capacity: ''
  });

  const tabs = ['Tables'];

  // Fetch tables when tab changes
  useEffect(() => {
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
      if (err.response && err.response.status !== 404) {
        alert('Failed to fetch tables. Please try again.');
      }
      setTables([]);
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

  const validateTableName = (name) => {
    if (!name || name.trim() === '') {
      return 'Table name is required';
    }
    if (name.trim().length < 2) {
      return 'Table name must be at least 2 characters';
    }
    if (name.trim().length > 50) {
      return 'Table name must not exceed 50 characters';
    }
    return null;
  };

  const validateCapacity = (capacity) => {
    const capacityNum = parseInt(capacity);
    if (!capacity || capacity === '') {
      return 'Capacity is required';
    }
    if (isNaN(capacityNum) || capacityNum <= 0) {
      return 'Capacity must be a positive number';
    }
    if (capacityNum > 100) {
      return 'Capacity cannot exceed 100 persons';
    }
    return null;
  };

  const getFormErrors = () => {
    const errors = {};
    const nameError = validateTableName(formData.tableName);
    const capacityError = validateCapacity(formData.capacity);
    
    if (nameError) errors.tableName = nameError;
    if (capacityError) errors.capacity = capacityError;
    
    return errors;
  };

  const handleReserveTable = async (table, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      
      const isReserving = !table.isReserved;
      
      await axios.put(
        `${API_BASE_URL}/tables/${table._id}`,
        {
          tableName: table.tableName,
          capacity: table.capacity,
          spaceType: table.spaceType,
          status: table.status || 'available',
          orderedMenu: table.orderedMenu || [],
          totalBill: table.totalBill || 0,
          isReserved: isReserving
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update local state immediately
      setTables(prevTables =>
        prevTables.map(t =>
          t._id === table._id ? { ...t, isReserved: isReserving } : t
        )
      );

      alert(isReserving ? 'Table reserved successfully!' : 'Reservation cancelled!');
      
      // Fetch fresh data from server
      await fetchTables();
    } catch (err) {
      console.error('Error updating table:', err.message || err);
      alert('Failed to update table');
      fetchTables();
    }
  };

  const handleClearTable = async (table, e) => {
    e.stopPropagation();
    
    if (!window.confirm(`Clear ${table.tableName}? This will remove all orders.`)) {
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
          totalBill: 0,
          isReserved: false
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = getFormErrors();
    if (Object.keys(errors).length > 0) {
      alert(Object.values(errors).join('\n'));
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
    
    const errors = getFormErrors();
    if (Object.keys(errors).length > 0) {
      alert(Object.values(errors).join('\n'));
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

  const getTableCardColor = (table) => {
    if (table.isReserved) {
      return 'bg-yellow-50 border-yellow-300 border-2';
    } else if (table.orderedMenu && table.orderedMenu.length > 0) {
      return 'bg-green-50 border-green-300 border-2';
    } else {
      return 'bg-white border border-gray-300';
    }
  };

  const getTableStatus = (table) => {
    if (table.isReserved) {
      return { text: 'Reserved', color: 'text-yellow-600 bg-yellow-100' };
    } else if (table.orderedMenu && table.orderedMenu.length > 0) {
      return { text: 'Booked', color: 'text-green-600 bg-green-200' };
    } else {
      return { text: 'Available', color: 'text-blue-600 bg-blue-100' };
    }
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
            {tables.map((table) => {
              const status = getTableStatus(table);
              const cardColor = getTableCardColor(table);
              
              return (
                <div
                  key={table._id}
                  className={`rounded-lg p-3 transition-shadow hover:shadow-md ${cardColor}`}
                >
                  {/* Table Icon/Menu Section */}
                  <div className="aspect-video mb-2 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                    {table.orderedMenu && table.orderedMenu.length > 0 ? (
                      <div className="w-full h-full overflow-y-auto p-2">
                        <p className="text-xs font-bold text-gray-700 mb-1">Menu:</p>
                        <div className="space-y-1">
                          {table.orderedMenu.map((item, idx) => (
                            <div key={idx} className="text-xs bg-white rounded px-1.5 py-1 border border-gray-200">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700 truncate">{item.name}</span>
                                <span className="text-gray-600 font-semibold ml-1">x{item.quantity}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <MdTableRestaurant className="w-12 h-12 text-gray-400" />
                    )}
                  </div>

                  {/* Table Info */}
                  <h3 className="font-semibold text-gray-800 mb-1 text-sm">
                    {table.tableName}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">
                    Capacity: {table.capacity}
                  </p>

                  {/* Status Badge */}
                  <p className="text-xs mb-2">
                    <span className={`px-2 py-1 rounded-full font-medium inline-block ${status.color}`}>
                      {status.text}
                    </span>
                  </p>

                  {/* Bill if booked */}
                  {table.totalBill && table.orderedMenu && table.orderedMenu.length > 0 && (
                    <p className="text-xs font-bold text-gray-800 mb-2 bg-gray-100 rounded px-2 py-1">
                      Bill: ₹{table.totalBill.toFixed(2)}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-1 flex-wrap">
                    {table.isReserved ? (
                      <button
                        onClick={(e) => handleReserveTable(table, e)}
                        className="flex-1 px-2 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 transition-colors"
                      >
                        Unreserve
                      </button>
                    ) : table.orderedMenu && table.orderedMenu.length > 0 ? (
                      <button
                        onClick={(e) => handleClearTable(table, e)}
                        className="flex-1 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                      >
                        Clear
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={(e) => handleEdit(table)}
                          className="flex-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => handleDelete(table._id)}
                          className="flex-1 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>

                  {/* Reserve Checkbox - Only for available tables (not reserved, not booked) */}
                  {!table.isReserved && !(table.orderedMenu && table.orderedMenu.length > 0) && (
                    <label className="flex items-center gap-2 mt-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={(e) => handleReserveTable(table, e)}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-xs text-gray-700 font-medium">Reserve</span>
                    </label>
                  )}
                </div>
              );
            })}
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
                  maxLength="50"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">{formData.tableName.length}/50 characters</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity (1-100) *
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  placeholder="Enter capacity"
                  min="1"
                  max="100"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
                {formData.capacity && (parseInt(formData.capacity) > 100 || parseInt(formData.capacity) <= 0) && (
                  <p className="text-xs text-red-500 mt-1">Capacity must be between 1 and 100</p>
                )}
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
                  maxLength="50"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">{formData.tableName.length}/50 characters</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity (1-100) *
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  placeholder="Enter capacity"
                  min="1"
                  max="100"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
                {formData.capacity && (parseInt(formData.capacity) > 100 || parseInt(formData.capacity) <= 0) && (
                  <p className="text-xs text-red-500 mt-1">Capacity must be between 1 and 100</p>
                )}
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
    </div>
  );
};

export default SpaceManagement;
