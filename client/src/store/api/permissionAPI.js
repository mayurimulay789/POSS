import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL|| 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const permissionAPI = {
  // Get permissions for a specific role
  getRolePermissions: (role) => api.get(`/role-permissions/roles/${role}`),

  // Update permissions for a specific role
  updateRolePermissions: (role, permissions) => 
    api.put(`/role-permissions/roles/${role}`, { permissions }),

  // Get all roles with their permissions
  getAllRolePermissions: () => api.get('/role-permissions/all'),

  // Get current user's permissions
  getMyPermissions: () => api.get('/role-permissions/my-permissions'),
};

export default permissionAPI;