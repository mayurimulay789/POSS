// src/pages/EmployeeManagement.jsx
import React from 'react';
import { useSelector } from 'react-redux';

// Import role-specific employee management components
import MerchantEmployeeManagement from '../components/merchant/EmployeeManagement/EmployeeManagement';
import ManagerEmployeeManagement from '../components/manager/EmployeeManagement/EmployeeManagement';

const EmployeeManagement = () => {
  const { user } = useSelector(state => state.auth);

  const renderEmployeeManagement = () => {
    switch (user?.role) {
      case 'merchant':
        return <MerchantEmployeeManagement />;
      case 'manager':
        return <ManagerEmployeeManagement />;
      case 'supervisor':
        // Supervisor doesn't have employee management permission
        return <div className="p-6 text-center">Access Denied</div>;
      case 'staff':
        // Staff doesn't have employee management permission  
        return <div className="p-6 text-center">Access Denied</div>;
      default:
        return <div>Unauthorized</div>;
    }
  };

  return renderEmployeeManagement();
};

export default EmployeeManagement;