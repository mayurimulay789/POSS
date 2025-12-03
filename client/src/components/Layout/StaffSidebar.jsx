import React from 'react';
import BaseSidebar from './BaseSidebar';

const StaffSidebar = ({ isSidebarOpen, setIsSidebarOpen, sidebarItems = [] }) => {
  // Debug: Log what we're receiving
  console.log('StaffSidebar - Received sidebarItems:', sidebarItems);
  console.log('StaffSidebar - sidebarItems length:', sidebarItems.length);

  return (
    <BaseSidebar
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      sidebarItems={sidebarItems}
      roleName="staff"
      roleLabel="Staff"
    />
  );
};

export default StaffSidebar;