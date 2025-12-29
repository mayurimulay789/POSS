import React from 'react';
import { useSelector } from 'react-redux';

// Import role-specific components
import MerchantSpaceManagement from '../components/merchant/SpaceManagement/SpaceManagement';
import ManagerSpaceManagement from '../components/manager/SpaceManagement/SpaceManagement';

const SpaceManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role;

  // Render component based on role
  switch (role) {
    case 'merchant':
      return <MerchantSpaceManagement />;
    case 'manager':
      return <ManagerSpaceManagement />;
    case 'supervisor':
      return (
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Space Management</h1>
          <p className="text-gray-600">Space management is not available for supervisor role.</p>
        </div>
      );
    case 'staff':
      return (
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Space Management</h1>
          <p className="text-gray-600">Space management is not available for staff role.</p>
        </div>
      );
    default:
      return (
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Space Management</h1>
          <p className="text-gray-600">Please log in to access space management.</p>
        </div>
      );
  }
};

export default SpaceManagement;
