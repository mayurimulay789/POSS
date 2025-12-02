import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance for employee API
const employeeApi = axios.create({
  baseURL: `${API_URL}/employee`,
});

// Add auth interceptor to employee API
employeeApi.interceptors.request.use(
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
employeeApi.interceptors.response.use(
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

const employeeAPI = {
  // Create employee (Only for merchants)
  createEmployee: async (employeeData) => {
    const response = await employeeApi.post('/users', employeeData);
    return response;
  },

  // Get all employees with pagination and filters
  getEmployees: async (params = {}) => {
    const response = await employeeApi.get('/users', { params });
    return response;
  },

  // Get single employee by ID
  getEmployee: async (id) => {
    const response = await employeeApi.get(`/users/${id}`);
    return response;
  },

  // Update employee
  updateEmployee: async (id, employeeData) => {
    const response = await employeeApi.put(`/users/${id}`, employeeData);
    return response;
  },

  // Toggle employee active status
  toggleEmployeeStatus: async (id) => {
    const response = await employeeApi.patch(`/users/${id}/toggle-status`);
    return response;
  },

  // Delete employee
  deleteEmployee: async (id) => {
    const response = await employeeApi.delete(`/users/${id}`);
    return response;
  }
};

export default employeeAPI;