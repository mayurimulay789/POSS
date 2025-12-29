

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearFilters } from '../store/slices/expenseSlice';
import {
  getExpenses,
  getMyExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  clearError,
  clearSuccess,
  setFilters
} from '../store/slices/expenseSlice';
import { selectCurrentUser } from '../store/slices/authSlice';
import { 
  CheckCircle,
  AlertCircle 
} from 'lucide-react';

// Import components
import {
  ExpenseStats,
  ExpenseHeader,
  ExpenseTable,
  CreateExpenseModal,
  EditExpenseModal,
  DeleteExpenseModal
} from '../components/expense';

const ExpenseManagement = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const {
    expenses,
    myExpenses,
    loading,
    error,
    success,
    pagination,
    myExpensesPagination,
    filters,
    statistics
  } = useSelector((state) => state.expenses);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [activeTab, setActiveTab] = useState('my-expenses');
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    description: '',
    paymentMethod: 'cash'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });

  // Check if user can view all expenses (merchant or manager)
  const canViewAllExpenses = user?.role === 'merchant' || user?.role === 'manager';

  // Set default tab based on user role
  useEffect(() => {
    if (user) {
      if (user.role === 'merchant') {
        setActiveTab('all-expenses');
      } else {
        setActiveTab('my-expenses');
      }
    }
  }, [user]);

  // Load expenses based on active tab
  useEffect(() => {
    if (!user?._id) return;

    const loadExpenses = () => {
      if (activeTab === 'all-expenses' && canViewAllExpenses) {
        const filterParams = {
          ...filters,
          startDate: dateFilter.startDate,
          endDate: dateFilter.endDate
        };
        dispatch(getExpenses(filterParams));
      } else {
        dispatch(getMyExpenses({ page: filters.page, limit: filters.limit }));
      }
    };

    loadExpenses();
  }, [activeTab, dateFilter, user?._id, dispatch, canViewAllExpenses, filters]);

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

  // Helper function to check if expense can be modified (before midnight)
  const canModifyExpense = (expense) => {
    if (!user || !expense) return false;
    
    // Merchant can always modify any expense
    if (user.role === 'merchant') {
      return true;
    }
    
    // For non-merchants: Check if user is the creator
    let isCreator = false;
    
    if (typeof expense.createdBy === 'object' && expense.createdBy !== null) {
      // createdBy is populated (object with _id)
      isCreator = expense.createdBy._id === user._id;
    } else if (typeof expense.createdBy === 'string') {
      // createdBy is just the ObjectId string
      isCreator = expense.createdBy === user._id;
    }
    
    if (!isCreator) return false;
    
    // Check if it's still the same day (before midnight)
    const expenseDate = new Date(expense.date);
    const now = new Date();
    
    // Check if it's the same day (day, month, year all match)
    const isSameDay = expenseDate.getDate() === now.getDate() && 
                      expenseDate.getMonth() === now.getMonth() && 
                      expenseDate.getFullYear() === now.getFullYear();
    
    return isSameDay;
  };

  // Check if expense is from today
  const isExpenseFromToday = (expenseDate) => {
    const today = new Date();
    const expenseDay = new Date(expenseDate);
    
    return today.getDate() === expenseDay.getDate() && 
           today.getMonth() === expenseDay.getMonth() && 
           today.getFullYear() === expenseDay.getFullYear();
  };

  // Handle form submissions
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(createExpense({
      ...formData,
      amount: parseFloat(formData.amount)
    }));
    
    if (!result.error) {
      setShowCreateModal(false);
      setFormData({
        title: '',
        amount: '',
        description: '',
        paymentMethod: 'cash'
      });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedExpense) return;
    
    const result = await dispatch(updateExpense({
      id: selectedExpense._id,
      expenseData: {
        ...formData,
        amount: parseFloat(formData.amount)
      }
    }));
    
    if (!result.error) {
      setShowEditModal(false);
      setSelectedExpense(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedExpense) return;
    
    const result = await dispatch(deleteExpense(selectedExpense._id));
    if (!result.error) {
      setShowDeleteModal(false);
      setSelectedExpense(null);
    }
  };

  const handleEditClick = (expense) => {
    // Check if user can modify this expense
    if (!canModifyExpense(expense)) {
      alert(user.role === 'merchant' 
        ? 'You cannot edit this expense' 
        : 'Cannot edit expense after midnight');
      return;
    }
    
    setSelectedExpense(expense);
    setFormData({
      title: expense.title,
      amount: expense.amount,
      description: expense.description || '',
      paymentMethod: expense.paymentMethod
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (expense) => {
    // Check if user can modify this expense
    if (!canModifyExpense(expense)) {
      alert(user.role === 'merchant' 
        ? 'You cannot delete this expense' 
        : 'Cannot delete expense after midnight');
      return;
    }
    
    setSelectedExpense(expense);
    setShowDeleteModal(true);
  };

  // Handle search
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(setFilters({ search: searchTerm, page: 1 }));
  };

  // Handle date filter
  const handleDateFilter = () => {
    dispatch(setFilters({ 
      startDate: dateFilter.startDate,
      endDate: dateFilter.endDate,
      page: 1 
    }));
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setDateFilter({ startDate: '', endDate: '' });
    dispatch(clearFilters());
  };

  // Handle page change
  const handlePageChange = (page) => {
    dispatch(setFilters({ page }));
  };

  // Handle date filter change
  const handleDateFilterChange = (field, value) => {
    setDateFilter({ ...dateFilter, [field]: value });
  };

  // Utility functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Get current data based on active tab
  const currentExpenses = activeTab === 'all-expenses' ? expenses : myExpenses;
  const currentPagination = activeTab === 'all-expenses' ? pagination : myExpensesPagination;
  const totalRecords = currentPagination.total || 0;
  const totalAmount = statistics.totalAmount;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Expense Management</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {canViewAllExpenses 
              ? 'Track and manage all restaurant expenses'
              : 'Manage your personal expenses'}
            {user?.role !== 'merchant' && (
              <span className="ml-2 text-xs sm:text-sm text-orange-600 font-medium">
                (Editable only before midnight on creation day)
              </span>
            )}
          </p>
        </div>

        {/* Stats Cards */}
        <ExpenseStats
          totalAmount={totalAmount}
          totalRecords={totalRecords}
          user={user}
          formatCurrency={formatCurrency}
        />

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow mb-6">
          {/* Header with Tabs and Toolbar */}
          <ExpenseHeader
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            canViewAllExpenses={canViewAllExpenses}
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            onSearchSubmit={handleSearchSubmit}
            dateFilter={dateFilter}
            onDateFilterChange={handleDateFilterChange}
            onApplyDateFilter={handleDateFilter}
            onClearFilters={handleClearFilters}
            onCreateExpense={() => setShowCreateModal(true)}
            showDateFilters={activeTab === 'all-expenses' && canViewAllExpenses}
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

          {/* Expenses Table */}
          <ExpenseTable
            expenses={currentExpenses}
            loading={loading}
            activeTab={activeTab}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
            canModifyExpense={canModifyExpense}
            isExpenseFromToday={isExpenseFromToday}
            user={user}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            pagination={currentPagination}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Modals */}
      <CreateExpenseModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        formData={formData}
        onChange={setFormData}
        onSubmit={handleCreateSubmit}
        loading={loading}
        user={user}
      />

      <EditExpenseModal
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedExpense(null);
        }}
        formData={formData}
        onChange={setFormData}
        onSubmit={handleEditSubmit}
        loading={loading}
        user={user}
      />

      <DeleteExpenseModal
        show={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedExpense(null);
        }}
        selectedExpense={selectedExpense}
        onSubmit={handleDelete}
        loading={loading}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
        isExpenseFromToday={isExpenseFromToday}
        user={user}
      />
    </div>
  );
};

export default ExpenseManagement;