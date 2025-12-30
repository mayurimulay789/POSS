import React from 'react';
import BaseSidebar from './BaseSidebar';
import { SIDEBAR_ITEMS } from '../../config/rolePermissions';

const MerchantSidebar = ({ isSidebarOpen, setIsSidebarOpen, sidebarItems = [] }) => {
  // Debug: Log what we're receiving
  console.log('MerchantSidebar - Received sidebarItems:', sidebarItems);
  console.log('MerchantSidebar - sidebarItems length:', sidebarItems.length);
  
  // Hotel Images item for merchant
  const hotelImagesItem = {
    path: '/hotel-images',
    label: 'Hotel Images',
    icon: '🖼️',
  };
  
  // Merchant gets all sidebar items including hotel images
  let merchantSidebarItems;
  if (sidebarItems.length > 0) {
    // Check if hotel images already exists in sidebarItems
    const hasHotelImages = sidebarItems.some(item => item.path === '/hotel-images');
    merchantSidebarItems = hasHotelImages ? sidebarItems : [hotelImagesItem, ...sidebarItems];
  } else {
    // Fallback: use all items from SIDEBAR_ITEMS
    const allItems = Object.values(SIDEBAR_ITEMS);
    const hasHotelImages = allItems.some(item => item.path === '/hotel-images');
    merchantSidebarItems = hasHotelImages ? allItems : [hotelImagesItem, ...allItems];
  }

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