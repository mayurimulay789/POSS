import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance for expense API
const expenseApi = axios.create({
  baseURL: `${API_URL}/expenses`,
});

// Add auth interceptor to expense API
expenseApi.interceptors.request.use(
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
expenseApi.interceptors.response.use(
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

const expenseAPI = {
  // Create expense
  createExpense: async (expenseData) => {
    const response = await expenseApi.post('/', expenseData);
    return response;
  },

  // Get all expenses (for merchant/manager only)
  getExpenses: async (params = {}) => {
    const response = await expenseApi.get('/', { params });
    return response;
  },

  // Get my expenses (for staff/supervisor/manager)
  getMyExpenses: async (params = {}) => {
    const response = await expenseApi.get('/my-expenses', { params });
    return response;
  },

  // Get single expense
  getExpense: async (id) => {
    const response = await expenseApi.get(`/${id}`);
    return response;
  },

  // Update expense
  updateExpense: async (id, expenseData) => {
    const response = await expenseApi.put(`/${id}`, expenseData);
    return response;
  },

  // Delete expense
  deleteExpense: async (id) => {
    const response = await expenseApi.delete(`/${id}`);
    return response;
  }
};

export default expenseAPI;