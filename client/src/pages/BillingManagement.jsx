import React from 'react';
import { useSelector } from 'react-redux';

// Import role-specific billing management components
import ManagerBillingManagement from '../components/manager/BillingManagement/BillingManagement';

const BillingManagement = () => {
  const { user } = useSelector(state => state.auth);

  const renderBillingManagement = () => {
    switch (user?.role) {
      case 'manager':
      case 'merchant':
      case 'supervisor':
      case 'staff':
        return <ManagerBillingManagement />;
      default:
        return <div>Unauthorized</div>;
    }
  };

  return renderBillingManagement();
};

export default BillingManagement;