import React from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import { WelcomeSectionManagement } from '../components/merchant';

const WelcomeSectionManagementPage = () => {
  return (
    <ProtectedRoute allowedRoles={['merchant']}>
      <WelcomeSectionManagement />
    </ProtectedRoute>
  );
};

export default WelcomeSectionManagementPage;
