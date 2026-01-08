import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTables, createTable, updateTable, deleteTable, clearSuccess, clearError, optimisticUpdateTable } from '../../../store/slices/tableSlice';
import { MdTableRestaurant } from 'react-icons/md';
import { FiEdit2, FiTrash2, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const SpaceManagement = () => {
  const dispatch = useDispatch();
  const { items: tables = [], loading, error, success } = useSelector(state => state.table);

  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('Tables');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [formData, setFormData] = useState({
    tableName: '',
    capacity: '',
    spaceType: 'Tables'
  });

  const tabs = ['Tables'];

  // Fetch tables when component mounts and set up auto-refresh
 useEffect(() => {
  dispatch(fetchTables());
  
  // The interval and cleanup logic have been removed from here
}, [dispatch]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

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
    if (nameError) errors.spaceName = nameError;
    if (capacityError) errors.capacity = capacityError;
    return errors;
  };

  const handleReserveTable = async (table, e) => {
    e.stopPropagation();
    try {
      const isReserving = !table.isReserved;
      const updateData = {
        tableName: table.tableName,
        capacity: table.capacity,
        spaceType: table.spaceType,
        status: table.status || 'available',
        orderedMenu: table.orderedMenu || [],
        totalBill: table.totalBill || 0,
        isReserved: isReserving
      };
      
      // Optimistic update
      dispatch(optimisticUpdateTable({ id: table._id, data: updateData }));
      
      await dispatch(updateTable({
        id: table._id,
        data: updateData
      })).unwrap();
      
      dispatch(clearSuccess());
    } catch (err) {
      console.error('Error updating table:', err.message || err);
      // Revert on error
      dispatch(fetchTables());
    }
  };

  const handleClearTable = async (table, e) => {
    e.stopPropagation();
    if (!window.confirm(`Clear ${table.tableName}? This will remove all orders.`)) {
      return;
    }
    try {
      const updateData = {
        tableName: table.tableName,
        capacity: table.capacity,
        spaceType: table.spaceType,
        status: 'available',
        orderedMenu: [],
        totalBill: 0,
        isReserved: false
      };
      
      // Optimistic update
      dispatch(optimisticUpdateTable({ id: table._id, data: updateData }));
      
      await dispatch(updateTable({
        id: table._id,
        data: updateData
      })).unwrap();
      
      dispatch(clearSuccess());
    } catch (err) {
      console.error('Error clearing table:', err.message || err);
      // Revert on error
      dispatch(fetchTables());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = getFormErrors();
    if (Object.keys(errors).length > 0) {
      setToast(Object.values(errors).join('\n'));
      return;
    }
    try {
      const payload = {
        tableName: formData.tableName,
        capacity: formData.capacity,
        spaceType: formData.spaceType || 'Tables'
      };
      await dispatch(createTable(payload)).unwrap();
      setToast('Table created successfully!');
      setShowAddForm(false);
      resetForm();
      dispatch(clearSuccess());
    } catch (err) {
      console.error('Error creating space:', err.message || err);
      const errorMessage = err.message || err;
      if (errorMessage.toLowerCase().includes('already exists') || errorMessage.toLowerCase().includes('duplicate')) {
        setToast('Table name already exists in this space. Please use a different name.');
      } else {
        setToast(errorMessage || 'Failed to create space');
      }
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
      const payload = {
        tableName: formData.tableName,
        capacity: formData.capacity,
        spaceType: formData.spaceType || 'Tables'
      };
      await dispatch(updateTable({
        id: editingTable._id,
        data: payload
      })).unwrap();
      setToast('Table updated successfully!');
      setShowEditForm(false);
      setEditingTable(null);
      resetForm();
      dispatch(clearSuccess());
    } catch (err) {
      console.error('Error updating space:', err.message || err);
      setToast('Failed to update space');
    }
  };

  const handleEdit = (table) => {
    setEditingTable(table);
    setFormData({
      tableName: table.tableName,
      capacity: table.capacity,
      spaceType: table.spaceType || 'Tables'
    });
    setShowEditForm(true);
  };

  const handleDelete = async (tableId) => {
    if (!window.confirm('Are you sure you want to delete this table?')) {
      return;
    }

    try {
      await dispatch(deleteTable(tableId)).unwrap();
      setToast('Table deleted successfully!');
      dispatch(clearSuccess());
    } catch (err) {
      console.error('Error deleting table:', err.message || err);
      setToast('Failed to delete table');
    }
  };

  const resetForm = () => {
    setFormData({
      tableName: '',
      capacity: '',
      spaceType: 'Tables'
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
      return { text: 'Booked', color: 'text-blue-600 bg-blue-100' };
    } else {
      return { text: 'Available', color: 'text-green-600 bg-green-100' };
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

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4 p-4 rounded shadow-lg ${
          toast.toLowerCase().includes('success') || toast.toLowerCase().includes('created') || toast.toLowerCase().includes('updated') || toast.toLowerCase().includes('deleted')
            ? 'bg-green-100 border border-green-400 text-green-700'
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          {toast}
        </div>
      )}
      
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tables.map((table) => {
              const status = getTableStatus(table);
              
              // Determine card background based on status
              const cardBg = table.isReserved 
                ? 'bg-yellow-50/50 border-yellow-200' 
                : table.orderedMenu?.length > 0 
                  ? 'bg-blue-50/30 border-blue-200' 
                  : 'bg-green-50/50 border-green-200';
              
              return (
                <div
                  key={table._id}
                  className={`rounded-lg border hover:shadow-lg transition-all duration-200 overflow-hidden ${cardBg}`}
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          table.isReserved 
                            ? 'bg-yellow-100' 
                            : table.orderedMenu?.length > 0 
                              ? 'bg-blue-100' 
                              : 'bg-green-100'
                        }`}>
                          <MdTableRestaurant className={`w-5 h-5 ${
                            table.isReserved 
                              ? 'text-yellow-700' 
                              : table.orderedMenu?.length > 0 
                                ? 'text-blue-700' 
                                : 'text-green-700'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{table.tableName}</h3>
                          <p className="text-sm text-gray-500">{table.capacity} persons</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.text}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    {/* Ordered Menu Section */}
                    {table.orderedMenu && table.orderedMenu.length > 0 ? (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-600 mb-2">Current Orders</p>
                        <div className="bg-gray-50 rounded-lg p-2 max-h-32 overflow-y-auto space-y-1">
                          {table.orderedMenu.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs px-2 py-1">
                              <span className="text-gray-700">{item.name}</span>
                              <span className="text-gray-500 font-medium">×{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                        {table.totalBill > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between items-center">
                            <span className="text-xs font-medium text-gray-600">Total:</span>
                            <span className="text-sm font-semibold text-gray-800">₹{table.totalBill.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mb-4 text-center py-4">
                        <p className="text-xs text-gray-400">No active orders</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {table.isReserved ? (
                        <button
                          onClick={(e) => handleReserveTable(table, e)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors text-sm font-medium border border-yellow-200"
                        >
                          <FiXCircle className="w-4 h-4" />
                          Unreserve
                        </button>
                      ) : table.orderedMenu && table.orderedMenu.length > 0 ? (
                        <button
                          onClick={(e) => handleClearTable(table, e)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm font-medium border border-blue-200"
                        >
                          <FiXCircle className="w-4 h-4" />
                          Clear
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={(e) => handleEdit(table)}
                            className="flex-1 p-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100 hover:text-green-700 transition-colors border border-green-200"
                            title="Edit Table"
                          >
                            <FiEdit2 className="w-4 h-4 mx-auto" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(table._id)}
                            className="flex-1 p-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 hover:text-red-700 transition-colors border border-red-200"
                            title="Delete Table"
                          >
                            <FiTrash2 className="w-4 h-4 mx-auto" />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Reserve Checkbox */}
                    {!table.isReserved && !(table.orderedMenu && table.orderedMenu.length > 0) && (
                      <label className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-gray-100 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={(e) => handleReserveTable(table, e)}
                          className="w-4 h-4 rounded border-green-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-xs text-gray-600 group-hover:text-green-600">Mark as Reserved</span>
                      </label>
                    )}
                  </div>
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
                  Capacity (1-10) *
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  placeholder="Enter capacity"
                  min="1"
                  max="10"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
                {formData.capacity && (parseInt(formData.capacity) > 10 || parseInt(formData.capacity) <= 0) && (
                  <p className="text-xs text-red-500 mt-1">Capacity must be between 1 and 10</p>
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
                  Capacity (1-10) *
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  placeholder="Enter capacity"
                  min="1"
                  max="10"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
                {formData.capacity && (parseInt(formData.capacity) > 10 || parseInt(formData.capacity) <= 0) && (
                  <p className="text-xs text-red-500 mt-1">Capacity must be between 1 and 10</p>
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
