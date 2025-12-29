import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAllRolePermissions, 
  updateRolePermissions,
  clearError,
  clearSuccess 
} from '../../../store/slices/permissionSlice';
import { FIXED_PERMISSIONS, PERMISSION_LABELS, PERMISSION_ICONS } from '../../../config/fixedPermissions';

const PermissionManagement = () => {
  const dispatch = useDispatch();
  const { rolePermissions, loading, error, success } = useSelector(state => state.permissions);
  const [selectedRole, setSelectedRole] = useState('manager');
  const [localPermissions, setLocalPermissions] = useState({});

  const roles = [
    { value: 'manager', label: 'Manager', description: 'Can manage operations and staff' },
    { value: 'supervisor', label: 'Supervisor', description: 'Can oversee daily operations' },
    { value: 'staff', label: 'Staff', description: 'Basic operational access' }
  ];

  // Load permissions when component mounts
  useEffect(() => {
    dispatch(fetchAllRolePermissions());
    setTimeout(() => {
    console.log(" all permissions********************************************************************* ",rolePermissions);
    },2000);
  }, [dispatch]);

  // Initialize local permissions when rolePermissions loads
  useEffect(() => {
    if (rolePermissions && Object.keys(rolePermissions).length > 0) {
      const initialPermissions = {};
      roles.forEach(role => {
        initialPermissions[role.value] = rolePermissions[role.value]?.permissions || [];
      });
      setLocalPermissions(initialPermissions);
    }
  }, [rolePermissions]);

  // Clear messages after timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  const togglePermission = (permission) => {
    setLocalPermissions(prev => {
      const currentPermissions = prev[selectedRole] || [];
      const updatedPermissions = currentPermissions.includes(permission)
        ? currentPermissions.filter(p => p !== permission)
        : [...currentPermissions, permission];
      
      return {
        ...prev,
        [selectedRole]: updatedPermissions
      };
    });
  };

  const savePermissions = async () => {
    if (localPermissions[selectedRole]) {
      await dispatch(updateRolePermissions({ 
        role: selectedRole, 
        permissions: localPermissions[selectedRole] 
      }));
    }
  };

  const resetToDefault = () => {
    const defaultPermissions = {
      manager: [
        'menu_management', 'order_management', 'billing_management',
        'space_management', 'task_management', 'expense_management',
        'reports_analytics', 'employee_management', 'customer_management'
      ],
      supervisor: [
        'order_management', 'billing_management', 'space_management', 'task_management'
      ],
      staff: [
        'order_management', 'billing_management'
      ]
    };

    setLocalPermissions(prev => ({
      ...prev,
      [selectedRole]: defaultPermissions[selectedRole] || []
    }));
  };

  const selectAllPermissions = () => {
    const allPermissions = Object.values(FIXED_PERMISSIONS);
    setLocalPermissions(prev => ({
      ...prev,
      [selectedRole]: allPermissions
    }));
  };

  const clearAllPermissions = () => {
    setLocalPermissions(prev => ({
      ...prev,
      [selectedRole]: []
    }));
  };

  const getPermissionCount = (role) => {
    return localPermissions[role]?.length || 0;
  };

  const totalPermissions = Object.values(FIXED_PERMISSIONS).length;

  // Group permissions by category for better organization
  const permissionGroups = [
    {
      category: 'Operations',
      permissions: ['menu_management', 'order_management', 'billing_management']
    },
    {
      category: 'Management', 
      permissions: ['space_management', 'task_management', 'expense_management','customer_management']
    },
    {
      category: 'Analytics',
      permissions: ['reports_analytics']
    },
    {
      category: 'Administration',
      permissions: ['employee_management']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Role Permissions Management
          </h1>
          <p className="text-gray-600">
            Configure what each role can access in the restaurant POS system 
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>✅</span>
              <span>{success}</span>
            </div>
            <button onClick={() => dispatch(clearSuccess())} className="text-green-700 hover:text-green-900">
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>❌</span>
              <span>{error}</span>
            </div>
            <button onClick={() => dispatch(clearError())} className="text-red-700 hover:text-red-900">
              ×
            </button>
          </div>
        )}

        {/* Role Selection */}
        <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Select Role to Configure
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map(role => (
              <button
                key={role.value}
                onClick={() => setSelectedRole(role.value)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedRole === role.value 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-semibold text-lg mb-1">{role.label}</div>
                <div className="text-sm text-gray-600 mb-2">{role.description}</div>
                <div className="text-xs text-gray-500">
                  {getPermissionCount(role.value)} of {totalPermissions} permissions
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Permissions Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Permissions for {roles.find(r => r.value === selectedRole)?.label}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={selectAllPermissions}
                className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                Select All
              </button>
              <button
                onClick={clearAllPermissions}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Permission Groups */}
          <div className="space-y-6">
            {permissionGroups.map(group => (
              <div key={group.category} className="border border-gray-200 rounded-lg">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800">{group.category}</h3>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.permissions.map(permission => (
                    <label 
                      key={permission} 
                      className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={localPermissions[selectedRole]?.includes(permission) || false}
                        onChange={() => togglePermission(permission)}
                        disabled={loading}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-lg">{PERMISSION_ICONS[permission]}</span>
                          <span className="font-medium text-gray-900">
                            {PERMISSION_LABELS[permission]}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Allows {roles.find(r => r.value === selectedRole)?.label?.toLowerCase()} to access {PERMISSION_LABELS[permission].toLowerCase()}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Permission Summary */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-800">Permission Summary</h4>
                <p className="text-sm text-blue-600">
                  {getPermissionCount(selectedRole)} of {totalPermissions} permissions selected
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-700">
                  {Math.round((getPermissionCount(selectedRole) / totalPermissions) * 100)}%
                </div>
                <div className="text-xs text-blue-600">Access Level</div>
              </div>
            </div>
            <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(getPermissionCount(selectedRole) / totalPermissions) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={resetToDefault}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset to Default
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setSelectedRole(prev => {
                const currentIndex = roles.findIndex(r => r.value === prev);
                const nextIndex = (currentIndex + 1) % roles.length;
                return roles[nextIndex].value;
              })}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Next Role
            </button>
            
            <button 
              onClick={savePermissions}
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>Save for {roles.find(r => r.value === selectedRole)?.label}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedRole('manager');
                selectAllPermissions();
              }}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              Full Access for Manager
            </button>
            <button
              onClick={() => {
                setSelectedRole('staff');
                clearAllPermissions();
              }}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Minimal Access for Staff
            </button>
            <button
              onClick={() => {
                roles.forEach(role => {
                  setLocalPermissions(prev => ({
                    ...prev,
                    [role.value]: []
                  }));
                });
              }}
              className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
            >
              Clear All Roles
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionManagement;