import { FIXED_PERMISSIONS } from './fixedPermissions';

// Common sidebar items structure
export const SIDEBAR_ITEMS = {
  dashboard: {
    path: '/dashboard',
    label: 'Dashboard',
    icon: '📊',
    permission: FIXED_PERMISSIONS.ORDER_MANAGEMENT, // Basic permission for dashboard
  },
  hotelImages: {
    path: '/hotel-images',
    label: 'Hotel Images',
    icon: '🖼️',
    // No permission required; visible to all roles
    permission: null,
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
    subItems: [
      {
        path: '/menu/add',
        label: 'Add Menu',
        icon: '➕',
        permission: FIXED_PERMISSIONS.MENU_MANAGEMENT,
      },
      {
        path: '/menu/list',
        label: 'Menu List',
        icon: '📝',
        permission: FIXED_PERMISSIONS.MENU_MANAGEMENT,
      }
    ]
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
  customers: {
    path: '/customers',
    label: 'Customer Management',
    icon: '🧑‍🤝‍🧑',
    permission: FIXED_PERMISSIONS.CUSTOMER_MANAGEMENT,
  },
  charges: {
    path: '/charges',
    label: 'Charges Management',
    icon: '💲',
    permission: FIXED_PERMISSIONS.CHARGES_MANAGEMENT,
  },
  attendance: {
    path: '/attendance-dashboard',
    label: 'Attendance Management',
    icon: '🕒',
    permission: FIXED_PERMISSIONS.ATTENDANCE_MANAGEMENT,
  },
  permissions: {
    path: '/permission-management',
    label: 'Permission Management',
    icon: '🔐',
    permission: FIXED_PERMISSIONS.EMPLOYEE_MANAGEMENT, // Only for merchant
  },

};

// Get sidebar items for a specific role based on their permissions
export const getSidebarItemsForRole = (rolePermissions = []) => {
  return Object.values(SIDEBAR_ITEMS).filter(item =>
    // Include if no permission required, else check role permissions
    !item.permission || rolePermissions.includes(item.permission)
  );
};

// Group items for better organization
export const GROUPED_SIDEBAR_ITEMS = {
  main: ['dashboard'],
  operations: ['orders', 'menu', 'billing'],
  management: ['hotelImages', 'spaces', 'tasks', 'expenses','customers'],
  analytics: ['reports'],
  administration: ['employees', 'permissions', 'charges','attendance'],
};