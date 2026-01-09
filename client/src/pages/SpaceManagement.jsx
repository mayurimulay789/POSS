import React from 'react';
import { useSelector } from 'react-redux';

// Import role-specific components
import MerchantSpaceManagement from '../components/merchant/SpaceManagement/SpaceManagement';
import ManagerSpaceManagement from '../components/manager/SpaceManagement/SpaceManagement';
import SupervisorSpaceManagement from '../components/supervisor/SpaceManagement/SpaceManagement';
import StaffSpaceManagement from '../components/staff/SpaceManagement/SpaceManagement';

const SpaceManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role;

  // Render component based on role
  switch (role) {
    case 'merchant':
      return <div className="w-full h-auto p-2 sm:p-4 md:p-6"><MerchantSpaceManagement /></div>;
    case 'manager':
      return <div className="w-full h-auto p-2 sm:p-4 md:p-6"><ManagerSpaceManagement /></div>;
    case 'supervisor':
      return <div className="w-full h-auto p-2 sm:p-4 md:p-6"><SupervisorSpaceManagement /></div>;
    case 'staff':
      return <div className="w-full h-auto p-2 sm:p-4 md:p-6"><StaffSpaceManagement /></div>;
    default:
      return (
        <div className="w-full h-auto p-2 sm:p-4 md:p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Space Management</h1>
          <p className="text-gray-600">Unauthorized access.</p>
        </div>
      );
  }
};

export default SpaceManagement;
