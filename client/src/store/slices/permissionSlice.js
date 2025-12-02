import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import permissionAPI from '../api/permissionAPI';

// Async Thunks
export const fetchRolePermissions = createAsyncThunk(
  'permissions/fetchRolePermissions',
  async (role, { rejectWithValue }) => {
    try {
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
      const response = await permissionAPI.getAllRolePermissions();
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
  async (_, { rejectWithValue }) => {
    try {
      const response = await permissionAPI.getMyPermissions();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user permissions'
      );
    }
  }
);

// Initial State
const initialState = {
  // Current user's permissions
  userPermissions: [],
  userRole: null,
  
  // Role permissions management (for merchant)
  rolePermissions: {
    manager: [],
    supervisor: [],
    staff: []
  },
  
  loading: false,
  error: null,
  success: null
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
    },
    updateRolePermissionLocal: (state, action) => {
      const { role, permissions } = action.payload;
      state.rolePermissions[role] = permissions;
    },
    resetPermissionState: (state) => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
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
        state.rolePermissions = action.payload;
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
        state.error = null;
      })
      .addCase(fetchMyPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  setUserPermissions,
  updateRolePermissionLocal,
  resetPermissionState
} = permissionSlice.actions;

export default permissionSlice.reducer;