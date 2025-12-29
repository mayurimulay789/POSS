// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import merchantAttendanceAPI from '../api/merchantAttendanceAPI';

// // Async Thunks
// export const getAllAttendance = createAsyncThunk(
//   'merchantAttendance/getAllAttendance',
//   async (filters = {}, { rejectWithValue }) => {
//     try {
//       const response = await merchantAttendanceAPI.getAllAttendance(filters);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || 'Failed to fetch all attendance'
//       );
//     }
//   }
// );

// export const getTeamAttendance = createAsyncThunk(
//   'merchantAttendance/getTeamAttendance',
//   async ({ date }, { rejectWithValue }) => {
//     try {
//       const response = await merchantAttendanceAPI.getTeamAttendance(date);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || 'Failed to fetch team attendance'
//       );
//     }
//   }
// );

// export const getDailyAttendanceSheet = createAsyncThunk(
//   'merchantAttendance/getDailyAttendanceSheet',
//   async ({ date }, { rejectWithValue }) => {
//     try {
//       const response = await merchantAttendanceAPI.getDailyAttendanceSheet(date);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || 'Failed to fetch daily sheet'
//       );
//     }
//   }
// );

// export const getAttendanceAnalytics = createAsyncThunk(
//   'merchantAttendance/getAttendanceAnalytics',
//   async (filters = {}, { rejectWithValue }) => {
//     try {
//       const response = await merchantAttendanceAPI.getAttendanceAnalytics(filters);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || 'Failed to fetch analytics'
//       );
//     }
//   }
// );

// export const approveAttendance = createAsyncThunk(
//   'merchantAttendance/approveAttendance',
//   async ({ id, action, remarks }, { rejectWithValue }) => {
//     try {
//       const response = await merchantAttendanceAPI.approveAttendance(id, action, remarks);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || 'Failed to approve/reject attendance'
//       );
//     }
//   }
// );

// export const exportAttendance = createAsyncThunk(
//   'merchantAttendance/exportAttendance',
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const response = await merchantAttendanceAPI.exportAttendance(params);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || 'Failed to export attendance'
//       );
//     }
//   }
// );

// export const getAttendanceReport = createAsyncThunk(
//   'merchantAttendance/getAttendanceReport',
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const response = await merchantAttendanceAPI.getAttendanceReport(params);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || 'Failed to fetch attendance report'
//       );
//     }
//   }
// );

// // Initial State
// const initialState = {
//   allAttendance: [],
//   teamAttendance: [],
//   dailySheet: [],
//   analytics: {},
//   reports: {},
//   loading: false,
//   exportLoading: false, // Separate loading for export operations
//   error: null,
//   success: null,
//   pagination: {
//     current: 1,
//     pages: 1,
//     total: 0,
//     hasNext: false,
//     hasPrev: false
//   },
//   filters: {
//     startDate: '',
//     endDate: '',
//     status: '',
//     userId: '',
//     role: '',
//     department: '',
//     page: 1,
//     limit: 50
//   },
//   stats: {
//     totalEmployees: 0,
//     presentToday: 0,
//     absentToday: 0,
//     lateToday: 0,
//     avgHours: 0,
//     attendanceRate: 0
//   }
// };

// // Merchant Attendance Slice
// const merchantAttendanceSlice = createSlice({
//   name: 'merchantAttendance',
//   initialState,
//   reducers: {
//     clearError: (state) => {
//       state.error = null;
//     },
//     clearSuccess: (state) => {
//       state.success = null;
//     },
//     setSuccess: (state, action) => {
//       state.success = action.payload;
//     },
//     setError: (state, action) => {
//       state.error = action.payload;
//     },
//     setFilters: (state, action) => {
//       state.filters = { ...state.filters, ...action.payload };
//     },
//     clearFilters: (state) => {
//       state.filters = {
//         startDate: '',
//         endDate: '',
//         status: '',
//         userId: '',
//         role: '',
//         department: '',
//         page: 1,
//         limit: 50
//       };
//     },
//     resetMerchantAttendanceState: (state) => {
//       return initialState;
//     },
//     updateAttendance: (state, action) => {
//       const updatedAttendance = action.payload;
//       const index = state.allAttendance.findIndex(a => a.id === updatedAttendance.id);
//       if (index !== -1) {
//         state.allAttendance[index] = updatedAttendance;
//       }
//     },
//     startExportLoading: (state) => {
//       state.exportLoading = true;
//       state.error = null;
//       state.success = null;
//     },
//     stopExportLoading: (state) => {
//       state.exportLoading = false;
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       // Get All Attendance
//       .addCase(getAllAttendance.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(getAllAttendance.fulfilled, (state, action) => {
//         state.loading = false;
//         state.allAttendance = action.payload.data || [];
//         state.pagination = {
//           current: action.payload.currentPage || 1,
//           pages: action.payload.totalPages || 1,
//           total: action.payload.total || 0,
//           hasNext: (action.payload.currentPage || 1) < (action.payload.totalPages || 1),
//           hasPrev: (action.payload.currentPage || 1) > 1
//         };
//         state.error = null;
//       })
//       .addCase(getAllAttendance.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload || 'Failed to fetch attendance';
//         state.allAttendance = [];
//       })
      
