import React from 'react';
import { useSelector } from 'react-redux';

// Import role-specific menu management components
const MerchantMenuManagement = React.lazy(() => import('../components/merchant/MenuManagement/MenuManagement'));
const ManagerMenuManagement = React.lazy(() => import('../components/manager/MenuManagement/MenuManagement'));
const SupervisorMenuManagement = React.lazy(() => import('../components/supervisor/MenuManagement/MenuManagement'));
const StaffMenuManagement = React.lazy(() => import('../components/staff/MenuManagement/MenuManagement'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// Access Denied component
const AccessDenied = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <div className="text-6xl mb-4">🚫</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
      <p className="text-gray-600">You don't have permission to access Menu Management.</p>
    </div>
  </div>
);

const MenuManagement = () => {
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { permissions } = useSelector(state => state.permissions);

  // Check if user has menu management permission
  const hasMenuPermission = () => {
    if (!isAuthenticated || !user) return false;
    if (user.role === 'merchant') return true; // Merchant has all permissions
    
    // For other roles, check if they have the menu_management permission
    return permissions.includes('menu_management');
  };

  const renderMenuManagement = () => {
    if (!hasMenuPermission()) {
      return <AccessDenied />;
    }

    // Render role-specific component with React.Suspense
    let ComponentToRender;
    
    switch (user?.role) {
      case 'merchant':
        ComponentToRender = MerchantMenuManagement;
        break;
      case 'manager':
        ComponentToRender = ManagerMenuManagement;
        break;
      case 'supervisor':
        ComponentToRender = SupervisorMenuManagement;
        break;
      case 'staff':
        ComponentToRender = StaffMenuManagement;
        break;
      default:
        return <AccessDenied />;
    }

    return (
      <React.Suspense fallback={<LoadingSpinner />}>
        <ComponentToRender />
      </React.Suspense>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderMenuManagement()}
    </div>
  );
};

export default MenuManagement;