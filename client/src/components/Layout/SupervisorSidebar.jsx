import React from 'react';
import BaseSidebar from './BaseSidebar';

const SupervisorSidebar = ({ isSidebarOpen, setIsSidebarOpen, sidebarItems = [] }) => {
  // Debug: Log what we're receiving
  console.log('SupervisorSidebar - Received sidebarItems:', sidebarItems);
  console.log('SupervisorSidebar - sidebarItems length:', sidebarItems.length);

  return (
    <BaseSidebar
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      sidebarItems={sidebarItems}
      roleName="supervisor"
      roleLabel="Supervisor"
    />
  );
};

export default SupervisorSidebar;