//       // Get Team Attendance
//       .addCase(getTeamAttendance.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(getTeamAttendance.fulfilled, (state, action) => {
//         state.loading = false;
//         state.teamAttendance = action.payload.data || [];
//         state.stats = {
//           ...state.stats,
//           totalEmployees: action.payload.stats?.total || 0,
//           presentToday: action.payload.stats?.present || 0,
//           absentToday: action.payload.stats?.absent || 0,
//           lateToday: action.payload.stats?.late || 0,
//           attendanceRate: action.payload.stats?.attendanceRate || 0
//         };
//         state.error = null;
//       })
//       .addCase(getTeamAttendance.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload || 'Failed to fetch team attendance';
//         state.teamAttendance = [];
//       })
      
//       // Get Daily Attendance Sheet
//       .addCase(getDailyAttendanceSheet.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(getDailyAttendanceSheet.fulfilled, (state, action) => {
//         state.loading = false;
//         state.dailySheet = action.payload.data || [];
//         state.error = null;
//       })
//       .addCase(getDailyAttendanceSheet.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload || 'Failed to fetch daily sheet';
//         state.dailySheet = [];
//       })
      
//       // Get Attendance Analytics
//       .addCase(getAttendanceAnalytics.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(getAttendanceAnalytics.fulfilled, (state, action) => {
//         state.loading = false;
//         state.analytics = action.payload.analytics || {};
//         state.error = null;
//       })
//       .addCase(getAttendanceAnalytics.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload || 'Failed to fetch analytics';
//         state.analytics = {};
//       })
      
//       // Approve Attendance
//       .addCase(approveAttendance.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//         state.success = null;
//       })
//       .addCase(approveAttendance.fulfilled, (state, action) => {
//         state.loading = false;
        
//         // Update the attendance record in all arrays
//         const updatedAttendance = action.payload.data;
//         const successMessage = action.payload.message || 'Attendance updated successfully';
        
//         if (updatedAttendance && updatedAttendance.id) {
//           // Update in allAttendance array
//           const allIndex = state.allAttendance.findIndex(a => a.id === updatedAttendance.id);
//           if (allIndex !== -1) {
//             state.allAttendance[allIndex] = {
//               ...state.allAttendance[allIndex],
//               approvalStatus: updatedAttendance.status || updatedAttendance.approvalStatus,
//               remarks: updatedAttendance.remarks || '',
//               approvedBy: updatedAttendance.approvedBy,
//               approvalDate: updatedAttendance.approvalDate
//             };
//           }
          
//           // Update in teamAttendance array
//           if (state.teamAttendance && state.teamAttendance.length > 0) {
//             state.teamAttendance = state.teamAttendance.map(item => {
//               if (item.attendance && item.attendance.id === updatedAttendance.id) {
//                 return {
//                   ...item,
//                   attendance: {
//                     ...item.attendance,
//                     approvalStatus: updatedAttendance.status || updatedAttendance.approvalStatus,
//                     remarks: updatedAttendance.remarks || ''
//                   }
//                 };
//               }
//               return item;
//             });
//           }
//         }
        
//         state.success = successMessage;
//         state.error = null;
//       })
//       .addCase(approveAttendance.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload || 'Failed to update attendance';
//         state.success = null;
//       })
      
