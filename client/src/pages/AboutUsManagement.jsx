// src/pages/AboutUsManagement.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import MerchantAboutUsManagement from '../components/merchant/AboutUsManagement/AboutUsManagement';

const AboutUsManagement = () => {
  const { user } = useSelector(state => state.auth);

  // Only merchant can access About Us management
  if (user?.role !== 'merchant') {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-gray-600">Only merchants can access About Us management.</p>
      </div>
    );
  }

  return <MerchantAboutUsManagement />;
};

export default AboutUsManagement;
