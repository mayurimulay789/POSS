import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import BaseSidebar from './BaseSidebar';
import { getSidebarItemsForRole } from '../../config/rolePermissions';

const SupervisorSidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { user } = useSelector(state => state.auth);
  const [sidebarItems, setSidebarItems] = useState([]);

  useEffect(() => {
    const fetchSupervisorPermissions = async () => {
      try {
        const response = await fetch('/api/role-permissions/my-permissions');
        const data = await response.json();
        const items = getSidebarItemsForRole(data.permissions);
        setSidebarItems(items);
      } catch (error) {
        const defaultPermissions = [
          'order_management', 'billing_management', 'space_management',
          'task_management'
        ];
        const items = getSidebarItemsForRole(defaultPermissions);
        setSidebarItems(items);
      }
    };

    fetchSupervisorPermissions();
  }, []);

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