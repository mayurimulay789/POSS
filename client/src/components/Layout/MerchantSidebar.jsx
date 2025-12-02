import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import BaseSidebar from './BaseSidebar';
import { getSidebarItemsForRole } from '../../config/rolePermissions';
import { FIXED_PERMISSIONS } from '../../config/fixedPermissions';

const MerchantSidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { user } = useSelector(state => state.auth);
  
  // Merchant has all permissions by default
  const allPermissions = Object.values(FIXED_PERMISSIONS);
  const sidebarItems = getSidebarItemsForRole(allPermissions);

  return (
    <BaseSidebar
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      sidebarItems={sidebarItems}
      roleName="merchant"
      roleLabel="Merchant"
    />
  );
};

export default MerchantSidebar;