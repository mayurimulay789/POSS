import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';

const BaseSidebar = ({ 
  isSidebarOpen, 
  setIsSidebarOpen, 
  sidebarItems = [],
  roleName,
  roleLabel 
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector(state => state.auth);
  const [openGroups, setOpenGroups] = useState({});

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isSidebarOpen, setIsSidebarOpen]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const toggleGroup = (groupName) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Debug: Log sidebar items to see their structure
  useEffect(() => {
    console.log('BaseSidebar - sidebarItems:', sidebarItems);
    console.log('BaseSidebar - sidebarItems length:', sidebarItems.length);
  }, [sidebarItems]);

  // Ensure sidebar items have the correct structure
  const normalizeSidebarItems = (items) => {
    return items.map(item => {
      // If item is already in the correct format, return as is
      if (item && typeof item === 'object' && item.path && item.label) {
        return item;
      }
      
      // If item is just a permission string, create a basic structure
      if (typeof item === 'string') {
        return {
          path: `/${item.replace('_management', '').replace('_', '-')}`,
          label: item.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          icon: getIconForPermission(item),
          permission: item
        };
      }
      
      return null;
    }).filter(Boolean);
  };

  // Helper function to get icons for permissions
  const getIconForPermission = (permission) => {
    const iconMap = {
      'order_management': '📝',
      'menu_management': '📋',
      'billing_management': '💰',
      'space_management': '🪑',
      'task_management': '✅',
      'expense_management': '💸',
      'customer_management': '🧑‍🤝‍🧑',
      'reports_analytics': '📈',
      'employee_management': '👥',
      'permission_management': '🔐',
      'dashboard': '📊'
    };
    
    return iconMap[permission] || '📄';
  };

  // Normalize sidebar items
  const normalizedSidebarItems = normalizeSidebarItems(sidebarItems);

  // Group sidebar items
  const groupedItems = {
    main: normalizedSidebarItems.filter(item => 
      ['dashboard'].includes(item.path.replace('/', ''))
    ),
    operations: normalizedSidebarItems.filter(item =>
      ['orders', 'menu', 'billing'].includes(item.path.replace('/', ''))
    ),
    management: normalizedSidebarItems.filter(item =>
      ['spaces', 'tasks', 'expenses','customers'].includes(item.path.replace('/', ''))
    ),
    analytics: normalizedSidebarItems.filter(item =>
      ['reports'].includes(item.path.replace('/', ''))
    ),
    administration: normalizedSidebarItems.filter(item =>
      ['employees', 'permission-management'].includes(item.path.replace('/', ''))
    )
  };

  const renderSidebarGroup = (groupName, items, groupLabel = null) => {
    if (items.length === 0) return null;

    const isGroupOpen = openGroups[groupName];
    const hasActiveItem = items.some(item => isActive(item.path));

    return (
      <div className="mb-2">
        {groupLabel && items.length > 0 && (
          <button
            onClick={() => toggleGroup(groupName)}
            className={`w-full text-left px-4 py-2 mb-1 rounded-lg flex items-center justify-between transition-colors ${
              hasActiveItem ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-xs font-semibold uppercase tracking-wider">
              {groupLabel}
            </span>
            <span className={`transform transition-transform ${isGroupOpen ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
        )}
        
        {(isGroupOpen || !groupLabel) && (
          <div className="space-y-1">
            {items.map(item => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                  isActive(item.path)
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-50 hover:border-gray-200 border border-transparent'
                }`}
              >
                <span className="text-lg">{item.icon || '📄'}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between lg:block">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center border border-blue-300">
              <span className="font-bold text-lg text-white">
                {user?.FullName?.charAt(0) || roleName?.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 truncate">{user?.FullName || 'User'}</h3>
              <p className="text-gray-600 text-sm capitalize">{roleLabel}</p>
              <p className="text-gray-500 text-xs truncate">{user?.email || ''}</p>
              <p className="text-gray-400 text-xs mt-1">
                {normalizedSidebarItems.length} menu items
              </p>
            </div>
          </div>
          
          {/* Mobile Close Button */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 p-4 overflow-y-auto">
        {normalizedSidebarItems.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">No menu items available</div>
            <div className="text-xs text-gray-500">Loading permissions...</div>
          </div>
        ) : (
          <>
            {renderSidebarGroup('main', groupedItems.main)}
            {renderSidebarGroup('operations', groupedItems.operations, 'Operations')}
            {renderSidebarGroup('management', groupedItems.management, 'Management')}
            {renderSidebarGroup('analytics', groupedItems.analytics, 'Analytics')}
            {renderSidebarGroup('administration', groupedItems.administration, 'Administration')}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <button
          onClick={handleLogout}
          className="w-full bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 bg-white shadow-sm min-h-screen flex-col border-r border-gray-200">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar */}
      <div className={`
        lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col border-r border-gray-200
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {sidebarContent}
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default BaseSidebar;