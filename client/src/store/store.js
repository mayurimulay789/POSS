import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import permissionReducer from './slices/permissionSlice';
import employeeReducer from './slices/employeeSlice';
import expenseReducer from './slices/expenseSlice'; 
import taskReducer from './slices/taskSlice';
import custmoerReducer from './slices/customerSlice';
import dashboardReducer from './slices/dashboardSlice';
import attendanceReducer from './slices/attendanceSlice';
import merchantAttendanceReducer from './slices/merchantAttendanceSlice';
import chargeReducer from './slices/chargeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    permissions: permissionReducer,
    employees: employeeReducer,
    expenses: expenseReducer, 
    tasks: taskReducer,
    customers: custmoerReducer,
     dashboard: dashboardReducer,
     attendance: attendanceReducer,
     merchantAttendance: merchantAttendanceReducer,
     charges: chargeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;