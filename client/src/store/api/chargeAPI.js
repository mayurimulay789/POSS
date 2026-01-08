import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance for charge API
const chargeApi = axios.create({
  baseURL: `${API_URL}/charges`,
});

// Add auth interceptor
chargeApi.interceptors.request.use(
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
chargeApi.interceptors.response.use(
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

const chargeAPI = {
  // Get all charges (admin only)
  getAllCharges: async (params = {}) => {
    const response = await chargeApi.get('/', { params });
    return response;
  },

  // Get single charge by ID (admin only)
  getChargeById: async (id) => {
    const response = await chargeApi.get(`/${id}`);
    return response;
  },

  // Create new charge (admin only)
  createCharge: async (chargeData) => {
    const response = await chargeApi.post('/', chargeData);
    return response;
  },

  // Update charge (admin only)
  updateCharge: async (id, chargeData) => {
    const response = await chargeApi.put(`/${id}`, chargeData);
    return response;
  },

  // Delete charge (admin only)
  deleteCharge: async (id) => {
    const response = await chargeApi.delete(`/${id}`);
    return response;
  },

  // Toggle charge status (admin only)
  toggleChargeStatus: async (id, active) => {
    const response = await chargeApi.patch(`/${id}/status`, { active });
    return response;
  },

  // Get active system charges (public)
  getSystemCharges: async () => {
    const response = await chargeApi.get('/system');
    return response;
  },

  // Get active optional charges (public)
  getOptionalCharges: async () => {
    const response = await chargeApi.get('/optional');
    return response;
  },

  // Get system charges summary (public)
  getSystemChargesSummary: async () => {
    const response = await chargeApi.get('/system/summary');
    return response;
  },

  // Calculate bill with charges (public)
  calculateBillCharges: async (subtotal, selectedOptionalCharges = []) => {
    const response = await chargeApi.post('/calculate', {
      subtotal,
      selectedOptionalCharges
    });
    return response;
  }
};

export default chargeAPI;