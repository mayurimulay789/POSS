// src/pages/AboutUsManagement.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import MerchantAboutUsManagement from '../components/merchant/AboutUsManagement/AboutUsManagement';

const AboutUsManagement = () => {
  const { user } = useSelector(state => state.auth);

  // All roles can access About Us management

  return <MerchantAboutUsManagement />;
};

export default AboutUsManagement;
