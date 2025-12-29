// src/store/slices/dashboardSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dashboardAPI from '../api/dashboardAPI';

// Async thunks for each role
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchDashboardData',
  async (role, { rejectWithValue }) => {
    try {
      let response;
      switch (role) {
        case 'merchant':
          response = await dashboardAPI.getMerchantDashboard();
          break;
        case 'manager':
          response = await dashboardAPI.getManagerDashboard();
          break;
        case 'supervisor':
          response = await dashboardAPI.getSupervisorDashboard();
          break;
        case 'staff':
          response = await dashboardAPI.getStaffDashboard();
          break;
        default:
          return rejectWithValue('Invalid role');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch dashboard data'
      );
    }
  }
);

// Initial state
const initialState = {
  data: null,
  loading: false,
  error: null,
  lastFetched: null,
  role: null,
};

// Dashboard slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
    clearDashboardData: (state) => {
      state.data = null;
      state.role = null;
    },
    setDashboardLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard data
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.role = action.meta.arg;
        state.lastFetched = Date.now();
        state.error = null;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.data = null;
      });
  },
});

export const { clearDashboardError, clearDashboardData, setDashboardLoading } = dashboardSlice.actions;

// Selectors
export const selectDashboardData = (state) => state.dashboard.data;
export const selectDashboardLoading = (state) => state.dashboard.loading;
export const selectDashboardError = (state) => state.dashboard.error;
export const selectDashboardRole = (state) => state.dashboard.role;
export const selectLastFetched = (state) => state.dashboard.lastFetched;

export default dashboardSlice.reducer;