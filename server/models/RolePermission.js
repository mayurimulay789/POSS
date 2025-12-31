const mongoose = require('mongoose');

// Import fixed permissions (create this file if it doesn't exist)
const FIXED_PERMISSIONS = {
  MENU_MANAGEMENT: 'menu_management',
  ORDER_MANAGEMENT: 'order_management', 
  BILLING_MANAGEMENT: 'billing_management',
  SPACE_MANAGEMENT: 'space_management',
  TASK_MANAGEMENT: 'task_management',
  EXPENSE_MANAGEMENT: 'expense_management',
  REPORTS_ANALYTICS: 'reports_analytics',
  EMPLOYEE_MANAGEMENT: 'employee_management',
  CUSTOMER_MANAGEMENT: 'customer_management',
  CHARGES_MANAGEMENT: 'charges_management',
  ATTENDANCE_MANAGEMENT: 'attendance_management'
};

const rolePermissionSchema = new mongoose.Schema({
  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Merchant ID is required']
  },
  role: {
    type: String,
    enum: ['merchant', 'manager', 'supervisor', 'staff'],
    required: [true, 'Role is required']
  },
  permissions: [{
    type: String,
    enum: {
      values: Object.values(FIXED_PERMISSIONS),
      message: 'Invalid permission value'
    }
  }]
}, {
  timestamps: true
});

// Compound index to ensure one permission set per role per merchant
rolePermissionSchema.index({ merchantId: 1, role: 1 }, { unique: true });

// Pre-save validation to ensure no duplicate permissions
rolePermissionSchema.pre('save', function(next) {
  if (this.permissions) {
    this.permissions = [...new Set(this.permissions)]; // Remove duplicates
  }
  next();
});

module.exports = mongoose.model('RolePermission', rolePermissionSchema);