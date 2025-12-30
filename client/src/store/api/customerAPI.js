import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance for customer API
const customerApi = axios.create({
  baseURL: `${API_URL}/customers`,
});

// Add auth interceptor to customer API
customerApi.interceptors.request.use(
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
customerApi.interceptors.response.use(
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

const customerAPI = {
  // Create customer
  createCustomer: async (customerData) => {
    const response = await customerApi.post('/', customerData);
    return response;
  },

  // Get all customers (with pagination and filters)
  getCustomers: async (params = {}) => {
    const response = await customerApi.get('/', { params });
    return response;
  },

  // Get customers created by current user
  getMyCustomers: async (params = {}) => {
    const response = await customerApi.get('/my-customers', { params });
    return response;
  },

  // Search customers
  searchCustomers: async (query) => {
    const response = await customerApi.get('/search', { params: { q: query } });
    return response;
  },

  // Get single customer
  getCustomer: async (id) => {
    const response = await customerApi.get(`/${id}`);
    return response;
  },

  // Update customer
  updateCustomer: async (id, customerData) => {
    const response = await customerApi.put(`/${id}`, customerData);
    return response;
  },

  // Delete customer
  deleteCustomer: async (id) => {
    const response = await customerApi.delete(`/${id}`);
    return response;
  },

  // Get customer statistics
  getCustomerStats: async () => {
    const response = await customerApi.get('/stats');
    return response;
  },

  // Export customers
  exportCustomers: async () => {
    const response = await customerApi.post('/export');
    return response;
  }
};

export default customerAPI;