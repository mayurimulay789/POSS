import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTables } from '../../../store/slices/tableSlice';
import { MdTableRestaurant } from 'react-icons/md';

const SpaceManagement = () => {
  const dispatch = useDispatch();
  const { items: tables = [], loading, error } = useSelector(state => state.table);

  // Error display (if error exists in Redux state)
  let errorMessage = null;
  if (error) {
    errorMessage = (
      <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {error}
      </div>
    );
  }

  useEffect(() => {
    dispatch(fetchTables());
  }, [dispatch]);

  const getTableCardColor = (table) => {
    if (table.isReserved) {
      return 'bg-yellow-50 border-yellow-300 border-2';
    } else if (table.orderedMenu && table.orderedMenu.length > 0) {
      return 'bg-blue-50 border-blue-300 border-2';
    } else {
      return 'bg-green-50 border-green-300 border-2';
    }
  };

  const getTableStatus = (table) => {
    if (table.isReserved) {
      return { text: 'Reserved', color: 'text-yellow-600 bg-yellow-100' };
    } else if (table.orderedMenu && table.orderedMenu.length > 0) {
      return { text: 'Booked', color: 'text-blue-600 bg-blue-100' };
    } else {
      return { text: 'Available', color: 'text-green-600 bg-green-100' };
    }
  };

  return (
    <div className="w-full h-auto p-2 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Space Management </h1>
      </div>
      {errorMessage}
      <div className="bg-white rounded-lg shadow p-2 sm:p-4 md:p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Tables Overview</h2>
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : tables.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tables.map((table) => {
              const status = getTableStatus(table);
              const cardColor = getTableCardColor(table);
              return (
                <div key={table._id} className={`rounded-lg p-3 transition-shadow hover:shadow-md ${cardColor}`}>
                  <div className="aspect-video mb-2 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                    <MdTableRestaurant className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1 text-sm">{table.tableName}</h3>
                  <p className="text-xs text-gray-600 mb-2">Capacity: {table.capacity}</p>
                  <span className={`px-2 py-1 rounded-full font-medium inline-block ${status.color}`}>{status.text}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No tables found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpaceManagement;
