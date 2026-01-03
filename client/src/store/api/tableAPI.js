import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const tableApi = axios.create({
  baseURL: `${API_URL}/tables`,
});

tableApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const tableAPI = {
  fetchTables: async () => tableApi.get('/'),
  createTable: async (data) => tableApi.post('/', data),
  updateTable: async (id, data) => tableApi.put(`/${id}`, data),
  deleteTable: async (id) => tableApi.delete(`/${id}`),
  getTableById: async (id) => tableApi.get(`/${id}`),
};

export default tableAPI;
