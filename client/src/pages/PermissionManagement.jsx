// src/pages/PermissionManagement.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import MerchantPermissionManagement from '../components/merchant/PermissionManagement/PermissionManagement';

const PermissionManagement = () => {
  const { user } = useSelector(state => state.auth);

  // Only merchant can access permission management
  if (user?.role !== 'merchant') {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-gray-600">Only merchants can access permission management.</p>
      </div>
    );
  }

  return <MerchantPermissionManagement />;
};

export default PermissionManagement;