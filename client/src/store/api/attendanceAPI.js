import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance for attendance API
const attendanceApi = axios.create({
  baseURL: `${API_URL}/attendance`,
});

// Add auth interceptor to attendance API
attendanceApi.interceptors.request.use(
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

// Response interceptor to handle token expiration
attendanceApi.interceptors.response.use(
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

const attendanceAPI = {
  // Start shift with selfie upload
  startShift: async (formData) => {
    const response = await attendanceApi.post('/start', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  // End shift with optional selfie upload
  endShift: async (formData) => {
    const response = await attendanceApi.post('/end', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  // Get current active shift
  getCurrentShift: async () => {
    const response = await attendanceApi.get('/current');
    return response;
  },

  // Get my attendance history
  getMyAttendance: async (params = {}) => {
    const response = await attendanceApi.get('/my-attendance', { params });
    return response;
  },

  // Export attendance data (for managers/merchants)
  exportAttendance: async (params = {}) => {
    const response = await attendanceApi.post('/export', params);
    return response;
  },

  // Get attendance stats (for dashboard)
  getAttendanceStats: async () => {
    const response = await attendanceApi.get('/stats');
    return response;
  }
};

export default attendanceAPI;