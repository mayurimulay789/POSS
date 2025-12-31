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
  useEffect(() => {
    const handleEscape = e => {
      if (e.key === 'Escape' && isSidebarOpen) setIsSidebarOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isSidebarOpen, setIsSidebarOpen]);

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? 'hidden' : 'unset';
    return () => (document.body.style.overflow = 'unset');
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
      reports_analytics: '📈',
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
      if (typeof item === 'string') {
        return {
          path: `/${item.replace('_management', '').replace(/_/g, '-')}`,
          label: item.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          icon: getIconForPermission(item)
        };
      }
      return item;
    })
    .filter(Boolean);

  /* ------------ MENU ITEM RENDER ------------ */
  const renderMenuItem = item => {
    const hasSub = item.subItems?.length;
    const isOpen = openSubMenus[item.path];
    const active =
      isActive(item.path) ||
      item.subItems?.some(sub => isActive(sub.path));

    if (hasSub) {
      return (
        <div key={item.path}>
          <button
            onClick={() => toggleSubMenu(item.path)}
            className={`w-full px-4 py-3 flex justify-between rounded-lg ${
              active ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-50'
            }`}
          >
            <span className="flex gap-3">
              <span>{item.icon}</span>
              {item.label}
            </span>
            <span className={isOpen ? 'rotate-180' : ''}>▼</span>
          </button>

          {isOpen && (
            <div className="ml-6 mt-1 space-y-1">
              {item.subItems.map(sub => (
                <button
                  key={sub.path}
                  onClick={() => handleNavigation(sub.path)}
                  className={`w-full text-left px-4 py-2 rounded ${
                    isActive(sub.path)
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {sub.label}
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
        className={`w-full px-4 py-3 flex gap-3 rounded-lg ${
          isActive(item.path)
            ? 'bg-blue-100 text-blue-700'
            : 'hover:bg-gray-50'
        }`}
      >
        <span>{item.icon}</span>
        {item.label}
      </button>
    );
  };

  /* ---------------- GROUPING ---------------- */
  const groupedItems = {
    main: normalizedSidebarItems.filter(i => i.path === '/dashboard'),
    operations: normalizedSidebarItems.filter(i =>
      ['/orders', '/menu', '/billing'].includes(i.path)
    ),
    management: normalizedSidebarItems.filter(i =>
      ['/spaces', '/tasks', '/expenses', '/customers'].includes(i.path)
    ),
    analytics: normalizedSidebarItems.filter(i => i.path === '/reports'),
    administration: normalizedSidebarItems.filter(i =>
      ['/employees', '/permission-management','/charges','/attendance-dashboard'].includes(i.path)
    )
  };

  const renderGroup = (key, items, label) =>
    items.length > 0 && (
      <div className="mb-3">
        {label && (
          <button
            onClick={() => toggleGroup(key)}
            className="w-full px-4 py-2 text-xs font-semibold uppercase text-gray-500 flex justify-between"
          >
            {label}
            <span>{openGroups[key] ? '▲' : '▼'}</span>
          </button>
        )}
        {(openGroups[key] || !label) &&
          items.map(item => renderMenuItem(item))}
      </div>
    );

  /* ---------------- UI ---------------- */
  return (
    <aside className="hidden lg:flex w-64 bg-white border-r min-h-screen flex-col">
      <div className="p-5 border-b">
        <h3 className="font-bold">{user?.FullName || roleName}</h3>
        <p className="text-sm text-gray-500">{roleLabel}</p>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {renderGroup('main', groupedItems.main)}
        {renderGroup('operations', groupedItems.operations, 'Operations')}
        {renderGroup('management', groupedItems.management, 'Management')}
        {renderGroup('analytics', groupedItems.analytics, 'Analytics')}
        {renderGroup(
          'administration',
          groupedItems.administration,
          'Administration'
        )}
      </div>

      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="w-full py-2 border rounded-lg hover:bg-gray-50"
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
};

export default BaseSidebar;
