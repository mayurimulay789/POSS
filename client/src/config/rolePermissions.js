import { FIXED_PERMISSIONS } from './fixedPermissions';

// Common sidebar items structure
export const SIDEBAR_ITEMS = {
  dashboard: {
    path: '/dashboard',
    label: 'Dashboard',
    icon: '📊',
    permission: FIXED_PERMISSIONS.ORDER_MANAGEMENT, // Basic permission for dashboard
  },
  orders: {
    path: '/orders',
    label: 'Order Management',
    icon: '📝',
    permission: FIXED_PERMISSIONS.ORDER_MANAGEMENT,
  },
  menu: {
    path: '/menu',
    label: 'Menu Management',
    icon: '📋',
    permission: FIXED_PERMISSIONS.MENU_MANAGEMENT,
  },
  billing: {
    path: '/billing',
    label: 'Billing Management',
    icon: '💰',
    permission: FIXED_PERMISSIONS.BILLING_MANAGEMENT,
  },
  spaces: {
    path: '/spaces',
    label: 'Space Management',
    icon: '🪑',
    permission: FIXED_PERMISSIONS.SPACE_MANAGEMENT,
  },
  tasks: {
    path: '/tasks',
    label: 'Task Management',
    icon: '✅',
    permission: FIXED_PERMISSIONS.TASK_MANAGEMENT,
  },
  expenses: {
    path: '/expenses',
    label: 'Expense Management',
    icon: '💸',
    permission: FIXED_PERMISSIONS.EXPENSE_MANAGEMENT,
  },
  reports: {
    path: '/reports',
    label: 'Reports & Analytics',
    icon: '📈',
    permission: FIXED_PERMISSIONS.REPORTS_ANALYTICS,
  },
  employees: {
    path: '/employees',
    label: 'Employee Management',
    icon: '👥',
    permission: FIXED_PERMISSIONS.EMPLOYEE_MANAGEMENT,
  },
  permissions: {
    path: '/permission-management',
    label: 'Permission Management',
    icon: '🔐',
    permission: FIXED_PERMISSIONS.EMPLOYEE_MANAGEMENT, // Only for merchant
  }
};

// Get sidebar items for a specific role based on their permissions
export const getSidebarItemsForRole = (rolePermissions = []) => {
  return Object.values(SIDEBAR_ITEMS).filter(item => 
    rolePermissions.includes(item.permission)
  );
};

// Group items for better organization
export const GROUPED_SIDEBAR_ITEMS = {
  main: ['dashboard'],
  operations: ['orders', 'menu', 'billing'],
  management: ['spaces', 'tasks', 'expenses'],
  analytics: ['reports'],
  administration: ['employees', 'permissions']
};