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
import aboutUsReducer from './slices/aboutUsSlice';
import contactUsReducer from './slices/contactUsSlice';
import welcomeSectionReducer from './slices/welcomeSectionSlice';
import cuisineGalleryReducer from './slices/cuisineGallerySlice';
import orderReducer from './slices/orderSlice';
import billingReducer from './slices/billingSlice';
import tableReducer from './slices/tableSlice';
import menuReducer from './slices/menuSlice';
import hotelImageReducer from './slices/hotelImageSlice';
import cuisineCardsReducer from './slices/cuisineCardsSlice';
import logoReducer from './slices/logoSlice';
import footerReducer from './slices/footerSlice';

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
    aboutUs: aboutUsReducer,
    contactUs: contactUsReducer,
    welcomeSection: welcomeSectionReducer,
    cuisineGallery: cuisineGalleryReducer,
    order: orderReducer,
    billing: billingReducer,
    table: tableReducer,
    menu: menuReducer,
    hotelImage: hotelImageReducer,
    cuisineCards: cuisineCardsReducer,
    logo: logoReducer,
    footer: footerReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
    
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;