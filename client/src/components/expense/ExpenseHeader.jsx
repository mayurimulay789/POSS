import React from 'react';
import { Plus, Search, Calendar } from 'lucide-react';

const ExpenseHeader = ({
  activeTab,
  setActiveTab,
  canViewAllExpenses,
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  dateFilter,
  onDateFilterChange,
  onApplyDateFilter,
  onClearFilters,
  onCreateExpense,
  showDateFilters
}) => {
  return (
    <div className="bg-white rounded-lg shadow mb-6">
      {/* Tabs */}
      <div className="border-b">
        <nav className="flex overflow-x-auto">
          <button
            className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === 'my-expenses'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('my-expenses')}
          >
            My Expenses
          </button>
          {canViewAllExpenses && (
            <button
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'all-expenses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('all-expenses')}
            >
              All Expenses
            </button>
          )}
        </nav>
      </div>

      {/* Toolbar */}
      <div className="p-3 sm:p-4 border-b">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
          {/* Search Bar */}
          <form onSubmit={onSearchSubmit} className="w-full sm:flex-1 sm:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={onSearchChange}
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </form>

          {/* Date Filter (only for all expenses view) */}
          {showDateFilters && (
            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="flex items-center space-x-2  ps-2">
                <input
                  type="date"
                  value={dateFilter.startDate}
                  onChange={(e) => onDateFilterChange('startDate', e.target.value)}
                  className="px-2 py-1 sm:px-3 sm:py-1 border border-gray-300 rounded text-sm w-32 sm:w-auto"
                />
                <span className="text-gray-400 text-sm">to</span>
                <input
                  type="date"
                  value={dateFilter.endDate}
                  onChange={(e) => onDateFilterChange('endDate', e.target.value)}
                  className="px-2 py-1 sm:px-3 sm:py-1 border border-gray-300 rounded text-sm w-32 sm:w-auto"
                />
              </div>
              <button
                onClick={onApplyDateFilter}
                className="px-3 py-1.5 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 w-full sm:w-auto"
              >
                Apply
              </button>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center space-x-2 w-full sm:w-auto ps-2">
            {showDateFilters && (
              <button
                onClick={onClearFilters}
                className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm w-full sm:w-auto"
              >
                Clear Filters
              </button>
            )}
            
            <button
              onClick={onCreateExpense}
              className="flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Expense
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseHeader;