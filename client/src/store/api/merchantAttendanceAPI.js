// import axios from 'axios';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// // Create axios instance for merchant attendance API
// const merchantAttendanceApi = axios.create({
//   baseURL: `${API_URL}/merchant/attendance`,
// });

// // Add auth interceptor to merchant attendance API
// merchantAttendanceApi.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor to handle token expiration
// merchantAttendanceApi.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// const merchantAttendanceAPI = {
//   // Get all attendance records
//   getAllAttendance: async (params = {}) => {
//     const response = await merchantAttendanceApi.get('/all', { params });
//     return response;
//   },

//   // Get team attendance for a specific date
//   getTeamAttendance: async (date) => {
//     const response = await merchantAttendanceApi.get('/team', { params: { date } });
//     return response;
//   },

//   // Get daily attendance sheet
//   getDailyAttendanceSheet: async (date) => {
//     const response = await merchantAttendanceApi.get('/daily-sheet', { params: { date } });
//     return response;
//   },

//   // Get attendance analytics
//   getAttendanceAnalytics: async (params = {}) => {
//     const response = await merchantAttendanceApi.get('/analytics', { params });
//     return response;
//   },

//   // Get attendance reports
//   getAttendanceReport: async (params = {}) => {
//     const response = await merchantAttendanceApi.get('/reports', { params });
//     return response;
//   },

//   // Approve or reject attendance
//   approveAttendance: async (id, action, remarks = '') => {
//     const response = await merchantAttendanceApi.patch(`/${id}/approve`, { 
//       action, 
//       remarks 
//     });
//     return response;
//   },

//   // Export attendance data
//   exportAttendance: async (params = {}) => {
//     const response = await merchantAttendanceApi.post('/export', params);
//     return response;
//   },

//   // Get all users for filters
//   getMerchantUsers: async () => {
//     const userApi = axios.create({
//       baseURL: `${API_URL}/employee/users`,
//     });
    
//     userApi.interceptors.request.use(
//       (config) => {
//         const token = localStorage.getItem('token');
//         if (token) {
//           config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//       }
//     );
    
//     const response = await userApi.get('');
//     return response;
//   }
// };

// export default merchantAttendanceAPI;

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance for merchant attendance API
const merchantAttendanceApi = axios.create({
  baseURL: `${API_URL}/merchant/attendance`,
});

// Add auth interceptor to merchant attendance API
merchantAttendanceApi.interceptors.request.use(
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
merchantAttendanceApi.interceptors.response.use(
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

const merchantAttendanceAPI = {
  // Get all attendance records
  getAllAttendance: async (params = {}) => {
    const response = await merchantAttendanceApi.get('/all', { params });
    return response;
  },

  // Get team attendance for a specific date
  getTeamAttendance: async (date) => {
    const response = await merchantAttendanceApi.get('/team', { params: { date } });
    return response;
  },

  // Get daily attendance sheet
  getDailyAttendanceSheet: async (date) => {
    const response = await merchantAttendanceApi.get('/daily-sheet', { params: { date } });
    return response;
  },

  // Get attendance analytics
  getAttendanceAnalytics: async (params = {}) => {
    const response = await merchantAttendanceApi.get('/analytics', { params });
    return response;
  },

  // Get attendance reports
  getAttendanceReport: async (params = {}) => {
    const response = await merchantAttendanceApi.get('/reports', { params });
    return response;
  },

  // Get attendance calendar data
  getAttendanceCalendar: async (userId, month, year) => {
    const response = await merchantAttendanceApi.get('/calendar', {
      params: { userId, month, year }
    });
    return response;
  },

  // Get merchant users for dropdown
  getMerchantUsers: async () => {
    const response = await merchantAttendanceApi.get('/users');
    return response;
  },

  // Approve or reject attendance
  approveAttendance: async (id, action, remarks = '') => {
    const response = await merchantAttendanceApi.patch(`/${id}/approve`, { 
      action, 
      remarks 
    });
    return response;
  },

  // Export attendance data
  exportAttendance: async (params = {}) => {
    const response = await merchantAttendanceApi.post('/export', params);
    return response;
  },
};

export default merchantAttendanceAPI;