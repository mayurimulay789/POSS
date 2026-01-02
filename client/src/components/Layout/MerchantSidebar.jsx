import React from 'react';
import BaseSidebar from './BaseSidebar';
import { SIDEBAR_ITEMS } from '../../config/rolePermissions';

const MerchantSidebar = ({ isSidebarOpen, setIsSidebarOpen, sidebarItems = [] }) => {
  // Merchant gets all sidebar items including Landing Page Management
  let merchantSidebarItems;
  if (sidebarItems.length > 0) {
    // Add Landing Page Management if it doesn't already exist
    const existingPaths = sidebarItems.map(item => item.path);
    const hasLandingPage = existingPaths.includes('/landing-page');
    merchantSidebarItems = hasLandingPage ? sidebarItems : [...sidebarItems, SIDEBAR_ITEMS.landingPageManagement];
  } else {
    // Fallback: use all items from SIDEBAR_ITEMS
    merchantSidebarItems = Object.values(SIDEBAR_ITEMS);
  }

  console.log('✅ MerchantSidebar - Final sidebar items to render:', merchantSidebarItems);
  console.log('✅ MerchantSidebar - Items count:', merchantSidebarItems.length);
  console.log('✅ MerchantSidebar - Has Landing Page Management:', 
    merchantSidebarItems.some(i => i.path === '/landing-page'));

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