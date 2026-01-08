// import React from 'react';
import { Plus, Search } from 'lucide-react';

const CustomerHeader = ({
  activeTab,
  setActiveTab,
  canViewAllCustomers,
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  onClearFilters,
  onCreateCustomer
}) => {
  return (
    <div className="bg-white rounded-lg shadow mb-4">
      {/* Tabs */}
      <div className="border-b">
        <nav className="flex overflow-x-auto">
          {canViewAllCustomers && (
            <button
              className={`px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('all')}
            >
              All Customers
            </button>
          )}
          <button
            className={`px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === 'my'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('my')}
          >
            My Customers
          </button>
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
                placeholder="Search customers by name, email, phone, or membership ID..."
                value={searchTerm}
                onChange={onSearchChange}
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </form>

          {/* Create Customer Button */}
          <button
            onClick={onCreateCustomer}
            className="flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base w-full sm:w-auto mt-2 sm:mt-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </button>
        </div>

        {/* Clear Filters Button */}
        {searchTerm && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
            <button
              onClick={onClearFilters}
              className="px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-xs sm:text-sm"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerHeader;