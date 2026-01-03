import React from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import { ContactUsManagement } from '../components/merchant';

const ContactUsManagementPage = () => {
  return (
    <ProtectedRoute allowedRoles={['merchant']}>
      <ContactUsManagement />
    </ProtectedRoute>
  );
};

export default ContactUsManagementPage;
