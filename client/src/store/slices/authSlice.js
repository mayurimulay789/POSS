import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authAPI from '../api/authAPI';
import permissionAPI from '../api/permissionAPI';

// ✅ SAFELY Get user from localStorage
const getStoredUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user && user !== 'undefined' ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing stored user:', error);
    return null;
  }
};

const getStoredToken = () => {
  const token = localStorage.getItem('token');
  return token && token !== 'undefined' ? token : null;
};

const getStoredPermissions = () => {
  try {
    const permissions = localStorage.getItem('permissions');
    return permissions && permissions !== 'undefined' ? JSON.parse(permissions) : [];
  } catch (error) {
    console.error('Error parsing permissions:', error);
    return [];
  }
};

const userFromStorage = getStoredUser();
const tokenFromStorage = getStoredToken();
const permissionsFromStorage = getStoredPermissions();

// ✅ Track last fetch time to prevent unnecessary calls
let lastPermissionFetchTime = 0;
const PERMISSION_FETCH_COOLDOWN = 5 * 60 * 1000; // 5 minutes

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      
      // Store token and user in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Reset permission fetch time on login
      lastPermissionFetchTime = 0;
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed'
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.warn('Logout API error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('permissions');
      lastPermissionFetchTime = 0; // Reset on logout
    }
    
    return null;
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = getStoredToken();
      if (!token) {
        throw new Error('No token found');
      }

      console.log("Fetching current user...");
      const response = await authAPI.getMe();
      
      // Store updated user data
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('permissions');
      
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get user data'
      );
    }
  }
);

export const fetchMyPermissions = createAsyncThunk(
  'auth/fetchPermissions',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const { auth } = state;
      
      // Check if we should fetch permissions
      const now = Date.now();
      const shouldFetch = (
        !auth.permissions || 
        auth.permissions.length === 0 || 
        now - lastPermissionFetchTime > PERMISSION_FETCH_COOLDOWN
      );
      
      if (!shouldFetch) {
        console.log("Skipping permissions fetch - recently fetched or already have permissions");
        return { 
          permissions: auth.permissions || [],
          isCached: true 
        };
      }
      
      console.log("Fetching permissions from API...");
      const response = await permissionAPI.getMyPermissions();
      
      // Update last fetch time
      lastPermissionFetchTime = now;
      
      return response.data;
    } catch (error) {
      console.error('Error fetching permissions:', error);
      
      // Return cached permissions if available
      const storedPermissions = getStoredPermissions();
      if (storedPermissions.length > 0) {
        return { 
          permissions: storedPermissions,
          isCached: true,
          error: error.response?.data?.message 
        };
      }
      
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch permissions'
      );
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.updateProfile(userData);
      
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Profile update failed'
      );
    }
  }
);

// ✅ SAFE Initial State
const initialState = {
  user: userFromStorage,
  token: tokenFromStorage,
  isAuthenticated: !!(tokenFromStorage && userFromStorage),
  permissions: permissionsFromStorage,
  loading: false,
  permissionLoading: false, // Separate loading state for permissions
  error: null,
  success: null,
  permissionsFetched: false // Flag to track if permissions have been fetched
};

// Auth Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    setCredentials: (state, action) => {
      const { user, token, permissions } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.permissions = permissions || [];
      state.permissionsFetched = true;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      if (permissions) {
        localStorage.setItem('permissions', JSON.stringify(permissions));
      }
    },
    manualLogout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.permissions = [];
      state.permissionsFetched = false;
      state.loading = false;
      state.permissionLoading = false;
      state.error = null;
      state.success = null;
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('permissions');
      lastPermissionFetchTime = 0;
    },
    clearInvalidStorage: (state) => {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('permissions');
      } catch (error) {
        console.error('Error clearing storage:', error);
      }
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.permissions = [];
      state.permissionsFetched = false;
      lastPermissionFetchTime = 0;
    },
    updateUserData: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    updatePermissions: (state, action) => {
      state.permissions = action.payload;
      state.permissionsFetched = true;
      localStorage.setItem('permissions', JSON.stringify(action.payload));
    },
    // Mark permissions as already fetched to prevent refetching
    markPermissionsFetched: (state) => {
      state.permissionsFetched = true;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
        state.permissionsFetched = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.success = action.payload.message || 'Login successful';
        state.error = null;
        state.permissionsFetched = false; // Reset to fetch fresh permissions
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.permissions = [];
        state.permissionsFetched = false;
        state.success = null;
      })
      
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.permissions = [];
        state.permissionsFetched = false;
        state.success = 'Logout successful';
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.permissions = [];
        state.permissionsFetched = false;
        state.error = action.payload;
        state.success = null;
      })
      
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        // Don't set permissionsFetched here - permissions will be fetched separately
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.permissions = [];
        state.permissionsFetched = false;
        state.error = action.payload;
      })
      
      // Fetch My Permissions
      .addCase(fetchMyPermissions.pending, (state) => {
        state.permissionLoading = true;
        state.error = null;
      })
      .addCase(fetchMyPermissions.fulfilled, (state, action) => {
        state.permissionLoading = false;
        
        // Only update if we got new permissions (not cached)
        if (!action.payload.isCached || action.payload.permissions?.length > 0) {
          state.permissions = action.payload.permissions || [];
          localStorage.setItem('permissions', JSON.stringify(action.payload.permissions || []));
        }
        
        state.permissionsFetched = true;
        state.error = null;
      })
      .addCase(fetchMyPermissions.rejected, (state, action) => {
        state.permissionLoading = false;
        state.error = action.payload;
        // Keep existing permissions if we have them
        state.permissionsFetched = state.permissions.length > 0;
      })
      
      // Update Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.success = action.payload.message || 'Profile updated successfully';
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = null;
      });
  },
});

export const { 
  clearError, 
  clearSuccess, 
  setCredentials, 
  manualLogout, 
  clearInvalidStorage,
  updateUserData,
  updatePermissions,
  markPermissionsFetched
} = authSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectPermissionLoading = (state) => state.auth.permissionLoading;
export const selectPermissionsFetched = (state) => state.auth.permissionsFetched;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthSuccess = (state) => state.auth.success;
export const selectUserPermissions = (state) => state.auth.permissions;

// Helper selector to check specific permission
export const selectHasPermission = (permission) => (state) => {
  const { user, permissions } = state.auth;
  if (!user) return false;
  if (user.role === 'merchant') return true;
  return permissions.includes(permission);
};

// Helper selector to check multiple permissions
export const selectHasAnyPermission = (requiredPermissions) => (state) => {
  const { user, permissions } = state.auth;
  if (!user) return false;
  if (user.role === 'merchant') return true;
  
  if (Array.isArray(requiredPermissions)) {
    return requiredPermissions.some(perm => permissions.includes(perm));
  }
  return permissions.includes(requiredPermissions);
};

// Helper selector to check all permissions
export const selectHasAllPermissions = (requiredPermissions) => (state) => {
  const { user, permissions } = state.auth;
  if (!user) return false;
  if (user.role === 'merchant') return true;
  
  if (Array.isArray(requiredPermissions)) {
    return requiredPermissions.every(perm => permissions.includes(perm));
  }
  return permissions.includes(requiredPermissions);
};

export default authSlice.reducer;