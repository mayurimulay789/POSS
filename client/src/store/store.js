import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import permissionReducer from './slices/permissionSlice';
import employeeReducer from './slices/employeeSlice';
// Import other reducers if you have them

export const store = configureStore({
  reducer: {
    auth: authReducer,
    permissions: permissionReducer,
    employees: employeeReducer,
    // Add other reducers here
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