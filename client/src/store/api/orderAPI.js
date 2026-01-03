import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const orderApi = axios.create({
  baseURL: `${API_URL}/orders`,
});

orderApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const orderAPI = {
  fetchOrders: async (status) => {
    if (status) {
      return orderApi.get(`/?status=${status}`);
    }
    return orderApi.get('/');
  },
  createOrder: async (data) => orderApi.post('/', data),
  updateOrder: async (id, data) => orderApi.put(`/${id}`, data),
  deleteOrder: async (id) => orderApi.delete(`/${id}`),
  cancelOrder: async (id) => orderApi.post(`/${id}/cancel`),
};

export default orderAPI;
