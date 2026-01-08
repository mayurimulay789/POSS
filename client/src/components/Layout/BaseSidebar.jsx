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
  const [isHovered, setIsHovered] = useState(false);

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

  const handleClose = () => {
    navigate('/');
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
      employee_management: '👥',
      charges_management: '💲',
      ...(user.role === 'merchant' && {
        attendance_management: '🕒',
        permission_management: '🔐'
      })
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
            className={`w-full text-left px-2 py-3 rounded-xl flex items-center justify-between transition-all duration-300 group ${
              active
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20 border border-blue-400' 
                : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-white hover:text-blue-600 hover:shadow-md hover:border-blue-200 border border-transparent'
            }`}
          >
            <span className="flex items-center  space-x-3">
              <span className={`text-lg transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span>
              <span className="font-medium text-sm">{String(item.label)}</span>
            </span>
            <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${active ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </button>

          {isOpen && (
            <div className="ml-10 mt-1 space-y-1">
              {item.subItems.map(sub => (
                <button
                  key={sub.path}
                  onClick={() => handleNavigation(sub.path)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg transition-all duration-300 group ${
                    isActive(sub.path)
                      ? 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                      : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-white hover:text-blue-600 hover:border-blue-200 border border-transparent'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span className="w-1 h-1 rounded-full bg-gray-400 group-hover:bg-blue-500 group-hover:scale-125 transition-transform"></span>
                    <span>{String(sub.label || 'Unknown')}</span>
                  </span>
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
        className={`w-full text-left ps-2 py-3.5 rounded-xl flex items-center space-x-3 transition-all duration-300 group mb-1 ${
          isActive(item.path)
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20 border border-blue-400' 
            : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-white hover:text-blue-600 hover:shadow-md hover:border-blue-200 border border-transparent'
        }`}
      >
        <span className={`text-lg transition-transform duration-300 ${isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'}`}>
          {item.icon}
        </span>
        <span className="font-medium text-sm">{String(item.label)}</span>
        {!isActive(item.path) && (
          <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        )}
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
    
    administration: normalizedSidebarItems.filter(i => {
      const adminPaths = ['/employees', '/landing-page', '/charges', '/about-us-management', '/contact-us-management', '/welcome-section-management', '/cuisine-gallery-management'];
      if (user.role === 'merchant') {
        adminPaths.push('/permission-management', '/attendance-dashboard');
      }
      return adminPaths.includes(i.path);
    })
  };

  const renderGroup = (key, items, label) => {
    if (items.length === 0) return null;
    
    const isGroupOpen = openGroups[key] !== undefined ? openGroups[key] : true; // Default to open
    const hasActiveItem = items.some(item => 
      isActive(item.path) || 
      item.subItems?.some(sub => isActive(sub.path))
    );

    return (
      <div className="mb-4">
        {label && (
          <button
            onClick={() => toggleGroup(key)}
            className="w-full text-left px-4 py-3 mb-2 rounded-lg flex items-center justify-between transition-colors hover:bg-gray-50/50 group"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 group-hover:text-gray-700 flex items-center space-x-2">
              <span className="w-1 h-1 rounded-full bg-gray-300 group-hover:bg-blue-500"></span>
              <span>{label}</span>
            </span>
            <span className={`transform transition-transform duration-300 ${isGroupOpen ? 'rotate-180' : ''} text-gray-400 group-hover:text-blue-500`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
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
      <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-white to-gray-50">
        <div className="flex items-center justify-between lg:block">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center border-2 border-white shadow-lg shadow-blue-500/20"
              onClick={handleClose}
              >
                <span className="font-bold text-xl text-white">
                  {user?.FullName?.charAt(0) || roleName?.charAt(0)}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 truncate text-lg">{user?.FullName || 'User'}</h3>
              <p className="text-gray-600 text-sm capitalize bg-gray-100 px-3 py-1 rounded-full inline-block mt-1">
                {roleLabel}
              </p>
              <p className="text-gray-500 text-xs truncate mt-2 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {user?.email || ''}
              </p>
            </div>
          </div>
          
          {/* Mobile Close Button */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2.5 rounded-xl bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-all duration-300 shadow-sm hover:shadow-md border border-gray-100"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 p-5 overflow-y-auto">
        {normalizedSidebarItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-gray-500 mb-2 font-medium">No menu items available</div>
            <div className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full inline-block">
              Loading permissions...
            </div>
          </div>
        ) : (
          <>
            {renderGroup('main', groupedItems.main)}
            {renderGroup('operations', groupedItems.operations, 'Operations')}
            {renderGroup('management', groupedItems.management, 'Management')}
            {renderGroup('administration', groupedItems.administration, 'Administration')}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-gray-100 bg-gradient-to-b from-white to-gray-50">
        <button
          onClick={handleLogout}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="w-full bg-gradient-to-r from-white to-gray-50 text-gray-700 px-4 py-3.5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-3 shadow-sm hover:shadow-md border border-gray-200 hover:border-red-200 hover:from-red-50 hover:to-white hover:text-red-600 group"
        >
          <span className={`transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </span>
          <span className="font-medium">Logout</span>
        </button>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-400 text-center">
            Version 1.0.0
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar - Always visible on large screens */}
      <div 
        className="hidden lg:flex lg:w-72 bg-gradient-to-b from-white to-gray-50 shadow-xl min-h-screen flex-col border-r border-gray-100"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)'
        }}
      >
        {sidebarContent}
      </div>

      {/* Mobile Sidebar - Toggleable on mobile */}
      <div className={`
        lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-white to-gray-50 shadow-2xl transform transition-all duration-300 ease-in-out flex flex-col border-r border-gray-100
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {sidebarContent}
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default BaseSidebar;