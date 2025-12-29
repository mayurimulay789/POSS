// src/store/api/dashboardAPI.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance for dashboard API
const dashboardApi = axios.create({
  baseURL: `${API_URL}/dashboard`,
});

// Add auth interceptor
dashboardApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
dashboardApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const dashboardAPI = {
  // Get merchant dashboard
  getMerchantDashboard: () => dashboardApi.get('/merchant'),
  
  // Get manager dashboard
  getManagerDashboard: () => dashboardApi.get('/manager'),
  
  // Get supervisor dashboard
  getSupervisorDashboard: () => dashboardApi.get('/supervisor'),
  
  // Get staff dashboard
  getStaffDashboard: () => dashboardApi.get('/staff'),
};

export default dashboardAPI;