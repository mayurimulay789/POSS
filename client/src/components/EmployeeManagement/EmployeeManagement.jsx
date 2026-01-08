// import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useState,useRef,useEffect } from 'react';
import { 
  getEmployees, 
  deleteEmployee, 
  toggleEmployeeStatus,
  clearError,
  clearSuccess,
  setFilters
} from '../../store/slices/employeeSlice';
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

  // CHANGED: Fetch employees for all roles, not just merchant
  useEffect(() => {
    dispatch(getEmployees(filters));
  }, [dispatch, filters]);

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

  // CHANGED: Function to check if user is merchant
  const isMerchant = user?.role === 'merchant';

  if (loading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // CHANGED: Removed access denied check since all roles can view now

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header Section */}
      <div className="flex-shrink-0 bg-white  mx-4 my-1 lg:pt-4 lg:pl-4 lg:pr-4 lg:pb-1  border-b border-gray-200">
  {/* Top Row: Title, Search, and Action Buttons */}
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
    {/* Left: Title */}
    <div>
      <h1 className="text-2xl lg:text-2xl font-bold text-gray-900">Employee Management</h1>
    </div>

    {/* Right: Action Buttons */}
    <div className="flex items-center gap-3">
      {/* Desktop Search Bar */}
      <div className="hidden md:block relative flex-1 md:flex-none md:w-64">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search employees..."
          value={filters.search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Action Buttons Group */}
      <div className="flex items-center gap-2">
        {/* Filter Button */}
        <div className="relative">
          <button
            ref={filterButtonRef}
            onClick={(e) => {
              e.stopPropagation();
              setShowFilterMenu(!showFilterMenu);
              setShowColumnsMenu(false);
            }}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            title="Filter options"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span>Filter</span>
          </button>

          {/* Filter Dropdown */}
          {showFilterMenu && (
            <div ref={filterMenuRef} className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-50">
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Filters</h3>
                  <button
                    onClick={() => {
                      dispatch(setFilters({ search: '', role: '', page: 1 }));
                      setShowFilterMenu(false);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear all
                  </button>
                </div>

                {/* Role Filter */}
                <div className="mb-5">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Filter by Role</h4>
                  <div className="flex flex-wrap gap-2">
                    {['all', 'staff', 'supervisor', 'manager', 'merchant'].map(role => (
                      <button
                        key={role}
                        onClick={() => handleRoleFilter(role)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          filters.role === role
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {role === 'all' ? 'All Roles' : role}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Filter */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Search</h4>
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={filters.search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setShowFilterMenu(false)}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                  >
                    Apply Filters
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
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            title="Column visibility"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span>Columns</span>
          </button>

          {/* Columns Dropdown */}
          {showColumnsMenu && (
            <div ref={columnsMenuRef} className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl z-50">
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Visible Columns</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAllColumns}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={deselectAllColumns}
                      className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                    >
                      None
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {columns.map(column => {
                    if (column.key === 'actions' && !isMerchant) {
                      return null;
                    }
                    return (
                      <label key={column.key} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 border rounded flex items-center justify-center ${
                            column.visible 
                              ? 'bg-blue-600 border-blue-600' 
                              : 'border-gray-300'
                          }`}>
                            {column.visible && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-700">{column.label}</span>
                        </div>
                        <button
                          onClick={() => toggleColumnVisibility(column.key)}
                          className="text-xs text-gray-500 hover:text-gray-700 opacity-0 group-hover:opacity-100"
                        >
                          {column.visible ? 'Hide' : 'Show'}
                        </button>
                      </label>
                    );
                  })}
                </div>

                <div className="mt-5 pt-4 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={() => setShowColumnsMenu(false)}
                    className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-black font-medium text-sm"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>

  {/* Bottom Row: Mobile Search and New Employee Button */}
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
    {/* Mobile Search - Only shows on small screens */}
    <div className="w-full sm:hidden">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search employees..."
          value={filters.search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>

    {/* New Employee Button - Positioned on right for all screen sizes */}
    {isMerchant && (
      <button
        onClick={() => setShowForm(true)}
        className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
      >
        <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
        <span className="text-sm lg:text-base"> New Employee</span>
      </button>
    )}
  </div>

  {/* Status Messages */}
  <div className="mt-4">
    {success && (
      <div className="animate-slideDown bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 p-4 rounded-r-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-green-800 font-medium">{success}</span>
        </div>
        <button
          onClick={() => dispatch(clearSuccess())}
          className="text-green-600 hover:text-green-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    )}

    {error && (
      <div className="animate-slideDown bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-red-800 font-medium">{error}</span>
        </div>
        <button
          onClick={() => dispatch(clearError())}
          className="text-red-600 hover:text-red-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    )}
  </div>
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
                    {columns.map(column => {
                      // CHANGED: Hide "actions" column header for non-merchant users
                      if (column.key === 'actions' && !isMerchant) {
                        return null;
                      }
                      return (
                        column.visible && (
                          <th 
                            key={column.key} 
                            className="px-2 lg:px-4 py-3 text-start text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 bg-gray-50"
                          >
                            {column.label}
                          </th>
                        )
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.length === 0 ? (
                    <tr>
                      <td 
                        colSpan={columns.filter(col => col.visible && !(col.key === 'actions' && !isMerchant)).length} 
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
                          // CHANGED: Skip "actions" column entirely for non-merchant users
                          if (column.key === 'actions' && !isMerchant) {
                            return null;
                          }
                          
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
                                  <div className="flex flex-row lg:flex-row items-start justify-start space-x-1 lg:space-y-0 lg:space-x-1">
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

      {/* CHANGED: Employee Form Modal - only show for merchant */}
      {showForm && isMerchant && (
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