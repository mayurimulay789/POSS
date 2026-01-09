import React from 'react';
import { useSelector } from 'react-redux';

// Import role-specific employee management components
import Employeemanagement from '../Employeemanagement/Employeepmanagement';
<Employeemanagement />

const EmployeeManagement = () => {
  const { user } = useSelector(state => state.auth);

  const renderEmployeeManagement = () => {
    switch (user?.role) {
      case 'merchant':
        return <Employeemanagement />;
      case 'manager':
        return <Employeemanagement />;
      case 'supervisor':
        return <Employeemanagement />;
      case 'staff':
        return <Employeemanagement />;
      default:
        return <div>Unauthorized</div>;
    }
  };

  return renderEmployeeManagement();
};

export default EmployeeManagement;