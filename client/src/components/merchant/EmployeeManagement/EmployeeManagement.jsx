import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getEmployees, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee, 
  toggleEmployeeStatus,
  clearError,
  clearSuccess,
  setFilters
} from '../../../store/slices/employeeSlice';
import EmployeeForm from './EmployeeForm';

const EmployeeManagement = () => {
  const dispatch = useDispatch();
  const { employees, loading, error, success, pagination, filters } = useSelector(state => state.employees);
  const { user } = useSelector(state => state.auth);
  
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  
  // Refs for dropdown menus
  const filterMenuRef = useRef(null);
  const columnsMenuRef = useRef(null);
  const filterButtonRef = useRef(null);
  const columnsButtonRef = useRef(null);

  // Define all available columns
  const allColumns = [
    { key: 'FullName', label: 'Full Name', visible: true },
    { key: 'email', label: 'Email', visible: true },
    { key: 'role', label: 'Role', visible: true },
    { key: 'isActive', label: 'Status', visible: true },
    { key: 'createdAt', label: 'Created At', visible: false },
    { key: 'actions', label: 'Actions', visible: true }
  ];

  const [columns, setColumns] = useState(allColumns);

  useEffect(() => {
    if (user?.role === 'merchant') {
      dispatch(getEmployees(filters));
    }
  }, [dispatch, user, filters]);

  useEffect(() => {
    if (success && !showForm) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch, showForm]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Fixed click outside detection
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFilterMenu && 
          filterMenuRef.current && 
          !filterMenuRef.current.contains(event.target) &&
          filterButtonRef.current &&
          !filterButtonRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }

      if (showColumnsMenu && 
          columnsMenuRef.current && 
          !columnsMenuRef.current.contains(event.target) &&
          columnsButtonRef.current &&
          !columnsButtonRef.current.contains(event.target)) {
        setShowColumnsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterMenu, showColumnsMenu]);

  const handleDelete = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      try {
        await dispatch(deleteEmployee(employeeId)).unwrap();
        dispatch(getEmployees(filters));
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleToggleStatus = async (employeeId) => {
    try {
      await dispatch(toggleEmployeeStatus(employeeId)).unwrap();
      dispatch(getEmployees(filters));
    } catch (error) {
      console.error('Status toggle failed:', error);
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEmployee(null);
    dispatch(getEmployees(filters));
  };

  const toggleColumnVisibility = (columnKey) => {
    setColumns(prevColumns => 
      prevColumns.map(col => 
        col.key === columnKey ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const selectAllColumns = () => {
    setColumns(prevColumns => 
      prevColumns.map(col => ({ ...col, visible: true }))
    );
  };

  const deselectAllColumns = () => {
    setColumns(prevColumns => 
      prevColumns.map(col => ({ ...col, visible: false }))
    );
  };

  const handleSearch = (searchTerm) => {
    dispatch(setFilters({ search: searchTerm, page: 1 }));
  };

  const handleRoleFilter = (role) => {
    dispatch(setFilters({ role, page: 1 }));
  };

  const handlePageChange = (page) => {
    dispatch(setFilters({ page }));
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
        Active
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
        Inactive
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleColors = {
      staff: 'bg-blue-100 text-blue-800',
      supervisor: 'bg-purple-100 text-purple-800',
      manager: 'bg-orange-100 text-orange-800',
      merchant: 'bg-green-100 text-green-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${roleColors[role] || 'bg-gray-100 text-gray-800'}`}>
        {role}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  if (loading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Check if user is merchant
  if (user?.role !== 'merchant') {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-gray-600">Only merchants can access employee management.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header Section */}
      <div className="flex-shrink-0 bg-white p-4 lg:p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full lg:w-auto space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Employee Management</h1>
              <p className="text-gray-600 text-sm lg:text-base">Manage your team members and their roles</p>
            </div>
            
            {/* Add New Employee Button */}
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2 w-full sm:w-auto justify-center"
            >
              <span>+</span>
              <span>New Employee</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-2 lg:space-x-3 w-full lg:w-auto justify-between lg:justify-end">
            {/* Search Input - Mobile Only */}
            <div className="lg:hidden flex-1">
              <input
                type="text"
                placeholder="Search employees..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Filter Button */}
            <div className="relative">
              <button
                ref={filterButtonRef}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFilterMenu(!showFilterMenu);
                  setShowColumnsMenu(false);
                }}
                className="flex items-center space-x-1 lg:space-x-2 bg-white border border-gray-300 text-gray-700 px-3 lg:px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
              >
                <span>🔍</span>
                <span className="hidden sm:inline">Filter</span>
                <span>▼</span>
              </button>

              {/* Filter Dropdown Menu */}
              {showFilterMenu && (
                <div 
                  ref={filterMenuRef}
                  className="absolute right-0 mt-2 w-64 lg:w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-50"
                >
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Filter by Role</h3>
                    <div className="space-y-2">
                      {['all', 'staff', 'supervisor', 'manager'].map(role => (
                        <label key={role} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="role"
                            value={role}
                            checked={filters.role === role}
                            onChange={(e) => handleRoleFilter(e.target.value)}
                            className="text-blue-500 focus:ring-blue-500"
                          />
                          <span className="capitalize text-sm">
                            {role === 'all' ? 'All Roles' : role}
                          </span>
                        </label>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <h3 className="font-semibold text-gray-800 mb-3">Search</h3>
                      <input
                        type="text"
                        placeholder="Search employees..."
                        value={filters.search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                    
                    <div className="mt-4 flex justify-between">
                      <button
                        onClick={() => {
                          dispatch(setFilters({ search: '', role: '', page: 1 }));
                        }}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => setShowFilterMenu(false)}
                        className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Columns Button */}
            <div className="relative">
              <button
                ref={columnsButtonRef}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowColumnsMenu(!showColumnsMenu);
                  setShowFilterMenu(false);
                }}
                className="flex items-center space-x-1 lg:space-x-2 bg-white border border-gray-300 text-gray-700 px-3 lg:px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
              >
                <span>📊</span>
                <span className="hidden sm:inline">Columns</span>
                <span>▼</span>
              </button>

              {/* Columns Dropdown Menu */}
              {showColumnsMenu && (
                <div 
                  ref={columnsMenuRef}
                  className="absolute right-0 mt-2 w-72 lg:w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-gray-800 text-sm lg:text-base">Show/Hide Columns</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={selectAllColumns}
                          className="text-xs text-blue-500 hover:text-blue-700"
                        >
                          Select All
                        </button>
                        <button
                          onClick={deselectAllColumns}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Deselect All
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {columns.map(column => (
                        <label key={column.key} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={column.visible}
                            onChange={() => toggleColumnVisibility(column.key)}
                            className="text-blue-500 focus:ring-blue-500 rounded"
                          />
                          <span className="text-sm text-gray-700">{column.label}</span>
                        </label>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-200 flex justify-end">
                      <button
                        onClick={() => setShowColumnsMenu(false)}
                        className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>✅</span>
              <span className="text-sm">{success}</span>
            </div>
            <button onClick={() => dispatch(clearSuccess())} className="text-green-700 hover:text-green-900">
              ×
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>❌</span>
              <span className="text-sm">{error}</span>
            </div>
            <button onClick={() => dispatch(clearError())} className="text-red-700 hover:text-red-900">
              ×
            </button>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="flex-1 min-h-0 bg-gray-50 p-2 lg:p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
          {/* Table with horizontal scroll only */}
          <div className="flex-1 min-h-0 overflow-auto">
            <div className="overflow-x-auto h-full">
              <table className="min-w-full divide-y divide-gray-200 border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    {columns.map(column => 
                      column.visible && (
                        <th 
                          key={column.key} 
                          className="px-2 lg:px-4 py-3 text-start text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 bg-gray-50"
                        >
                          {column.label}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.length === 0 ? (
                    <tr>
                      <td 
                        colSpan={columns.filter(col => col.visible).length} 
                        className="px-4 lg:px-6 py-8 lg:py-12 text-center"
                      >
                        <div className="text-gray-500">
                          <span className="text-3xl lg:text-4xl mb-2 block">👥</span>
                          <p className="text-base lg:text-lg font-medium">No employees found</p>
                          <p className="text-xs lg:text-sm">Get started by creating your first employee</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    employees.map((employee, index) => (
                      <tr 
                        key={employee._id} 
                        className={`transition-colors duration-150 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        } hover:bg-blue-50`}
                      >
                        {columns.map(column => {
                          if (!column.visible) return null;
                          
                          // Common cell styling
                          const baseCellClasses = "px-2 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm border-b border-gray-200";
                          
                          switch (column.key) {
                            case 'FullName':
                              return (
                                <td key={column.key} className={`${baseCellClasses} font-semibold text-gray-900 whitespace-nowrap`}>
                                  {employee.FullName}
                                </td>
                              );
                            case 'email':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-700 whitespace-nowrap`}>
                                  {employee.email}
                                </td>
                              );
                            case 'role':
                              return (
                                <td key={column.key} className={`${baseCellClasses} `}>
                                  {getRoleBadge(employee.role)}
                                </td>
                              );
                            case 'isActive':
                              return (
                                <td key={column.key} className={`${baseCellClasses} `}>
                                  {getStatusBadge(employee.isActive)}
                                </td>
                              );
                            case 'createdAt':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-500 whitespace-nowrap`}>
                                  {formatDate(employee.createdAt)}
                                </td>
                              );
                            case 'actions':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-center whitespace-nowrap`}>
                                  <div className="flex flex-row lg:flex-row items-start  justify-start space-y-2 lg:space-y-0 lg:space-x-1">
                                    <button 
                                      onClick={() => handleEdit(employee)} 
                                      className="text-blue-600 hover:text-blue-900 px-1 lg:px-2 py-1 rounded hover:bg-blue-50 transition-colors border border-blue-200 text-xs w-full lg:w-auto" 
                                      title="Edit Employee"
                                    >
                                      Edit
                                    </button>
                                    <button 
                                      onClick={() => handleToggleStatus(employee._id)} 
                                      className={`px-1 lg:px-2 py-1 rounded transition-colors border text-xs w-full lg:w-auto ${
                                        employee.isActive 
                                          ? 'text-orange-600 hover:text-orange-900 hover:bg-orange-50 border-orange-200' 
                                          : 'text-green-600 hover:text-green-900 hover:bg-green-50 border-green-200'
                                      }`}
                                      title={employee.isActive ? 'Deactivate Employee' : 'Activate Employee'}
                                    >
                                      {employee.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button 
                                      onClick={() => handleDelete(employee._id)} 
                                      className="text-red-600 hover:text-red-900 px-1 lg:px-2 py-1 rounded hover:bg-red-50 transition-colors border border-red-200 text-xs w-full lg:w-auto" 
                                      title="Delete Employee"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              );
                            default:
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-700`}>
                                  {employee[column.key] || '-'}
                                </td>
                              );
                          }
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table Footer with Pagination */}
          {employees.length > 0 && (
            <div className="flex-shrink-0 bg-gray-50 px-4 lg:px-6 py-3 lg:py-4 border-t border-gray-200">
              <div className="flex flex-col lg:flex-row justify-between items-center space-y-3 lg:space-y-0">
                {/* Records Info */}
                <div className="text-xs lg:text-sm text-gray-700">
                  Showing <span className="font-semibold">{employees.length}</span> of{' '}
                  <span className="font-semibold">{pagination.total}</span> employees 
                  (Page <span className="font-semibold">{pagination.current}</span> of{' '}
                  <span className="font-semibold">{pagination.pages}</span>)
                </div>
                
                {/* Pagination Controls */}
                <div className="flex items-center space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(pagination.current - 1)}
                    disabled={!pagination.hasPrev}
                    className={`px-3 py-1 lg:px-4 lg:py-2 rounded-lg border text-xs lg:text-sm font-medium transition-colors duration-200 ${
                      !pagination.hasPrev
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(number => (
                      <button
                        key={number}
                        onClick={() => handlePageChange(number)}
                        className={`px-2 lg:px-3 py-1 lg:py-2 rounded-lg border text-xs lg:text-sm font-medium transition-colors duration-200 ${
                          pagination.current === number
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                      >
                        {number}
                      </button>
                    ))}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(pagination.current + 1)}
                    disabled={!pagination.hasNext}
                    className={`px-3 py-1 lg:px-4 lg:py-2 rounded-lg border text-xs lg:text-sm font-medium transition-colors duration-200 ${
                      !pagination.hasNext
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    Next
                  </button>
                </div>

                {/* Total Records */}
                <div className="text-xs lg:text-sm text-gray-500">
                  Total: {pagination.total} employees
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Employee Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 lg:p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 lg:p-6">
              <div className="flex justify-between items-center mb-4 lg:mb-6">
                <h2 className="text-lg lg:text-xl font-bold text-gray-800">
                  {editingEmployee ? 'Edit Employee' : 'Create New Employee'}
                </h2>
                <button onClick={handleCloseForm} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
              </div>
              <EmployeeForm employee={editingEmployee} onClose={handleCloseForm} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;