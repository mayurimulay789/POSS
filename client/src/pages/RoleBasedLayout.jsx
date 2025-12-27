import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { usePermissions } from '../hooks/usePermissions';
import MerchantSidebar from '../components/Layout/MerchantSidebar';
import ManagerSidebar from '../components/Layout/ManagerSidebar';
import SupervisorSidebar from '../components/Layout/SupervisorSidebar';
import StaffSidebar from '../components/Layout/StaffSidebar';

const RoleBasedLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { loadPermissions } = usePermissions();

  // Load permissions when component mounts
  useEffect(() => {
    if (isAuthenticated && user) {
      loadPermissions();
    }
  }, [isAuthenticated, user, loadPermissions]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const renderSidebar = () => {
    switch (user?.role) {
      case 'merchant':
        return (
          <MerchantSidebar 
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        );
      case 'manager':
        return (
          <ManagerSidebar 
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        );
      case 'supervisor':
        return (
          <SupervisorSidebar 
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        );
      case 'staff':
        return (
          <StaffSidebar 
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
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