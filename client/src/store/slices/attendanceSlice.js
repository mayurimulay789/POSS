import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import attendanceAPI from '../api/attendanceAPI';

// Async Thunks
export const startShift = createAsyncThunk(
  'attendance/startShift',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await attendanceAPI.startShift(formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to start shift'
      );
    }
  }
);

export const endShift = createAsyncThunk(
  'attendance/endShift',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await attendanceAPI.endShift(formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to end shift'
      );
    }
  }
);

export const getCurrentShift = createAsyncThunk(
  'attendance/getCurrentShift',
  async (_, { rejectWithValue }) => {
    try {
      const response = await attendanceAPI.getCurrentShift();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch current shift'
      );
    }
  }
);

export const getMyAttendance = createAsyncThunk(
  'attendance/getMyAttendance',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await attendanceAPI.getMyAttendance(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch attendance history'
      );
    }
  }
);

export const getAttendanceStats = createAsyncThunk(
  'attendance/getAttendanceStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await attendanceAPI.getAttendanceStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch attendance stats'
      );
    }
  }
);

// Initial State
const initialState = {
  currentShift: null,
  attendanceHistory: [],
  loading: false,
  error: null,
  success: null,
  pagination: {
    current: 1,
    pages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false
  },
  stats: {
    totalShifts: 0,
    completedShifts: 0,
    activeShifts: 0,
    totalHours: 0,
    averageHours: 0,
    daysPresent: 0
  },
  filters: {
    page: 1,
    limit: 10,
    month: '',
    year: ''
  }
};

// Attendance Slice
const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearCurrentShift: (state) => {
      state.currentShift = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        page: 1,
        limit: 10,
        month: '',
        year: ''
      };
    },
    resetAttendanceState: (state) => {
      return initialState;
    },
    setCurrentShift: (state, action) => {
      state.currentShift = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Start Shift
      .addCase(startShift.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(startShift.fulfilled, (state, action) => {
        state.loading = false;
        state.currentShift = action.payload.data;
        state.success = action.payload.message || 'Shift started successfully';
        state.error = null;
      })
      .addCase(startShift.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = null;
      })
      
      // End Shift
      .addCase(endShift.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(endShift.fulfilled, (state, action) => {
        state.loading = false;
        state.currentShift = null;
        
        // Add to history if we have the new record
        if (action.payload.data) {
          // Remove any existing active shift for this date
          state.attendanceHistory = state.attendanceHistory.filter(
            record => !record._id === action.payload.data.id
          );
          
          // Add the completed shift to history
          state.attendanceHistory.unshift({
            ...action.payload.data,
            status: 'completed'
          });
        }
        
        state.success = action.payload.message || 'Shift ended successfully';
        state.error = null;
      })
      .addCase(endShift.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = null;
      })
      
      // Get Current Shift
      .addCase(getCurrentShift.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentShift.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.hasActiveShift) {
          state.currentShift = action.payload.data;
        } else {
          state.currentShift = null;
        }
        state.error = null;
      })
      .addCase(getCurrentShift.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentShift = null;
      })
      
      // Get My Attendance
      .addCase(getMyAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.attendanceHistory = action.payload.data || [];
        state.pagination = {
          current: action.payload.currentPage || 1,
          pages: action.payload.totalPages || 1,
          total: action.payload.total || 0,
          hasNext: (action.payload.currentPage || 1) < (action.payload.totalPages || 1),
          hasPrev: (action.payload.currentPage || 1) > 1
        };
        
        // Update stats from summary
        if (action.payload.summary) {
          state.stats = {
            totalShifts: action.payload.summary.totalShifts || 0,
            completedShifts: action.payload.summary.completedShifts || 0,
            activeShifts: action.payload.summary.activeShifts || 0,
            totalHours: action.payload.summary.totalHours || 0,
            averageHours: action.payload.summary.averageHours || 0,
            daysPresent: action.payload.summary.daysPresent || 0
          };
        }
        
        state.error = null;
      })
      .addCase(getMyAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.attendanceHistory = [];
      })
      
      // Get Attendance Stats
      .addCase(getAttendanceStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAttendanceStats.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          state.stats = action.payload.data;
        }
        state.error = null;
      })
      .addCase(getAttendanceStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.stats = initialState.stats;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  clearCurrentShift,
  setFilters,
  clearFilters,
  resetAttendanceState,
  setCurrentShift
} = attendanceSlice.actions;

// Selectors
export const selectCurrentShift = (state) => state.attendance.currentShift;
export const selectAttendanceHistory = (state) => state.attendance.attendanceHistory;
export const selectAttendanceLoading = (state) => state.attendance.loading;
export const selectAttendanceError = (state) => state.attendance.error;
export const selectAttendanceSuccess = (state) => state.attendance.success;
export const selectAttendancePagination = (state) => state.attendance.pagination;
export const selectAttendanceFilters = (state) => state.attendance.filters;
export const selectAttendanceStats = (state) => state.attendance.stats;
export const selectHasActiveShift = (state) => !!state.attendance.currentShift;

export default attendanceSlice.reducer;