
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const menuApi = axios.create({
  baseURL: `${API_URL}/menu`,
});

menuApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const menuAPI = {
  fetchMenuItems: async () => menuApi.get('/items'),
  createMenuItem: async (data) => menuApi.post('/items', data),
  updateMenuItem: async (id, data) => menuApi.put(`/items/${id}`, data),
  deleteMenuItem: async (id) => menuApi.delete(`/items/${id}`),
};

export default menuAPI;
