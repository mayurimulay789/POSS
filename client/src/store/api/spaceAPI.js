import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const spaceApi = axios.create({
  baseURL: `${API_URL}/space`,
});

spaceApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const spaceAPI = {
  fetchSpaces: async () => spaceApi.get('/'),
  createSpace: async (data) => spaceApi.post('/', data),
  updateSpace: async (id, data) => spaceApi.put(`/${id}`, data),
  deleteSpace: async (id) => spaceApi.delete(`/${id}`),
};

export default spaceAPI;
