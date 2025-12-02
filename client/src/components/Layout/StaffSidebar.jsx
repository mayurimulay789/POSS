import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import BaseSidebar from './BaseSidebar';
import { getSidebarItemsForRole } from '../../config/rolePermissions';

const StaffSidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { user } = useSelector(state => state.auth);
  const [sidebarItems, setSidebarItems] = useState([]);

  useEffect(() => {
    const fetchStaffPermissions = async () => {
      try {
        const response = await fetch('/api/role-permissions/my-permissions');
        const data = await response.json();
        const items = getSidebarItemsForRole(data.permissions);
        setSidebarItems(items);
      } catch (error) {
        const defaultPermissions = [
          'order_management', 'billing_management'
        ];
        const items = getSidebarItemsForRole(defaultPermissions);
        setSidebarItems(items);
      }
    };

    fetchStaffPermissions();
  }, []);

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