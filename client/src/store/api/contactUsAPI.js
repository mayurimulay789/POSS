import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const contactUsApi = axios.create({
  baseURL: `${API_URL}/contact-us`,
});

contactUsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const contactUsAPI = {
  fetchContactUs: async () => contactUsApi.get('/'),
  updateContactUs: async (data) => contactUsApi.post('/', data),
};

export default contactUsAPI;
