import { useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMyPermissions } from '../store/slices/permissionSlice';
import { FIXED_PERMISSIONS } from '../config/fixedPermissions';

export const usePermissions = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { userPermissions, userRole, loading, error, permissionsLoaded } = useSelector(state => state.permissions);

  // Memoize loadPermissions to prevent infinite loops
  const loadPermissions = useCallback(() => {
    if (user && user.role !== 'merchant' && !permissionsLoaded) {
      dispatch(fetchMyPermissions());
    }
  }, [dispatch, user, permissionsLoaded]);

  // Check if user has specific permission
  const can = (permission) => {
    if (user?.role === 'merchant') return true; // Merchant has all permissions
    return userPermissions.includes(permission);
  };

  // Check if user has any of the given permissions
  const canAny = (requiredPermissions) => {
    if (user?.role === 'merchant') return true;
    return requiredPermissions.some(permission => userPermissions.includes(permission));
  };

  // Check if user has all of the given permissions
  const canAll = (requiredPermissions) => {
    if (user?.role === 'merchant') return true;
    return requiredPermissions.every(permission => userPermissions.includes(permission));
  };

  // Get available permissions for current user
  const availablePermissions = useMemo(() => {
    if (user?.role === 'merchant') {
      return Object.values(FIXED_PERMISSIONS);
    }
    return userPermissions;
  }, [user, userPermissions]);

  return {
    permissions: availablePermissions,
    userRole,
    loading,
    error,
    can,
    canAny,
    canAll,
    loadPermissions,
    isMerchant: user?.role === 'merchant',
    isManager: user?.role === 'manager',
    isSupervisor: user?.role === 'supervisor',
    isStaff: user?.role === 'staff',
    permissionsLoaded
  };
};