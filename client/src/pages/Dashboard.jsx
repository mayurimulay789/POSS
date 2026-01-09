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
    <div className="min-h-screen  bg-gray-50">
      <div className="max-w-7xl mx-auto">

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
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-2">
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