import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  createCustomer,
  getCustomers,
  getMyCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerStats,
  clearError,
  clearSuccess,
  setFilters,
  clearFilters
} from '../store/slices/customerSlice';
import { selectCurrentUser } from '../store/slices/authSlice';
import { CheckCircle, AlertCircle } from 'lucide-react';

// Import components
import {
  CustomerStats,
  CustomerHeader,
  CustomerTable,
  CreateCustomerModal,
  EditCustomerModal,
  DeleteCustomerModal,
  CustomerDetailsModal
} from '../components/customer';

const CustomerManagement = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const {
    customers,
    myCustomers,
    loading,
    error,
    success,
    pagination,
    filters,
    stats,
  } = useSelector((state) => state.customers);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [expandedRows, setExpandedRows] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    cust_name: '',
    email: '',
    phone: '',
    membership_id: ''
  });

  // Check if user can view all customers
  const canViewAllCustomers = user?.role === 'merchant' || user?.role === 'manager' || user?.role === 'supervisor';
  const canEditDelete = user?.role === 'merchant' || user?.role === 'manager' || user?.role === 'supervisor';

  // Set default tab based on user role
  useEffect(() => {
    if (user) {
      if (user.role === 'merchant' || user.role === 'manager') {
        setActiveTab('all');
      } else {
        setActiveTab('my');
      }
    }
  }, [user]);

  // Load customers based on active tab
  useEffect(() => {
    const loadCustomers = () => {
      switch (activeTab) {
        case 'all':
          if (canViewAllCustomers) {
            dispatch(getCustomers(filters));
          } else {
            setActiveTab('my');
            dispatch(getMyCustomers({ page: filters.page, limit: filters.limit }));
          }
          break;
        case 'my':
          dispatch(getMyCustomers({ page: filters.page, limit: filters.limit }));
          break;
        default:
          if (canViewAllCustomers) {
            dispatch(getCustomers(filters));
          } else {
            dispatch(getMyCustomers({ page: filters.page, limit: filters.limit }));
          }
      }
    };

    loadCustomers();
  }, [activeTab, filters, canViewAllCustomers, dispatch]);

  // Load stats on initial load
  useEffect(() => {
    dispatch(getCustomerStats());
  }, [dispatch]);

  // Clear error/success messages
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        dispatch(clearError());
        dispatch(clearSuccess());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success, dispatch]);

  // Handle form submissions
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required field
    if (!formData.cust_name) {
      alert('Customer name is required');
      return;
    }

    const result = await dispatch(createCustomer(formData));
    
    if (!result.error) {
      setShowCreateModal(false);
      setFormData({
        cust_name: '',
        email: '',
        phone: '',
        membership_id: ''
      });
      // Refresh stats after creating a customer
      dispatch(getCustomerStats());
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    
    const result = await dispatch(updateCustomer({
      id: selectedCustomer._id,
      customerData: formData
    }));
    
    if (!result.error) {
      setShowEditModal(false);
      setSelectedCustomer(null);
      // Refresh stats after updating a customer
      dispatch(getCustomerStats());
    }
  };

  const handleDelete = async () => {
    if (!selectedCustomer) return;
    
    const result = await dispatch(deleteCustomer(selectedCustomer._id));
    if (!result.error) {
      setShowDeleteModal(false);
      setSelectedCustomer(null);
      // Refresh stats after deleting a customer
      dispatch(getCustomerStats());
    }
  };

  const handleEditClick = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      cust_name: customer.cust_name,
      email: customer.email || '',
      phone: customer.phone || '',
      membership_id: customer.membership_id || ''
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (customer) => {
    setSelectedCustomer(customer);
    setShowDeleteModal(true);
  };

  const handleDetailsClick = async (customer) => {
    try {
      const result = await dispatch(getCustomer(customer._id));
      if (!result.error) {
        setSelectedCustomer(result.payload.data);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
    }
  };

  const handlePageChange = (page) => {
    dispatch(setFilters({ page }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(setFilters({ search: searchTerm, page: 1 }));
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    dispatch(clearFilters());
  };

  const toggleRowExpand = (customerId) => {
    setExpandedRows(prev => ({
      ...prev,
      [customerId]: !prev[customerId]
    }));
  };

  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error(error);
      return 'Invalid date';
    }
  };

  // Get current customers based on active tab
  const currentCustomers = activeTab === 'my' ? myCustomers : customers;
  const currentPagination = pagination;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Customer Management</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage customer information
          </p>
        </div>

        {/* Stats Cards */}
        {/* <CustomerStats stats={stats} listStats={listStats} /> */}
        <CustomerStats stats={stats} />

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow mb-6">
          {/* Header with Tabs and Toolbar */}
          <CustomerHeader
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            canViewAllCustomers={canViewAllCustomers}
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            onSearchSubmit={handleSearchSubmit}
            onClearFilters={handleClearFilters}
            onCreateCustomer={() => setShowCreateModal(true)}
          />

          {/* Error/Success Messages */}
          {error && (
            <div className="m-3 sm:m-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start sm:items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5 sm:mt-0" />
              <p className="text-red-700 text-sm sm:text-base">{error}</p>
            </div>
          )}

          {success && (
            <div className="m-3 sm:m-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg flex items-start sm:items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5 sm:mt-0" />
              <p className="text-green-700 text-sm sm:text-base">{success}</p>
            </div>
          )}

          {/* Customers Table */}
          <CustomerTable
            customers={currentCustomers}
            loading={loading}
            canEditDelete={canEditDelete}
            user={user}
            formatDate={formatDate}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            onDetailsClick={handleDetailsClick}
            expandedRows={expandedRows}
            onToggleExpand={toggleRowExpand}
            pagination={currentPagination}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Modals */}
      <CreateCustomerModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        formData={formData}
        onChange={setFormData}
        onSubmit={handleCreateSubmit}
        loading={loading}
      />

      <EditCustomerModal
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCustomer(null);
        }}
        formData={formData}
        onChange={setFormData}
        onSubmit={handleEditSubmit}
        loading={loading}
        selectedCustomer={selectedCustomer}
      />

      <DeleteCustomerModal
        show={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCustomer(null);
        }}
        selectedCustomer={selectedCustomer}
        onSubmit={handleDelete}
        loading={loading}
      />

      <CustomerDetailsModal
        show={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedCustomer(null);
        }}
        selectedCustomer={selectedCustomer}
        onEditClick={handleEditClick}
        formatDate={formatDate}
        canEditDelete={canEditDelete}
      />
    </div>
  );
};

export default CustomerManagement;