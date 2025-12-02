// src/pages/Dashboard.jsx
import React from 'react';
import { useSelector } from 'react-redux';

// Import role-specific dashboard components
import MerchantDashboard from '../components/merchant/Dashboard/MerchantDashboard';
import ManagerDashboard from '../components/manager/Dashboard/ManagerDashboard';
import SupervisorDashboard from '../components/supervisor/Dashboard/SupervisorDashboard';
import StaffDashboard from '../components/staff/Dashboard/Dashboard';

const Dashboard = () => {
  const { user } = useSelector(state => state.auth);

  const renderDashboard = () => {
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
        return <div>Unauthorized</div>;
    }
  };

  return renderDashboard();
};

export default Dashboard;