import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance for permission API
const permissionApi = axios.create({
  baseURL: `${API_URL}/role-permissions`,
});

// Add auth interceptor
permissionApi.interceptors.request.use(
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
permissionApi.interceptors.response.use(
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

const permissionAPI = {
  // Get permissions for a specific role
  getRolePermissions: async (role) => {
    const response = await permissionApi.get(`/roles/${role}`);
    return response;
  },

  // Update permissions for a specific role
  updateRolePermissions: async (role, permissions) => {
    const response = await permissionApi.put(`/roles/${role}`, { permissions });
    return response;
  },

  // Get all roles with their permissions
  getAllRolePermissions: async () => {
    const response = await permissionApi.get('/all');
    return response;
  },

  // Get current user's permissions
  getMyPermissions: async () => {
    const response = await permissionApi.get('/my-permissions');
    return response;
  }
};

export default permissionAPI;