//       // Export Attendance
//       .addCase(exportAttendance.pending, (state) => {
//         state.exportLoading = true;
//         state.error = null;
//         state.success = null;
//       })
//       .addCase(exportAttendance.fulfilled, (state, action) => {
//         state.exportLoading = false;
//         state.success = action.payload.message || 'Export completed successfully';
//         state.error = null;
//       })
//       .addCase(exportAttendance.rejected, (state, action) => {
//         state.exportLoading = false;
//         state.error = action.payload || 'Export failed. Please try again.';
//         state.success = null;
//       })
      
//       // Get Attendance Report
//       .addCase(getAttendanceReport.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(getAttendanceReport.fulfilled, (state, action) => {
//         state.loading = false;
//         state.reports = action.payload.data || {};
//         state.error = null;
//       })
//       .addCase(getAttendanceReport.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload || 'Failed to fetch reports';
//         state.reports = {};
//       });
//   },
// });

// export const {
//   clearError,
//   clearSuccess,
//   setSuccess,
//   setError,
//   setFilters,
//   clearFilters,
//   resetMerchantAttendanceState,
//   updateAttendance,
//   startExportLoading,
//   stopExportLoading
// } = merchantAttendanceSlice.actions;

// // Selectors
// export const selectAllAttendance = (state) => state.merchantAttendance.allAttendance || [];
// export const selectTeamAttendance = (state) => state.merchantAttendance.teamAttendance || [];
// export const selectDailySheet = (state) => state.merchantAttendance.dailySheet || [];
// export const selectAttendanceAnalytics = (state) => state.merchantAttendance.analytics || {};
// export const selectAttendanceReports = (state) => state.merchantAttendance.reports || {};
// export const selectMerchantAttendanceLoading = (state) => state.merchantAttendance.loading;
// export const selectMerchantAttendanceExportLoading = (state) => state.merchantAttendance.exportLoading;
// export const selectMerchantAttendanceError = (state) => state.merchantAttendance.error;
// export const selectMerchantAttendanceSuccess = (state) => state.merchantAttendance.success;
// export const selectMerchantAttendancePagination = (state) => state.merchantAttendance.pagination;
// export const selectMerchantAttendanceFilters = (state) => state.merchantAttendance.filters;
// export const selectMerchantAttendanceStats = (state) => state.merchantAttendance.stats;

// export default merchantAttendanceSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import merchantAttendanceAPI from '../api/merchantAttendanceAPI';

// Async Thunks
export const getAllAttendance = createAsyncThunk(
  'merchantAttendance/getAllAttendance',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await merchantAttendanceAPI.getAllAttendance(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch all attendance'
      );
    }
  }
);

export const getTeamAttendance = createAsyncThunk(
  'merchantAttendance/getTeamAttendance',
  async ({ date }, { rejectWithValue }) => {
    try {
      const response = await merchantAttendanceAPI.getTeamAttendance(date);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch team attendance'
      );
    }
  }
);

export const getDailyAttendanceSheet = createAsyncThunk(
  'merchantAttendance/getDailyAttendanceSheet',
  async ({ date }, { rejectWithValue }) => {
    try {
      const response = await merchantAttendanceAPI.getDailyAttendanceSheet(date);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch daily sheet'
      );
    }
  }
);

export const getAttendanceAnalytics = createAsyncThunk(
  'merchantAttendance/getAttendanceAnalytics',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await merchantAttendanceAPI.getAttendanceAnalytics(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch analytics'
      );
    }
  }
);

export const getAttendanceCalendar = createAsyncThunk(
  'merchantAttendance/getAttendanceCalendar',
  async ({ userId, month, year }, { rejectWithValue }) => {
    try {
      const response = await merchantAttendanceAPI.getAttendanceCalendar(userId, month, year);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch attendance calendar'
      );
    }
  }
);

export const getMerchantUsers = createAsyncThunk(
  'merchantAttendance/getMerchantUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await merchantAttendanceAPI.getMerchantUsers();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch merchant users'
      );
    }
  }
);

export const approveAttendance = createAsyncThunk(
  'merchantAttendance/approveAttendance',
  async ({ id, action, remarks }, { rejectWithValue }) => {
    try {
      const response = await merchantAttendanceAPI.approveAttendance(id, action, remarks);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to approve/reject attendance'
      );
    }
  }
);

