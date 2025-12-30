import React from 'react';
import BaseSidebar from './BaseSidebar';
import { SIDEBAR_ITEMS } from '../../config/rolePermissions';

const ManagerSidebar = ({ isSidebarOpen, setIsSidebarOpen, sidebarItems = [] }) => {
  // Debug: Log what we're receiving
  console.log('ManagerSidebar - Received sidebarItems:', sidebarItems);
  console.log('ManagerSidebar - sidebarItems length:', sidebarItems.length);

  // Hotel Images item for manager
  const hotelImagesItem = {
    path: '/hotel-images',
    label: 'Hotel Images',
    icon: '🖼️',
  };

  // Add hotel images to manager's sidebar items if not already present
  const hasHotelImages = sidebarItems.some(item => item.path === '/hotel-images');
  const managerSidebarItems = hasHotelImages 
    ? sidebarItems 
    : (sidebarItems.length > 0 ? [hotelImagesItem, ...sidebarItems] : [hotelImagesItem]);

  return (
    <BaseSidebar
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      sidebarItems={managerSidebarItems}
      roleName="manager"
      roleLabel="Manager"
    />
  );
};

export default ManagerSidebar;