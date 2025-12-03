import React from 'react';
import BaseSidebar from './BaseSidebar';

const ManagerSidebar = ({ isSidebarOpen, setIsSidebarOpen, sidebarItems = [] }) => {
  // Debug: Log what we're receiving
  console.log('ManagerSidebar - Received sidebarItems:', sidebarItems);
  console.log('ManagerSidebar - sidebarItems length:', sidebarItems.length);

  return (
    <BaseSidebar
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      sidebarItems={sidebarItems}
      roleName="manager"
      roleLabel="Manager"
    />
  );
};

export default ManagerSidebar;