export const exportAttendance = createAsyncThunk(
  'merchantAttendance/exportAttendance',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await merchantAttendanceAPI.exportAttendance(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to export attendance'
      );
    }
  }
);

export const getAttendanceReport = createAsyncThunk(
  'merchantAttendance/getAttendanceReport',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await merchantAttendanceAPI.getAttendanceReport(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch attendance report'
      );
    }
  }
);

// Initial State
const initialState = {
  allAttendance: [],
  teamAttendance: [],
  dailySheet: [],
  analytics: {},
  reports: {},
  calendarData: [],
  merchantUsers: [],
  loading: false,
  exportLoading: false,
  calendarLoading: false,
  error: null,
  success: null,
  pagination: {
    current: 1,
    pages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false
  },
  filters: {
    startDate: '',
    endDate: '',
    status: '',
    userId: '',
    role: '',
    department: '',
    page: 1,
    limit: 50
  },
  stats: {
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    avgHours: 0,
    attendanceRate: 0
  },
  calendarMonth: new Date().getMonth(),
  calendarYear: new Date().getFullYear(),
  selectedUser: null
};

// Merchant Attendance Slice
const merchantAttendanceSlice = createSlice({
  name: 'merchantAttendance',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    setSuccess: (state, action) => {
      state.success = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        startDate: '',
        endDate: '',
        status: '',
        userId: '',
        role: '',
        department: '',
        page: 1,
        limit: 50
      };
    },
    resetMerchantAttendanceState: (state) => {
      return initialState;
    },
    updateAttendance: (state, action) => {
      const updatedAttendance = action.payload;
      const index = state.allAttendance.findIndex(a => a.id === updatedAttendance.id);
      if (index !== -1) {
        state.allAttendance[index] = updatedAttendance;
      }
    },
    startExportLoading: (state) => {
      state.exportLoading = true;
      state.error = null;
      state.success = null;
    },
    stopExportLoading: (state) => {
      state.exportLoading = false;
    },
    setCalendarMonth: (state, action) => {
      state.calendarMonth = action.payload.month;
      state.calendarYear = action.payload.year;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get All Attendance
      .addCase(getAllAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.allAttendance = action.payload.data || [];
        state.pagination = {
          current: action.payload.currentPage || 1,
          pages: action.payload.totalPages || 1,
          total: action.payload.total || 0,
          hasNext: (action.payload.currentPage || 1) < (action.payload.totalPages || 1),
          hasPrev: (action.payload.currentPage || 1) > 1
        };
        state.error = null;
      })
      .addCase(getAllAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch attendance';
        state.allAttendance = [];
      })
      
      // Get Team Attendance
      .addCase(getTeamAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTeamAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.teamAttendance = action.payload.data || [];
        state.stats = {
          ...state.stats,
          totalEmployees: action.payload.stats?.total || 0,
          presentToday: action.payload.stats?.present || 0,
          absentToday: action.payload.stats?.absent || 0,
          lateToday: action.payload.stats?.late || 0,
          attendanceRate: action.payload.stats?.attendanceRate || 0
        };
        state.error = null;
      })
      .addCase(getTeamAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch team attendance';
        state.teamAttendance = [];
      })
      
      // Get Daily Attendance Sheet
      .addCase(getDailyAttendanceSheet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDailyAttendanceSheet.fulfilled, (state, action) => {
        state.loading = false;
        state.dailySheet = action.payload.data || [];
        state.error = null;
      })
      .addCase(getDailyAttendanceSheet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch daily sheet';
        state.dailySheet = [];
      })
      
      // Get Attendance Analytics
      .addCase(getAttendanceAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAttendanceAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload.analytics || {};
        state.error = null;
      })
      .addCase(getAttendanceAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch analytics';
        state.analytics = {};
      })
      
      // Get Attendance Calendar
      .addCase(getAttendanceCalendar.pending, (state) => {
        state.calendarLoading = true;
        state.error = null;
      })
      .addCase(getAttendanceCalendar.fulfilled, (state, action) => {
        state.calendarLoading = false;
        state.calendarData = action.payload.data || [];
        state.error = null;
      })
      .addCase(getAttendanceCalendar.rejected, (state, action) => {
        state.calendarLoading = false;
        state.error = action.payload || 'Failed to fetch calendar data';
        state.calendarData = [];
      })
      
      // Get Merchant Users
      .addCase(getMerchantUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMerchantUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.merchantUsers = action.payload.data || [];
        state.error = null;
      })
      .addCase(getMerchantUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch users';
        state.merchantUsers = [];
      })
      
      // Approve Attendance
      .addCase(approveAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(approveAttendance.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update the attendance record in all arrays
        const updatedAttendance = action.payload.data;
        const successMessage = action.payload.message || 'Attendance updated successfully';
        
        if (updatedAttendance && updatedAttendance.id) {
          // Update in allAttendance array
          const allIndex = state.allAttendance.findIndex(a => a.id === updatedAttendance.id);
          if (allIndex !== -1) {
            state.allAttendance[allIndex] = {
              ...state.allAttendance[allIndex],
              approvalStatus: updatedAttendance.status || updatedAttendance.approvalStatus,
              remarks: updatedAttendance.remarks || '',
              approvedBy: updatedAttendance.approvedBy,
              approvalDate: updatedAttendance.approvalDate
            };
          }
          
          // Update in teamAttendance array
          if (state.teamAttendance && state.teamAttendance.length > 0) {
            state.teamAttendance = state.teamAttendance.map(item => {
              if (item.attendance && item.attendance.id === updatedAttendance.id) {
                return {
                  ...item,
                  attendance: {
                    ...item.attendance,
                    approvalStatus: updatedAttendance.status || updatedAttendance.approvalStatus,
                    remarks: updatedAttendance.remarks || ''
                  }
                };
              }
              return item;
            });
          }
        }
        
        state.success = successMessage;
        state.error = null;
      })
      .addCase(approveAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update attendance';
        state.success = null;
      })
      
      // Export Attendance
      .addCase(exportAttendance.pending, (state) => {
        state.exportLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(exportAttendance.fulfilled, (state, action) => {
        state.exportLoading = false;
        state.success = action.payload.message || 'Export completed successfully';
        state.error = null;
      })
      .addCase(exportAttendance.rejected, (state, action) => {
        state.exportLoading = false;
        state.error = action.payload || 'Export failed. Please try again.';
        state.success = null;
      })
      
      // Get Attendance Report
      .addCase(getAttendanceReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAttendanceReport.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload.data || {};
        state.error = null;
      })
      .addCase(getAttendanceReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch reports';
        state.reports = {};
      });
  },
});

