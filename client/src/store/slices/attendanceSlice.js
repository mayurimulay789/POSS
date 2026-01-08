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

export const endShiftById = createAsyncThunk(
  'attendance/endShiftById',
  async ({ id, formData = null }, { rejectWithValue }) => {
    try {
      console.log('endShiftById thunk called with id:', id, 'type:', typeof id);
      
      if (!id) {
        throw new Error('Attendance ID is required');
      }
      
      const response = await attendanceAPI.endShiftById(id, formData);
      return response.data;
    } catch (error) {
      console.error('endShiftById thunk error:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to end shift'
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
    },
    updateAttendanceRecord: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.attendanceHistory.findIndex(record => record._id === id);
      if (index !== -1) {
        state.attendanceHistory[index] = {
          ...state.attendanceHistory[index],
          ...updates
        };
      }
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
        
        // Add to history if not already present
        if (action.payload.data) {
          const exists = state.attendanceHistory.some(
            record => record._id === action.payload.data.id
          );
          if (!exists) {
            state.attendanceHistory.unshift({
              ...action.payload.data,
              status: 'active'
            });
          }
        }
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
        
        // Update in history if we have the new record
        if (action.payload.data) {
          const index = state.attendanceHistory.findIndex(
            record => record._id === action.payload.data.id
          );
          
          if (index !== -1) {
            // Update existing record
            state.attendanceHistory[index] = {
              ...state.attendanceHistory[index],
              ...action.payload.data,
              status: 'completed'
            };
          } else {
            // Add as new record
            state.attendanceHistory.unshift({
              ...action.payload.data,
              status: 'completed'
            });
          }
        }
        
        state.success = action.payload.message || 'Shift ended successfully';
        state.error = null;
      })
      .addCase(endShift.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = null;
      })
      
      // End Shift By ID
      .addCase(endShiftById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(endShiftById.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update current shift if it's the same one
        if (state.currentShift && state.currentShift.id === action.payload.data?.id) {
          state.currentShift = null;
        }
        
        // Update the specific record in history
        const endedShiftId = action.payload.data?.id;
        if (endedShiftId) {
          const index = state.attendanceHistory.findIndex(
            record => record._id === endedShiftId
          );
          
          if (index !== -1) {
            state.attendanceHistory[index] = {
              ...state.attendanceHistory[index],
              ...action.payload.data,
              status: 'completed'
            };
          }
          
          // Update stats
          state.stats = {
            ...state.stats,
            activeShifts: Math.max(0, state.stats.activeShifts - 1),
            completedShifts: state.stats.completedShifts + 1,
            totalShifts: state.stats.totalShifts,
            totalHours: state.stats.totalHours + (action.payload.data.totalHours || 0),
            daysPresent: state.stats.daysPresent
          };
          
          // Recalculate average hours
          if (state.stats.completedShifts > 0) {
            state.stats.averageHours = state.stats.totalHours / state.stats.completedShifts;
          }
        }
        
        state.success = action.payload.message || 'Shift ended successfully';
        state.error = null;
      })
      .addCase(endShiftById.rejected, (state, action) => {
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
  setCurrentShift,
  updateAttendanceRecord
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

// Helper selector to get active shifts from history
export const selectActiveShiftsFromHistory = (state) => 
  state.attendance.attendanceHistory.filter(record => record.status === 'active');

export default attendanceSlice.reducer;