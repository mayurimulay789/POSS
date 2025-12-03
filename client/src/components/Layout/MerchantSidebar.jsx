import React from 'react';
import BaseSidebar from './BaseSidebar';
import { SIDEBAR_ITEMS } from '../../config/rolePermissions';

const MerchantSidebar = ({ isSidebarOpen, setIsSidebarOpen, sidebarItems = [] }) => {
  // Debug: Log what we're receiving
  console.log('MerchantSidebar - Received sidebarItems:', sidebarItems);
  console.log('MerchantSidebar - sidebarItems length:', sidebarItems.length);
  
  // Merchant gets all sidebar items
  const merchantSidebarItems = sidebarItems.length > 0 
    ? sidebarItems 
    : Object.values(SIDEBAR_ITEMS);

  console.log('MerchantSidebar - Final sidebar items to render:', merchantSidebarItems);

  return (
    <BaseSidebar
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      sidebarItems={merchantSidebarItems}
      roleName="merchant"
      roleLabel="Merchant"
    />
  );
};

export default MerchantSidebar;