export const {
  clearError,
  clearSuccess,
  setSuccess,
  setError,
  setFilters,
  clearFilters,
  resetMerchantAttendanceState,
  updateAttendance,
  startExportLoading,
  stopExportLoading,
  setCalendarMonth,
  setSelectedUser
} = merchantAttendanceSlice.actions;

// Selectors
export const selectAllAttendance = (state) => state.merchantAttendance.allAttendance || [];
export const selectTeamAttendance = (state) => state.merchantAttendance.teamAttendance || [];
export const selectDailySheet = (state) => state.merchantAttendance.dailySheet || [];
export const selectAttendanceAnalytics = (state) => state.merchantAttendance.analytics || {};
export const selectAttendanceReports = (state) => state.merchantAttendance.reports || {};
export const selectCalendarData = (state) => state.merchantAttendance.calendarData || [];
export const selectMerchantUsers = (state) => state.merchantAttendance.merchantUsers || [];
export const selectMerchantAttendanceLoading = (state) => state.merchantAttendance.loading;
export const selectCalendarLoading = (state) => state.merchantAttendance.calendarLoading;
export const selectMerchantAttendanceExportLoading = (state) => state.merchantAttendance.exportLoading;
export const selectMerchantAttendanceError = (state) => state.merchantAttendance.error;
export const selectMerchantAttendanceSuccess = (state) => state.merchantAttendance.success;
export const selectMerchantAttendancePagination = (state) => state.merchantAttendance.pagination;
export const selectMerchantAttendanceFilters = (state) => state.merchantAttendance.filters;
export const selectMerchantAttendanceStats = (state) => state.merchantAttendance.stats;
export const selectSelectedUser = (state) => state.merchantAttendance.selectedUser;

export default merchantAttendanceSlice.reducer;