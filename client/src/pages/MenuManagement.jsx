import React from 'react';
import { useSelector } from 'react-redux';

// Import role-specific menu management components
import MerchantMenuManagement from '../components/merchant/MenuManagement/MenuManagement';
import ManagerMenuManagement from '../components/manager/MenuManagement/MenuManagement';
// import SupervisorMenuManagement from '../components/supervisor/MenuManagement/MenuManagement';
// import StaffMenuManagement from '../components/staff/MenuManagement/MenuManagement';

const MenuManagement = () => {
  const { user } = useSelector(state => state.auth);

  const renderMenuManagement = () => {
    switch (user?.role) {
      case 'merchant':
        return <MerchantMenuManagement />;
      case 'manager':
        return <ManagerMenuManagement />;
      case 'supervisor':
        return <SupervisorMenuManagement />;
      case 'staff':
        return <StaffMenuManagement />;
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-4xl mb-4">🚫</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
              <p className="text-gray-600">You don't have permission to access menu management.</p>
            </div>
          </div>
        );
    }
  };

  return renderMenuManagement();
};

export default MenuManagement;