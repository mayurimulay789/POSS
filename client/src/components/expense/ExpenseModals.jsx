import React from 'react';
import { 
  XCircle, 
  CheckCircle, 
  Loader,
  X
} from 'lucide-react';

// Base Modal Container
const ModalContainer = ({ children, size = 'md', onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
    <div className={`bg-white rounded-lg shadow-xl w-full ${
      size === 'md' ? 'max-w-md' : 'max-w-lg'
    } my-4 sm:my-0`}>
      {children}
    </div>
    {/* Close button outside modal for mobile */}
    <button
      onClick={onClose}
      className="fixed top-4 right-4 sm:hidden bg-white rounded-full p-2 shadow-lg"
    >
      <X className="w-5 h-5" />
    </button>
  </div>
);

// Create/Edit Expense Form Component
const ExpenseForm = ({ 
  formData, 
  onChange, 
  user,
  isEdit = false
}) => {
  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'digital_wallet', label: 'Digital Wallet' },
    { value: 'other', label: 'Other' }
  ];

  const handleChange = (field, value) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter expense title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount (INR) *
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
          <input
            type="number"
            required
            min="0"
            step="1"
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>
        {!isEdit && (
          <p className="text-xs text-gray-500 mt-1">
            Note: {user?.role !== 'merchant' ? 'You can only edit/delete this expense before midnight today' : 'You can edit/delete anytime'}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Payment Method
        </label>
        <select
          value={formData.paymentMethod}
          onChange={(e) => handleChange('paymentMethod', e.target.value)}
          className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {paymentMethods.map((method) => (
            <option key={method.value} value={method.value}>
              {method.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (Optional)
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows="3"
          className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Add any additional details about this expense..."
        />
      </div>
    </div>
  );
};

// Create Expense Modal
export const CreateExpenseModal = ({ 
  show, 
  onClose, 
  formData, 
  onChange, 
  onSubmit, 
  loading, 
  user 
}) => {
  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <ModalContainer size="md" onClose={onClose}>
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Create New Expense</h3>
          <button
            onClick={onClose}
            className="hidden sm:block text-gray-400 hover:text-gray-500"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <ExpenseForm 
            formData={formData}
            onChange={onChange}
            user={user}
          />

          <div className="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin w-4 h-4 mr-2" />
                  Creating...
                </>
              ) : (
                'Create Expense'
              )}
            </button>
          </div>
        </form>
      </div>
    </ModalContainer>
  );
};

// Edit Expense Modal
export const EditExpenseModal = ({ 
  show, 
  onClose, 
  formData, 
  onChange, 
  onSubmit, 
  loading,
  user 
}) => {
  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <ModalContainer size="md" onClose={onClose}>
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Edit Expense</h3>
          <button
            onClick={onClose}
            className="hidden sm:block text-gray-400 hover:text-gray-500"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <ExpenseForm 
            formData={formData}
            onChange={onChange}
            user={user}
            isEdit={true}
          />

          <div className="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin w-4 h-4 mr-2" />
                  Updating...
                </>
              ) : (
                'Update Expense'
              )}
            </button>
          </div>
        </form>
      </div>
    </ModalContainer>
  );
};

// Delete Confirmation Modal
export const DeleteExpenseModal = ({ 
  show, 
  onClose, 
  selectedExpense,
  onSubmit,
  loading,
  formatDate,
  formatCurrency,
  isExpenseFromToday,
  user 
}) => {
  if (!show || !selectedExpense) return null;

  const isToday = isExpenseFromToday(selectedExpense.date);

  return (
    <ModalContainer size="md" onClose={onClose}>
      <div className="p-4 sm:p-6">
        <div className="flex items-center mb-4">
          <XCircle className="w-6 h-6 text-red-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Delete Expense</h3>
        </div>
        
        <p className="text-gray-600 mb-6 text-sm sm:text-base">
          Are you sure you want to delete the expense <strong>"{selectedExpense.title}"</strong>?
          This action cannot be undone.
        </p>

        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Amount:</span>
            <span className="font-bold">{formatCurrency(selectedExpense.amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Date:</span>
            <span>{formatDate(selectedExpense.date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Payment Method:</span>
            <span className="capitalize">{selectedExpense.paymentMethod.replace('_', ' ')}</span>
          </div>
          {user?.role !== 'merchant' && !isToday && (
            <div className="text-xs text-orange-600 mt-2 p-2 bg-orange-50 rounded">
              ⚠️ This expense was created yesterday. You cannot delete it after midnight.
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
          >
            {loading ? (
              <>
                <Loader className="animate-spin w-4 h-4 mr-2" />
                Deleting...
              </>
            ) : (
              'Delete Expense'
            )}
          </button>
        </div>
      </div>
    </ModalContainer>
  );
};