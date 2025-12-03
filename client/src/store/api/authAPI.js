import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL|| 'http://localhost:5000/api';

const authAPI = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
authAPI.interceptors.request.use(
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

// Response interceptor for error handling
authAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('permissions');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const authService = {
  // ✅ FIXED: Login with correct format
  login: (credentials) => authAPI.post('/auth/login', credentials),
  
  // Get current user profile
  getMe: () => authAPI.get('/auth/me'),
  
  // Update user profile
  updateProfile: (data) => authAPI.put('/auth/myprofile', data),
  
  // Logout
  logout: () => authAPI.post('/auth/logout'),
  
  // Register (for merchant)
  registerUser: (userData) => authAPI.post('/auth/register', userData),
};

export default authService;