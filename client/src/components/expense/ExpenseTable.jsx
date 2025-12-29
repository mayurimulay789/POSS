import React from 'react';
import { FileText, Clock, IndianRupee, CreditCard, Edit, Trash2, Shield } from 'lucide-react';

const ExpenseTable = ({
  expenses,
  loading,
  activeTab,
  formatDate,
  formatCurrency,
  canModifyExpense,
  isExpenseFromToday,
  user,
  onEditClick,
  onDeleteClick,
  pagination,
  onPageChange
}) => {
  const paymentMethodIcons = {
    cash: IndianRupee,
    card: CreditCard,
    bank_transfer: FileText,
    digital_wallet: CreditCard,
    other: IndianRupee
  };

  const paymentMethodLabels = {
    cash: 'Cash',
    card: 'Card',
    bank_transfer: 'Bank Transfer',
    digital_wallet: 'Digital Wallet',
    other: 'Other'
  };

  const getCreatorName = (expense) => {
    if (!expense.createdBy) return 'Unknown';
    if (typeof expense.createdBy === 'object' && expense.createdBy !== null) {
      return expense.createdBy.FullName || 'Unknown';
    }
    return 'You';
  };

  const getCreatorRole = (expense) => {
    if (!expense.createdBy) return null;
    if (typeof expense.createdBy === 'object' && expense.createdBy !== null) {
      return expense.createdBy.role;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="p-6 sm:p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-500 text-sm sm:text-base">Loading expenses...</p>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="p-6 sm:p-8 text-center">
        <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">No expenses found</h3>
        <p className="text-gray-500 text-sm sm:text-base">
          {user?.role === 'merchant' && activeTab === 'all-expenses'
            ? 'No expenses have been created yet'
            : 'Create your first expense to get started'}
        </p>
      </div>
    );
  }

  // Mobile View Component
  const MobileExpenseCard = ({ expense }) => {
    const canModify = canModifyExpense(expense);
    const isToday = isExpenseFromToday(expense.date);
    const PaymentIcon = paymentMethodIcons[expense.paymentMethod] || IndianRupee;

    return (
      <div className="bg-white p-4 border-b border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 text-sm">{expense.title}</h3>
            <p className="text-lg font-bold text-gray-800 mt-1">
              {formatCurrency(expense.amount)}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {canModify ? (
              <>
                <button
                  onClick={() => onEditClick(expense)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                  title="Edit Expense"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteClick(expense)}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Delete Expense"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            ) : (
              <span className="text-xs text-gray-400 italic">
                {!isToday ? 'Cannot modify' : 'Not your expense'}
              </span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
          <div>
            <span className="text-gray-500 text-xs">Payment:</span>
            <div className="flex items-center mt-1">
              <PaymentIcon className="w-4 h-4 text-gray-400 mr-1" />
              <span>{paymentMethodLabels[expense.paymentMethod]}</span>
            </div>
          </div>
          <div>
            <span className="text-gray-500 text-xs">Date:</span>
            <div className="flex items-center mt-1">
              <Clock className="w-4 h-4 text-gray-400 mr-1" />
              <span className="text-xs">{formatDate(expense.date)}</span>
            </div>
          </div>
        </div>

        {/* Creator Info (only for all expenses view) */}
        {activeTab === 'all-expenses' && (
          <div className="pt-3 border-t border-gray-100">
            <span className="text-gray-500 text-xs">Created by:</span>
            <p className="text-sm text-gray-700">
              {getCreatorName(expense)}
              {getCreatorRole(expense) && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full capitalize">
                  {getCreatorRole(expense)}
                </span>
              )}
            </p>
          </div>
        )}

        {/* Description */}
        {expense.description && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-gray-500 text-xs block mb-1">Description:</span>
            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
              {expense.description}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Desktop Table Row Component
  const DesktopExpenseRow = ({ expense }) => {
    const canModify = canModifyExpense(expense);
    const isToday = isExpenseFromToday(expense.date);
    const PaymentIcon = paymentMethodIcons[expense.paymentMethod] || IndianRupee;

    return (
      <tr className="hover:bg-gray-50">
        <td className="px-4 sm:px-6 py-4">
          <div>
            <div className="text-sm font-medium text-gray-900">
              {expense.title}
            </div>
            {expense.description && (
              <div className="text-sm text-gray-500 truncate max-w-xs">
                {expense.description}
              </div>
            )}
          </div>
        </td>
        <td className="px-4 sm:px-6 py-4">
          <div className="text-sm font-bold text-gray-900">
            {formatCurrency(expense.amount)}
          </div>
        </td>
        <td className="px-4 sm:px-6 py-4">
          <div className="flex items-center">
            <PaymentIcon className="w-4 h-4 text-gray-400" />
            <span className="ml-2 text-sm text-gray-600">
              {paymentMethodLabels[expense.paymentMethod]}
            </span>
          </div>
        </td>
        <td className="px-4 sm:px-6 py-4">
          <div className="flex flex-col">
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              <span className="text-xs sm:text-sm">{formatDate(expense.date)}</span>
            </div>
            {!isToday && (
              <span className="text-xs text-orange-600 mt-1">
                Created {user?.role === 'merchant' ? 'previously' : 'yesterday'}
              </span>
            )}
          </div>
        </td>
        
        {activeTab === 'all-expenses' && (
          <td className="px-4 sm:px-6 py-4">
            <div className="text-sm text-gray-500">
              {getCreatorName(expense)}
              {getCreatorRole(expense) && (
                <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full capitalize">
                  {getCreatorRole(expense)}
                </span>
              )}
            </div>
          </td>
        )}
        
        <td className="px-4 sm:px-6 py-4">
          <div className="flex items-center space-x-2">
            {canModify ? (
              <>
                <button
                  onClick={() => onEditClick(expense)}
                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                  title="Edit Expense"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteClick(expense)}
                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                  title="Delete Expense"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex flex-col">
                {user?.role === 'merchant' ? (
                  <span className="text-xs text-blue-600 flex items-center">
                    <Shield className="w-3 h-3 mr-1" />
                    Merchant can modify
                  </span>
                ) : (
                  <span className="text-xs text-gray-400 italic">
                    {!isToday ? 'Cannot modify (past midnight)' : 'Not your expense'}
                  </span>
                )}
              </div>
            )}
          </div>
        </td>
      </tr>
    );
  };

  // Pagination Component
  const Pagination = () => {
    if (!pagination || pagination.pages <= 1) return null;

    return (
      <div className="px-4 sm:px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
        <div className="text-sm text-gray-500">
          Showing page {pagination.current} of {pagination.pages}
          <span className="ml-2 hidden sm:inline">•</span>
          <span className="ml-0 sm:ml-2 block sm:inline">Total: {pagination.total} records</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onPageChange(pagination.current - 1)}
            disabled={!pagination.hasPrev}
            className={`px-3 sm:px-4 py-2 border rounded-lg text-sm ${
              pagination.hasPrev
                ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                : 'border-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Previous
          </button>
          
          {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
            let pageNum;
            if (pagination.pages <= 5) {
              pageNum = i + 1;
            } else if (pagination.current <= 3) {
              pageNum = i + 1;
            } else if (pagination.current >= pagination.pages - 2) {
              pageNum = pagination.pages - 4 + i;
            } else {
              pageNum = pagination.current - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-2 sm:px-3 py-1 sm:py-1 border rounded text-xs sm:text-sm ${
                  pagination.current === pageNum
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button
            onClick={() => onPageChange(pagination.current + 1)}
            disabled={!pagination.hasNext}
            className={`px-3 sm:px-4 py-2 border rounded-lg text-sm ${
              pagination.hasNext
                ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                : 'border-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile View */}
      <div className="sm:hidden">
        {expenses.map((expense) => (
          <MobileExpenseCard key={expense._id} expense={expense} />
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              {activeTab === 'all-expenses' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {expenses.map((expense) => (
              <DesktopExpenseRow key={expense._id} expense={expense} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination />
    </>
  );
};

export default ExpenseTable;