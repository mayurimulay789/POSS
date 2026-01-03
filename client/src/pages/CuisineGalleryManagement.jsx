import React from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import { CuisineGalleryManagement } from '../components/merchant';

const CuisineGalleryManagementPage = () => {
  return (
    <ProtectedRoute allowedRoles={['merchant']}>
      <CuisineGalleryManagement />
    </ProtectedRoute>
  );
};

export default CuisineGalleryManagementPage;
