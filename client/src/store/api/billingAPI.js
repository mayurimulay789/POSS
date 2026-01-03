import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const billingApi = axios.create({
  baseURL: `${API_URL}/billing`,
});

billingApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const billingAPI = {
  fetchBills: async () => billingApi.get('/'),
  createBill: async (data) => billingApi.post('/', data),
  updateBill: async (id, data) => billingApi.put(`/${id}`, data),
  deleteBill: async (id) => billingApi.delete(`/${id}`),
};

export default billingAPI;
