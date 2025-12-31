import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { usePermissions } from '../hooks/usePermissions';
import MerchantSidebar from '../components/Layout/MerchantSidebar';
import ManagerSidebar from '../components/Layout/ManagerSidebar';
import SupervisorSidebar from '../components/Layout/SupervisorSidebar';
import StaffSidebar from '../components/Layout/StaffSidebar';
import { getSidebarItemsForRole, SIDEBAR_ITEMS } from '../config/rolePermissions';

const RoleBasedLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { permissions, loadPermissions, permissionsLoaded } = usePermissions();
  const [sidebarItems, setSidebarItems] = useState([]);
  const [hasLoadedPermissions, setHasLoadedPermissions] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('RoleBasedLayout - User:', user);
    console.log('RoleBasedLayout - Permissions:', permissions);
    console.log('RoleBasedLayout - Permissions loaded:', permissionsLoaded);
    console.log('RoleBasedLayout - hasLoadedPermissions:', hasLoadedPermissions);
  }, [user, permissions, permissionsLoaded, hasLoadedPermissions]);

  // Load permissions only once when component mounts
  useEffect(() => {
    if (isAuthenticated && user && !hasLoadedPermissions) {
      console.log('Loading permissions...');
      loadPermissions();
      setHasLoadedPermissions(true);
    }
  }, [isAuthenticated, user, loadPermissions, hasLoadedPermissions]);

  // Update sidebar items when permissions change
  useEffect(() => {
    console.log('Updating sidebar items with permissions:', permissions);
    
    if (permissions && permissions.length > 0) {
      const items = getSidebarItemsForRole(permissions);
      console.log('Filtered sidebar items:', items);
      setSidebarItems(items);
    } else if (user?.role === 'merchant') {
      // Merchant gets all items
      const items = Object.values(SIDEBAR_ITEMS);
      console.log('Merchant sidebar items:', items);
      setSidebarItems(items);
    } else if (permissionsLoaded && (!permissions || permissions.length === 0)) {
      // Fallback based on role if no permissions loaded
      const defaultPermissions = getDefaultPermissionsForRole(user?.role);
      const items = getSidebarItemsForRole(defaultPermissions);
      console.log('Fallback sidebar items for role:', user?.role, items);
      setSidebarItems(items);
    }
  }, [permissions, user, permissionsLoaded]);

  // Helper function for default permissions per role
  const getDefaultPermissionsForRole = (role) => {
    switch (role) {
      case 'manager':
        return ['order_management', 'billing_management', 'space_management', 
                'task_management', 'expense_management', 'reports_analytics', 
                'employee_management','customer_management','charges_management'];
      case 'supervisor':
        return ['order_management', 'billing_management', 'space_management', 
                'task_management'];
      case 'staff':
        return ['order_management', 'billing_management'];
      default:
        return [];
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const renderSidebar = () => {
    console.log('Rendering sidebar for role:', user?.role);
    console.log('Sidebar items to pass:', sidebarItems);
    
    switch (user?.role) {
      case 'merchant':
        return (
          <MerchantSidebar 
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            sidebarItems={sidebarItems}
          />
        );
      case 'manager':
        return (
          <ManagerSidebar 
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            sidebarItems={sidebarItems}
          />
        );
      case 'supervisor':
        return (
          <SupervisorSidebar 
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            sidebarItems={sidebarItems}
          />
        );
      case 'staff':
        return (
          <StaffSidebar 
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            sidebarItems={sidebarItems}
          />
        );
      default:
        return <Navigate to="/" replace />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {renderSidebar()}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-800 capitalize">
              {user?.role} Dashboard
            </h1>
            <div className="w-10"></div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default RoleBasedLayout;