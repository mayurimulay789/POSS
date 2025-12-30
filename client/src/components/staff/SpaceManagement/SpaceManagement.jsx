import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdTableRestaurant } from 'react-icons/md';
import API_BASE_URL from '../../../config/apiConfig';

const SpaceManagement = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      // Only show loading on initial fetch
      if (tables.length === 0) {
        setLoading(true);
      }
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        setTables([]);
        setLoading(false);
        return;
      }
      const url = `${API_BASE_URL}/tables?t=${Date.now()}`;
      const response = await axios.get(url, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      // Handle different response formats
      let tableData = [];
      if (response.data && response.data.data) {
        tableData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        tableData = response.data;
      } else if (Array.isArray(response.data)) {
        tableData = response.data;
      }
      
      setTables(tableData);
      if (tableData.length === 0) {
        setError('No tables available');
      }
    } catch (err) {
      console.error('Error fetching tables:', err);
      setError(err.message || 'Failed to load tables');
      setTables([]);
    } finally {
      setLoading(false);
    }
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
      return { text: 'Booked', color: 'text-green-600 bg-green-200' };
    } else {
      return { text: 'Available', color: 'text-blue-600 bg-blue-100' };
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Space Management — Staff View</h1>
      </div>

      {/* Management Content */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Tables Overview
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Tables Grid */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : tables.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {tables.map((table) => {
              const status = getTableStatus(table);
              const cardColor = getTableCardColor(table);
              
              return (
                <div
                  key={table._id}
                  className={`rounded-lg p-3 transition-shadow hover:shadow-md ${cardColor}`}
                >
                  {/* Table Icon/Menu Section */}
                  <div className="aspect-video mb-2 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                    {table.orderedMenu && table.orderedMenu.length > 0 ? (
                      <div className="w-full h-full overflow-y-auto p-2">
                        <p className="text-xs font-bold text-gray-700 mb-1">Menu:</p>
                        <div className="space-y-1">
                          {table.orderedMenu.map((item, idx) => (
                            <div key={idx} className="text-xs bg-white rounded px-1.5 py-1 border border-gray-200">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700 truncate">{item.name}</span>
                                <span className="text-gray-600 font-semibold ml-1">x{item.quantity}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <MdTableRestaurant className="w-12 h-12 text-gray-400" />
                    )}
                  </div>

                  {/* Table Info */}
                  <h3 className="font-semibold text-gray-800 mb-1 text-sm">
                    {table.tableName}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">
                    Capacity: {table.capacity}
                  </p>

                  {/* Status Badge */}
                  <p className="text-xs mb-2">
                    <span className={`px-2 py-1 rounded-full font-medium inline-block ${status.color}`}>
                      {status.text}
                    </span>
                  </p>

                  {/* Bill if booked */}
                  {table.totalBill && table.orderedMenu && table.orderedMenu.length > 0 && (
                    <p className="text-xs font-bold text-gray-800 mb-2 bg-gray-100 rounded px-2 py-1">
                      Bill: ₹{table.totalBill.toFixed(2)}
                    </p>
                  )}

                  {/* Reserved indicator */}
                  {table.isReserved && (
                    <div className="mt-2 p-2 bg-yellow-100 rounded text-xs text-yellow-800 font-semibold border border-yellow-200">
                      🔒 Reserved Table
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">
              No tables found.
            </p>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: As staff, you have view-only access to space management. To edit tables, please contact management.
      </p>
    </div>
  );
};

export default SpaceManagement;
