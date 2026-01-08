import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearDashboardError } from '../store/slices/dashboardSlice';
import RoleDashboard from '../components/dashboard/RoleDashboard';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { error } = useSelector(state => state.dashboard);

  // Clear any existing errors when component mounts
  useEffect(() => {
    dispatch(clearDashboardError());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with refresh button */}
        {/* <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.FullName}! 
              <span className="ml-2 capitalize text-sm bg-gray-100 px-2 py-1 rounded">
                {user?.role}
              </span>
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <span className="text-lg">↻</span>
              <span>Refresh</span>
            </button>
          </div>
        </div> */}

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Main dashboard content */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
          <RoleDashboard />
        </div>

        {/* Footer note */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>Dashboard updates automatically. Data is cached for 5 minutes.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;