import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import permissionAPI from '../api/permissionAPI';
import authAPI from '../api/authAPI'; // We'll need auth API for user info

// Async Thunks
export const fetchRolePermissions = createAsyncThunk(
  'permissions/fetchRolePermissions',
  async (role, { rejectWithValue }) => {
    try {
      console.log("permissionslice is calling");
      const response = await permissionAPI.getRolePermissions(role);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch role permissions'
      );
    }
  }
);

export const updateRolePermissions = createAsyncThunk(
  'permissions/updateRolePermissions',
  async ({ role, permissions }, { rejectWithValue }) => {
    try {
      console.log("permissionslice is calling");
      const response = await permissionAPI.updateRolePermissions(role, permissions);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update role permissions'
      );
    }
  }
);

export const fetchAllRolePermissions = createAsyncThunk(
  'permissions/fetchAllRolePermissions',
  async (_, { rejectWithValue }) => {
    try {
      console.log("permissionslice is calling");
      const response = await permissionAPI.getAllRolePermissions();
      console.log("response data:all permissions ::", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch all role permissions'
      );
    }
  }
);

export const fetchMyPermissions = createAsyncThunk(
  'permissions/fetchMyPermissions',
  async (_, { rejectWithValue, getState }) => {
    try {
      console.log("permissionslice is calling");
      const state = getState();
      const token = state.auth.token;
      const response = await permissionAPI.getMyPermissions(token);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user permissions'
      );
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'permissions/fetchUserProfile',
  async (_, { rejectWithValue, getState }) => {
    try {
      console.log("permissionslice is calling");
      const state = getState();
      const token = state.auth.token;
      const response = await authAPI.getCurrentUser(token);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user profile'
      );
    }
  }
);

// Initial State
const initialState = {
  // Current user's data
  currentUser: null,
  userPermissions: [],
  userRole: null,
  
  // Role permissions management (for merchant)
  rolePermissions: {
    manager: [],
    supervisor: [],
    staff: []
  },
  
  // All permissions data
  allRolePermissions: {},
  
  loading: false,
  error: null,
  success: null,
  permissionsLoaded: false // Add this flag
};

// Permission Slice
const permissionSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    setUserPermissions: (state, action) => {
      state.userPermissions = action.payload.permissions;
      state.userRole = action.payload.role;
      state.permissionsLoaded = true;
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    updateRolePermissionLocal: (state, action) => {
      const { role, permissions } = action.payload;
      state.rolePermissions[role] = permissions;
    },
    resetPermissionState: (state) => {
      return initialState;
    },
    resetPermissionsLoaded: (state) => {
      state.permissionsLoaded = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload.user;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Role Permissions
      .addCase(fetchRolePermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRolePermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.rolePermissions[action.payload.role] = action.payload.permissions;
        state.error = null;
      })
      .addCase(fetchRolePermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Role Permissions
      .addCase(updateRolePermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateRolePermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.rolePermissions[action.payload.role] = action.payload.permissions;
        state.success = action.payload.message || 'Permissions updated successfully';
        state.error = null;
      })
      .addCase(updateRolePermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = null;
      })
      
      // Fetch All Role Permissions
      .addCase(fetchAllRolePermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllRolePermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.allRolePermissions = action.payload;
        state.error = null;
      })
      .addCase(fetchAllRolePermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch My Permissions
      .addCase(fetchMyPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.userPermissions = action.payload.permissions;
        state.userRole = action.payload.role;
        state.permissionsLoaded = true; // Set flag when permissions are loaded
        state.error = null;
      })
      .addCase(fetchMyPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.permissionsLoaded = false;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  setUserPermissions,
  setCurrentUser,
  updateRolePermissionLocal,
  resetPermissionState,
  resetPermissionsLoaded
} = permissionSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.permissions.currentUser;
export const selectUserPermissions = (state) => state.permissions.userPermissions;
export const selectUserRole = (state) => state.permissions.userRole;
export const selectAllRolePermissions = (state) => state.permissions.allRolePermissions;
export const selectRolePermissions = (role) => (state) => state.permissions.rolePermissions[role];
export const selectPermissionsLoading = (state) => state.permissions.loading;
export const selectPermissionsError = (state) => state.permissions.error;
export const selectPermissionsSuccess = (state) => state.permissions.success;
export const selectPermissionsLoaded = (state) => state.permissions.permissionsLoaded; // Export selector

export default permissionSlice.reducer;