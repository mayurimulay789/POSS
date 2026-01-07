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
  const [openSubMenus, setOpenSubMenus] = useState({});

  /* ---------------- EFFECTS ---------------- */
  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = e => {
      if (e.key === 'Escape' && isSidebarOpen) setIsSidebarOpen(false);
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

  /* ---------------- HELPERS ---------------- */
  const handleNavigation = path => {
    navigate(path);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const isActive = path =>
    location.pathname === path ||
    location.pathname.startsWith(path + '/');

  const toggleGroup = name =>
    setOpenGroups(prev => ({ ...prev, [name]: !prev[name] }));

  const toggleSubMenu = path =>
    setOpenSubMenus(prev => ({ ...prev, [path]: !prev[path] }));

  /* ---------------- ICON MAP ---------------- */
  const getIconForPermission = permission => {
    const icons = {
      dashboard: '📊',
      order_management: '📝',
      menu_management: '📋',
      billing_management: '💰',
      space_management: '🪑',
      task_management: '✅',
      expense_management: '💸',
      customer_management: '🧑‍🤝‍🧑',
      // reports_analytics: '📈',
      employee_management: '👥',
      permission_management: '🔐',
      charges_management: '💲',
      attendance_management: '🕒',
    };
    return icons[permission] || '📄';
  };

  /* -------- NORMALIZE SIDEBAR ITEMS -------- */
  const normalizedSidebarItems = sidebarItems
    .map(item => {
      // If it's a string, convert to object
      if (typeof item === 'string') {
        return {
          path: `/${item.replace('_management', '').replace(/_/g, '-')}`,
          label: item.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          icon: getIconForPermission(item),
          permission: item
        };
      }
      // If it's an object, ensure label is a string
      if (item && typeof item === 'object') {
        return {
          ...item,
          label: typeof item.label === 'string' ? item.label : String(item.label || 'Unknown'),
          icon: item.icon || getIconForPermission(item.permission) || '📄',
          subItems: item.subItems?.map(sub => ({
            ...sub,
            label: typeof sub.label === 'string' ? sub.label : String(sub.label || 'Unknown')
          })) || []
        };
      }
      return null;
    })
    .filter(Boolean);

  /* ------------ MENU ITEM RENDER ------------ */
  const renderMenuItem = item => {
    // Safety check: ensure item has required properties
    if (!item || !item.path || !item.label) {
      console.warn('Invalid menu item:', item);
      return null;
    }

    const hasSub = item.subItems?.length > 0;
    const isOpen = openSubMenus[item.path];
    const active =
      isActive(item.path) ||
      item.subItems?.some(sub => isActive(sub.path));

    if (hasSub) {
      return (
        <div key={item.path} className="mb-1">
          <button
            onClick={() => toggleSubMenu(item.path)}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-all duration-200 ${
              active
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'text-gray-700 hover:bg-gray-50 hover:border-gray-200 border border-transparent'
            }`}
          >
            <span className="flex items-center space-x-3">
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{String(item.label)}</span>
            </span>
            <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {isOpen && (
            <div className="ml-8 mt-1 space-y-1">
              {item.subItems.map(sub => (
                <button
                  key={sub.path}
                  onClick={() => handleNavigation(sub.path)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    isActive(sub.path)
                      ? 'bg-blue-50 text-blue-700 border border-blue-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {String(sub.label || 'Unknown')}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={item.path}
        onClick={() => handleNavigation(item.path)}
        className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-all duration-200 mb-1 ${
          isActive(item.path)
            ? 'bg-blue-100 text-blue-700 border border-blue-200' 
            : 'text-gray-700 hover:bg-gray-50 hover:border-gray-200 border border-transparent'
        }`}
      >
        <span className="text-lg">{item.icon}</span>
        <span className="font-medium">{String(item.label)}</span>
      </button>
    );
  };

  /* ---------------- GROUPING ---------------- */
  const groupedItems = {
    main: normalizedSidebarItems.filter(i => i.path === '/dashboard'),
    operations: normalizedSidebarItems.filter(i =>
      ['/spaces', '/menu', '/orders', '/billing'].includes(i.path)
    ).sort((a, b) => {
      const order = ['/spaces', '/menu', '/orders', '/billing'];
      return order.indexOf(a.path) - order.indexOf(b.path);
    }),
    management: normalizedSidebarItems.filter(i =>
      ['/hotel-images', '/tasks', '/expenses', '/customers'].includes(i.path)
    ),
    analytics: normalizedSidebarItems.filter(i => i.path === '/'),
    administration: normalizedSidebarItems.filter(i =>
      ['/employees', '/permission-management', '/landing-page', '/charges','/attendance-dashboard','/about-us-management', '/contact-us-management', '/welcome-section-management', '/cuisine-gallery-management'].includes(i.path)
    )
  };

  const renderGroup = (key, items, label) => {
    if (items.length === 0) return null;
    
    const isGroupOpen = openGroups[key] || false;
    const hasActiveItem = items.some(item => 
      isActive(item.path) || 
      item.subItems?.some(sub => isActive(sub.path))
    );

    return (
      <div className="mb-2">
        {label && (
          <button
            onClick={() => toggleGroup(key)}
            className={`w-full text-left px-4 py-2 mb-1 rounded-lg flex items-center justify-between transition-colors ${
              hasActiveItem ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-xs font-semibold uppercase tracking-wider">
              {label}
            </span>
            <span className={`transform transition-transform ${isGroupOpen ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
        )}
        
        {(isGroupOpen || !label) && (
          <div className="space-y-1">
            {items.map(item => renderMenuItem(item))}
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
            {renderGroup('main', groupedItems.main)}
            {renderGroup('operations', groupedItems.operations, 'Operations')}
            {renderGroup('management', groupedItems.management, 'Management')}
            {/* {renderGroup('analytics', groupedItems.analytics, 'Analytics')} */}
            {renderGroup('administration', groupedItems.administration, 'Administration')}
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
      {/* Desktop Sidebar - Always visible on large screens */}
      <div className="hidden lg:flex lg:w-64 bg-white shadow-sm min-h-screen flex-col border-r border-gray-200">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar - Toggleable on mobile */}
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