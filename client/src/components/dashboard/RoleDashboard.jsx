// src/components/dashboard/RoleDashboard.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import MerchantDashboard from './MerchantDashboard';
import ManagerDashboard from './ManagerDashboard';
import SupervisorDashboard from './SupervisorDashboard';
import StaffDashboard from './StaffDashboard';
import LoadingSkeleton from './common/LoadingSkeleton';

const RoleDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { loading, error } = useSelector((state) => state.dashboard);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-red-200">
        <div className="text-red-600 text-lg font-semibold mb-2">Error loading dashboard</div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  switch (user?.role) {
    case 'merchant':
      return <MerchantDashboard />;
    case 'manager':
      return <ManagerDashboard />;
    case 'supervisor':
      return <SupervisorDashboard />;
    case 'staff':
      return <StaffDashboard />;
    default:
      return (
        <div className="p-8 text-center bg-white rounded-xl border">
          <div className="text-gray-600">Unauthorized access</div>
          <p className="text-sm text-gray-500 mt-2">Please contact your administrator</p>
        </div>
      );
  }
};

export default RoleDashboard;