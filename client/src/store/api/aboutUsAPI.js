import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const aboutUsApi = axios.create({
  baseURL: `${API_URL}/about-us`,
});

aboutUsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const aboutUsAPI = {
  fetchAboutUs: async () => aboutUsApi.get('/'),
  updateAboutUs: async (data) => aboutUsApi.post('/', data),
};

export default aboutUsAPI;
