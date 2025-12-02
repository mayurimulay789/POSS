import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import BaseSidebar from './BaseSidebar';
import { getSidebarItemsForRole } from '../../config/rolePermissions';
import { usePermissions } from '../../hooks/usePermissions';

const ManagerSidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { user } = useSelector(state => state.auth);
  const { permissions, loadPermissions } = usePermissions();
  const [sidebarItems, setSidebarItems] = useState([]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  useEffect(() => {
    const items = getSidebarItemsForRole(permissions);
    setSidebarItems(items);
  }, [permissions]);

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