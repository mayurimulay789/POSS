import React from 'react';
// Replace lucide-react with react-icons
import { FaPlus, FaSearch } from 'react-icons/fa';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { useSelector } from 'react-redux';

const ChargeHeader = ({
  activeTab,
  setActiveTab,
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  onClearFilters,
  onCreateCharge,
  filters,
}) => {
  const user = useSelector(selectCurrentUser);

  return (
    <div className="bg-white rounded-lg shadow mb-4">
      {/* Tabs */}
      <div className="border-b">
        <nav className="flex overflow-x-auto">
          <button
            className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('all')}
          >
            All Charges
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === 'system'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('system')}
          >
            System Charges
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === 'optional'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('optional')}
          >
            Optional Charges
          </button>
        </nav>
      </div>

      {/* Toolbar */}
      <div className="p-4 border-b">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-3 lg:space-y-0">
          {/* Search and Filters */}
          <div className="flex-1 w-full lg:w-auto">
            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
              {/* Search Bar */}
              <form onSubmit={onSearchSubmit} className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search charges by name..."
                    value={searchTerm}
                    onChange={onSearchChange}
                    className="w-1/2 pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 w-full lg:w-auto">
          {user?.role === 'merchant' || user?.role === 'manager' &&(
            <button
              onClick={onCreateCharge}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              aria-label="Add new charge"
            >
              <FaPlus className="w-4 h-4 mr-2" />
              Add Charge
            </button>
            )}
          </div>
          
        </div>

        {/* Clear Filters */}
        {(searchTerm || filters.category || filters.active) && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={onClearFilters}
              className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
              aria-label="Clear all filters"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChargeHeader;